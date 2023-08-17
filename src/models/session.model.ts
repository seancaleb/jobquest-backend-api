import mongoose, { Schema, Document } from "mongoose";
import config from "config";

export interface SessionDocument extends Document {
  email: string;
  invalidated: boolean;
  expireAt: Date;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    invalidated: {
      type: Boolean,
      default: false,
    },
    expireAt: {
      type: Date,
      default: Date.now,
      expires: config.get<string>("accessTokenExpiresIn"),
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<SessionDocument>("Session", sessionSchema);
