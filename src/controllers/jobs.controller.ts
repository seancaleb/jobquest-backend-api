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
  JOB_CREATED,
  JOB_NOT_FOUND,
  JOB_POST_DELETED,
  UNAUTHORIZED,
  UNAUTHORIZED_JOB_POST,
  UNAUTHORIZED_UPDATE_JOB,
  USER_NOT_FOUND,
} from "@/constants";
import Application from "@/models/application.model";
import User from "@/models/user.model";
import { SortOrder } from "mongoose";
import { subDays } from "date-fns";

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

    if (filterDate) {
      const fromDate = subDays(Date.now(), parseInt(filterDate));
      query.where("createdAt", { $gte: fromDate });
    }

    if (location) {
      const parsedLocation = location.split(",");
      const locationRegexArray = parsedLocation.map((location) => new RegExp(location, "i"));
      query.where("location").in(locationRegexArray);
    }

    if (keyword) {
      query.where("title", { $regex: keyword, $options: "i" });
    }

    query.sort({ [sortBy]: sortOrder });

    // Apply the pagination
    query.skip(startIndex).limit(limit);

    // Get all jobs
    const jobs = await query.exec();

    if (jobs.length) {
      return res.status(200).json({ total: jobs.length, jobs, limit, pageNumber });
    } else {
      res.status(200).json({ total: jobs.length, jobs: [], limit, pageNumber });
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
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    console.log(employer);

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
      return res.status(401).json({ message: UNAUTHORIZED_UPDATE_JOB });
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

    res.json({ job: updateJobPost });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get list of applications for a job post
 * @route   GET /api/employers/jobs/:jobId
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
      return res.status(401).json({ message: UNAUTHORIZED_JOB_POST });
    }

    const { applications } = jobPost;
    const jobApplications = await Application.find({
      applicantId: { $in: applications },
      jobId,
    }).lean();

    res.status(200).json({ total: jobApplications.length, jobApplications });
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
      return res.status(401).json({ message: UNAUTHORIZED_JOB_POST });
    }

    const updatedApplication = await Application.findOneAndUpdate(
      { jobId, applicationId },
      { status },
      { runValidators: true, new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: JOB_APPLICATION_NOT_FOUND });
    }

    res.status(200).json({ updatedApplication });
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
      return res.status(401).json({ message: UNAUTHORIZED_JOB_POST });
    }

    const { jobId: jobPostId, _id } = await jobPost.deleteOne();

    const { deletedCount } = await Application.deleteMany({ jobId: jobPostId });

    // Update the bookmark field of each user
    await User.updateMany({ bookmark: { $in: _id } }, { $pull: { bookmark: { $in: _id } } });

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

    // Get all job postings
    const jobs = await Job.find({ employerId: id }).lean();

    if (jobs.length) {
      return res.status(200).json({ total: jobs.length, jobs });
    } else {
      res.status(200).json({ total: jobs.length, jobs: [] });
    }
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
};
