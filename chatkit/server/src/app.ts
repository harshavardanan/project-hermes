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

export async function start() {
  const app: Application = express();
  const mongoUri = process.env.MONGO_URI!;

  await connectDB(mongoUri);
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    }),
  );

  app.use(express.json());

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

  // 3. Passport Initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // 4. Routes
  app.use("/auth", authRoutes);
  app.use("/api", projectRoutes);
  app.use("/api", pricingRoutes);

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });

  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () =>
    console.log(`🚀 Server on http://localhost:${PORT}`),
  );

  return { app, server, io };
}
