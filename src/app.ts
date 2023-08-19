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

/**
 * Declarations
 */
dotenv.config();
const app = express();
const PORT = config.get<number>("PORT");

/**
 * Middleware entrypoint
 */
app.use(loggerMiddleware);
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(compression());
app.use(helmet());

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
  logger.info(`Application running in ${config.util.getEnv("NODE_ENV").toUpperCase()}`);
  await connect();
  logger.info(`Application is listening at port:${PORT}`);
});
