/**
 * Structured logger for the Hermes Engine.
 *
 * Supports log levels controlled by the LOG_LEVEL env var (default: "info").
 * In production (NODE_ENV=production), outputs JSON for log aggregators.
 * In development, outputs colorized human-readable output.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (): LogLevel => {
  const env = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
  return LEVEL_PRIORITY[env] !== undefined ? env : "info";
};

const isProduction = () => process.env.NODE_ENV === "production";

const shouldLog = (level: LogLevel): boolean =>
  LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel()];

const time = () => new Date().toISOString();

// ── JSON output (production) ──────────────────────────────────────────────────
const jsonLog = (level: LogLevel, msg: string, meta?: Record<string, any>) => {
  const entry = {
    timestamp: time(),
    level,
    service: "hermes-engine",
    message: msg,
    ...meta,
  };
  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
};

// ── Color output (development) ────────────────────────────────────────────────
const COLORS: Record<LogLevel, string> = {
  debug: "\x1b[90m", // gray
  info: "\x1b[32m", // green
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
};
const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";

const colorLog = (level: LogLevel, msg: string, ...args: any[]) => {
  const prefix = `${COLORS[level]}[Hermes][${level.toUpperCase()}]${RESET} ${time()}`;
  switch (level) {
    case "error":
      console.error(`${prefix} ${msg}`, ...args);
      break;
    case "warn":
      console.warn(`${prefix} ${msg}`, ...args);
      break;
    default:
      console.log(`${prefix} ${msg}`, ...args);
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

export const logger = {
  debug: (msg: string, ...args: any[]) => {
    if (!shouldLog("debug")) return;
    if (isProduction()) {
      jsonLog("debug", msg, args.length ? { details: args } : undefined);
    } else {
      colorLog("debug", msg, ...args);
    }
  },

  info: (msg: string, ...args: any[]) => {
    if (!shouldLog("info")) return;
    if (isProduction()) {
      jsonLog("info", msg, args.length ? { details: args } : undefined);
    } else {
      colorLog("info", msg, ...args);
    }
  },

  warn: (msg: string, ...args: any[]) => {
    if (!shouldLog("warn")) return;
    if (isProduction()) {
      jsonLog("warn", msg, args.length ? { details: args } : undefined);
    } else {
      colorLog("warn", msg, ...args);
    }
  },

  error: (msg: string, ...args: any[]) => {
    if (!shouldLog("error")) return;
    if (isProduction()) {
      const errorMeta: Record<string, any> = {};
      for (const arg of args) {
        if (arg instanceof Error) {
          errorMeta.error = {
            name: arg.name,
            message: arg.message,
            stack: arg.stack,
          };
        } else {
          errorMeta.details = arg;
        }
      }
      jsonLog("error", msg, errorMeta);
    } else {
      colorLog("error", msg, ...args);
    }
  },

  /** Socket-specific log: prefixed with user ID and event name */
  socket: (event: string, hermesId: string, ...args: any[]) => {
    if (!shouldLog("info")) return;
    if (isProduction()) {
      jsonLog("info", `[SOCKET] ${event}`, {
        hermesId,
        ...(args.length ? { details: args } : {}),
      });
    } else {
      console.log(
        `${CYAN}[Hermes][SOCKET]${RESET} ${time()} [${hermesId}] ${event}`,
        ...args,
      );
    }
  },
};
