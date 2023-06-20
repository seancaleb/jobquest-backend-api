import { z } from "zod";

const payload = {
  body: z.object({
    resume: z.string({ required_error: "Resume is required" }).url("Not a valid link"),
    coverLetter: z.string({ required_error: "Cover letter is required" }),
  }),
};

const params = {
  params: z.object({
    applicationId: z.string(),
  }),
};

export const applyJobPostSchema = z.object({ ...payload });
export const deleteJobApplicationSchema = z.object({ ...params });

// Base type for Application model in mongoose
export type ApplicationType = z.infer<typeof payload.body>;

export type AppyJobPostBody = z.infer<typeof applyJobPostSchema>["body"];
export type JobApplicationIdParams = z.infer<typeof deleteJobApplicationSchema>["params"];
