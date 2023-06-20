import { ApplicationType } from "@/schema/application.schema";
import mongoose, { Schema, Document, Types } from "mongoose";
import { customAlphabet } from "nanoid";

export interface ApplicationDocument extends ApplicationType, Document {
  jobId: string;
  applicantId: typeof Types.ObjectId;
  applicationId: string;
  status: "submitted" | "accepted" | "rejected" | "under review";
  createdAt: Date;
  updatedAt: Date;
}

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", 10);

const applicationSchema = new Schema<ApplicationDocument>(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      default: () => `application_${nanoid()}`,
    },
    jobId: {
      type: String,
      required: true,
      ref: "Job",
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "accepted", "rejected", "under review"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ApplicationDocument>("Application", applicationSchema);
