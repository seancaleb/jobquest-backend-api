import express from "express";
import config from "config";
import connect from "@/utils/connect";
import logger from "@/utils/logger";
import dotenv from "dotenv";
import errorHandler from "@/middleware/errorHandler";
import loggerMiddleware from "@/middleware/loggerMiddleware";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "@/routes/auth.route";
import usersRoute from "@/routes/users.route";
import jobsRoute from "@/routes/jobs.route";
import adminRoute from "@/routes/admin.route";

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
    credentials: true,
  })
);
app.use(cookieParser());

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
  await connect();
  logger.info(`Application is listening at port:${PORT}`);
});
