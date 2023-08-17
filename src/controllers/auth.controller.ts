import { Request, Response, NextFunction } from "express";
import User from "@/models/user.model";
import jwt from "jsonwebtoken";
import { LoginBody, RegisterBody } from "@/schema/user.schema";
import config from "config";
import {
  BAD_REQUEST,
  EMAIL_EXISTS,
  FORBIDDEN,
  INVALID_PASSWORD,
  UNAUTHORIZED,
  USER_CREATED,
  USER_NOT_FOUND,
} from "@/constants";
import Session from "@/models/session.model";

/**
 * @desc    Register
 * @route   POST /api/auth/register
 * @access  PUBLIC
 */
const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email } = req.body;

    // Check if email exists in database
    const emailExists = await User.find({ email }).lean();
    if (emailExists.length) {
      res.status(409);
      throw new Error(EMAIL_EXISTS);
    }

    // Create user
    const user = await User.create({ ...req.body });
    if (user) {
      return res.status(201).json({ message: USER_CREATED });
    } else {
      res.status(400).json({ message: BAD_REQUEST });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login
 * @route   POST /api/auth/login
 * @access  PUBLIC
 */
const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Check if user doesn't exist
    if (!user) {
      return res.status(404).json({ message: USER_NOT_FOUND });
    }

    const isPasswordMatch = await user.comparePassword(password);

    // Check if user password doesn't match password from the database
    if (!isPasswordMatch) {
      return res.status(401).json({ message: INVALID_PASSWORD });
    }

    // Create an access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        role: user.role,
        userId: user.userId,
      },
      config.get<string>("accessToken"),
      {
        expiresIn: config.get<string>("accessTokenExpiresIn"),
      }
    );

    res.cookie("jwt-token", accessToken, {
      httpOnly: true, // accessible only by the web server
      secure: true, // https only
      sameSite: "none", // cross site cookie
      maxAge: 15 * 60 * 1000, // cookie expiry: set to match accessToken (15 minutes)
    });

    // Create a refresh token
    const refreshToken = jwt.sign(
      {
        email: user.email,
      },
      config.get<string>("refreshToken"),
      { expiresIn: config.get<string>("refreshTokenExpiresIn") }
    );

    res.cookie("jwt-token-refresh", refreshToken, {
      httpOnly: true, // accessible only by the web server
      secure: true, // https only
      sameSite: "none", // cross site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry: set to match refreshToken (7 days)
    });

    // Check if email is present in the session
    const session = await Session.findOne({ email: user.email }).exec();

    if (session) {
      await session.deleteOne();
    }

    // Create a session for the token in the database
    await Session.create({ email: user.email });

    // Send access token containing user information
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh
 * @route   GET /api/auth/refresh
 * @access  PUBLIC - because token has expired
 */
const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const cookies = req.cookies;

    // Check if 'jwt-token-refresh' exists in req.cookies
    if (!cookies["jwt-token-refresh"]) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }

    const refreshToken = cookies["jwt-token-refresh"] as string;

    // Verify token
    jwt.verify(
      refreshToken,
      config.get<string>("refreshToken"),
      async (err: jwt.VerifyErrors | null, decoded) => {
        if (err) {
          return res.status(403).json({
            message: FORBIDDEN,
          });
        }

        const { email } = jwt.decode(refreshToken) as { email: string };

        const user = await User.findOne({ email });

        if (!user) {
          return res.status(401).json({ message: USER_NOT_FOUND });
        }

        // Create a new access token
        const accessToken = jwt.sign(
          {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            age: user.age,
            role: user.role,
            userId: user.userId,
          },
          config.get<string>("accessToken"),
          {
            expiresIn: config.get<string>("accessTokenExpiresIn"),
          }
        );

        // Check if email is present in the session
        const session = await Session.findOne({ email: user.email }).exec();

        if (session) {
          await session.deleteOne();
        }

        // Create a session for the token in the database
        await Session.create({ email: user.email });

        res.cookie("jwt-token", accessToken, {
          httpOnly: true, // accessible only by the web server
          secure: true, // https only
          sameSite: "none", // cross site cookie
          maxAge: 15 * 60 * 1000, // cookie expiry: set to match accessToken (15 minutes)
        });

        res.json({ accessToken });
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout
 * @route   POST /api/auth/logout
 * @access  PUBLIC - just to clear cookies if exist
 */
const logout = async (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;
  const { email } = req.user;

  res.clearCookie("jwt-token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  // Check if 'jwt' exists in req.cookies
  if (!cookies["jwt-token-refresh"]) {
    return res.status(401).json({ message: UNAUTHORIZED });
  }

  res.clearCookie("jwt-token-refresh", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  // Update the session in the sessions collection to mark the token as invalidated
  await Session.findOneAndUpdate({ email }, { invalidated: true });

  res.json({ message: "Cookie cleared" });
};

export { register, login, refresh, logout };
