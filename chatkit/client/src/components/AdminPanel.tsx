import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Users,
  LayoutDashboard,
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAppConfig } from "../store/appConfig";

interface Plan {
  _id: string;
  planId: string;
  name: string;
  dailyLimit: number;
  monthlyPrice: number;
  features: string[];
}

interface UserData {
  _id: string;
  email: string;
  displayName: string;
  projectCount: number;
  subUserCount: number;
  createdAt: string;
  status?: string;
  plan?: {
    _id: string;
    name: string;
    planId: string;
  };
}

interface StatsData {
  totalUsers: number;
  totalProjects: number;
  planDistribution: { planId: string | null; planName: string; count: number }[];
}

const Admin = () => {
  const queryClient = useQueryClient();
  const endpoint = useAppConfig((s) => s.endpoint);

  const [activeTab, setActiveTab] = useState("overview");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    planId: "",
    name: "",
    dailyLimit: 0,
    monthlyPrice: 0,
    features: "",
  });

  // Queries
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["admin_plans"],
    queryFn: async () => {
      const res = await fetch(`${endpoint}/api/plans`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load plans");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery<UserData[]>({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const res = await fetch(`${endpoint}/api/admin/users`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
    enabled: activeTab === "users",
  });

  const { data: stats, isLoading: loadingStats } = useQuery<StatsData>({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      const res = await fetch(`${endpoint}/api/admin/stats`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
    enabled: activeTab === "overview",
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${endpoint}/api/admin/plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update plan");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_plans"] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => alert(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${endpoint}/api/admin/plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete plan");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin_plans"] }),
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await fetch(`${endpoint}/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_users"] }),
  });

  // Handlers
  const handleOpenModal = (plan: Plan | null = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        planId: plan.planId,
        name: plan.name,
        dailyLimit: plan.dailyLimit || 0,
        monthlyPrice: plan.monthlyPrice || 0,
        features: plan.features?.join(", ") || "",
      });
    } else {
      setEditingPlan(null);
      setFormData({
        planId: "",
        name: "",
        dailyLimit: 0,
        monthlyPrice: 0,
        features: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f !== ""),
    };
    saveMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this plan?")) {
      deleteMutation.mutate(id);
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: <Activity size={18} /> },
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "plans", label: "System Tiers", icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <div className="flex bg-brand-bg min-h-screen text-white">
      {/* Admin Sidebar */}
      <aside 
        className={`border-r border-brand-border bg-brand-card flex flex-col pt-24 shrink-0 transition-all duration-300 ease-in-out relative ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-28 p-1 rounded-md bg-brand-card border border-brand-border text-brand-muted hover:text-white transition-colors z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`px-6 mb-8 ${isCollapsed ? "flex flex-col items-center px-2" : ""}`}>
          <Link
            to="/dashboard"
            title="Back to Dashboard"
            className={`text-brand-muted hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] transition-colors mb-6 ${isCollapsed ? "justify-center" : ""}`}
          >
            <ArrowLeft size={14} className="shrink-0" /> 
            {!isCollapsed && "Back to Dashboard"}
          </Link>
          
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                <img src="/vite.svg" alt="Hermes Admin Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight">
                Hermes Admin
              </h1>
            </div>
          )}
          {isCollapsed && (
            <div className="w-6 h-6 shrink-0 flex items-center justify-center">
              <img src="/vite.svg" alt="Hermes Admin Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]" />
            </div>
          )}
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-1">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveTab(n.id)}
              title={isCollapsed ? n.label : ""}
              className={`flex items-center rounded-lg font-bold text-sm transition-all ${
                isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
              } ${
                activeTab === n.id
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-brand-muted hover:bg-brand-accent hover:text-white"
              }`}
            >
              <div className="shrink-0">{n.icon}</div>
              {!isCollapsed && <span>{n.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 pt-24 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === "overview" && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-8">
                System Overview
              </h2>
              {loadingStats ? (
                <div className="text-brand-muted animate-pulse">
                  Loading metrics...
                </div>
              ) : stats ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-5">
                      <div className="bg-brand-primary/10 p-4 rounded-xl text-brand-primary">
                        <Users size={32} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                          Total Users
                        </div>
                        <div className="text-4xl font-black">
                          {stats.totalUsers.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="bg-brand-card border border-brand-border p-6 rounded-2xl flex items-center gap-5">
                      <div className="bg-brand-primary/10 p-4 rounded-xl text-brand-primary">
                        <LayoutDashboard size={32} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                          Total Projects
                        </div>
                        <div className="text-4xl font-black">
                          {stats.totalProjects.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-card border border-brand-border p-8 rounded-2xl">
                    <h3 className="text-lg font-bold uppercase mb-6 text-brand-muted tracking-widest text-[11px]">
                      Subscription Distribution
                    </h3>
                    <div className="grid gap-4">
                      {stats.planDistribution.map((d) => (
                        <div
                          key={d.planId || "none"}
                          className="flex items-center justify-between p-4 bg-black/40 border border-brand-border rounded-xl"
                        >
                          <span className="font-bold text-sm tracking-wide">
                            {d.planName.toUpperCase()}
                          </span>
                          <span className="font-mono text-brand-primary font-bold">
                            {d.count} Users
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-400">Failed to load statistics.</div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-black uppercase tracking-tight mb-8">
                Registered Users
              </h2>
              {loadingUsers ? (
                <div className="text-brand-muted animate-pulse">
                  Loading users...
                </div>
              ) : (
                <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/40 border-b border-brand-border">
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                          User
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                          Email
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                          Projects
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                          Chat Users
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                          Plan
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                          Status
                        </th>
                        <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {users.length === 0 ? (
                        <tr>
                            <td
                              colSpan={7}
                              className="p-8 text-center text-brand-muted text-sm font-medium"
                            >
                            No users registered yet.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr
                            key={u._id}
                            className="hover:bg-brand-accent/50 transition-colors"
                          >
                            <td className="p-4 font-bold text-sm">
                              {u.displayName}
                            </td>
                            <td className="p-4 text-sm text-brand-muted">
                              {u.email}
                            </td>
                            <td className="p-4 font-mono text-brand-primary font-bold">
                              {u.projectCount}
                            </td>
                            <td className="p-4 font-mono text-brand-primary font-bold">
                              {u.subUserCount || 0}
                            </td>
                            <td className="p-4">
                              <select
                                className="bg-black/50 border border-brand-border rounded px-2 py-1 text-xs text-brand-muted outline-none hover:border-brand-primary focus:border-brand-primary cursor-pointer transition-colors"
                                value={u.plan?._id || "none"}
                                onChange={(e) => updateUserMutation.mutate({ id: u._id, payload: { plan: e.target.value } })}
                                disabled={updateUserMutation.isPending}
                              >
                                <option value="none">None</option>
                                {plans.map((p) => (
                                  <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-4">
                              <select
                                className={`bg-black/50 border border-brand-border rounded px-2 py-1 text-xs font-bold uppercase tracking-widest outline-none hover:border-brand-primary focus:border-brand-primary cursor-pointer transition-colors ${u.status === 'Suspended' ? 'text-red-400' : 'text-emerald-400'}`}
                                value={u.status || "Active"}
                                onChange={(e) => updateUserMutation.mutate({ id: u._id, payload: { status: e.target.value } })}
                                disabled={updateUserMutation.isPending}
                              >
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                              </select>
                            </td>
                            <td className="p-4 text-xs text-brand-muted">
                              {u.createdAt
                                ? new Date(u.createdAt).toLocaleDateString()
                                : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "plans" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  System Tiers
                </h2>
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-brand-primary text-black px-5 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:brightness-110 flex items-center gap-2"
                >
                  <Plus size={16} /> Add Tier
                </button>
              </div>

              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className="bg-brand-card border border-brand-border p-6 rounded-2xl flex justify-between items-center hover:border-brand-primary/50 transition-colors"
                  >
                    <div>
                      <h3 className="text-xl font-black uppercase">
                        {plan.name}{" "}
                        <span className="text-brand-muted text-[10px] tracking-widest ml-2">
                          ID: {plan.planId}
                        </span>
                      </h3>
                      <p className="text-brand-primary font-mono text-sm mt-1">
                        ${plan.monthlyPrice}/mo —{" "}
                        {plan.dailyLimit?.toLocaleString()} tokens/day
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(plan)}
                        className="p-3 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary transition-all text-brand-muted hover:text-white"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan._id)}
                        className="p-3 bg-brand-bg border border-brand-border rounded-xl hover:border-red-500 transition-all text-brand-muted hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmit}
            className="bg-brand-card border border-brand-border p-8 rounded-3xl w-full max-w-lg shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {editingPlan ? "Edit Tier" : "Create New Tier"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-brand-muted hover:text-white transition-colors"
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                  Plan Unique ID
                </label>
                <input
                  placeholder="e.g., pro-plus"
                  className="w-full bg-black/50 border border-brand-border p-3.5 rounded-xl text-sm focus:border-brand-primary outline-none transition-colors"
                  value={formData.planId}
                  onChange={(e) =>
                    setFormData({ ...formData, planId: e.target.value })
                  }
                  disabled={!!editingPlan}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                  Display Name
                </label>
                <input
                  placeholder="e.g., Startup"
                  className="w-full bg-black/50 border border-brand-border p-3.5 rounded-xl text-sm focus:border-brand-primary outline-none transition-colors"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                    Max Tokens / Day
                  </label>
                  <input
                    type="number"
                    className="w-full bg-black/50 border border-brand-border p-3.5 rounded-xl text-sm focus:border-brand-primary outline-none transition-colors"
                    value={formData.dailyLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyLimit: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                    Price ($/mo)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-black/50 border border-brand-border p-3.5 rounded-xl text-sm focus:border-brand-primary outline-none transition-colors"
                    value={formData.monthlyPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyPrice: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                  Features (comma separated)
                </label>
                <textarea
                  placeholder="Feature A, Feature B, Feature C"
                  className="w-full bg-black/50 border border-brand-border p-3.5 rounded-xl text-sm focus:border-brand-primary outline-none h-24 transition-colors"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-brand-primary text-black py-3.5 rounded-xl font-black uppercase text-sm tracking-widest hover:brightness-110 flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 transition-all"
            >
              <Save size={16} /> Sync with Vault
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
