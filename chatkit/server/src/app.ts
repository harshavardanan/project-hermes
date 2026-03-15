import http from "http";
import express from "express";
import type { Application } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Server } from "socket.io";
import "dotenv/config";

import "./config/passport.js";
import { connectDB } from "./config/db.js";
import projectRoutes from "./routes/ProjectsRoute.js";
import authRoutes from "./routes/auth.js";
import pricingRoutes from "./routes/PricingRoute.js";
import docRoutes from "./routes/Docroute.js";
import { initHermes } from "./hermes-engine/src/index.js"; // 👈 Hermes

export async function start() {
  const app: Application = express();
  const mongoUri = process.env.MONGO_URI!;

  await connectDB(mongoUri);

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: mongoUri }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );
  app.set("trust proxy", 1);
  app.use(passport.initialize());
  app.use(passport.session());

  // ── Existing routes ─────────────────────────────────────────────────────────
  app.use("/api/docs", docRoutes);
  app.use("/api", pricingRoutes);
  app.use("/auth", authRoutes);
  app.use("/api", projectRoutes);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });

  // ── Hermes Engine ───────────────────────────────────────────────────────────
  initHermes(io, app); // 👈 One line, that's it

  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () =>
    console.log(`🚀 Server on http://localhost:${PORT}`),
  );

  return { app, server, io };
}
