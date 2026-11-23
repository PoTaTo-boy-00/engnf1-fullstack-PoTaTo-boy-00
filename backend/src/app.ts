
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

// Security and request middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
// Health checr
app.get("/health", (_req, res) => {
  res.status(200).json({ message: "TriageSync API is running" });
});

// API routes

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});
export default app;
