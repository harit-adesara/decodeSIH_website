import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { ApiError } from "./utils/ApiError.js";

// Import Route Handlers
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import healthAssistantRouter from "./routes/healthAssistant.routes.js";
import publicRouter from "./routes/public.routes.js";
import chatRouter from "./routes/chat.routes.js";

const app = express();

// Security and Logging Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(morgan("dev"));

// Static Folder for Medical Uploads & Assets
app.use("/uploads", express.static(path.resolve("public/uploads")));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Bharat Swasthya AI Engine",
    timestamp: new Date().toISOString(),
  });
});

// API V1 Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/doctor", doctorRouter);
app.use("/api/v1/health-assistant", healthAssistantRouter);
app.use("/api/v1/public", publicRouter);
app.use("/api/v1/chat", chatRouter);

// Catch-all 404 handler for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found on Bharat Swasthya AI Server.`));
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
