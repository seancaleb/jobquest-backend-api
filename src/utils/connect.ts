import mongoose from "mongoose";
import config from "config";
import logger from "@/utils/logger";

const connect = async () => {
  try {
    await mongoose.connect(config.get<string>("mongoPath"));
    logger.info("Connected to database");
  } catch (error) {
    logger.info(error);
    logger.info("Could not connect to database");
  }
};

export default connect;
