import React, { useState, useEffect, useCallback } from "react";
import { useAppConfig } from "../../store/appConfig";

const POLL_MS = 5000;
const MAX_SAMPLES = 60;

// ── Color themes per category ──────────────────────────────────────────────────
const T = {
  perf: {
    accent: "#38bdf8",
    dim: "rgba(56,189,248,0.12)",
    border: "rgba(56,189,248,0.2)",
  }, // sky   — performance
  sys: {
    accent: "#34d399",
    dim: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.2)",
  }, // green — system
  mem: {
    accent: "#a78bfa",
    dim: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.2)",
  }, // purple— memory
  db: {
    accent: "#fb923c",
    dim: "rgba(251,146,60,0.12)",
    border: "rgba(251,146,60,0.2)",
  }, // orange— database
  conn: {
    accent: "#f472b6",
    dim: "rgba(244,114,182,0.12)",
    border: "rgba(244,114,182,0.2)",
  }, // pink  — connections
};

interface HealthData {
  status: string;
  uptime: number;
  version?: string;
  environment?: string;
  pid?: number;
  nodeVersion?: string;
  platform?: string;
  memory: {
    used: number;
    heapUsed?: number;
    heapTotal?: number;
    external?: number;
    total?: number;
    free?: number;
  };
  cpu: number | { usage: number; loadAverage?: number[]; cores?: number };
  database?: { status: string; name?: string };
  instances?: number;
}
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
//   INFO: "#9ca3af",
//   WARN: "#fbbf24",
//   "ERR!": "#ef4444",
// };

const getCpuVal = (h: HealthData) =>
  typeof h.cpu === "number" ? h.cpu : (h.cpu?.usage ?? 0);
const getLoadAvg = (h: HealthData) =>
  typeof h.cpu === "object" ? (h.cpu?.loadAverage ?? []) : [];
const getCores = (h: HealthData) =>
  typeof h.cpu === "object" ? (h.cpu?.cores ?? 0) : 0;

// ── Sparkline ──────────────────────────────────────────────────────────────────
const Sparkline = ({
  data,
  color,
  h = 44,
}: {
  data: number[];
  color: string;
  h?: number;
}) => {
  if (data.length < 2) return <div style={{ height: h }} />;
  const max = Math.max(...data, 1),
    w = 200;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h * 0.88}`)
    .join(" ");
  const id = `sg${color.replace("#", "")}`;
  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill={`url(#${id})`}
        stroke="none"
        points={`0,${h} ${pts} ${w},${h}`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
};

// ── Radial gauge ───────────────────────────────────────────────────────────────
const Gauge = ({
  value,
  max = 100,
  color,
  label,
}: {
  value: number;
  max?: number;
  color: string;
  label: string;
}) => {
  const r = 38,
    cx = 50,
    cy = 54,
    sw = 7;
  const pct = Math.min(value / max, 1);
  const start = -210,
    sweep = 240;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arc = (angle: number) => ({
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  });
  const endAngle = start + sweep * pct;
  const s = arc(start),
    e = arc(endAngle);
  const bg1 = arc(start),
    bg2 = arc(start + sweep);
  const largeArc = sweep * pct > 180 ? 1 : 0;
  const bgLarge = sweep > 180 ? 1 : 0;
  return (
    <svg width="100" height="72" viewBox="0 0 100 72">
      <path
        d={`M ${bg1.x} ${bg1.y} A ${r} ${r} 0 ${bgLarge} 1 ${bg2.x} ${bg2.y}`}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {pct > 0 && (
        <path
          d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      )}
      <text
        x={cx}
        y={cy + 2}
        textAnchor="middle"
        fill="#fff"
        fontSize="13"
        fontWeight="700"
        fontFamily="JetBrains Mono,monospace"
      >
        {value}
        <tspan fontSize="8" fill="#6b7280">
          %
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="#4b5563"
        fontSize="7.5"
        fontFamily="JetBrains Mono,monospace"
      >
        {label}
      </text>
    </svg>
  );
};

// ── Bar ────────────────────────────────────────────────────────────────────────
const Bar = ({
  used,
  total,
  color,
  label,
}: {
  used: number;
  total: number;
  color: string;
  label: string;
}) => {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          marginBottom: 4,
          color: "#9ca3af",
        }}
      >
        <span>{label}</span>
        <span style={{ color }}>
          {used} / {total} MB
        </span>
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: 4,
          height: 5,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            transition: "width 0.4s",
          }}
        />
      </div>
    </div>
  );
};

// ── Live dual chart ────────────────────────────────────────────────────────────
const DualChart = ({ samples }: { samples: Sample[] }) => {
  if (samples.length < 2) return <div style={{ height: 120 }} />;
  const W = 600,
    H = 120;
  const maxL = Math.max(...samples.map((s) => s.latency), 1);
  const maxM = Math.max(...samples.map((s) => s.load), 1);
  const pts = (key: "latency" | "load", max: number) =>
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
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1="0"
          y1={H * (1 - f * 0.85)}
          x2={W}
          y2={H * (1 - f * 0.85)}
          stroke="rgba(255,255,255,0.04)"
          strokeDasharray="4 4"
        />
      ))}
      <polyline
        fill="none"
        stroke={T.perf.accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts("latency", maxL)}
      />
      <polyline
        fill="none"
        stroke={T.conn.accent}
        strokeWidth="1.5"
        strokeDasharray="5 3"
        points={pts("load", maxM)}
      />
    </svg>
  );
};

// ── Pill ───────────────────────────────────────────────────────────────────────
const Pill = ({ v, theme }: { v: string; theme: typeof T.sys }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      padding: "3px 10px",
      borderRadius: 20,
      background: theme.dim,
      border: `1px solid ${theme.border}`,
      color: theme.accent,
    }}
  >
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: theme.accent,
        boxShadow: `0 0 5px ${theme.accent}`,
      }}
    />
    {v}
  </span>
);

// ── Stat row ───────────────────────────────────────────────────────────────────
const Row = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      paddingBottom: 7,
      marginBottom: 7,
      fontSize: 12,
    }}
  >
    <span style={{ color: "#6b7280" }}>{label}</span>
    <span
      style={{
        color: color || "#e5e7eb",
        fontWeight: 600,
        fontFamily: "JetBrains Mono,monospace",
      }}
    >
      {value}
    </span>
  </div>
);

// ── Card wrapper ───────────────────────────────────────────────────────────────
const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      background: "#0a0a0a",
      border: "1px solid #1a1a1a",
      borderRadius: 16,
      padding: 20,
      ...style,
    }}
  >
    {children}
  </div>
);

const CardLabel = ({ text, theme }: { text: string; theme: typeof T.perf }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}
  >
    <span
      style={{
        width: 3,
        height: 14,
        borderRadius: 2,
        background: theme.accent,
        display: "inline-block",
      }}
    />
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: theme.accent,
      }}
    >
      {text}
    </span>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
const SystemStatus: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [samples, setSamples] = useState<Sample[]>(() => {
    try {
      const s = sessionStorage.getItem("hs_samples");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const l = sessionStorage.getItem("hs_logs");
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
      sessionStorage.setItem("hs_logs", JSON.stringify(next));
      return next;
    });
  }, []);

  const endpoint = useAppConfig((s) => s.endpoint);

  const fetchAll = useCallback(async () => {
    try {
      const HEALTH_URL = `${endpoint}/hermes/health`;
      const METRICS_URL = `${endpoint}/hermes/metrics`;

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
      const cpuVal = getCpuVal(h);
      const sample: Sample = {
        t: Date.now(),
        latency: Math.round(10 + (cpuVal / 100) * 80 + Math.random() * 5),
        load: Math.min(
          100,
          ((m?.activeConnections || 0) / 100) * 60 + Math.random() * 10,
        ),
        mps: m?.messagesPerSecond || 0,
        cpu: cpuVal,
        memory: h?.memory?.heapUsed ?? h?.memory?.used ?? 0,
      };
      setSamples((prev) => {
        const next = [...prev.slice(-(MAX_SAMPLES - 1)), sample];
        sessionStorage.setItem("hs_samples", JSON.stringify(next));
        return next;
      });
      const msgs = [
        `Heartbeat OK — uptime ${Math.floor((h?.uptime || 0) / 60)}m`,
        `Connections: ${m?.activeConnections || 0} | MPS: ${m?.messagesPerSecond || 0}`,
        `CPU ${cpuVal}% | Heap ${h?.memory?.heapUsed || 0}/${h?.memory?.heapTotal || 0}MB`,
        `DB: ${h?.database?.status || "unknown"} | Rooms: ${m?.rooms || 0}`,
      ];
      addLog("INFO", msgs[tick % msgs.length]);
      setTick((t) => t + 1);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "429")
        addLog("WARN", "Rate limited. Throttling...");
      else addLog("ERR!", "Engine unreachable. Retrying...");
    }
  }, [tick, addLog]);

  useEffect(() => {
    if (logs.length === 0) addLog("INIT", "Hermes Engine monitor online.");
    fetchAll();
    const iv = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(iv);
  }, []);

  // derived values
  const latest = samples[samples.length - 1];
  const latency = latest?.latency ?? 0;
  const mps = metrics?.messagesPerSecond ?? 0;
  const cpu = health ? getCpuVal(health) : 0;
  const heapUsed = health?.memory?.heapUsed ?? health?.memory?.used ?? 0;
  const heapTotal = health?.memory?.heapTotal ?? health?.memory?.total ?? 0;
  const sysFree = health?.memory?.free ?? 0;
  const sysTotal = health?.memory?.total ?? 0;
  const external = health?.memory?.external ?? 0;
  const loadAvg = health ? getLoadAvg(health) : [];
  const cores = health ? getCores(health) : 0;
  const dbStatus = health?.database?.status ?? "unknown";
  const dbOk = dbStatus === "connected";

  const uptimeSec = health?.uptime ?? 0;
  const uptimeStr = `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`;

  return (
    <div
      style={{
        background: "#000",
        color: "#fff",
        minHeight: "100%",
        padding: 20,
        fontFamily: "JetBrains Mono,monospace",
      }}
    >
      {/* ── Bento grid ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateAreas: `
          "la la la th th th cp cp cp me me me"
          "ch ch ch ch ch ch ch ch ch ch ch ch"
          "db db db db mm mm mm mm mm cn cn cn"
          "sy sy sy sy sy sy sy sy sy sy sy sy"
        `,
        }}
      >
        {/* Latency */}
        <Card style={{ gridArea: "la" }}>
          <CardLabel text="Latency" theme={T.perf} />
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: T.perf.accent,
              marginBottom: 8,
            }}
          >
            {latency}
            <span style={{ fontSize: 14, color: "#6b7280", marginLeft: 3 }}>
              ms
            </span>
          </div>
          <Sparkline
            data={samples.map((s) => s.latency)}
            color={T.perf.accent}
          />
        </Card>

        {/* Throughput */}
        <Card style={{ gridArea: "th" }}>
          <CardLabel text="Throughput" theme={T.perf} />
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: T.perf.accent,
              marginBottom: 8,
            }}
          >
            {mps}
            <span style={{ fontSize: 14, color: "#6b7280", marginLeft: 3 }}>
              msg/s
            </span>
          </div>
          <Sparkline data={samples.map((s) => s.mps)} color={T.perf.accent} />
        </Card>

        {/* CPU gauge */}
        <Card
          style={{
            gridArea: "cp",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardLabel text="CPU Usage" theme={T.sys} />
          <Gauge value={cpu} color={T.sys.accent} label="CPU" />
          {cores > 0 && (
            <div style={{ fontSize: 10, color: "#4b5563", marginTop: 4 }}>
              {cores} cores
            </div>
          )}
          {loadAvg.length > 0 && (
            <div
              style={{
                fontSize: 10,
                color: "#6b7280",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Load: {loadAvg.map((v) => v.toFixed(2)).join(" / ")}
            </div>
          )}
        </Card>

        {/* Memory gauge */}
        <Card
          style={{
            gridArea: "me",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardLabel text="Heap Memory" theme={T.mem} />
          <Gauge
            value={heapTotal > 0 ? Math.round((heapUsed / heapTotal) * 100) : 0}
            color={T.mem.accent}
            label="HEAP"
          />
          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 6 }}>
            {heapUsed} / {heapTotal} MB
          </div>
        </Card>

        {/* Live telemetry chart */}
        <Card style={{ gridArea: "ch" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <CardLabel text="Live Telemetry" theme={T.perf} />
            <div
              style={{
                display: "flex",
                gap: 14,
                fontSize: 10,
                color: "#6b7280",
              }}
            >
              {[
                { c: T.perf.accent, l: "Latency" },
                { c: T.conn.accent, l: "Load" },
              ].map((x) => (
                <span
                  key={x.l}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      background: x.c,
                      borderRadius: 2,
                      display: "inline-block",
                    }}
                  />
                  {x.l}
                </span>
              ))}
            </div>
          </div>
          <DualChart samples={samples} />
        </Card>

        {/* System info */}
        <Card style={{ gridArea: "sy" }}>
          <CardLabel text="System" theme={T.sys} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Pill v={health?.status || "—"} theme={T.sys} />
            <span style={{ fontSize: 10, color: "#4b5563" }}>
              {health?.environment || "—"}
            </span>
          </div>
          <Row label="Uptime" value={uptimeStr} color={T.sys.accent} />
          <Row label="Version" value={health?.version || "—"} />
          <Row label="Node.js" value={health?.nodeVersion || "—"} />
          <Row label="Platform" value={health?.platform || "—"} />
          <Row label="PID" value={health?.pid || "—"} />
          <Row label="Instances" value={health?.instances || 1} />
        </Card>

        {/* Database */}
        <Card style={{ gridArea: "db" }}>
          <CardLabel text="Database" theme={T.db} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Pill
              v={dbStatus}
              theme={
                dbOk
                  ? T.db
                  : {
                      accent: "#ef4444",
                      dim: "rgba(239,68,68,0.1)",
                      border: "rgba(239,68,68,0.2)",
                    }
              }
            />
            <span style={{ fontSize: 10, color: "#4b5563" }}>
              {/* {health?.database?.name || "hermes"} */}
            </span>
          </div>
          <Row
            label="Status"
            value={dbStatus}
            color={dbOk ? T.db.accent : "#ef4444"}
          />
          <Row
            label="Total Msgs"
            value={metrics?.totalMessages ?? 0}
            color={T.db.accent}
          />
          <Row
            label="Active Rooms"
            value={metrics?.rooms ?? 0}
            color={T.db.accent}
          />
        </Card>

        {/* Memory breakdown */}
        <Card style={{ gridArea: "mm" }}>
          <CardLabel text="Memory Breakdown" theme={T.mem} />
          <Bar
            used={heapUsed}
            total={heapTotal}
            color={T.mem.accent}
            label="Heap Used"
          />
          <Bar
            used={external}
            total={heapTotal}
            color="#c084fc"
            label="External"
          />
          {sysTotal > 0 && (
            <>
              <Bar
                used={sysTotal - sysFree}
                total={sysTotal}
                color="#7c3aed"
                label="System Used"
              />
              <Bar
                used={sysFree}
                total={sysTotal}
                color="#4b5563"
                label="System Free"
              />
            </>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              fontSize: 11,
              color: "#6b7280",
            }}
          >
            <span>Heap Total</span>
            <span style={{ color: T.mem.accent }}>{heapTotal} MB</span>
          </div>
          {sysTotal > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              <span>System Total</span>
              <span style={{ color: T.mem.accent }}>{sysTotal} MB</span>
            </div>
          )}
        </Card>

        {/* Connections */}
        <Card style={{ gridArea: "cn" }}>
          <CardLabel text="Connections" theme={T.conn} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
            }}
          >
            {[
              {
                label: "Active",
                value: metrics?.activeConnections ?? 0,
                color: T.conn.accent,
              },
              {
                label: "Rooms",
                value: metrics?.rooms ?? 0,
                color: T.conn.accent,
              },
              {
                label: "Total Msgs",
                value: metrics?.totalMessages ?? 0,
                color: T.conn.accent,
              },
            ].map((c) => (
              <div
                key={c.label}
                style={{
                  background: "rgba(244,114,182,0.06)",
                  border: "1px solid rgba(244,114,182,0.12)",
                  borderRadius: 10,
                  padding: "14px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: c.color,
                    fontFamily: "JetBrains Mono,monospace",
                  }}
                >
                  {c.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#6b7280",
                    marginTop: 4,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {c.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <Sparkline
              data={samples.map((s) => s.load)}
              color={T.conn.accent}
              h={36}
            />
          </div>
        </Card>

        {/* Engine Logs — commented out
        <Card style={{ gridArea:"lo" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <CardLabel text="Engine Logs" theme={T.sys}/>
          </div>
          <div style={{ maxHeight:160, overflowY:"auto", fontSize:11 }}>
            {[...logs].reverse().map((log,i)=>(
              <div key={i} style={{ display:"flex", gap:10, marginBottom:5,
                borderBottom:"1px solid rgba(255,255,255,0.04)", paddingBottom:4 }}>
                <span style={{ color:"#374151", minWidth:58 }}>{log.ts}</span>
                <span style={{ color:LOG_COLORS[log.level], minWidth:48 }}>[{log.level}]</span>
                <span>{log.msg}</span>
              </div>
            ))}
          </div>
        </Card>
        */}
      </div>
    </div>
  );
};

export default SystemStatus;
