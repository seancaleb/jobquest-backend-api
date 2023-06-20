import { getAllJobApplications, getUsers } from "@/controllers/admin.controller";
import authorizeUser from "@/middleware/authorizeUser";
import verifyJwt from "@/middleware/verifyJwt";
import express from "express";

const router = express.Router();

router.use(verifyJwt);
router.use(authorizeUser("admin"));

router.get("/users", getUsers);
router.get("/applications", getAllJobApplications);

export default router;
