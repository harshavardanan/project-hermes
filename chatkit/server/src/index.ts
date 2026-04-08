// src/index.ts
import "dotenv/config";
import { start } from "./app.js";

// ── Startup environment validation ──────────────────────────────────────────
const REQUIRED_ENV = ["MONGO_URI", "SESSION_SECRET", "CLIENT_ORIGIN"] as const;

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `\n❌ Missing environment variables:\n${missing
      .map((k) => `   • ${k}`)
      .join("\n")}\n`,
  );
  process.exit(1);
}

start();
