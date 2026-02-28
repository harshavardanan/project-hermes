import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  Activity,
  X,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import Projects from "./Projects";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Projects");
  const [showForm, setShowForm] = useState(false);

  // Form & Loading States
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectData, setNewProjectData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // System Status States
  const [engineHealth, setEngineHealth] = useState<any>(null);
  const [engineMetrics, setEngineMetrics] = useState<any>(null);

  // Fetch Health & Metrics when on the System Status tab
  useEffect(() => {
    if (activeTab === "System Status") {
      const fetchStatus = async () => {
        try {
          const healthRes = await fetch("http://localhost:8080/hermes/health");
          const metricsRes = await fetch(
            "http://localhost:8080/hermes/metrics",
          );

          if (healthRes.ok) setEngineHealth(await healthRes.json());
          if (metricsRes.ok) setEngineMetrics(await metricsRes.json());
        } catch (error) {
          console.error("Failed to fetch engine status", error);
        }
      };

      fetchStatus();
      const interval = setInterval(fetchStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    setIsCreating(true);
    try {
      const response = await fetch("http://localhost:8080/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create project");
      const data = await response.json();
      setNewProjectData(data);
    } catch (err) {
      console.error("Creation error:", err);
      alert("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const closeAndRefresh = () => {
    setShowForm(false);
    setNewProjectData(null);
    setProjectName("");
    setRefreshKey((prev) => prev + 1);
  };

  const configSnippet = newProjectData
    ? `
const hermesConfig = {
  projectId: "${newProjectData.projectId}",
  apiKey: "${newProjectData.apiKey}",
  apiSecret: "${newProjectData.secret}",
  endpoint: "${newProjectData.endpoint}",
  region: "${newProjectData.region}"
};`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(configSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-brand-border bg-brand-bg fixed h-full pt-20 z-40">
        <div className="px-4 space-y-2 mt-4">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Projects"
            active={activeTab === "Projects"}
            onClick={() => setActiveTab("Projects")}
          />
          <SidebarItem
            icon={<Activity size={20} />}
            label="System Status"
            active={activeTab === "System Status"}
            onClick={() => setActiveTab("System Status")}
          />
          <SidebarItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeTab === "Settings"}
            onClick={() => setActiveTab("Settings")}
          />
          <div className="pt-4 mt-4 border-t border-brand-border">
            <SidebarItem
              icon={<HelpCircle size={20} />}
              label="Support"
              active={activeTab === "Support"}
              onClick={() => setActiveTab("Support")}
            />
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 pt-24 p-10">
        <div className="max-w-5xl mx-auto">
          {activeTab === "Projects" && (
            <Projects key={refreshKey} onOpenForm={() => setShowForm(true)} />
          )}

          {activeTab === "System Status" && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-3xl font-bold text-white tracking-tight mb-6">
                Hermes Engine Status
              </h1>

              {/* STATUS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-brand-card p-6 rounded-2xl border border-brand-border">
                  <h3 className="text-brand-muted font-bold mb-2">
                    Engine Health
                  </h3>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${engineHealth?.status === "ok" ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
                    ></div>
                    <span className="text-2xl font-bold text-white capitalize">
                      {engineHealth?.status || "Offline"}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted mt-2">
                    Uptime:{" "}
                    {engineHealth?.uptime
                      ? Math.floor(engineHealth.uptime / 60)
                      : 0}{" "}
                    minutes
                  </p>
                </div>

                <div className="bg-brand-card p-6 rounded-2xl border border-brand-border">
                  <h3 className="text-brand-muted font-bold mb-2">
                    Resource Usage
                  </h3>
                  <p className="text-2xl font-bold text-white">
                    {engineHealth?.memory?.used || 0} MB
                  </p>
                  <p className="text-sm text-brand-muted mt-2">
                    CPU: {engineHealth?.cpu || 0}% | Total RAM:{" "}
                    {engineHealth?.memory?.total || 0} MB
                  </p>
                </div>

                <div className="bg-brand-card p-6 rounded-2xl border border-brand-border">
                  <h3 className="text-brand-muted font-bold mb-2">
                    Real-time Metrics
                  </h3>
                  <p className="text-2xl font-bold text-brand-primary">
                    {engineMetrics?.activeConnections || 0} Active Users
                  </p>
                  <p className="text-sm text-brand-muted mt-2">
                    {engineMetrics?.totalMessages || 0} Total Msgs |{" "}
                    {engineMetrics?.messagesPerSecond || 0} msg/s
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Settings" && (
            <div className="animate-in fade-in duration-500">
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                Settings
              </h1>
              <p className="text-brand-muted">
                Configure your Project Hermes SDK preferences.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* --- FIREBASE-STYLE MODAL --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-brand-card border border-brand-border w-full max-w-2xl p-8 rounded-3xl relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={closeAndRefresh}
              className="absolute top-6 right-6 text-brand-muted hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {!newProjectData ? (
              /* STEP 1: ENTER NAME */
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Create a project
                  </h2>
                  <p className="text-brand-muted">
                    Give your Project Hermes app a name to generate your SDK
                    credentials.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-brand-muted mb-3">
                    Project Name
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. My Awesome Chat App"
                    className="w-full bg-brand-bg border-2 border-brand-border rounded-2xl px-6 py-4 text-xl focus:border-brand-primary outline-none text-white transition-all"
                  />
                </div>

                <button
                  onClick={handleCreateProject}
                  disabled={isCreating || !projectName.trim()}
                  className="w-full bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-lg shadow-[0_0_30px_rgba(57,255,20,0.2)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin" /> Generating...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            ) : (
              /* STEP 2: SUCCESS & CODE SNIPPET */
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-black font-bold text-sm">
                    ✓
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Project Ready
                  </h2>
                </div>
                <p className="text-brand-muted mb-6">
                  Use this configuration to initialize your Hermes SDK client.
                </p>

                <div className="relative group">
                  <pre className="bg-black/50 p-6 rounded-2xl border border-brand-border overflow-x-auto text-sm font-mono text-brand-primary leading-relaxed">
                    <code>{configSnippet}</code>
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 p-2 bg-brand-card border border-brand-border rounded-lg hover:text-brand-primary transition-all"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-xs text-yellow-500 font-medium italic">
                    Note: This is the only time the API Secret will be
                    displayed. Please save it securely.
                  </p>
                </div>

                <button
                  onClick={closeAndRefresh}
                  className="mt-8 w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 border ${
      active
        ? "bg-brand-primary/10 text-brand-primary border-brand-primary shadow-[0_0_15px_rgba(57,255,20,0.1)]"
        : "text-brand-muted border-transparent hover:bg-brand-card hover:text-white"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Dashboard;
