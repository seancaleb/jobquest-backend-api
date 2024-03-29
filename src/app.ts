import express from "express";
import dotenv from "dotenv";

const environment = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${environment}`,
});

import config from "config";
import connect from "@/utils/connect";
import logger from "@/utils/logger";
import errorHandler from "@/middleware/errorHandler";
import loggerMiddleware from "@/middleware/loggerMiddleware";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "@/routes/auth.route";
import usersRoute from "@/routes/users.route";
import jobsRoute from "@/routes/jobs.route";
import adminRoute from "@/routes/admin.route";
import compression from "compression";
import helmet from "helmet";
import { createRouteHandler } from "uploadthing/express";
import { fileRouter } from "./upload";

/**
 * Declarations
 */
const app = express();
const PORT = config.get<number>("PORT");

/**
 * Middlewares
 */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://snjobs.vercel.app",
    ],
    credentials: true,
  })
);
app.use(loggerMiddleware);
app.use(cookieParser());
app.use(compression());
app.use(helmet());

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: fileRouter,
  })
);

app.use(express.json());

/**
 * All Routes
 */
app.use("/api/admin", adminRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api", jobsRoute);

/**
 * Catch-all middleware
 */
app.all("*", (req, res) => {
  res.status(404);
  res.json({ message: "404 Not Found" });
});

app.use(errorHandler);

/**
 * Initialize express application
 */
app.listen(PORT, async () => {
  logger.info(
    `Application running in ${config.util
      .getEnv("NODE_CONFIG_ENV")
      .toUpperCase()}`
  );
  await connect();
  logger.info(`Application is listening at port:${PORT}`);
});
