import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Settings,
  Key,
  Globe,
  Zap,
  Loader2,
  Copy,
  Check,
  Users,
  MessageSquare,
  Activity,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Cpu,
  Database,
  Radio,
} from "lucide-react";

const BASE = "http://localhost:8080";

// ── Tiny sparkline ────────────────────────────────────────────────────────────
const Spark = ({
  data,
  color = "#39ff14",
}: {
  data: number[];
  color?: string;
}) => {
  if (data.length < 2) return <div style={{ height: 32 }} />;
  const max = Math.max(...data, 1);
  const W = 80,
    H = 32;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / max) * H * 0.85}`)
    .join(" ");
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block" }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
        style={{ opacity: 0.8 }}
      />
    </svg>
  );
};

// ── Usage bar ─────────────────────────────────────────────────────────────────
const UsageBar = ({
  pct,
  color = "#39ff14",
}: {
  pct: number;
  color?: string;
}) => (
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
        width: `${Math.min(pct, 100)}%`,
        borderRadius: 2,
        background: color,
        boxShadow: `0 0 8px ${color}60`,
        transition: "width 1s ease",
      }}
    />
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  icon,
  label,
  value,
  sub,
  trend,
  spark,
  accent = "#39ff14",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  spark?: number[];
  accent?: string;
}) => (
  <div
    style={{
      background: "var(--brand-card)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      padding: "20px 20px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${accent}60, transparent)`,
      }}
    />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>
        {icon}
      </div>
      {spark && <Spark data={spark} color={accent} />}
    </div>
    <div
      style={{
        fontSize: 11,
        color: "rgba(255,255,255,0.4)",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        fontFamily: "var(--font-mono)",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 26,
        fontWeight: 800,
        color: "#f0f0f0",
        lineHeight: 1.1,
        fontFamily: "var(--font-mono)",
        letterSpacing: "-0.02em",
      }}
    >
      {value}
    </div>
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}
    >
      {sub && (
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {sub}
        </span>
      )}
      {trend && (
        <span
          style={{
            fontSize: 10,
            color: accent,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
          }}
        >
          {trend}
        </span>
      )}
    </div>
  </div>
);

// ── Sidebar nav item ──────────────────────────────────────────────────────────
const NavItem = ({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      background: active ? "rgba(57,255,20,0.08)" : "transparent",
      borderLeft: `2px solid ${active ? "#39ff14" : "transparent"}`,
      color: active ? "#39ff14" : "rgba(255,255,255,0.45)",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      transition: "all 0.15s",
      textAlign: "left",
    }}
  >
    <span style={{ flexShrink: 0 }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge && (
      <span
        style={{
          fontSize: 9,
          padding: "2px 6px",
          borderRadius: 10,
          background: "rgba(57,255,20,0.15)",
          color: "#39ff14",
          fontWeight: 700,
          letterSpacing: "0.1em",
        }}
      >
        {badge}
      </span>
    )}
    {active && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
  </button>
);

// ── Copy field ────────────────────────────────────────────────────────────────
const CopyField = ({
  label,
  value,
  masked,
}: {
  label: string;
  value: string;
  masked?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const display = masked && !revealed ? "•".repeat(32) : value;
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontFamily: "var(--font-mono)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "10px 14px",
        }}
      >
        <code
          style={{
            flex: 1,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: masked && !revealed ? "rgba(255,255,255,0.2)" : "#39ff14",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {display}
        </code>
        {masked && (
          <button
            onClick={() => setRevealed((r) => !r)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 4px",
              color: "rgba(255,255,255,0.3)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
            }}
          >
            {revealed ? "HIDE" : "SHOW"}
          </button>
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={{
            background: copied
              ? "rgba(57,255,20,0.15)"
              : "rgba(255,255,255,0.05)",
            border: `1px solid ${copied ? "rgba(57,255,20,0.3)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 6,
            padding: "4px 8px",
            cursor: "pointer",
            color: copied ? "#39ff14" : "rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Simulated historical data for sparklines (replace with real API data if available)
  const [tokenHistory, setTokenHistory] = useState<number[]>([]);
  const [userHistory, setUserHistory] = useState<number[]>([]);
  const [msgHistory, setMsgHistory] = useState<number[]>([]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`${BASE}/api/projects/${id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        // Append to history arrays for sparklines
        setTokenHistory((h) => [...h.slice(-19), data.usage?.dailyTokens ?? 0]);
        setUserHistory((h) => [...h.slice(-19), data.stats?.totalUsers ?? 0]);
        setMsgHistory((h) => [...h.slice(-19), data.stats?.totalMessages ?? 0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    const iv = setInterval(fetchProject, 5000);
    return () => clearInterval(iv);
  }, [id]);

  const handleDelete = async () => {
    if (deleteConfirm !== project.projectName) return;
    setDeleting(true);
    const res = await fetch(`${BASE}/api/projects/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) navigate("/dashboard");
    setDeleting(false);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-brand-primary">
        <Loader2 className="animate-spin mb-4" size={32} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            opacity: 0.6,
          }}
        >
          LOADING PROJECT...
        </span>
      </div>
    );

  if (!project)
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div
          style={{
            fontFamily: "var(--font-mono)",
            color: "rgba(255,255,255,0.3)",
            fontSize: 13,
            letterSpacing: "0.2em",
          }}
        >
          [404] PROJECT NOT FOUND
        </div>
      </div>
    );

  // ── Derived values ──────────────────────────────────────────────────────────
  const dailyLimit = project.plan?.dailyLimit ?? 0;
  const usedTokens = project.usage?.dailyTokens ?? 0;
  const totalAllTime = project.usage?.totalTokensAllTime ?? 0;
  const usagePct = dailyLimit > 0 ? (usedTokens / dailyLimit) * 100 : 0;
  const planName = project.plan?.name ?? "Free";
  const planPrice = project.plan?.monthlyPrice ?? 0;
  const totalUsers =
    project.stats?.totalUsers ?? project.usage?.totalUsers ?? 0;
  const activeUsers =
    project.stats?.activeUsers ?? project.usage?.activeUsers ?? 0;
  const totalMessages =
    project.stats?.totalMessages ?? project.usage?.totalMessages ?? 0;
  const totalRooms =
    project.stats?.totalRooms ?? project.usage?.totalRooms ?? 0;
  const avgLatency = project.stats?.avgLatency ?? 0;
  const uptime = project.stats?.uptime ?? 99.9;
  const createdAt = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const navItems = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={14} /> },
    {
      id: "users",
      label: "Users",
      icon: <Users size={14} />,
      badge: totalUsers > 0 ? String(totalUsers) : undefined,
    },
    { id: "credentials", label: "Credentials", icon: <Key size={14} /> },
    { id: "settings", label: "Settings", icon: <Settings size={14} /> },
  ];

  const usageColor =
    usagePct > 90 ? "#ff4444" : usagePct > 70 ? "#f0a500" : "#39ff14";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--brand-bg)",
        color: "var(--brand-text)",
        paddingTop: 64,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        :root { --font-mono: 'JetBrains Mono', monospace; }
        .pd-section { animation: pd-fadein 0.3s ease; }
        @keyframes pd-fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .pd-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      {/* ── Left sidebar ── */}
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.01)",
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          padding: "28px 12px 20px",
        }}
      >
        {/* Project identity */}
        <div
          style={{
            padding: "0 6px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <Globe size={12} style={{ color: "#39ff14", flexShrink: 0 }} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              {project.region}
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              fontWeight: 700,
              color: "#f0f0f0",
              letterSpacing: "0.02em",
              wordBreak: "break-all",
              lineHeight: 1.3,
            }}
          >
            {project.projectName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#39ff14",
                boxShadow: "0 0 6px #39ff14",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "#39ff14",
                letterSpacing: "0.15em",
              }}
            >
              ACTIVE
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {navItems.map((n) => (
            <NavItem
              key={n.id}
              icon={n.icon}
              label={n.label}
              active={tab === n.id}
              onClick={() => setTab(n.id)}
              badge={n.badge}
            />
          ))}
        </nav>

        {/* Plan badge */}
        <div
          style={{
            marginTop: "auto",
            padding: "12px 14px",
            background: "rgba(57,255,20,0.05)",
            border: "1px solid rgba(57,255,20,0.15)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.2em",
              marginBottom: 4,
            }}
          >
            PLAN
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              fontWeight: 700,
              color: "#39ff14",
            }}
          >
            {planName.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              marginTop: 2,
            }}
          >
            {planPrice > 0 ? `$${planPrice}/mo` : "Free tier"}
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 40px 60px" }}>
        <div style={{ maxWidth: 900 }}>
          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="pd-section">
              <SectionHeader
                title="Overview"
                sub={`Project created ${createdAt}`}
              />

              {/* Primary stats grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <StatCard
                  icon={<Users size={16} />}
                  label="Total Users"
                  value={totalUsers.toLocaleString()}
                  sub={`${activeUsers} active now`}
                  trend="↑ live"
                  spark={userHistory}
                  accent="#39ff14"
                />
                <StatCard
                  icon={<MessageSquare size={16} />}
                  label="Messages Sent"
                  value={totalMessages.toLocaleString()}
                  sub="all time"
                  spark={msgHistory}
                  accent="#00c8ff"
                />
                <StatCard
                  icon={<Radio size={16} />}
                  label="Active Rooms"
                  value={totalRooms.toLocaleString()}
                  sub="open channels"
                  accent="#a78bfa"
                />
                <StatCard
                  icon={<Activity size={16} />}
                  label="Uptime"
                  value={`${uptime}%`}
                  sub="last 30 days"
                  accent="#39ff14"
                />
              </div>

              {/* Token usage */}
              <div
                style={{
                  background: "var(--brand-card)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}
                    >
                      Daily Token Consumption
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 28,
                          fontWeight: 800,
                          color: "#f0f0f0",
                        }}
                      >
                        {usedTokens.toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        / {dailyLimit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 22,
                      fontWeight: 800,
                      color: usageColor,
                    }}
                  >
                    {usagePct.toFixed(1)}%
                  </div>
                </div>
                <UsageBar pct={usagePct} color={usageColor} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    {usagePct >= 100
                      ? "⚠ Limit exceeded — requests being throttled"
                      : "Resets at midnight UTC"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    {(dailyLimit - usedTokens).toLocaleString()} remaining
                  </span>
                </div>
              </div>

              {/* Secondary stats row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                {[
                  {
                    icon: <Cpu size={14} />,
                    label: "Avg Latency",
                    value: avgLatency ? `${avgLatency}ms` : "—",
                    sub: "last 1h",
                  },
                  {
                    icon: <Database size={14} />,
                    label: "Total Lifetime",
                    value: totalAllTime.toLocaleString(),
                    sub: "tokens consumed",
                  },
                  {
                    icon: <Clock size={14} />,
                    label: "Created",
                    value: createdAt,
                    sub: project.region,
                  },
                ].map(({ icon, label, value, sub }) => (
                  <div
                    key={label}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 10,
                      padding: "16px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}
                    >
                      {icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "rgba(255,255,255,0.3)",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          marginBottom: 4,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#e0e0e0",
                        }}
                      >
                        {value}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "rgba(255,255,255,0.25)",
                          marginTop: 2,
                        }}
                      >
                        {sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {tab === "analytics" && (
            <div className="pd-section">
              <SectionHeader
                title="Analytics"
                sub="Usage trends and performance metrics"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <ChartCard
                  title="Token Usage (24h)"
                  data={tokenHistory}
                  color="#39ff14"
                  value={`${usedTokens.toLocaleString()} tokens`}
                />
                <ChartCard
                  title="Messages / interval"
                  data={msgHistory}
                  color="#00c8ff"
                  value={`${totalMessages.toLocaleString()} total`}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <ChartCard
                  title="Active Users"
                  data={userHistory}
                  color="#a78bfa"
                  value={`${activeUsers} online`}
                />
                <div
                  style={{
                    background: "var(--brand-card)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      marginBottom: 16,
                    }}
                  >
                    Plan Limits
                  </div>
                  {[
                    {
                      label: "Daily Tokens",
                      used: usedTokens,
                      max: dailyLimit,
                      color: usageColor,
                    },
                    {
                      label: "Active Users",
                      used: activeUsers,
                      max: project.plan?.maxUsers ?? 100,
                      color: "#a78bfa",
                    },
                    {
                      label: "Rooms",
                      used: totalRooms,
                      max: project.plan?.maxRooms ?? 500,
                      color: "#00c8ff",
                    },
                  ].map(({ label, used, max, color }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color,
                          }}
                        >
                          {used.toLocaleString()} / {max.toLocaleString()}
                        </span>
                      </div>
                      <UsageBar
                        pct={max > 0 ? (used / max) * 100 : 0}
                        color={color}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="pd-section">
              <SectionHeader
                title="Users"
                sub="All registered Hermes users under this project"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {[
                  {
                    label: "Total Users",
                    value: totalUsers,
                    icon: <Users size={14} />,
                    color: "#39ff14",
                  },
                  {
                    label: "Active Now",
                    value: activeUsers,
                    icon: <Radio size={14} />,
                    color: "#00c8ff",
                  },
                  {
                    label: "Rooms Open",
                    value: totalRooms,
                    icon: <MessageSquare size={14} />,
                    color: "#a78bfa",
                  },
                ].map(({ label, value, icon, color }) => (
                  <div
                    key={label}
                    style={{
                      background: "var(--brand-card)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10,
                      padding: "16px 20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          color: "rgba(255,255,255,0.3)",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.2)" }}>
                        {icon}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 24,
                        fontWeight: 800,
                        color,
                      }}
                    >
                      {value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "var(--brand-card)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "rgba(255,255,255,0.25)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>User</span>
                  <span>Status</span>
                  <span>Last Seen</span>
                  <span>Messages</span>
                </div>
                {(project.users ?? []).length === 0 ? (
                  <div
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.2)",
                      letterSpacing: "0.15em",
                    }}
                  >
                    No users yet — users appear here once they connect via the
                    SDK
                  </div>
                ) : (
                  (project.users ?? []).map((u: any, i: number) => (
                    <div
                      key={i}
                      className="pd-row"
                      style={{
                        padding: "12px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: "rgba(57,255,20,0.1)",
                            border: "1px solid rgba(57,255,20,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#39ff14",
                          }}
                        >
                          {u.displayName?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            color: "#d0d0d0",
                          }}
                        >
                          {u.displayName}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: u.isOnline
                              ? "#39ff14"
                              : "rgba(255,255,255,0.2)",
                            boxShadow: u.isOnline ? "0 0 6px #39ff14" : "none",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: u.isOnline
                              ? "#39ff14"
                              : "rgba(255,255,255,0.3)",
                          }}
                        >
                          {u.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        {u.lastSeen
                          ? new Date(u.lastSeen).toLocaleString()
                          : "—"}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {u.messageCount ?? "—"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── CREDENTIALS ── */}
          {tab === "credentials" && (
            <div className="pd-section">
              <SectionHeader
                title="Credentials"
                sub="Keep your API secret secure — never expose it client-side"
              />
              <div
                style={{
                  background: "var(--brand-card)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: 28,
                  marginBottom: 16,
                }}
              >
                <CopyField label="Project ID" value={project.projectId} />
                <CopyField label="API Key" value={project.apiKey} />
                <CopyField label="API Secret" value={project.secret} masked />
                <CopyField label="Endpoint" value={project.endpoint} />
                <CopyField label="Region" value={project.region} />
              </div>

              <div
                style={{
                  padding: "14px 18px",
                  background: "rgba(240,165,0,0.06)",
                  border: "1px solid rgba(240,165,0,0.2)",
                  borderRadius: 8,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <AlertTriangle
                  size={14}
                  style={{ color: "#f0a500", flexShrink: 0, marginTop: 1 }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "rgba(240,165,0,0.8)",
                    lineHeight: 1.6,
                  }}
                >
                  The API Secret is shown once. Rotate it in Settings if
                  compromised. Never commit secrets to version control.
                </span>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === "settings" && (
            <div className="pd-section">
              <SectionHeader
                title="Settings"
                sub="Manage your project configuration"
              />

              {/* Plan */}
              <SettingsCard title="Subscription Plan" icon={<Zap size={16} />}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "#39ff14",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {planName.toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                      }}
                    >
                      {planPrice > 0 ? `$${planPrice}/month` : "Free tier"}
                      {" · "}
                      {dailyLimit.toLocaleString()} daily tokens
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/pricing")}
                    style={{
                      background: "#39ff14",
                      color: "#000",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px 20px",
                      borderRadius: 8,
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                    }}
                  >
                    UPGRADE
                  </button>
                </div>
              </SettingsCard>

              {/* Security */}
              <SettingsCard title="Security" icon={<Shield size={16} />}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 14,
                    lineHeight: 1.6,
                  }}
                >
                  Rotate your API secret if it has been compromised or exposed.
                  All existing connections will be invalidated immediately.
                </div>
                <button
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    padding: "8px 18px",
                    borderRadius: 8,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                  }}
                >
                  ROTATE SECRET
                </button>
              </SettingsCard>

              {/* Danger zone */}
              <div
                style={{
                  background: "rgba(255,68,68,0.04)",
                  border: "1px solid rgba(255,68,68,0.15)",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <AlertTriangle size={15} style={{ color: "#ff4444" }} />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#ff4444",
                      letterSpacing: "0.15em",
                    }}
                  >
                    DANGER ZONE
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    marginBottom: 16,
                    lineHeight: 1.6,
                  }}
                >
                  Permanently deletes this project and all associated data. This
                  action cannot be undone.
                </p>
                <button
                  onClick={() => setDeleteModal(true)}
                  style={{
                    background: "rgba(255,68,68,0.1)",
                    border: "1px solid rgba(255,68,68,0.3)",
                    color: "#ff4444",
                    cursor: "pointer",
                    padding: "8px 20px",
                    borderRadius: 8,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                  }}
                >
                  TERMINATE PROJECT
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Delete modal ── */}
      {deleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--brand-card)",
              border: "1px solid rgba(255,68,68,0.25)",
              borderRadius: 16,
              padding: 32,
              width: "100%",
              maxWidth: 440,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 16,
                fontWeight: 800,
                color: "#ff4444",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              TERMINATE PROJECT
            </div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 20,
                lineHeight: 1.7,
              }}
            >
              Type{" "}
              <strong style={{ color: "#fff" }}>{project.projectName}</strong>{" "}
              to confirm deletion. All data will be permanently erased.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={project.projectName}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "10px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#fff",
                outline: "none",
                marginBottom: 20,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setDeleteConfirm("");
                }}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                CANCEL
              </button>
              <button
                disabled={deleteConfirm !== project.projectName || deleting}
                onClick={handleDelete}
                style={{
                  flex: 1,
                  background:
                    deleteConfirm === project.projectName
                      ? "rgba(255,68,68,0.2)"
                      : "rgba(255,68,68,0.05)",
                  border: `1px solid ${
                    deleteConfirm === project.projectName
                      ? "rgba(255,68,68,0.5)"
                      : "rgba(255,68,68,0.15)"
                  }`,
                  color:
                    deleteConfirm === project.projectName
                      ? "#ff4444"
                      : "rgba(255,68,68,0.3)",
                  cursor:
                    deleteConfirm === project.projectName
                      ? "pointer"
                      : "not-allowed",
                  padding: "10px",
                  borderRadius: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {deleting ? (
                  <Loader2
                    size={12}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : null}
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Helper sub-components ─────────────────────────────────────────────────────
const SectionHeader = ({ title, sub }: { title: string; sub?: string }) => (
  <div style={{ marginBottom: 24 }}>
    <h2
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 18,
        fontWeight: 800,
        color: "#f0f0f0",
        letterSpacing: "0.05em",
        margin: 0,
      }}
    >
      {title}
    </h2>
    {sub && (
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "rgba(255,255,255,0.3)",
          marginTop: 4,
          letterSpacing: "0.05em",
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

const SettingsCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    style={{
      background: "var(--brand-card)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 12,
      padding: 24,
      marginBottom: 12,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.4)" }}>{icon}</span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 700,
          color: "#d0d0d0",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
    </div>
    {children}
  </div>
);

const ChartCard = ({
  title,
  data,
  color,
  value,
}: {
  title: string;
  data: number[];
  color: string;
  value: string;
}) => {
  const max = Math.max(...data, 1);
  const W = 400,
    H = 80;
  const pts =
    data.length > 1
      ? data
          .map(
            (v, i) =>
              `${(i / (data.length - 1)) * W},${H - (v / max) * H * 0.85}`,
          )
          .join(" ")
      : "";

  return (
    <div
      style={{
        background: "var(--brand-card)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            fontWeight: 700,
            color,
          }}
        >
          {value}
        </div>
      </div>
      {data.length > 1 ? (
        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={`cg-${color.replace("#", "")}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            fill={`url(#cg-${color.replace("#", "")})`}
            stroke="none"
            points={`0,${H} ${pts} ${W},${H}`}
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
      ) : (
        <div
          style={{
            height: H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "rgba(255,255,255,0.15)",
          }}
        >
          Collecting data...
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
