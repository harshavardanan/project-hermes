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

  // ── Security ───────────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );

  // ── CORS ───────────────────────────────────────────────────────────────────
  // /hermes/* routes are SDK-facing → open to ANY origin (third-party devs)
  // /api/* and /auth/* routes are dashboard-facing → restricted to CLIENT_ORIGIN
  const allowedOrigins: string[] = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

  const dashboardCors = cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    credentials: true,
  });

  const hermesCors = cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  // Apply open CORS to all /hermes routes (SDK endpoints)
  app.use("/hermes", hermesCors);

  // Apply restricted CORS to dashboard routes
  app.use("/api", dashboardCors);
  app.use("/auth", dashboardCors);

  // ── Body parsing ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // ── Passport (ORDER MATTERS) ───────────────────────────────────────────────
  app.use(passport.initialize());

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use("/api/docs", docRoutes);
  app.use("/api", pricingRoutes);
  app.use("/auth", authRoutes);
  app.use("/api", projectRoutes);
  app.use("/api/admin", adminRoutes);

  // ── Server ─────────────────────────────────────────────────────────────────
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      // Sockets are intentionally open to any origin — SDK clients can connect from anywhere
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 30000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e7,
    transports: ["polling", "websocket"],
  });

  initHermes(io, app);

  const PORT = process.env.PORT || 8080;

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // ── Graceful shutdown ──────────────────────────────────────────────────────
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down...`);

    server.close(() => {
      console.log("HTTP server closed.");
    });

    io.disconnectSockets(true);

    setTimeout(() => {
      process.exit(0);
    }, 5000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  return { app, server, io };
}