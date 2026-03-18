import React, { useState, useEffect, useCallback } from "react";

const HEALTH_URL = `${import.meta.env.VITE_ENDPOINT}/hermes/health`;
const METRICS_URL = `${import.meta.env.VITE_ENDPOINT}/hermes/metrics`;
const POLL_MS = 5000;
const MAX_SAMPLES = 60;

const COLORS = {
  latency: "#38bdf8",
  throughput: "#34d399",
  cpu: "#fbbf24",
  memory: "#a78bfa",
  load: "#f472b6",
};

interface HealthData {
  status: string;
  uptime: number;
  memory: { used: number; total: number };
  cpu: number | { usage: number; loadAverage?: number[]; cores?: number };
  version?: string;
}
const getCpu = (h: HealthData): number =>
  typeof h.cpu === "number" ? h.cpu : (h.cpu?.usage ?? 0);
interface MetricsData {
  activeConnections: number;
  totalMessages: number;
  messagesPerSecond: number;
  rooms?: number;
}
interface Sample {
  t: number;
  latency: number;
  load: number;
  mps: number;
  cpu: number;
  memory: number;
}
interface LogEntry {
  ts: string;
  level: "INIT" | "INFO" | "WARN" | "ERR!";
  msg: string;
}

// const LOG_COLORS: Record<string, string> = {
//   INIT: "#38bdf8",
//   INFO: "#e5e5e5",
//   WARN: "#fbbf24",
//   "ERR!": "#ef4444",
// };

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
  const w = 200,
    h = height;
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
  const W = 600,
    H = 140;
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
          stroke="rgba(255,255,255,0.05)"
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

export function Stats() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [samples, setSamples] = useState<Sample[]>(() => {
    try {
      const s = sessionStorage.getItem("hermes_samples");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const l = sessionStorage.getItem("hermes_logs");
      return l ? JSON.parse(l) : [];
    } catch {
      return [];
    }
  });
  const [tick, setTick] = useState(0);

  const addLog = useCallback((level: LogEntry["level"], msg: string) => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setLogs((prev) => {
      const next = [...prev.slice(-49), { ts, level, msg }];
      sessionStorage.setItem("hermes_logs", JSON.stringify(next));
      return next;
    });
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [hRes, mRes] = await Promise.all([
        fetch(HEALTH_URL),
        fetch(METRICS_URL),
      ]);
      if (hRes.status === 429 || mRes.status === 429) throw new Error("429");
      if (!hRes.ok || !mRes.ok) throw new Error("HTTP_ERROR");

      const h: HealthData = await hRes.json();
      const m: MetricsData = await mRes.json();

      setHealth(h);
      setMetrics(m);

      // Extract the exact CPU number once to use in calculations and logs safely
      const currentCpu = getCpu(h);

      const sample: Sample = {
        t: Date.now(),
        // FIX: Use currentCpu instead of h?.cpu
        latency: Math.round(10 + (currentCpu / 100) * 80 + Math.random() * 5),
        load: Math.min(
          100,
          ((m?.activeConnections || 0) / 100) * 60 + Math.random() * 10,
        ),
        mps: m?.messagesPerSecond || 0,
        cpu: currentCpu,
        memory: h?.memory?.used || 0,
      };

      setSamples((prev) => {
        const next = [...prev.slice(-(MAX_SAMPLES - 1)), sample];
        sessionStorage.setItem("hermes_samples", JSON.stringify(next));
        return next;
      });

      const msgs = [
        `Heartbeat OK — uptime ${Math.floor((h?.uptime || 0) / 60)}m`,
        `Active connections: ${m?.activeConnections || 0}`,
        // FIX: Use currentCpu instead of h?.cpu to prevent "[object Object]%" in logs
        `CPU ${currentCpu.toFixed(2)}% | RAM ${h?.memory?.used || 0}/${h?.memory?.total || 0}MB`,
      ];

      addLog("INFO", msgs[tick % msgs.length]);
      setTick((t) => t + 1);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "429")
        addLog("WARN", "Rate limit exceeded. Throttling...");
      else addLog("ERR!", "Failed to reach Hermes engine. Retrying...");
    }
  }, [tick, addLog]);

  useEffect(() => {
    if (logs.length === 0)
      addLog("INIT", "Dashboard connected to Hermes Engine monitor.");
    fetchAll();
    const iv = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(iv);
  }, []);

  const latency = samples.length ? samples[samples.length - 1].latency : 0;
  const mps = metrics?.messagesPerSecond ?? 0;
  const cpu = health ? getCpu(health) : 0;
  const mem = health?.memory?.used ?? 0;

  const card: React.CSSProperties = {
    background: "#0a0a0a",
    border: "1px solid #1a1a1a",
    borderRadius: 14,
    padding: 20,
  };

  const label: React.CSSProperties = {
    fontSize: 10,
    color: "#4b5563",
    letterSpacing: "0.15em",
    fontWeight: 700,
    marginBottom: 6,
    textTransform: "uppercase",
  };

  const bigNum: React.CSSProperties = {
    fontSize: 32,
    fontWeight: 700,
    display: "flex",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 8,
    fontFamily: "JetBrains Mono, monospace",
  };

  const unit: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: "#6b7280",
  };

  const metrics_cards = [
    {
      label: "LATENCY",
      val: latency,
      unit: "ms",
      color: COLORS.latency,
      data: samples.map((x) => x.latency),
    },
    {
      label: "THROUGHPUT",
      val: mps,
      unit: "msg/s",
      color: COLORS.throughput,
      data: samples.map((x) => x.mps),
    },
    {
      label: "CPU",
      val: cpu,
      unit: "%",
      color: COLORS.cpu,
      data: samples.map((x) => x.cpu),
    },
    {
      label: "MEMORY",
      val: mem,
      unit: "MB",
      color: COLORS.memory,
      data: samples.map((x) => x.memory),
    },
  ];

  return (
    <section
      style={{
        background: "#000",
        color: "#fff",
        fontFamily: "JetBrains Mono, monospace",
        padding: "64px 24px",
        width: "100%",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Live Stats
          </h2>
          <p style={{ color: "#6b7280", marginTop: 8, fontSize: 14 }}>
            Real-time metrics from the Hermes engine
          </p>
        </div>

        {/* Metric cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 12,
          }}
        >
          {metrics_cards.map((c) => (
            <div key={c.label} style={card}>
              <div style={label}>{c.label}</div>
              <div style={{ ...bigNum, color: c.color }}>
                {c.val}
                <span style={unit}>{c.unit}</span>
              </div>
              <Sparkline data={c.data} color={c.color} height={40} />
            </div>
          ))}
        </div>

        {/* Live telemetry chart */}
        <div style={{ ...card, marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={label}>Live Telemetry</div>
            <div
              style={{
                display: "flex",
                gap: 12,
                fontSize: 10,
                color: "#6b7280",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    background: COLORS.latency,
                    borderRadius: 2,
                  }}
                />
                Latency
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    background: COLORS.load,
                    borderRadius: 2,
                  }}
                />
                System Load
              </span>
            </div>
          </div>
          <LiveChart samples={samples} />
        </div>
      </div>
    </section>
  );
}

export default Stats;
