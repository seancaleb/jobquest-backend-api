import { ApplicationType } from "@/schema/application.schema";
import mongoose, { Schema, Document, Types } from "mongoose";
import generateUniqueId from "@/utils/generateUniqueId";

export interface ApplicationDocument extends ApplicationType, Document {
  jobId: string;
  applicantId: typeof Types.ObjectId;
  applicationId: string;
  status: "Applied" | "Application viewed" | "not selected by employer";
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<ApplicationDocument>(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      default: () => generateUniqueId("application"),
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
      enum: ["Applied", "Application viewed", "Not selected by employer"],
      default: "Applied",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ApplicationDocument>("Application", applicationSchema);
