
import http from "http";
import express from "express";
import type { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import { Server } from "socket.io";
import "dotenv/config";

import "./config/passport.js";
import { connectDB } from "./config/db.js";
import projectRoutes from "./routes/ProjectsRoute.js";
import authRoutes from "./routes/auth.js";
import pricingRoutes from "./routes/PricingRoute.js";
import docRoutes from "./routes/Docroute.js";
import adminRoutes from "./routes/AdminRoute.js";
import { initHermes } from "./hermes-engine/src/index.js";

export async function start() {
  const app: Application = express();
  const mongoUri = process.env.MONGO_URI!;

  await connectDB(mongoUri);

  app.set("trust proxy", 1);

  // ── Security headers ────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false, // CSP managed by frontend/CDN
      crossOriginEmbedderPolicy: false, // Allow cross-origin embeds (Cloudinary etc.)
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => callback(null, origin || true),
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    }),
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(passport.initialize());

  app.use("/api/docs", docRoutes);
  app.use("/api", pricingRoutes);
  app.use("/auth", authRoutes);
  app.use("/api", projectRoutes);
  app.use("/api/admin", adminRoutes);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, origin || true),
      credentials: true,
    },
    // Performance tuning for Socket.IO
    pingTimeout: 30000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e7, // 10MB max payload
    transports: ["websocket", "polling"],
  });

  initHermes(io, app);

  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () =>
    console.log(`🚀 Server on http://localhost:${PORT}`),
  );

  // ── Graceful shutdown ───────────────────────────────────────────────────────
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    // Stop accepting new connections
    server.close(() => {
      console.log("HTTP server closed.");
    });

    // Close all socket connections
    io.disconnectSockets(true);

    // Allow 5s for in-flight requests
    setTimeout(() => {
      console.log("Force shutdown after timeout.");
      process.exit(0);
    }, 5000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  return { app, server, io };
}
