import { UNAUTHORIZED_ADMIN, UNAUTHORIZED_APPLICANT, UNAUTHORIZED_EMPLOYER } from "@/constants";
import { Request, Response, NextFunction } from "express";

const authorizeUser =
  (accessType: "employer" | "admin" | "user") =>
  (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user;

    if (accessType === "admin")
      return accessType !== role ? res.status(401).json({ message: UNAUTHORIZED_ADMIN }) : next();
    else if (accessType === "employer")
      return accessType !== role
        ? res.status(401).json({ message: UNAUTHORIZED_EMPLOYER })
        : next();
    else
      return accessType !== role
        ? res.status(401).json({ message: UNAUTHORIZED_APPLICANT })
        : next();
  };

export default authorizeUser;
