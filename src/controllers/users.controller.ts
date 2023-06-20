import Job from "@/models/job.model";
import { Request, Response, NextFunction } from "express";
import User from "@/models/user.model";
import {
  APPLICATION_CREATED,
  BAD_REQUEST,
  EMAIL_EXISTS,
  INVALID_PASSWORD,
  JOB_ALREADY_APPLIED,
  JOB_ALREADY_BOOKMARKED,
  JOB_APPLICATION_NOT_FOUND,
  JOB_NOT_FOUND,
  JOB_POST_BOOKMARKED,
  USER_DELETED,
  USER_NOT_FOUND,
} from "@/constants";
import { UpdatePasswordBody, UpdateUserBody } from "@/schema/user.schema";
import { JobIdParams } from "@/schema/job.schema";
import { AppyJobPostBody, JobApplicationIdParams } from "@/schema/application.schema";
import Application from "@/models/application.model";
import { Types } from "mongoose";

/**
 * @desc    Get current user
 * @route   GET /api/users/profile
 * @access  PRIVATE
 */
const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email } = req.user;

    const user = await User.findOne({ email }).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user
 * @route   PATCH /api/users/profile
 * @access  PRIVATE
 */
const updateUser = async (
  req: Request<{}, {}, UpdateUserBody>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { firstName, lastName, email, age } = req.body;
    const { id } = req.user;

    // Find current authenticated user and get his email
    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const currentEmail = user.email;

    // Get all user emails in the database except the authenticated user
    const userEmails = await User.find({ email: { $ne: currentEmail } });

    // Check if email from req.body is found in the list of userEmails
    const isPresentEmail = userEmails.find((user) => user.email === email);

    if (isPresentEmail) {
      return res.status(409).json({ message: EMAIL_EXISTS });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        firstName,
        lastName,
        email,
        age,
      },
      { runValidators: true, new: true }
    );

    // Check if user doesn't exist in the database
    if (!updatedUser) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete current user
 * @route   DELETE /api/users/profile
 * @access  PRIVATE
 */
const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.user;

    const user = await User.findById(id).exec();

    // Check if user doesn't exist in the database
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    if (user.role === "user") {
      // Delete user's applications
      await Application.deleteMany({ applicantId: user._id });

      // Delete user's ID from associated job posts
      await Job.updateMany({ applications: user._id }, { $pull: { applications: user._id } });
    }

    if (user.role === "employer") {
      // Find all job posts belonging to the employer
      const jobPosts = await Job.find({ employerId: user._id });

      // Delete all job applications associated with each job post
      const jobPostIds = jobPosts.map((jobPost) => jobPost.jobId);
      const jobPostObjectId = jobPosts.map((jobPost) => jobPost._id.toString());
      await Application.deleteMany({ jobId: { $in: jobPostIds } });

      // Update the bookmark field of each user
      await User.updateMany(
        { bookmark: { $in: jobPostObjectId } },
        { $pull: { bookmark: { $in: jobPostObjectId } } }
      );

      // Delete all job posts belonging to the employer
      await Job.deleteMany({ employerId: user._id });
    }

    // Delete user
    await user.deleteOne();

    // Clear cookies
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ message: USER_DELETED });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update password of current user
 * @route   PATCH /api/users/profile
 * @access  PRIVATE
 */
const updatePassword = async (
  req: Request<{}, {}, UpdatePasswordBody>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.user;
    const { password, newPassword } = req.body;

    const user = await User.findById(id).exec();

    // Check if user doesn't exist in the database
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const isPasswordMatch = await user.comparePassword(password);

    // Check if user password doesn't match password from the database
    if (!isPasswordMatch) {
      res.status(401).json({ message: INVALID_PASSWORD });
    }

    await User.findOneAndUpdate(
      {
        _id: id,
      },
      {
        password: newPassword,
      },
      {
        runValidators: true,
        new: true,
      }
    );

    res.status(200).json({ message: "Password has been successfully updated." });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply to a job post
 * @route   POST /api/users/jobs/:jobId/apply
 * @access  PRIVATE
 */
const applyJobPost = async (
  req: Request<JobIdParams, {}, AppyJobPostBody>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email } = req.user;
    const { jobId } = req.params;

    const user = await User.findOne({ email }).exec();

    // Check if user doesn't exist in the database
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const jobPost = await Job.findOne({ jobId }).exec();

    // Check if job post doesn't exist in the database
    if (!jobPost) {
      return res.status(404).json({ message: JOB_NOT_FOUND });
    }

    // Check if applicant already applied to the job
    const isCurrentlyApplied = jobPost.applications.find(
      (applicantId) => applicantId.toString() === user._id.toString()
    );

    if (isCurrentlyApplied) {
      return res.status(409).json({ message: JOB_ALREADY_APPLIED });
    }

    // Create job application
    const appliedJob = await Application.create({
      jobId,
      applicantId: user._id,
      ...req.body,
    });

    // Check if job application has been successfully created
    if (appliedJob) {
      // Add job application to the Job's list of applications
      jobPost.applications.push(appliedJob.applicantId);
      await jobPost.save();

      return res.status(201).json({ message: APPLICATION_CREATED });
    } else {
      res.status(400).json({ message: BAD_REQUEST });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all job applications
 * @route   GET /api/users/applications
 * @access  PRIVATE
 */
const getAllJobApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email } = req.user;

    const user = await User.findOne({ email }).lean();

    // Check if user doesn't exist in the database
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const jobApplications = await Application.find({ applicantId: user._id }).lean();

    if (jobApplications.length) {
      return res.status(200).json({ total: jobApplications.length, jobApplications });
    } else {
      res.status(200).json({ total: jobApplications.length, jobApplications: [] });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    DELETE
 * @route   DELETE /api/users/applications/:applicationId
 * @access  PRIVATE
 */
const deleteJobApplicationById = async (
  req: Request<JobApplicationIdParams>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email } = req.user;
    const { applicationId } = req.params;

    const user = await User.findOne({ email }).lean();

    // Check if user doesn't exist in the database
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const jobApplication = await Application.findOne({
      applicationId,
      applicantId: user._id,
    }).exec();

    // Check if job application doesn't exist in the database
    if (!jobApplication) {
      return res.status(404).json({ message: JOB_APPLICATION_NOT_FOUND });
    }

    // Remove the job application from the job associated with it
    const jobPost = await Job.findOne({ jobId: jobApplication.jobId }).exec();

    if (!jobPost) {
      return res.status(404).json({ message: JOB_NOT_FOUND });
    }

    jobPost.applications = jobPost.applications.filter(
      (applicationId) => applicationId.toString() !== user._id.toString()
    );

    await jobPost.save();
    await jobApplication.deleteOne();

    res.status(200).json({ message: "Successfully deleted job application" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    POST - Bookmark a job post
 * @route   POST /api/users/jobs/:jobId/bookmark
 * @access  PRIVATE
 */
const bookmarkJobPost = async (
  req: Request<JobIdParams>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email } = req.user;
    const { jobId } = req.params;

    const user = await User.findOne({ email }).exec();

    // Check if user doesn't exist in the database
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const jobPost = await Job.findOne({ jobId }).lean();

    // Check if job post doesn't exist in the database
    if (!jobPost) {
      return res.status(404).json({ message: JOB_NOT_FOUND });
    }

    // Check if job post is already bookmarked
    const isCurrentlyBookmarked = user.bookmark.find(
      (jobId) => jobId.toString() === jobPost._id.toString()
    );

    if (isCurrentlyBookmarked) {
      return res.status(409).json({ message: JOB_ALREADY_BOOKMARKED });
    }

    user.bookmark.push(jobPost._id);
    await user.save();

    res.status(200).json({ message: JOB_POST_BOOKMARKED });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookmarked jobs of user
 * @route   GET /api/users/bookmarked-jobs
 * @access  PRIVATE
 */
const getBookmarkedJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.user;

    const user = await User.findById(id).lean();

    // Check if user doesn't exist in the database
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const bookmarkedJobs = await Job.find({ _id: { $in: user.bookmark } });

    res.json({ total: bookmarkedJobs.length, bookmarkedJobs });
  } catch (error) {
    next(error);
  }
};

export {
  getUser,
  updateUser,
  deleteUser,
  updatePassword,
  applyJobPost,
  getAllJobApplications,
  deleteJobApplicationById,
  bookmarkJobPost,
  getBookmarkedJobs,
};
