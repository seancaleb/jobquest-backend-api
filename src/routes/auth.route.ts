import { login, logout, refresh, register } from "@/controllers/auth.controller";
import validateResource from "@/middleware/validateResource";
import verifyJwt from "@/middleware/verifyJwt";
import { loginUserSchema, registerUserSchema } from "@/schema/user.schema";
import express from "express";

const router = express.Router();

router.post("/register", validateResource(registerUserSchema), register);
router.post("/login", validateResource(loginUserSchema), login);
router.get("/refresh", refresh);

router.use(verifyJwt);

router.post("/logout", logout);

export default router;
