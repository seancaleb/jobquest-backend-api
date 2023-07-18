import { Request, Response, NextFunction } from "express";
import Session from "@/models/session.model";
import { UNAUTHORIZED, UNAUTHORIZED_TOKEN_INVALIDATED } from "@/constants";

const verifyTokenSession = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.user;

  // Check if the email exists in the sessions collection and is not invalidated
  const session = await Session.findOne({ email });

  if (!session || session.invalidated) {
    // Token is not found or invalidated, reject the request
    return res.status(401).json({ message: UNAUTHORIZED_TOKEN_INVALIDATED });
  }

  next();
};

export default verifyTokenSession;
