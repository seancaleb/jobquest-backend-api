import { Request, Response, NextFunction } from "express";
import Job from "@/models/job.model";
import {
  CreateJobPostBody,
  JobIdParams,
  UpdateJobApplicationBody,
  UpdateJobApplicationParams,
  UpdateJobPostBody,
} from "@/schema/job.schema";
import {
  BAD_REQUEST,
  JOB_APPLICATION_NOT_FOUND,
  JOB_APPLICATION_STATUS_UPDATED,
  JOB_CREATED,
  JOB_NOT_FOUND,
  JOB_POST_DELETED,
  JOB_POST_UPDATED,
  ACCESS_DENIED_JOB_POST,
  ACCESS_DENIED_UPDATE_JOB,
  ACCOUNT_NOT_FOUND,
} from "@/constants";
import Application from "@/models/application.model";
import User from "@/models/user.model";
import { SortOrder } from "mongoose";
import { format, formatISO, isSameDay, parseISO, subDays } from "date-fns";
import { JobApplicationIdParams } from "@/schema/application.schema";

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  PUBLIC
 */
const getJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { pageNumber, limit, startIndex, lastIndex } = req.pagination;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as SortOrder) || "desc";
    const location = req.query.location as string;
    const keyword = req.query.keyword as string;
    const filterDate = req.query.fromAge as string;

    const query = Job.find();

    // Apply filters
    if (filterDate) {
      const fromDate = subDays(Date.now(), parseInt(filterDate));
      query.where("createdAt", { $gte: fromDate });
    }

    if (location) {
      const parsedLocation = location.split(",");
      const locationRegexArray = parsedLocation.map(
        (location) => new RegExp(location, "i")
      );
      query.where("location").in(locationRegexArray);
    }

    if (keyword) {
      query.where("title", { $regex: keyword, $options: "i" });
    }

    query.sort({ [sortBy]: sortOrder });

    // Run query to get filters
    const countQuery = Job.find(query.getFilter());

    // Get the total jobs applied by filters
    const totalJobs = await countQuery.countDocuments();
    const totalPages = Math.ceil(totalJobs / limit);

    // Apply the pagination
    query.skip(startIndex).limit(limit);

    // Get all jobs in paginated form
    const jobs = await query.exec();

    if (jobs.length) {
      return res
        .status(200)
        .json({ total: totalJobs, jobs, limit, pageNumber, totalPages });
    } else {
      res
        .status(200)
        .json({ total: totalJobs, jobs: [], limit, pageNumber, totalPages });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get job
 * @route   GET /api/jobs/:jobId
 * @access  PUBLIC
 */
const getJob = async (
  req: Request<JobIdParams>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { jobId } = req.params;
    // Get specific job post
    const job = await Job.findOne({ jobId });

    if (!job) {
      return res.status(404).json({ message: JOB_NOT_FOUND });
    }

    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job post
 * @route   POST /api/employers/jobs
 * @access  PROTECTED - only for employers and admin only
 */
const createJobPost = async (
  req: Request<{}, {}, CreateJobPostBody>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id, email } = req.user;

    // Get employer details
    const employer = await User.findOne({ email }).lean();

    if (!employer) {
      return res.status(404).json({ message: ACCOUNT_NOT_FOUND });
    }

    // Create a new job post
    const createdJobPost = await Job.create({
      employerId: id,
      employerName: `${employer.firstName} ${employer.lastName[0]}.`,
      ...req.body,
    });

    if (createdJobPost) {
      return res.status(201).json({ message: JOB_CREATED });
    } else {
      res.status(400).json({ message: BAD_REQUEST });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job post
 * @route   PATCH /api/employers/jobs/:jobId
 * @access  PROTECTED - only for employers and admin only
 */
const updateJobPost = async (
  req: Request<JobIdParams, {}, UpdateJobPostBody>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.user;
    const { jobId } = req.params;

    // Find the job post that will be updated
    const jobPost = await Job.findOne({ jobId }).exec();

    // Check if job doesn't exist in the database
    if (!jobPost) {
      return res.status(404).json({ message: JOB_NOT_FOUND });
    }

    // Check if employerId is same as the logged in employer's id
    if (jobPost.employerId.toString() !== id.toString()) {
      return res.status(403).json({ message: ACCESS_DENIED_UPDATE_JOB });
    }

    const updateJobPost = await Job.findOneAndUpdate(
      { jobId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    // Check if updated job doesn't exist in the database
    if (!updateJobPost) {
      return res.status(404).json({ message: JOB_NOT_FOUND });
    }

    res.json({ message: JOB_POST_UPDATED, job: updateJobPost });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of applications for a job post
 * @route   GET /api/employers/jobs/:jobId/applications
 * @access  PROTECTED - only for employers only
 */
const getAllJobApplications = async (
  req: Request<JobIdParams>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { jobId } = req.params;
    const { id } = req.user;

    const jobPost = await Job.findOne({ jobId }).exec();

    // Check if job post doesn't exist in the database
    if (!jobPost) {
      return res.status(404).json({ message: JOB_NOT_FOUND });
    }

    // Check if employer is the creator of the job post
    if (jobPost.employerId.toString() !== id.toString()) {
      return res.status(403).json({ message: ACCESS_DENIED_JOB_POST });
    }

    const { applications: jobApplications } = jobPost;

    // Get all applications for a job post and include user information
    const applications = await Application.aggregate([
      {
        $match: {
          applicantId: { $in: jobApplications },
          jobId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "applicantId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: {
            $first: {
              $map: {
                input: "$user",
                as: "userData",
                in: {
                  firstName: "$$userData.firstName",
                  lastName: "$$userData.lastName",
                  userId: "$$userData.userId",
                  avatar: "$$userData.avatar",
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    res.status(200).json({ total: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update status of a job application for a specific job post
 * @route   PATCH /api/employers/jobs/:jobId/applications/:applicationId/review
 * @access  PROTECTED - only for employers only
 */
const updateJobApplicationStatus = async (
  req: Request<UpdateJobApplicationParams, {}, UpdateJobApplicationBody>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { jobId, applicationId } = req.params;
    const { id } = req.user;
    const { status } = req.body;

    const jobPost = await Job.findOne({ jobId }).exec();

    // Check if job post doesn't exist in the database
    if (!jobPost) {
      return res.status(404).json({ message: JOB_NOT_FOUND });
    }

    // Check if employer is the creator of the job post
    if (jobPost.employerId.toString() !== id.toString()) {
      return res.status(403).json({ message: ACCESS_DENIED_JOB_POST });
    }

    const updatedApplication = await Application.findOneAndUpdate(
      { jobId, applicationId },
      { status },
      { runValidators: true, new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: JOB_APPLICATION_NOT_FOUND });
    }

    res.status(200).json({
      application: updatedApplication,
      message: JOB_APPLICATION_STATUS_UPDATED,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific job post
 * @route   DELETE /api/employers/jobs/:jobId
 * @access  PROTECTED - only for employers only
 */
const deleteJobPost = async (
  req: Request<JobIdParams>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { jobId } = req.params;
    const { id } = req.user;

    const jobPost = await Job.findOne({ jobId }).exec();

    // Check if job post doesn't exist in the database
    if (!jobPost) {
      return res.status(404).json({ message: JOB_NOT_FOUND });
    }

    // Check if employer is the creator of the job post
    if (jobPost.employerId.toString() !== id.toString()) {
      return res.status(403).json({ message: ACCESS_DENIED_JOB_POST });
    }

    const { jobId: jobPostId, _id } = await jobPost.deleteOne();

    const { deletedCount } = await Application.deleteMany({ jobId: jobPostId });

    // Update the bookmark field by deleting the bookmark id from each user
    await User.updateMany(
      { bookmark: { $in: jobId }, applications: { $in: jobId } },
      { $pull: { bookmark: { $in: jobId }, applications: { $in: jobId } } }
    );

    res.status(200).json({
      deletedJobApplications: deletedCount,
      message: JOB_POST_DELETED,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  PROTECTED - only for employers only
 */
const getAllJobPostings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.user;
    const { pageNumber, limit, startIndex, lastIndex } = req.pagination;

    // Get all job postings
    const query = Job.find({ employerId: id });
    const totalCountQuery = Job.find({ employerId: id });

    query.sort({ updatedAt: -1 });

    const totalJobs = await totalCountQuery.countDocuments();
    const totalPages = Math.ceil(totalJobs / limit);

    // Apply the pagination
    query.skip(startIndex).limit(limit);

    // Get all jobs in paginated form
    const jobs = await query.exec();

    if (jobs.length) {
      return res
        .status(200)
        .json({ total: totalJobs, jobs, limit, pageNumber, totalPages });
    } else {
      res
        .status(200)
        .json({ total: totalJobs, jobs: [], limit, pageNumber, totalPages });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all job applications
 * @route   GET /api/jobs/applications
 * @access  PROTECTED - only for employers only
 */
const getApplicationsOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email } = req.user;

    const employer = await User.findOne({ email }).lean();

    if (!employer) {
      return res.status(404).json({ message: ACCOUNT_NOT_FOUND });
    }

    const jobsResult = await Job.find({ employerId: employer._id }).select(
      "-_id jobId createdAt"
    );

    const jobIds = jobsResult.map(({ jobId }) => jobId);

    const applications = await Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "applicantId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: {
            $first: {
              $map: {
                input: "$user",
                as: "userData",
                in: {
                  firstName: "$$userData.firstName",
                  lastName: "$$userData.lastName",
                  userId: "$$userData.userId",
                  avatar: "$$userData.avatar",
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    const applicationStatusDistribution = [
      { name: "Applied", count: 0 },
      { name: "Viewed", count: 0 },
      { name: "Rejected", count: 0 },
    ];

    applications.forEach((application) => {
      const status = application.status;
      if (status === "Applied") {
        applicationStatusDistribution[0].count++;
      } else if (status === "Application viewed") {
        applicationStatusDistribution[1].count++;
      } else {
        applicationStatusDistribution[2].count++;
      }
    });

    let applicationTrendsGraphActive = false;
    const currentDate = new Date(); // Current date

    if (applications.length === 0) {
      return res.json({
        totalJobs: jobsResult.length,
        totalApplications: applications.length,
        applications,
        applicationStatusDistribution,
        applicationTrends: [],
        applicationTrendsGraphActive,
      });
    }

    const dayElapsed = Math.floor(
      (currentDate.getTime() - employer.createdAt.getTime()) /
        (24 * 60 * 60 * 1000)
    );

    if (applications.length > 0 && dayElapsed >= 3) {
      applicationTrendsGraphActive = true;
    }

    const firstJobPostDate =
      jobsResult.length > 0 ? jobsResult[0].createdAt : currentDate; // Replace with the actual creation date of the first job post

    // Calculate the date range based on the first job post date
    let startDate = firstJobPostDate;

    // Calculate the difference in days between the current date and the start date
    const dayDifference = Math.floor(
      (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    // If the range exceeds 30 days, set the start date to 30 days ago from the current date
    if (dayDifference > 30) {
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 30);
    }

    const dateArray = [];

    let currentDatePointer = new Date(startDate);

    while (!isSameDay(currentDatePointer, currentDate)) {
      dateArray.push(formatISO(currentDatePointer));

      currentDatePointer.setDate(currentDatePointer.getDate() + 1);

      if (isSameDay(currentDatePointer, currentDate))
        dateArray.push(formatISO(currentDatePointer));
    }

    const applicationTrends: { date: string; applications: number }[] = [];

    const applicationCounts = await Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          createdAt: {
            $gte: startDate,
            $lte: currentDate,
          },
        },
      },
    ]);

    dateArray.forEach((date) => {
      applicationTrends.push({ date, applications: 0 });
    });

    applicationCounts.forEach((item) => {
      const dateString = format(item.createdAt, "P");
      const target = applicationTrends.find(
        (item) => format(parseISO(item.date), "P") === dateString
      );

      if (target) {
        target.applications += 1;
      }
    });

    return res.json({
      totalJobs: jobsResult.length,
      totalApplications: applications.length,
      applications,
      applicationStatusDistribution,
      applicationTrends,
      applicationTrendsGraphActive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get job application
 * @route   GET /api/employers/jobs/:jobId/applications/:applicationId
 * @access  PROTECTED - only for employers only
 */
const getJobApplication = async (
  req: Request<JobApplicationIdParams>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { applicationId } = req.params;
    const { id } = req.user;

    const jobApplication = await Application.findOne({ applicationId }).exec();

    // Check if job application doesn't exist in the database
    if (!jobApplication) {
      return res.status(404).json({ message: JOB_APPLICATION_NOT_FOUND });
    }

    const user = await User.findOne({ _id: jobApplication.applicantId }).exec();

    if (!user) {
      return res.status(404).json({ message: ACCOUNT_NOT_FOUND });
    }

    res.status(200).json({
      ...jobApplication.toObject(),
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user.userId,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all job applications
 * @route   GET /api/employers/jobs/applications
 * @access  PROTECTED - only for employers only
 */
const getAllApplications = async (
  req: Request<JobApplicationIdParams>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.user;

    const jobIds = (
      await Job.find({ employerId: id }).select("-_id jobId")
    ).map((job) => job.jobId);

    const applications = await Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "applicantId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          user: {
            $first: {
              $map: {
                input: "$user",
                as: "userData",
                in: {
                  firstName: "$$userData.firstName",
                  lastName: "$$userData.lastName",
                  userId: "$$userData.userId",
                  avatar: "$$userData.avatar",
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    res.status(200).json({ total: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

export {
  getJobs,
  getJob,
  createJobPost,
  updateJobPost,
  getAllJobApplications,
  updateJobApplicationStatus,
  deleteJobPost,
  getAllJobPostings,
  getApplicationsOverview,
  getJobApplication,
  getAllApplications,
};
