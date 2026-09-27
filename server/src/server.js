import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

import authRouter from "./routes/auth.routes.js";
import complaintRouter from "./routes/complaint.routes.js";
import staffRouter from "./routes/staff.routes.js";
import adminRouter from "./routes/admin.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import chatRouter from "./routes/chat.routes.js";
import aiRouter from "./routes/ai.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

dotenv.config({ path: "./.env" });

const server = express();

// Ensure public/uploads exists
const uploadDir = path.resolve("public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS configuration
server.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.ALLOW_ORIGIN || "https://dev-mark.vercel.app"
    ],
    credentials: true
  })
);

server.use(express.json({ limit: "25mb" }));
server.use(cookieParser());
server.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Static file hosting
server.use(express.static("public"));
server.use("/uploads", express.static("public/uploads"));

// Health check
server.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Smart City — AI-Powered Civic Complaint Management System",
    timestamp: new Date().toISOString()
  });
});

// API Routes mounted on both /api/v1 and /api for backwards & forwards compatibility
const mountRoutes = (basePath) => {
  server.use(`${basePath}/auth`, authRouter);
  server.use(`${basePath}/complaints`, complaintRouter);
  server.use(`${basePath}/staff`, staffRouter);
  server.use(`${basePath}/admin`, adminRouter);
  server.use(`${basePath}/notifications`, notificationRouter);
  server.use(`${basePath}/chat`, chatRouter);
  server.use(`${basePath}/ai`, aiRouter);
};

mountRoutes("/api/v1");
mountRoutes("/api");

// Global error handler
server.use(errorHandler);

export default server;
