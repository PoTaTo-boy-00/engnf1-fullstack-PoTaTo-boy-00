
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware";


import authRoutes from "./modules/auth/auth.routes";
import ticketRoutes from "./modules/tickets/ticket.routes";
import resourceRoutes from "./modules/resources/resource.routes";
import bookingRoutes from "./modules/bookings/booking.routes";

import { authenticate } from "./middleware/auth.middleware";
import { getTicketStatsController } from "./modules/tickets/ticket.controller";
import { getAdminBookingStatsController } from "./modules/bookings/booking.controller";
import { requireAdmin } from "./middleware/role.middleware";

const app = express();

// Security and request middleware
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ message: "TriageSync API is running" });
});

// API routes

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/resources", resourceRoutes);
app.get("/api/stats", authenticate, getTicketStatsController);
app.use("/api/bookings", bookingRoutes);

app.get("/api/admin/stats", authenticate, requireAdmin, getAdminBookingStatsController);
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
