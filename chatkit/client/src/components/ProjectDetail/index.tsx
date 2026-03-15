import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Settings,
  Key,
  Globe,
  Zap,
  Loader2,
  Users,
  MessageSquare,
  Activity,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  Cpu,
  Database,
  Radio,
} from "lucide-react";

import type { Project } from "./types";
import StatCard from "./StatCard";
import UsageBar from "./UsageBar";
import NavItem from "./NavItem";
import HermesConfigJson from "./HermesConfigJson";
import SectionHeader from "./SectionHeader";
import SettingsCard from "./SettingsCard";
import ChartCard from "./ChartCard";


const BASE = import.meta.env.VITE_ENDPOINT;

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [tokenHistory, setTokenHistory] = useState<number[]>([]);
  const [userHistory, setUserHistory] = useState<number[]>([]);
  const [msgHistory, setMsgHistory] = useState<number[]>([]);
  const [usersPage, setUsersPage] = useState(0);

  const PAGE_SIZE = 10;

  const fetchProject = async () => {
    try {
      const res = await fetch(`${BASE}/api/projects/${id}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data);
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
    if (!project || deleteConfirm !== project.projectName) return;
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
      <div className="min-h-[calc(100vh-64px)] bg-brand-bg flex flex-col items-center justify-center text-brand-primary">
        <Loader2 className="animate-spin mb-4" size={32} />
        <span className="font-mono text-xs font-bold tracking-[0.2em] opacity-80 uppercase">
          Loading Project...
        </span>
      </div>
    );

  if (!project)
    return (
      <div className="min-h-[calc(100vh-64px)] bg-brand-bg flex items-center justify-center">
        <div className="font-mono text-red-500/80 text-sm font-bold tracking-[0.2em] bg-red-500/10 px-6 py-3 rounded-lg border border-red-500/20">
          [404] PROJECT NOT FOUND
        </div>
      </div>
    );

  const dailyLimit = project.plan?.dailyLimit ?? 0;
  const usedTokens = project.usage?.dailyTokens ?? 0;
  const totalAllTime = project.usage?.totalTokensAllTime ?? 0;
  const usagePct = dailyLimit > 0 ? (usedTokens / dailyLimit) * 100 : 0;
  const planName = project.plan?.name ?? "Free";
  const planPrice = project.plan?.monthlyPrice ?? 0;
  const totalUsers = project.stats?.totalUsers ?? project.usage?.totalUsers ?? 0;
  const activeUsers = project.stats?.activeUsers ?? project.usage?.activeUsers ?? 0;
  const totalMessages = project.stats?.totalMessages ?? project.usage?.totalMessages ?? 0;
  const totalRooms = project.stats?.totalRooms ?? project.usage?.totalRooms ?? 0;
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
    { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={16} /> },
    {
      id: "users",
      label: "Users",
      icon: <Users size={16} />,
      badge: totalUsers > 0 ? String(totalUsers) : undefined,
    },
    { id: "credentials", label: "Credentials", icon: <Key size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  const handleTabChange = (id: string) => {
    setTab(id);
    if (id === "users") setUsersPage(0);
  };

  const usageColor =
    usagePct > 90 ? "#ef4444" : usagePct > 70 ? "#fbbf24" : "#ffffff";

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-brand-bg text-white">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 fixed top-16 left-0 h-[calc(100vh-64px)] flex flex-col bg-[#0a0a0a] border-r border-white/10 z-40 p-4">
        <div className="pb-5 border-b border-white/10 mb-4 px-2 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-brand-primary shrink-0" />
            <span className="font-sans text-[10px] font-bold text-slate-500 tracking-[0.15em] uppercase">
              {project.region || "Global Edge"}
            </span>
          </div>
          <div className="font-sans text-lg font-black text-white tracking-tight break-words leading-tight">
            {project.projectName}
          </div>
          <div className="flex items-center gap-2 mt-3 bg-brand-primary/10 w-fit px-2 py-1 rounded-md border border-brand-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-none " />
            <span className="font-sans text-[9px] font-bold text-brand-primary tracking-widest uppercase">
              Operational
            </span>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map((n) => (
            <NavItem
              key={n.id}
              icon={n.icon}
              label={n.label}
              active={tab === n.id}
              onClick={() => handleTabChange(n.id)}
              badge={n.badge}
            />
          ))}
        </nav>
        <div className="mt-auto p-4 bg-[#111] border border-white/10 rounded-xl">
          <div className="font-sans text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-1">
            Current Plan
          </div>
          <div className="font-sans text-sm font-black text-brand-primary tracking-tight">
            {planName.toUpperCase()}
          </div>
          <div className="font-sans text-xs text-slate-400 font-medium mt-1">
            {planPrice > 0 ? `$${planPrice}/mo` : "Free tier"}
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-6">
              <SectionHeader title="Overview" sub={`Project created on ${createdAt}`} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Users size={18} />}
                  label="Total Users"
                  value={totalUsers.toLocaleString()}
                  sub={`${activeUsers} active now`}
                  trend="↑ live"
                  spark={userHistory}
                  accent="#ffffff"
                />
                <StatCard
                  icon={<MessageSquare size={18} />}
                  label="Messages"
                  value={totalMessages.toLocaleString()}
                  sub="all time"
                  spark={msgHistory}
                  accent="#3b82f6"
                />
                <StatCard
                  icon={<Radio size={18} />}
                  label="Active Rooms"
                  value={totalRooms.toLocaleString()}
                  sub="open channels"
                  accent="#a855f7"
                />
                <StatCard
                  icon={<Activity size={18} />}
                  label="Uptime"
                  value={`${uptime}%`}
                  sub="last 30 days"
                  accent="#ffffff"
                />
              </div>
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                  <div>
                    <div className="font-sans text-xs font-bold text-slate-500 tracking-[0.15em] uppercase mb-2">
                      Daily Token Consumption
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-4xl font-black text-white tracking-tight">
                        {usedTokens.toLocaleString()}
                      </span>
                      <span className="font-sans text-sm font-medium text-slate-400">
                        / {dailyLimit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div
                    className="font-mono text-3xl font-black tracking-tight"
                    style={{ color: usageColor }}
                  >
                    {usagePct.toFixed(1)}%
                  </div>
                </div>
                <UsageBar pct={usagePct} color={usageColor} />
                <div className="flex justify-between items-center mt-3">
                  <span
                    className={`font-sans text-xs font-medium ${usagePct >= 100 ? "text-red-400" : "text-slate-500"}`}
                  >
                    {usagePct >= 100
                      ? "⚠ Limit exceeded — requests throttled"
                      : "Resets at midnight UTC"}
                  </span>
                  <span className="font-sans text-xs font-medium text-slate-500">
                    {(dailyLimit - usedTokens).toLocaleString()} remaining
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: <Cpu size={16} />,
                    label: "Avg Latency",
                    value: avgLatency ? `${avgLatency}ms` : "—",
                    sub: "last 1h",
                  },
                  {
                    icon: <Database size={16} />,
                    label: "Lifetime Usage",
                    value: totalAllTime.toLocaleString(),
                    sub: "total tokens",
                  },
                  {
                    icon: <Clock size={16} />,
                    label: "Created",
                    value: createdAt,
                    sub: project.region || "Global",
                  },
                ].map(({ icon, label, value, sub }) => (
                  <div
                    key={label}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4"
                  >
                    <div className="text-slate-400 bg-black/50 p-2.5 rounded-lg border border-white/5">
                      {icon}
                    </div>
                    <div>
                      <div className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {label}
                      </div>
                      <div className="font-mono text-lg font-bold text-white leading-none">
                        {value}
                      </div>
                      <div className="font-sans text-xs text-slate-400 mt-1.5 font-medium">
                        {sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {tab === "analytics" && (
            <div className="space-y-6">
              <SectionHeader
                title="Analytics"
                sub="Usage trends and performance metrics"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ChartCard
                  title="Token Usage (24h)"
                  data={tokenHistory}
                  color="#ffffff"
                  value={`${usedTokens.toLocaleString()} tokens`}
                />
                <ChartCard
                  title="Message Volume"
                  data={msgHistory}
                  color="#3b82f6"
                  value={`${totalMessages.toLocaleString()} total`}
                />
                <ChartCard
                  title="Active Connections"
                  data={userHistory}
                  color="#a855f7"
                  value={`${activeUsers} online`}
                />
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                  <div className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-5">
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
                      color: "#a855f7",
                    },
                    {
                      label: "Rooms",
                      used: totalRooms,
                      max: project.plan?.maxRooms ?? 500,
                      color: "#3b82f6",
                    },
                  ].map(({ label, used, max, color }) => (
                    <div key={label} className="mb-5 last:mb-0">
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-sans text-xs font-semibold text-slate-400">
                          {label}
                        </span>
                        <span
                          className="font-mono text-xs font-bold"
                          style={{ color }}
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

          {/* USERS */}
          {tab === "users" && (
            <div className="space-y-6">
              <SectionHeader
                title="Users"
                sub="All registered Hermes users under this project"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Total Users", value: totalUsers, icon: <Users size={16} />, color: "#ffffff" },
                  { label: "Active Now", value: activeUsers, icon: <Radio size={16} />, color: "#3b82f6" },
                  { label: "Rooms Open", value: totalRooms, icon: <MessageSquare size={16} />, color: "#a855f7" },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="bg-[#111] border border-white/10 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {label}
                      </span>
                      <span className="text-slate-600">{icon}</span>
                    </div>
                    <span className="font-mono text-3xl font-black" style={{ color }}>
                      {value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {(() => {
                const allUsers = project.users ?? [];
                const totalPages = Math.max(1, Math.ceil(allUsers.length / PAGE_SIZE));
                const pageUsers = allUsers.slice(usersPage * PAGE_SIZE, (usersPage + 1) * PAGE_SIZE);
                return (
                  <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-4 p-4 bg-black/40 border-b border-white/10 font-sans text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>User</span>
                      <span>Status</span>
                      <span>Last Seen</span>
                      <span>Messages</span>
                    </div>

                    {allUsers.length === 0 ? (
                      <div className="p-12 text-center font-sans text-sm font-medium text-slate-500">
                        No users yet. Users will appear here once they connect via the SDK.
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {pageUsers.map((u, i) => (
                          <div key={i} className="grid grid-cols-4 p-4 items-center hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-sans text-xs font-bold text-brand-primary">
                                {u.displayName?.[0]?.toUpperCase() ?? "?"}
                              </div>
                              <span className="font-sans text-sm font-bold text-white">{u.displayName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${u.isOnline ? "bg-brand-primary" : "bg-slate-600"}`} />
                              <span className={`font-sans text-xs font-semibold ${u.isOnline ? "text-brand-primary" : "text-slate-500"}`}>
                                {u.isOnline ? "Online" : "Offline"}
                              </span>
                            </div>
                            <span className="font-sans text-xs font-medium text-slate-400">
                              {u.lastSeen ? new Date(u.lastSeen).toLocaleString() : "—"}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-300">
                              {u.messageCount ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {allUsers.length > PAGE_SIZE && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-black/20">
                        <button
                          disabled={usersPage === 0}
                          onClick={() => setUsersPage((p) => p - 1)}
                          className="px-4 py-1.5 rounded-lg font-sans text-xs font-bold border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          ← Prev
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          Page {usersPage + 1} / {totalPages}
                          <span className="text-slate-600 font-normal ml-2">
                            ({allUsers.length} total)
                          </span>
                        </span>
                        <button
                          disabled={usersPage >= totalPages - 1}
                          onClick={() => setUsersPage((p) => p + 1)}
                          className="px-4 py-1.5 rounded-lg font-sans text-xs font-bold border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {tab === "credentials" && (
            <div className="space-y-6">
              <SectionHeader
                title="Credentials"
                sub="Keep your API secret secure — never expose it client-side"
              />
              <HermesConfigJson project={project} showSecret />
            </div>
          )}

          {/* SETTINGS */}
          {tab === "settings" && (
            <div className="space-y-6">
              <SectionHeader title="Settings" sub="Manage your project configuration" />
              <SettingsCard title="Subscription Plan" icon={<Zap size={18} />}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-sans text-base font-black text-brand-primary mb-1">
                      {planName.toUpperCase()}
                    </div>
                    <div className="font-sans text-sm font-medium text-slate-400">
                      {planPrice > 0 ? `$${planPrice}/month` : "Free tier"}
                      <span className="mx-2">•</span>
                      {dailyLimit.toLocaleString()} daily tokens
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="bg-brand-primary text-black px-6 py-2.5 rounded-lg font-sans text-sm font-bold transition-all hover:brightness-110 shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                  >
                    UPGRADE PLAN
                  </button>
                </div>
              </SettingsCard>
              <SettingsCard title="Security" icon={<Shield size={18} />}>
                <p className="font-sans text-sm font-medium text-slate-400 mb-5 leading-relaxed max-w-2xl">
                  Rotate your API secret if it has been compromised or exposed. All existing connections will be invalidated immediately.
                </p>
                <button className="bg-transparent border border-white/20 text-white hover:bg-white/5 px-6 py-2.5 rounded-lg font-sans text-sm font-bold transition-colors">
                  ROTATE API SECRET
                </button>
              </SettingsCard>
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 lg:p-8 mt-8">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle size={20} className="text-red-500" />
                  <span className="font-sans text-sm font-bold text-red-500 uppercase tracking-widest">
                    Danger Zone
                  </span>
                </div>
                <p className="font-sans text-sm font-medium text-red-500/70 mb-6 leading-relaxed max-w-2xl">
                  Permanently deletes this project, invalidates all keys, and removes all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white px-6 py-2.5 rounded-lg font-sans text-sm font-bold transition-colors"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#111] border border-red-500/30 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(239,68,68,0.15)]">
            <div className="font-sans text-xl font-bold text-red-500 mb-3 tracking-tight">
              Delete Project?
            </div>
            <p className="font-sans text-sm text-slate-400 mb-6 leading-relaxed">
              Type{" "}
              <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded">
                {project.projectName}
              </strong>{" "}
              to confirm. All data will be permanently erased.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={project.projectName}
              className="w-full bg-black/50 border border-white/10 focus:border-red-500/50 rounded-lg p-3 font-sans text-sm text-white outline-none mb-6 transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="flex-1 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white py-3 rounded-lg font-sans text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirm !== project.projectName || deleting}
                onClick={handleDelete}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-sans text-sm font-bold transition-colors
                  ${
                    deleteConfirm === project.projectName
                      ? "bg-red-500 text-white cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-600"
                      : "bg-red-500/10 text-red-500/50 cursor-not-allowed"
                  }`}
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
