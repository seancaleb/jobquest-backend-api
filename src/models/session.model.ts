import mongoose, { Schema, Document, Query, Types } from "mongoose";

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
      expires: 900,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<SessionDocument>("Session", sessionSchema);
