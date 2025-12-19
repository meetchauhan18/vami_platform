import mongoose from "mongoose";
import logger from "../utils/logger";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info("MongoDB connected: ", conn.connection.host);
    logger.info("Database", conn.connection.name);
  } catch (error) {
    logger.error("MongoDB connection error: ", error);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error("MongoDB disconnection error: ", error);
  }
};

export { connectDB, closeDB };
