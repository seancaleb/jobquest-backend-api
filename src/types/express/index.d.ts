import { UserType } from "@/schema/user.schema";
import { Schema } from "mongoose";

type Pagination = {
  pageNumber: number;
  limit: number;
  startIndex: number;
  lastIndex: number;
};

declare module "express-serve-static-core" {
  interface Request {
    user: Pick<UserType, "email" | "role"> & { id: Schema.Types.ObjectId };
    pagination: Pagination;
  }
}
