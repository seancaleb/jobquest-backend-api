import { UserType } from "@/schema/user.schema";
import { Schema } from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    user: Pick<UserType, "email" | "role"> & { id: Schema.Types.ObjectId };
  }
}
