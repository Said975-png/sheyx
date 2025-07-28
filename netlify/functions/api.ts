import serverless from "serverless-http";
import express from "express";
import cors from "cors";

// Import all route handlers
import { handleDemo } from "../../server/routes/demo";
import {
  handleImageUpload,
  handleGenerateWebsite,
} from "../../server/routes/upload";
import { handleSendOrder } from "../../server/routes/orders";
import { handleGroqChat } from "../../server/routes/groq-chat";
import {
  createContract,
  getUserContracts,
  getContract,
} from "../../server/routes/contracts";
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBooking,
  deleteBooking,
} from "../../server/routes/bookings";

// Create Express app specifically for Netlify Functions
function createNetlifyApp() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check
  app.get("/ping", (_req, res) => {
    res.json({
      message: "Netlify function is working!",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || "development",
    });
  });

  // API routes (without /api prefix since Netlify redirects handle that)
  app.get("/demo", handleDemo);

  // Upload and generation routes
  app.post("/upload", handleImageUpload);
  app.get("/generated/:imageId", handleGenerateWebsite);

  // Orders route
  app.post("/orders", handleSendOrder);

  // Groq chat route
  app.post("/groq-chat", handleGroqChat);

  // Contracts routes
  app.post("/contracts", createContract);
  app.get("/contracts", getUserContracts);
  app.get("/contracts/:contractId", getContract);

  // Bookings routes
  app.post("/bookings", createBooking);
  app.get("/bookings", getUserBookings);
  app.get("/bookings/all", getAllBookings);
  app.put("/bookings/:bookingId", updateBooking);
  app.delete("/bookings/:bookingId", deleteBooking);

  // Catch-all for unmatched API routes
  app.use("*", (req, res) => {
    console.log(
      `[Netlify Function] Unmatched route: ${req.method} ${req.originalUrl}`,
    );
    res.status(404).json({
      error: "API endpoint not found",
      path: req.originalUrl,
      method: req.method,
    });
  });

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Netlify Function Error]:", err);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  });

  return app;
}

// Export the handler for Netlify
export const handler = serverless(createNetlifyApp(), {
  binary: ["image/*", "application/octet-stream"],
});
