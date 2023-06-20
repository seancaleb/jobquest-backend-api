import { z } from "zod";

const registerUserPayload = {
  body: z.object({
    firstName: z.string({
      required_error: "First name is required",
    }),
    lastName: z.string({
      required_error: "Last name is required",
    }),
    age: z.number().nullish(),
    email: z.string({ required_error: "Email is required" }).email("Not a valid email"),
    role: z.enum(["user", "employer", "admin"], { required_error: "Role is required" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password is too short - minimum of 6 characters")
      .max(50, "Password too long"),
  }),
};

const loginUserPayload = {
  body: z.object({
    email: z.string({ required_error: "Email is required" }).email("Not a valid email"),
    password: z.string({ required_error: "Password is required" }),
  }),
};

const updateUserPayload = {
  body: registerUserPayload["body"].pick({
    firstName: true,
    lastName: true,
    age: true,
    email: true,
  }),
};

const updatePasswordPayload = {
  body: z.object({
    password: z.string({ required_error: "Password is required" }),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "Password is too short - minimum of 6 characters")
      .max(50, "Password too long"),
  }),
};

const bookmarkJobPostPayload = {
  params: z.object({
    jobId: z.string(),
  }),
};

// Base type for User model in mongoose
export type UserType = z.infer<typeof registerUserPayload.body>;

export const registerUserSchema = z.object({ ...registerUserPayload });
export const loginUserSchema = z.object({ ...loginUserPayload });
export const updateUserSchema = z.object({ ...updateUserPayload });
export const updatePasswordSchema = z.object({ ...updatePasswordPayload });
export const bookmarkJobPostSchema = z.object({ ...bookmarkJobPostPayload });

export type RegisterBody = z.infer<typeof registerUserSchema>["body"];
export type LoginBody = z.infer<typeof loginUserSchema>["body"];
export type UpdateUserBody = z.infer<typeof updateUserSchema>["body"];
export type UpdatePasswordBody = z.infer<typeof updatePasswordSchema>["body"];
