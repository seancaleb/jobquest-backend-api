import { z } from "zod";

export const defaultCities = [
  "Manila",
  "Makati City",
  "Taguig City",
  "Pasig City",
  "Quezon City",
] as const;

const ArrayOfDescriptions = (field: string) =>
  z
    .array(
      z
        .string({ required_error: `${field} is required` })
        .min(6, `${field} is too short - minimum of 6 characters`)
        .max(256, `${field} is too long`)
    )
    .nonempty(`Should contain at least one ${field.toLowerCase()}`);

const StringDescription = (field: string) =>
  z
    .string({ required_error: `${field} is required` })
    .min(6, `${field} is too short - minimum of 12 characters`);

const payload = {
  body: z.object({
    title: StringDescription("Title"),
    description: StringDescription("Description"),
    requirements: ArrayOfDescriptions("Requirement"),
    location: z.enum(defaultCities),
  }),
};

const params = {
  params: z.object({
    jobId: z.string({ required_error: "Job ID is required" }),
  }),
};

const updateJobApplicationStatusPayload = {
  body: z.object({
    status: z.enum(["applied", "application viewed", "Not selected by employer"]),
  }),
  params: z.object({
    jobId: z.string({ required_error: "Job ID is required" }),
    applicationId: z.string({ required_error: "Application ID is required" }),
  }),
};

// Base type for Job model in mongoose
export type JobType = z.infer<typeof payload.body> & z.infer<typeof params.params>;

export const createJobPostSchema = z.object({ ...payload });
export const updateJobPostSchema = z.object({ ...payload, ...params });
export const getAllJobApplicationsSchema = z.object({ ...params });
export const updateJobApplicationStatusSchema = z.object({ ...updateJobApplicationStatusPayload });
export const deleteJobApplicationSchema = z.object({ ...params });
export const getJobSchema = z.object({ ...params });

export type CreateJobPostBody = z.infer<typeof createJobPostSchema>["body"];
export type UpdateJobPostBody = z.infer<typeof updateJobPostSchema>["body"];
export type JobIdParams = z.infer<typeof params.params>;
export type UpdateJobApplicationParams = z.infer<typeof updateJobApplicationStatusPayload.params>;
export type UpdateJobApplicationBody = z.infer<typeof updateJobApplicationStatusPayload.body>;
