// libs import
import express from "express";
import crypto from "crypto";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

// local imports
import authRoutes from "./routes/auth.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

const app = express();

// Middlewares
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.requestId = req.headers["x-request-id"] || crypto.randomUUID();
  res.set("x-request-id", req.requestId);
  next();
});
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Security Middlewares
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

app.get("/health", async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(dbStatus === "connected" ? 200 : 503).json({
    status: dbStatus === "connected" ? "OK" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    memory: process.memoryUsage(),
  });
});

// API Routes

// add limiter
app.use("/api", apiLimiter);
app.use("/api/v1/auth", authRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
