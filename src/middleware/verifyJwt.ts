import User from "@/models/user.model";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "config";
import { UserType } from "@/schema/user.schema";
import { FORBIDDEN, UNAUTHORIZED } from "@/constants";
import { ObjectId } from "mongoose";

const verifyJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || (req.headers.Authorization as string);

  if (!authHeader) {
    return res.status(401).json({ message: UNAUTHORIZED });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: UNAUTHORIZED });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, config.get<string>("accessToken"), async (err, decoded) => {
    if (err) {
      console.log("What is the error?");
      return res.status(403).json({ message: FORBIDDEN });
    }

    const { id, email } = decoded as Omit<UserType, "password"> & { id: ObjectId };

    // Check if user exists in database
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(401).json({ message: UNAUTHORIZED });
    }

    req.user = { id, email: user.email, role: user.role };
    next();
  });
};

export default verifyJwt;
