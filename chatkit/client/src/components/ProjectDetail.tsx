import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Settings,
  Trash2,
  Key,
  Globe,
  AlertTriangle,
  Zap,
  Loader2,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";

// --- MAIN COMPONENT ---
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (deleteConfirm !== project.projectName) return;
    const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) navigate("/dashboard");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-brand-primary">
        <Loader2 className="animate-spin mb-4" size={40} />
        <span className="font-black uppercase tracking-widest text-xs">
          Accessing Hermes Vault...
        </span>
      </div>
    );

  if (!project)
    return (
      <div className="p-20 text-center text-white">Project not found.</div>
    );

  const dailyLimit = project.plan?.dailyLimit || 1000;
  const usedTokens = project.usage?.dailyTokens || 0;
  const usagePercent = (usedTokens / dailyLimit) * 100;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pt-24 pb-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 text-brand-primary mb-2">
              <Globe size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {project.region}
              </span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              {project.projectName}
            </h1>
          </div>

          <div className="flex bg-brand-card border border-brand-border p-1 rounded-xl shadow-lg">
            <TabBtn
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              icon={<BarChart3 size={16} />}
              label="Overview"
            />
            <TabBtn
              active={activeTab === "credentials"}
              onClick={() => setActiveTab("credentials")}
              icon={<Key size={16} />}
              label="Credentials"
            />
            <TabBtn
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              icon={<Settings size={16} />}
              label="Settings"
            />
          </div>
        </header>

        {/* --- CONTENT --- */}
        <div className="grid grid-cols-1 gap-8">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Daily Consumption"
                  value={usedTokens.toLocaleString()}
                  detail={`Limit: ${dailyLimit.toLocaleString()}`}
                />
                <StatCard
                  title="Current Tier"
                  value={project.plan?.name || "Free"}
                  detail={`$${project.plan?.monthlyPrice || 0}/mo`}
                />
                <StatCard
                  title="Total Lifetime"
                  value={
                    project.usage?.totalTokensAllTime?.toLocaleString() || "0"
                  }
                  detail="Tokens total"
                />
              </div>

              <div className="bg-brand-card border border-brand-border p-8 rounded-brand relative overflow-hidden">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-muted">
                    Token Pulse (24h)
                  </h3>
                  <span
                    className={`text-xl font-black ${usagePercent > 80 ? "text-red-500" : "text-brand-primary"}`}
                  >
                    {usagePercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-4 bg-brand-bg rounded-full border border-brand-border overflow-hidden">
                  <div
                    className="h-full bg-brand-primary transition-all duration-1000 shadow-[0_0_20px_rgba(57,255,20,0.5)]"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
                <p className="mt-4 text-xs text-brand-muted font-medium">
                  {usagePercent >= 100
                    ? "⚠️ Limit exceeded. API requests are being throttled."
                    : "System operational. Usage resets at midnight UTC."}
                </p>
              </div>
            </div>
          )}

          {/* CREDENTIALS TAB - JSON VIEW */}
          {activeTab === "credentials" && (
            <div className="animate-in fade-in duration-300 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                    SDK Configuration
                  </h3>
                  <p className="text-brand-muted text-xs mt-1">
                    Inject this JSON into your{" "}
                    <code className="text-brand-primary">
                      hermes.config.json
                    </code>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Production Ready
                </div>
              </div>

              <JsonConfigBox
                data={{
                  projectId: project.projectId,
                  apiKey: project.apiKey,
                  secret: project.secret,
                  region: project.region,
                  endpoint: project.endpoint,
                  version: "v1.0.4",
                }}
              />

              <div className="bg-brand-primary/5 border border-brand-primary/20 p-4 rounded-xl flex gap-4 items-start">
                <AlertTriangle
                  className="text-brand-primary shrink-0"
                  size={20}
                />
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  <strong className="text-brand-primary uppercase">
                    Security Warning:
                  </strong>{" "}
                  Never commit your <code className="text-white">secret</code>{" "}
                  key to public repositories.
                </p>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-brand-card border border-brand-border rounded-brand p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="text-brand-primary" size={24} />
                  <h3 className="text-xl font-black text-white uppercase">
                    Subscription Plan
                  </h3>
                </div>
                <p className="text-brand-muted text-sm mb-6 max-w-xl">
                  Currently on the{" "}
                  <span className="text-brand-primary font-bold">
                    {project.plan?.name}
                  </span>{" "}
                  plan.
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-brand-primary text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all"
                >
                  View All Plans
                </button>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-brand p-8">
                <h3 className="text-xl font-bold text-red-500 mb-2">
                  Danger Zone
                </h3>
                <p className="text-brand-muted text-sm mb-6">
                  Permanently remove this project.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
                >
                  Terminate Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-md bg-black/90">
          <div className="bg-brand-card border border-red-500/30 w-full max-w-md rounded-brand p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle size={28} />
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Confirm Deletion
              </h2>
            </div>
            <p className="text-brand-muted text-sm mb-6">
              Type{" "}
              <span className="text-white font-black">
                "{project.projectName}"
              </span>{" "}
              to delete:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-4 text-white mb-6 focus:ring-1 focus:ring-red-500 outline-none font-mono"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-brand-border text-white py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirm !== project.projectName}
                onClick={handleDelete}
                className="flex-1 bg-red-600 disabled:opacity-20 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---

const JsonConfigBox = ({ data }: { data: any }) => {
  const [copied, setCopied] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const displayData = {
    ...data,
    secret: showSecret ? data.secret : "••••••••••••••••••••••••••••••••",
  };

  const jsonString = JSON.stringify(displayData, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group bg-[#0a0a0a] border border-brand-border rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-brand-card/50 border-b border-brand-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSecret(!showSecret)}
            className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors"
          >
            {showSecret ? "Mask Secret" : "Reveal Secret"}
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-black transition-all"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {copied ? "Copied" : "Copy JSON"}
            </span>
          </button>
        </div>
      </div>
      <div className="p-6 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed">
          {jsonString.split("\n").map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 shrink-0 text-brand-muted/30 select-none text-xs">
                {i + 1}
              </span>
              <span
                className={
                  line.includes('":')
                    ? "text-brand-primary"
                    : "text-brand-muted"
                }
              >
                {line}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-black uppercase text-[10px] tracking-widest ${
      active
        ? "bg-brand-primary text-black shadow-lg"
        : "text-brand-muted hover:text-white"
    }`}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ title, value, detail }: any) => (
  <div className="bg-brand-card border border-brand-border p-6 rounded-brand shadow-xl">
    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-3">
      {title}
    </p>
    <p className="text-3xl font-black text-white mb-1 tracking-tighter">
      {value}
    </p>
    <p className="text-xs text-brand-primary font-bold">{detail}</p>
  </div>
);

export default ProjectDetail;
