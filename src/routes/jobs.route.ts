import {
  createJobPost,
  deleteJobPost,
  getAllJobApplications,
  getAllJobPostings,
  getJobs,
  updateJobApplicationStatus,
  updateJobPost,
} from "@/controllers/jobs.controller";
import authorizeUser from "@/middleware/authorizeUser";
import validateResource from "@/middleware/validateResource";
import verifyJwt from "@/middleware/verifyJwt";
import {
  createJobPostSchema,
  deleteJobApplicationSchema,
  getAllJobApplicationsSchema,
  updateJobApplicationStatusSchema,
  updateJobPostSchema,
} from "@/schema/job.schema";
import express from "express";

const router = express.Router();

router.get("/jobs", getJobs);

router.use(verifyJwt);
router.use(authorizeUser("employer"));

router.post("/employers/jobs", validateResource(createJobPostSchema), createJobPost);
router.patch("/employers/jobs/:jobId", validateResource(updateJobPostSchema), updateJobPost);
router.get(
  "/employers/jobs/:jobId/applications",
  validateResource(getAllJobApplicationsSchema),
  getAllJobApplications
);
router.patch(
  "/employers/jobs/:jobId/applications/:applicationId/review",
  validateResource(updateJobApplicationStatusSchema),
  updateJobApplicationStatus
);
router.delete(
  "/employers/jobs/:jobId",
  validateResource(deleteJobApplicationSchema),
  deleteJobPost
);
router.get("/employers/jobs", getAllJobPostings);

export default router;
