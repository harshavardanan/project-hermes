import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Save, ShieldAlert } from "lucide-react";

const Admin = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const [formData, setFormData] = useState({
    planId: "",
    name: "",
    dailyLimit: 0,
    monthlyPrice: 0,
    features: "",
  });

  const fetchPlans = () => {
    fetch("http://localhost:8080/api/plans", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPlans(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan: any = null) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f !== ""),
    };

    const res = await fetch("http://localhost:8080/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 👈 Vital for session-based isAdmin check
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchPlans();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to update plan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this plan?")) return;
    const res = await fetch(`http://localhost:8080/api/admin/plans/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) fetchPlans();
  };

  return (
    <div className="pt-32 px-10 bg-brand-bg min-h-screen text-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-brand-primary" size={32} />
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              Hermes Control
            </h1>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-brand-primary text-black px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:brightness-110"
          >
            <Plus size={18} className="inline mr-2" /> Add New Plan
          </button>
        </div>

        <div className="grid gap-4">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-brand-card border border-brand-border p-6 rounded-2xl flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-black uppercase">
                  {plan.name}{" "}
                  <span className="text-brand-muted text-xs">
                    ({plan.planId})
                  </span>
                </h3>
                <p className="text-brand-primary font-mono text-sm">
                  ${plan.monthlyPrice}/mo — {plan.dailyLimit?.toLocaleString()}{" "}
                  tokens/day
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(plan)}
                  className="p-3 bg-brand-bg border border-brand-border rounded-lg hover:border-brand-primary transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="p-3 bg-brand-bg border border-brand-border rounded-lg hover:border-red-500 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <form
            onSubmit={handleSubmit}
            className="bg-brand-card border border-brand-border p-8 rounded-3xl w-full max-w-lg shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {editingPlan ? "Edit System Tier" : "Create New Tier"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-brand-muted hover:text-white"
              >
                <X />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">
                  Plan Unique ID
                </label>
                <input
                  placeholder="e.g., standard"
                  className="w-full bg-brand-bg border border-brand-border p-4 rounded-xl text-sm focus:border-brand-primary outline-none"
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
                  className="w-full bg-brand-bg border border-brand-border p-4 rounded-xl text-sm focus:border-brand-primary outline-none"
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
                    className="w-full bg-brand-bg border border-brand-border p-4 rounded-xl text-sm focus:border-brand-primary outline-none"
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
                    className="w-full bg-brand-bg border border-brand-border p-4 rounded-xl text-sm focus:border-brand-primary outline-none"
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
                  className="w-full bg-brand-bg border border-brand-border p-4 rounded-xl text-sm focus:border-brand-primary outline-none h-28"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-10 bg-brand-primary text-black py-4 rounded-xl font-black uppercase tracking-widest hover:brightness-110 flex items-center justify-center gap-2"
            >
              <Save size={18} /> Sync with Vault
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
