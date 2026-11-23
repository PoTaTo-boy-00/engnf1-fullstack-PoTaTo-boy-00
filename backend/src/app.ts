
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware";


import authRoutes from "./modules/auth/auth.routes";

const app = express();

// Security and request middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ message: "TriageSync API is running" });
});

// API routes

app.use("/api/auth", authRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

app.use(errorHandler);

export default app;
