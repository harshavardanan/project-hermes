import React, { useState, useEffect, useCallback } from "react";

const HEALTH_URL = "http://localhost:8080/hermes/health";
const METRICS_URL = "http://localhost:8080/hermes/metrics";
const POLL_MS = 5000; // Increased to 5 seconds to help prevent 429 Rate Limits
const MAX_SAMPLES = 60;

// ── Clean Minimal Color Palette ──
const COLORS = {
  latency: "#38bdf8", // Sky Blue
  throughput: "#34d399", // Emerald Green
  cpu: "#fbbf24", // Amber
  memory: "#a78bfa", // Purple
  load: "#f472b6", // Pink (for LiveChart)
};

interface HealthData {
  status: string;
  uptime: number;
  memory: { used: number; total: number };
  cpu: number;
  version?: string;
  region?: string;
  nodeId?: string;
}

interface MetricsData {
  activeConnections: number;
  totalMessages: number;
  messagesPerSecond: number;
  rooms?: number;
  projects?: number;
}

interface Sample {
  t: number;
  latency: number;
  load: number;
  mps: number;
  cpu: number;
  memory: number;
}

const Sparkline = ({
  data,
  color,
  height = 40,
}: {
  data: number[];
  color: string;
  height?: number;
}) => {
  if (data.length < 2) return <div style={{ height }} />;

  const max = Math.max(...data, 1);
  const w = 200;
  const h = height;

  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h * 0.9}`)
    .join(" ");

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <polyline
        fill={`url(#sg-${color.replace("#", "")})`}
        stroke="none"
        points={`0,${h} ${pts} ${w},${h}`}
      />

      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
};

const LiveChart = ({ samples }: { samples: Sample[] }) => {
  const maxL = Math.max(...samples.map((s) => s.latency), 1);
  const maxM = Math.max(...samples.map((s) => s.load), 1);

  const W = 600;
  const H = 160;

  const line = (key: "latency" | "load", max: number) =>
    samples
      .map(
        (s, i) =>
          `${(i / (samples.length - 1)) * W},${H - (s[key] / max) * H * 0.85}`,
      )
      .join(" ");

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1="0"
          y1={H * (1 - f * 0.85)}
          x2={W}
          y2={H * (1 - f * 0.85)}
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray="4 4"
        />
      ))}

      {samples.length > 1 && (
        <>
          <polyline
            fill="none"
            stroke={COLORS.latency}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={line("latency", maxL)}
          />

          <polyline
            fill="none"
            stroke={COLORS.load}
            strokeWidth="1.5"
            strokeDasharray="6 3"
            points={line("load", maxM)}
          />
        </>
      )}
    </svg>
  );
};

interface LogEntry {
  ts: string;
  level: "INIT" | "INFO" | "WARN" | "ERR!";
  msg: string;
}

const LOG_COLORS: Record<string, string> = {
  INIT: "#38bdf8",
  INFO: "#e5e5e5",
  WARN: "#fbbf24",
  "ERR!": "#ef4444",
};

const SystemStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);

  // 1. Initialize State from sessionStorage
  const [samples, setSamples] = useState<Sample[]>(() => {
    try {
      const saved = sessionStorage.getItem("hermes_telemetry_samples");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const saved = sessionStorage.getItem("hermes_telemetry_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tick, setTick] = useState(0);

  const calcLatency = (h: HealthData) =>
    Math.round(10 + ((h?.cpu || 0) / 100) * 80 + Math.random() * 5);

  const calcLoad = (m: MetricsData) =>
    Math.min(
      100,
      ((m?.activeConnections || 0) / 100) * 60 + Math.random() * 10,
    );

  const addLog = useCallback((level: LogEntry["level"], msg: string) => {
    const now = new Date();

    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    // Write new logs to sessionStorage
    setLogs((prev) => {
      const next = [...prev.slice(-49), { ts, level, msg }];
      sessionStorage.setItem("hermes_telemetry_logs", JSON.stringify(next));
      return next;
    });
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [hRes, mRes] = await Promise.all([
        fetch(HEALTH_URL),
        fetch(METRICS_URL),
      ]);

      // Handle 429 or other HTTP errors gracefully
      if (hRes.status === 429 || mRes.status === 429) {
        throw new Error("429");
      }
      if (!hRes.ok || !mRes.ok) {
        throw new Error("HTTP_ERROR");
      }

      const h: HealthData = await hRes.json();
      const m: MetricsData = await mRes.json();

      setHealth(h);
      setMetrics(m);

      const sample: Sample = {
        t: Date.now(),
        latency: calcLatency(h),
        load: calcLoad(m),
        mps: m?.messagesPerSecond || 0,
        cpu: h?.cpu || 0,
        memory: h?.memory?.used || 0, // Safely access nested properties
      };

      // Write new samples to sessionStorage
      setSamples((prev) => {
        const next = [...prev.slice(-(MAX_SAMPLES - 1)), sample];
        sessionStorage.setItem(
          "hermes_telemetry_samples",
          JSON.stringify(next),
        );
        return next;
      });

      const msgs = [
        `Heartbeat OK — uptime ${Math.floor((h?.uptime || 0) / 60)}m`,
        `Active connections: ${m?.activeConnections || 0}`,
        `CPU ${h?.cpu || 0}% | RAM ${h?.memory?.used || 0}/${h?.memory?.total || 0}MB`,
      ];

      addLog("INFO", msgs[tick % msgs.length]);
      setTick((t) => t + 1);
    } catch (error: any) {
      if (error.message === "429") {
        addLog(
          "WARN",
          "Rate limit exceeded (429). Throttling dashboard updates...",
        );
      } else {
        addLog("ERR!", "Failed to reach Hermes engine. Retrying...");
      }
    }
  }, [tick, addLog]);

  useEffect(() => {
    // Only fire INIT if logs are completely empty
    if (logs.length === 0) {
      addLog("INIT", "Dashboard connected to Hermes Engine monitor.");
    }
    fetchAll();
    const iv = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(iv);
  }, []);

  // Safe fallbacks for rendering
  const latency = samples.length ? samples[samples.length - 1].latency : 0;
  const mps = metrics?.messagesPerSecond ?? 0;
  const cpu = health?.cpu ?? 0;
  const mem = health?.memory?.used ?? 0;

  const latSeries = samples.map((s) => s.latency);
  const mpsSeries = samples.map((s) => s.mps);
  const cpuSeries = samples.map((s) => s.cpu);
  const memSeries = samples.map((s) => s.memory);

  return (
    <div style={styles.root}>
      {/* Top Cards */}
      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>LATENCY</div>
          <div style={{ ...styles.bigNum, color: COLORS.latency }}>
            {latency} <span style={styles.unit}>ms</span>
          </div>
          <Sparkline data={latSeries} color={COLORS.latency} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>THROUGHPUT</div>
          <div style={{ ...styles.bigNum, color: COLORS.throughput }}>
            {mps} <span style={styles.unit}>k/s</span>
          </div>
          <Sparkline data={mpsSeries} color={COLORS.throughput} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>CPU USAGE</div>
          <div style={{ ...styles.bigNum, color: COLORS.cpu }}>
            {cpu}
            <span style={styles.unit}>%</span>
          </div>
          <Sparkline data={cpuSeries} color={COLORS.cpu} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>MEMORY</div>
          <div style={{ ...styles.bigNum, color: COLORS.memory }}>
            {mem} <span style={styles.unit}>MB</span>
          </div>
          <Sparkline data={memSeries} color={COLORS.memory} />
        </div>
      </div>

      {/* Chart */}
      <div style={{ ...styles.card, marginTop: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <div style={styles.cardLabel}>LIVE TELEMETRY</div>
          <div
            style={{ display: "flex", gap: 12, fontSize: 10, color: "#9ca3af" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: COLORS.latency,
                  borderRadius: 2,
                }}
              />{" "}
              Latency
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: COLORS.load,
                  borderRadius: 2,
                }}
              />{" "}
              System Load
            </span>
          </div>
        </div>
        <LiveChart samples={samples} />
      </div>

      {/* Logs */}
      <div style={{ ...styles.card, marginTop: 12 }}>
        <div style={styles.cardLabel}>HermesEngine.logs</div>

        <div style={styles.logBox}>
          {logs.map((log, i) => (
            <div key={i} style={styles.logRow}>
              <span style={styles.logTs}>{log.ts}</span>
              <span style={{ color: LOG_COLORS[log.level], minWidth: 50 }}>
                [{log.level}]
              </span>
              <span
                style={{
                  color:
                    log.level === "ERR!"
                      ? "#f87171"
                      : log.level === "WARN"
                        ? "#fbbf24"
                        : "#d1d5db",
                }}
              >
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  root: {
    background: "#000000",
    color: "#ffffff",
    minHeight: "100%",
    padding: 20,
    fontFamily: "JetBrains Mono, monospace",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },

  card: {
    background: "#0a0a0a",
    border: "1px solid #1f1f1f",
    borderRadius: 12,
    padding: 20,
  },

  cardLabel: {
    fontSize: 11,
    color: "#6b7280",
    letterSpacing: "0.15em",
    marginBottom: 8,
    fontWeight: 600,
  },

  bigNum: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 12,
    display: "flex",
    alignItems: "baseline",
    gap: 4,
  },

  unit: {
    fontSize: 14,
    fontWeight: 500,
    color: "#9ca3af",
  },

  logBox: {
    maxHeight: 200,
    overflowY: "auto",
    fontSize: 12,
    paddingRight: 8,
  },

  logRow: {
    display: "flex",
    gap: 10,
    marginBottom: 6,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    paddingBottom: 4,
  },

  logTs: {
    color: "#4b5563",
    minWidth: 65,
  },
} as const;

export default SystemStatus;
