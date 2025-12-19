// libs import
import dotenv from "dotenv";
dotenv.config();

// local imports
import app from "./src/app.js";
import { closeDB, connectDB } from "./src/config/database.js";
import { validateEnv } from "./src/config/validateEnv.js";
import logger from "./src/utils/logger.js";

const PORT = process.env.PORT || 3000;

validateEnv();

let server; // Declare server variable outside to make it accessible

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    });

    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");
        await closeDB();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((error) => {
    logger.error("MongoDB connection error: ", error);
    process.exit(1);
  });
