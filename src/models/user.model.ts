import mongoose, { Schema, Document, Query, Types } from "mongoose";
import bcrypt from "bcrypt";
import config from "config";
import { UserType } from "@/schema/user.schema";

export interface UserDocument extends UserType, Document {
  bookmark: (typeof Types.ObjectId)[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<Error | boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "employer", "admin"],
      default: "user",
    },
    bookmark: [{ type: Types.ObjectId, ref: "Job" }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  if (this.role !== "user") {
    this.set("bookmark", undefined);
  }

  const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
  const hash = bcrypt.hashSync(this.password, salt);

  this.password = hash;

  return next();
});

userSchema.pre<Query<any, UserDocument>>("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as { password: string };

  if (update.password) {
    const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
    const hash = bcrypt.hashSync(update.password, salt);

    this.set("password", hash);
    next();
  }
  next();
});

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<Error | boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<UserDocument>("User", userSchema);
