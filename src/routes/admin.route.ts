import { getAllJobApplications, getUsers } from "@/controllers/admin.controller";
import authorizeUser from "@/middleware/authorizeUser";
import verifyJwt from "@/middleware/verifyJwt";
import verifyTokenSession from "@/middleware/verifyTokenSession";
import express from "express";

const router = express.Router();

router.use(verifyJwt, verifyTokenSession);
router.use(authorizeUser("admin"));

router.get("/users", getUsers);
router.get("/applications", getAllJobApplications);

export default router;
