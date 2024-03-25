import {
  createJobPost,
  deleteJobPost,
  getApplicationsOverview,
  getAllJobApplications,
  getAllJobPostings,
  getJob,
  getJobApplication,
  getJobs,
  updateJobApplicationStatus,
  updateJobPost,
  getAllApplications,
} from "@/controllers/jobs.controller";
import authorizeUser from "@/middleware/authorizeUser";
import pagination from "@/middleware/pagination";
import validateResource from "@/middleware/validateResource";
import verifyJwt from "@/middleware/verifyJwt";
import {
  createJobPostSchema,
  deleteJobApplicationSchema,
  getAllJobApplicationsSchema,
  getJobSchema,
  updateJobApplicationStatusSchema,
  updateJobPostSchema,
} from "@/schema/job.schema";
import express from "express";

const router = express.Router();

router.get("/jobs", pagination, getJobs);
router.get("/jobs/:jobId", validateResource(getJobSchema), getJob);

router.use(verifyJwt);
router.use(authorizeUser("employer"));

router.post(
  "/employers/jobs",
  validateResource(createJobPostSchema),
  createJobPost
);
router.patch(
  "/employers/jobs/:jobId",
  validateResource(updateJobPostSchema),
  updateJobPost
);
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
router.get("/employers/jobs", pagination, getAllJobPostings);
router.get("/employers/jobs/applications/overview", getApplicationsOverview);
router.get(
  "/employers/jobs/:jobId/applications/:applicationId",
  getJobApplication
);
router.get("/employers/jobs/applications", getAllApplications);

export default router;
