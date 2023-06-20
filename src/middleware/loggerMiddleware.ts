import logger from "@/utils/logger";
import { NextFunction, Request, Response } from "express";

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method}\t${req.url}`);
  next();
};

export default loggerMiddleware;
