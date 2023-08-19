import { ACCESS_DENIED_ADMIN, ACCESS_DENIED_APPLICANT, ACCESS_DENIED_EMPLOYER } from "@/constants";
import { Request, Response, NextFunction } from "express";

const authorizeUser =
  (accessType: "employer" | "admin" | "user") =>
  (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user;

    if (accessType === "admin")
      return accessType !== role ? res.status(403).json({ message: ACCESS_DENIED_ADMIN }) : next();
    else if (accessType === "employer")
      return accessType !== role
        ? res.status(403).json({ message: ACCESS_DENIED_EMPLOYER })
        : next();
    else
      return accessType !== role
        ? res.status(403).json({ message: ACCESS_DENIED_APPLICANT })
        : next();
  };

export default authorizeUser;
