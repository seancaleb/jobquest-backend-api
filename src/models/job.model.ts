import { JobType, defaultCities } from "@/schema/job.schema";
import mongoose, { Schema, Document, Types } from "mongoose";
import { customAlphabet } from "nanoid";

export interface JobDocument extends JobType, Document {
  applications: (typeof Types.ObjectId)[];
  employerId: typeof Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 10);

const jobSchema = new Schema<JobDocument>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      default: () => `job_${nanoid()}`,
    },
    employerId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String],
      required: true,
    },
    location: {
      type: String,
      enum: defaultCities,
      required: true,
    },
    applications: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<JobDocument>("Job", jobSchema);
