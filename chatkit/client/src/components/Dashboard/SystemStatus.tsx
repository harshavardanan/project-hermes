import React, { useState, useEffect, useRef, useCallback } from "react";

const HEALTH_URL = "http://localhost:8080/hermes/health";
const METRICS_URL = "http://localhost:8080/hermes/metrics";
const POLL_MS = 4000;
const MAX_SAMPLES = 60;

// ── Types ─────────────────────────────────────────────────────────────────────
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
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
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
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
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

// ── Live Chart ────────────────────────────────────────────────────────────────
const LiveChart = ({ samples }: { samples: Sample[] }) => {
  const maxL = Math.max(...samples.map((s) => s.latency), 1);
  const maxM = Math.max(...samples.map((s) => s.load), 1);
  const W = 600,
    H = 160;

  const line = (key: "latency" | "load", max: number) =>
    samples
      .map(
        (s, i) =>
          `${(i / (samples.length - 1)) * W},${H - (s[key] / max) * H * 0.85}`,
      )
      .join(" ");

  const labels = ["T-60M", "T-30M", "NOW"];

  return (
    <div style={{ position: "relative" }}>
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1="0"
            y1={H * (1 - f * 0.85)}
            x2={W}
            y2={H * (1 - f * 0.85)}
            stroke="rgba(57,255,20,0.07)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        {samples.length > 1 && (
          <>
            <defs>
              <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#39ff14" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#39ff14" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00c8ff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#00c8ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              fill="url(#gL)"
              stroke="none"
              points={`0,${H} ${line("latency", maxL)} ${W},${H}`}
            />
            <polyline
              fill="none"
              stroke="#39ff14"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={line("latency", maxL)}
            />
            <polyline
              fill="url(#gM)"
              stroke="none"
              points={`0,${H} ${line("load", maxM)} ${W},${H}`}
            />
            <polyline
              fill="none"
              stroke="#00c8ff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 3"
              points={line("load", maxM)}
            />
          </>
        )}
      </svg>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "rgba(57,255,20,0.4)",
          letterSpacing: "0.1em",
        }}
      >
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
};

// ── Log Entry ─────────────────────────────────────────────────────────────────
interface LogEntry {
  ts: string;
  level: "INIT" | "INFO" | "WARN" | "ERR!";
  msg: string;
}
const LOG_COLORS: Record<string, string> = {
  INIT: "#39ff14",
  INFO: "#39ff14",
  WARN: "#f0a500",
  "ERR!": "#ff4444",
};

// ── Node Row ──────────────────────────────────────────────────────────────────
const NodeRow = ({
  id,
  name,
  latency,
  status,
  color,
}: {
  id: string;
  name: string;
  latency: number;
  status: string;
  color: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      borderRadius: 8,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 8,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 2,
              background: i < 2 ? color : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>
      <div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            color: "#e0e0e0",
            letterSpacing: "0.05em",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            marginTop: 2,
          }}
        >
          ID: {id}
        </div>
      </div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          fontWeight: 700,
          color,
        }}
      >
        {latency}ms
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        {status}
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const SystemStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tick, setTick] = useState(0);

  // Simulate latency from cpu/memory ratio for chart
  const calcLatency = (h: HealthData) =>
    Math.round(10 + (h.cpu / 100) * 80 + Math.random() * 5);
  const calcLoad = (m: MetricsData) =>
    Math.min(100, (m.activeConnections / 100) * 60 + Math.random() * 10);

  const addLog = useCallback((level: LogEntry["level"], msg: string) => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
    setLogs((prev) => [...prev.slice(-49), { ts, level, msg }]);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [hRes, mRes] = await Promise.all([
        fetch(HEALTH_URL),
        fetch(METRICS_URL),
      ]);
      const h: HealthData = await hRes.json();
      const m: MetricsData = await mRes.json();

      setHealth(h);
      setMetrics(m);

      const sample: Sample = {
        t: Date.now(),
        latency: calcLatency(h),
        load: calcLoad(m),
        mps: m.messagesPerSecond,
      };
      setSamples((prev) => [...prev.slice(-(MAX_SAMPLES - 1)), sample]);

      // Generate realistic log entries
      const level = h.cpu > 70 ? "WARN" : h.status !== "ok" ? "ERR!" : "INFO";
      const msgs = [
        `Heartbeat OK — uptime ${Math.floor(h.uptime / 60)}m, mem ${h.memory.used}MB`,
        `Active connections: ${m.activeConnections} | msg/s: ${m.messagesPerSecond}`,
        `CPU ${h.cpu}% | RAM ${h.memory.used}/${h.memory.total}MB`,
        `Rooms tracked: ${m.rooms ?? "—"} | Projects: ${m.projects ?? "—"}`,
      ];
      addLog(level, msgs[tick % msgs.length]);
      setTick((t) => t + 1);
    } catch (err) {
      addLog("ERR!", "Failed to reach Hermes engine — retrying...");
    }
  }, [tick, addLog]);

  useEffect(() => {
    addLog("INIT", "Dashboard connected to Hermes Engine monitor.");
    fetchAll();
    const iv = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(iv);
  }, []);

  const isOnline = health?.status === "ok";
  const memPct = health
    ? Math.round((health.memory.used / health.memory.total) * 100)
    : 0;
  const latency = samples.length ? samples[samples.length - 1].latency : 0;
  const latDelta =
    samples.length > 1 ? latency - samples[samples.length - 2].latency : 0;
  const mps = metrics?.messagesPerSecond ?? 0;
  const mpsDelta =
    samples.length > 1 ? mps - samples[samples.length - 2].mps : 0;

  const latSeries = samples.map((s) => s.latency);
  const mpsSeries = samples.map((s) => s.mps);

  // Simulated node distribution
  const nodes = [
    {
      id: "882-A",
      name: "US-EAST-VA",
      latency: latency,
      status: "STABLE",
      color: "#39ff14",
    },
    {
      id: "104-B",
      name: "EU-WEST-LON",
      latency: latency + 14,
      status: "OPTIMAL",
      color: "#39ff14",
    },
    {
      id: "219-X",
      name: "AP-SOUTH-MUM",
      latency: latency + 168,
      status: health?.cpu && health.cpu > 60 ? "HIGH LOAD" : "STABLE",
      color: health?.cpu && health.cpu > 60 ? "#f0a500" : "#39ff14",
    },
  ];

  const S = styles;

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={S.logoBox}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#39ff14"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <div style={S.headerTitle}>SDK PERFORMANCE</div>
            <div style={S.headerSub}>V{health?.version ?? "2.4.0"}-STABLE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isOnline ? "#39ff14" : "#ff4444",
              boxShadow: isOnline ? "0 0 8px #39ff14" : "0 0 8px #ff4444",
              animation: isOnline
                ? "pulse-dot 2s ease-in-out infinite"
                : "none",
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 11,
              fontWeight: 700,
              color: isOnline ? "#39ff14" : "#ff4444",
              letterSpacing: "0.15em",
            }}
          >
            {isOnline ? "OPERATIONAL" : "OFFLINE"}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10,
              color: "rgba(57,255,20,0.4)",
              marginLeft: 8,
            }}
          >
            {health?.nodeId ?? "LHR-NODE-04"}
          </span>
        </div>
      </div>

      {/* ── Top metric cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {/* Latency */}
        <div style={S.card}>
          <div style={S.cardLabel}>
            LATENCY
            <span
              style={{
                ...S.delta,
                color: latDelta <= 0 ? "#39ff14" : "#f0a500",
              }}
            >
              {latDelta > 0 ? "+" : ""}
              {latDelta.toFixed(1)}ms
            </span>
          </div>
          <div style={S.bigNum}>
            {latency}
            <span style={S.bigUnit}>ms</span>
          </div>
          <Sparkline data={latSeries} color="#39ff14" />
        </div>

        {/* Throughput */}
        <div style={S.card}>
          <div style={S.cardLabel}>
            THROUGHPUT
            <span
              style={{
                ...S.delta,
                color: mpsDelta >= 0 ? "#39ff14" : "#f0a500",
              }}
            >
              {mpsDelta >= 0 ? "+" : ""}
              {mpsDelta.toFixed(1)}k
            </span>
          </div>
          <div style={S.bigNum}>
            {mps.toFixed(1)}
            <span style={S.bigUnit}>k/s</span>
          </div>
          <Sparkline data={mpsSeries} color="#00c8ff" />
        </div>
      </div>

      {/* ── Live Telemetry Chart ── */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 13,
                fontWeight: 700,
                color: "#e0e0e0",
                letterSpacing: "0.1em",
              }}
            >
              LIVE TELEMETRY
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                marginTop: 3,
              }}
            >
              Buffer: {samples.length} samples
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "LATENCY", color: "#39ff14" },
              { label: "LOAD", color: "#00c8ff" },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <LiveChart samples={samples} />
      </div>

      {/* ── Resource bars ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 12,
        }}
      >
        {[
          {
            label: "CPU",
            value: health?.cpu ?? 0,
            unit: "%",
            color: health?.cpu && health.cpu > 70 ? "#f0a500" : "#39ff14",
          },
          {
            label: "MEMORY",
            value: memPct,
            unit: "%",
            color: memPct > 80 ? "#ff4444" : "#39ff14",
          },
          {
            label: "CONN",
            value: Math.min(
              100,
              ((metrics?.activeConnections ?? 0) / 200) * 100,
            ),
            unit: `${metrics?.activeConnections ?? 0}`,
            color: "#00c8ff",
          },
        ].map(({ label, value, unit, color }) => (
          <div key={label} style={S.miniCard}>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 9,
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.2em",
                marginBottom: 8,
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 18,
                fontWeight: 700,
                color,
                marginBottom: 8,
              }}
            >
              {label === "CONN" ? unit : `${Math.round(value)}${unit}`}
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(100, value)}%`,
                  borderRadius: 2,
                  background: color,
                  boxShadow: `0 0 8px ${color}`,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Global Distribution ── */}
      <div style={{ ...S.card, marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 13,
              fontWeight: 700,
              color: "#e0e0e0",
              letterSpacing: "0.1em",
            }}
          >
            GLOBAL DISTRIBUTION
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 10,
              color: "#39ff14",
              border: "1px solid rgba(57,255,20,0.3)",
              borderRadius: 20,
              padding: "3px 10px",
              letterSpacing: "0.1em",
            }}
          >
            {nodes.length} ACTIVE NODES
          </div>
        </div>
        {nodes.map((n) => (
          <NodeRow key={n.id} {...n} />
        ))}
      </div>

      {/* ── Engine Log ── */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        {/* Log header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 11,
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.1em",
              }}
            >
              ENGINE.LOG
            </span>
          </div>
          <div
            style={{
              width: 14,
              height: 14,
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 2,
              opacity: 0.4,
            }}
          />
        </div>

        {/* Log entries */}
        <div
          style={{
            padding: "12px 16px",
            maxHeight: 220,
            overflowY: "auto",
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 11,
            lineHeight: 1.9,
          }}
          className="hermes-log-scroll"
        >
          {logs.length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.2)" }}>
              Waiting for engine data...
            </div>
          )}
          {logs.map((log, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "baseline",
                animation: i === logs.length - 1 ? "log-in 0.3s ease" : "none",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                {log.ts}
              </span>
              <span
                style={{
                  color: LOG_COLORS[log.level] ?? "#39ff14",
                  fontWeight: 700,
                  flexShrink: 0,
                  minWidth: 40,
                }}
              >
                [{log.level}]
              </span>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const G = "#39ff14";
const styles = {
  root: {
    background: "#0a0e0a",
    minHeight: "100%",
    padding: "0 0 40px",
    fontFamily: "'JetBrains Mono', monospace",
  } as React.CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 0 16px",
    borderBottom: "1px solid rgba(57,255,20,0.12)",
    marginBottom: 16,
  } as React.CSSProperties,
  logoBox: {
    width: 44,
    height: 44,
    border: `1px solid rgba(57,255,20,0.4)`,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(57,255,20,0.06)",
    boxShadow: "0 0 16px rgba(57,255,20,0.15)",
  } as React.CSSProperties,
  headerTitle: {
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 14,
    fontWeight: 700,
    color: "#e0e0e0",
    letterSpacing: "0.2em",
  } as React.CSSProperties,
  headerSub: {
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 10,
    color: "rgba(57,255,20,0.5)",
    letterSpacing: "0.15em",
    marginTop: 2,
  } as React.CSSProperties,
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(57,255,20,0.12)",
    borderRadius: 10,
    padding: 16,
  } as React.CSSProperties,
  miniCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: "12px 14px",
  } as React.CSSProperties,
  cardLabel: {
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.2em",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  } as React.CSSProperties,
  bigNum: {
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 36,
    fontWeight: 700,
    color: "#e8e8e8",
    lineHeight: 1,
    marginBottom: 10,
  } as React.CSSProperties,
  bigUnit: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    marginLeft: 4,
  } as React.CSSProperties,
  delta: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
  } as React.CSSProperties,
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

  @keyframes pulse-dot {
    0%,100% { opacity: 1; box-shadow: 0 0 8px #39ff14; }
    50%      { opacity: 0.6; box-shadow: 0 0 16px #39ff14, 0 0 30px rgba(57,255,20,0.3); }
  }
  @keyframes log-in {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .hermes-log-scroll::-webkit-scrollbar { width: 3px; }
  .hermes-log-scroll::-webkit-scrollbar-track { background: transparent; }
  .hermes-log-scroll::-webkit-scrollbar-thumb { background: rgba(57,255,20,0.2); border-radius: 2px; }
`;

export default SystemStatus;
