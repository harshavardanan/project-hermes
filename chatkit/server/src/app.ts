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
  // Allowed HTTP origins are read from CLIENT_ORIGIN (comma-separated list in .env)
  // e.g. CLIENT_ORIGIN="https://hermes-sdk.vercel.app,http://localhost:5173"
  const allowedOrigins: string[] = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow server-to-server / curl (no origin header) and any whitelisted origin
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin "${origin}" not allowed`));
        }
      },
      credentials: true,
    }),
  );

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