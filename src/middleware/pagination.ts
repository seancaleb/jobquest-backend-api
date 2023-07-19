import { Request, Response, NextFunction } from "express";

const pagination = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageNumber = parseInt(req.query.offset as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const startIndex = (pageNumber - 1) * limit;
    const lastIndex = startIndex + limit;

    req.pagination = {
      pageNumber,
      limit,
      startIndex,
      lastIndex,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default pagination;
