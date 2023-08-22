import mongoose from "mongoose";
import config from "config";
import logger from "@/utils/logger";

const connect = async () => {
  try {
    // if (process.env.NODE_ENV === "development") {
    //   await mongoose.connect(config.get<string>("mongoPath"));
    //   logger.info("Connected to database");
    // }

    await mongoose.connect(config.get<string>("mongoPath"));
    logger.info("Connected to database");
  } catch (error) {
    console.log(error);
    logger.info("Could not connect to database");
  }
};

export default connect;
