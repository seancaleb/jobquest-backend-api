import {
  createUploadthing,
  type FileRouter as UploadthingFileRouter,
} from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";
import User from "@/models/user.model";
import { UNAUTHORIZED } from "@/constants";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: {
      maxFileSize: "2MB",
    },
  })
    .middleware(({ req }) => {
      const userHeaders = req.headers["x-auth-user"] as string;
      const user = JSON.parse(userHeaders) as AuthState;

      if (!user.isAuthenticated) {
        throw new UploadThingError(UNAUTHORIZED);
      }

      return { id: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log({ metadata, file });

      await User.findOneAndUpdate(
        { userId: metadata.id },
        {
          avatar: file.url,
        },
        {
          runValidators: true,
          new: true,
        }
      );
    }),
} satisfies UploadthingFileRouter;

export type FileRouter = typeof fileRouter;
