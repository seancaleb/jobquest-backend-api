import { Request, Response, NextFunction } from "express";
import User from "@/models/user.model";
import Application from "@/models/application.model";

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  PROTECTED - 'admin' only
 */
const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.user;

    // Get all users
    const users = await User.find({ _id: { $ne: id } })
      .select("-password")
      .lean();

    res.json({ total: users.length, users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all job application list of all users
 * @route   GET /api/admin/applications
 * @access  PROTECTED - 'admin' only
 */
const getAllJobApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    // Get all job applications
    const jobApplications = await Application.find().lean();

    res.json({ total: jobApplications.length, jobApplications });
  } catch (error) {
    next(error);
  }
};

export { getUsers, getAllJobApplications };
