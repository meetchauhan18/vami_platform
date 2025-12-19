// libs import
import dotenv from "dotenv";
dotenv.config();

// local imports
import app from "./src/app.js";
import { closeDB, connectDB } from "./src/config/database.js";
import { validateEnv } from "./src/config/validateEnv.js";

const PORT = process.env.PORT || 3000;

validateEnv();

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("HTTP server closed");
        await closeDB();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((error) => {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  });
