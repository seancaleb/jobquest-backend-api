import User from "@/models/user.model";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "config";
import { UserType } from "@/schema/user.schema";
import { FORBIDDEN, UNAUTHORIZED, ACCOUNT_NOT_FOUND } from "@/constants";
import { ObjectId } from "mongoose";

const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const cookies = req.cookies;

  // Check if 'jwt-token' exists in req.cookies
  if (!cookies["jwt-token"]) {
    return res.status(401).json({ message: UNAUTHORIZED });
  }

  const token = cookies["jwt-token"] as string;

  jwt.verify(token, config.get<string>("accessToken"), async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: FORBIDDEN });
    }

    const { id } = decoded as Omit<UserType, "password"> & { id: ObjectId };

    // Check if user exists in database
    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({ message: ACCOUNT_NOT_FOUND });
    }

    req.user = { id, email: user.email, role: user.role };
    next();
  });
};

export default verifyJwt;
