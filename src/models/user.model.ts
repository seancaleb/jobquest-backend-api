import mongoose, { Schema, Document, Query, Types } from "mongoose";
import bcrypt from "bcrypt";
import config from "config";
import { UserType } from "@/schema/user.schema";
import generateUniqueId from "@/utils/generateUniqueId";

export interface UserDocument extends UserType, Document {
  bookmark: string[];
  applications: string[];
  createdAt: Date;
  updatedAt: Date;
  avatar: string;
  comparePassword(candidatePassword: string): Promise<Error | boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    userId: {
      type: String,
      unique: true,
    },
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
    avatar: {
      type: String,
      default: null,
    },
    bookmark: [{ type: String, ref: "Job" }],
    applications: [{ type: String, ref: "Job" }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre<UserDocument>("save", async function (next) {
  if (this.isNew) {
    this.userId = generateUniqueId(this.role);
  }

  if (this.role !== "user") {
    this.set("bookmark", undefined);
    this.set("applications", undefined);
  }

  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
  const hash = bcrypt.hashSync(this.password, salt);

  this.password = hash;

  return next();
});

userSchema.pre<Query<any, UserDocument>>(
  "findOneAndUpdate",
  async function (next) {
    const update = this.getUpdate() as { password: string };

    if (update.password) {
      const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
      const hash = bcrypt.hashSync(update.password, salt);

      this.set("password", hash);
      next();
    }
    next();
  }
);

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<Error | boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<UserDocument>("User", userSchema);
