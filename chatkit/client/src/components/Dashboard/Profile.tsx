import { useState } from "react";
import { User, Activity, ArrowRight, ShieldCheck, CreditCard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { useAppConfig } from "../../store/appConfig";

export default function Profile() {
  const { user, setUser } = useUserStore();
  const endpoint = useAppConfig((s) => s.endpoint);
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate("/");
    window.location.href = `${endpoint}/auth/logout`;
  };
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${endpoint}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 border-b border-brand-border pb-6 mb-8">
        <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
          <User size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-text mb-1">
            User Profile
          </h1>
          <p className="text-brand-muted text-sm max-w-2xl leading-relaxed">
            Manage your personal settings, view usage, and update your information.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="p-5 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
              <User size={18} className="text-brand-muted" /> Personal Details
            </h2>
          </div>
          
          <form onSubmit={handleSave} className="p-6 flex flex-col gap-6 flex-1">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-brand-muted pl-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all w-full placeholder-white/20"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-brand-muted pl-1">
                Email Address
              </label>
              <div className="flex flex-col gap-1">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-black/50 border border-white/5 rounded-lg px-4 py-3 text-white/50 cursor-not-allowed w-full"
                />
                <p className="text-xs text-brand-muted/70 pl-1">
                  Email addresses are tied to your OAuth provider and cannot be changed here.
                </p>
              </div>
            </div>

            <div className="mt-auto pt-4 flex flex-col gap-3">
              {successMsg && (
                <div className="text-sm text-green-400 bg-green-400/10 px-4 py-3 rounded-lg border border-green-400/20 font-medium">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20 font-medium">
                  {errorMsg}
                </div>
              )}
              <button
                type="submit"
                disabled={isSaving || displayName === user.displayName}
                className="w-full bg-brand-primary text-black font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Stats & Info block */}
        <div className="space-y-6 flex flex-col">
          {/* Avatar box */}
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 shadow-2xl flex items-center gap-6">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}&background=18181b&color=ffffff`}
              alt="Avatar"
              className="w-24 h-24 rounded-full border border-brand-border bg-black object-cover shrink-0"
            />
            <div className="flex flex-col gap-1">
              <h3 className="text-white font-bold text-xl">{user.displayName}</h3>
              <p className="text-brand-muted text-sm">{user.email}</p>
              {user.isAdmin && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-full text-xs font-bold uppercase tracking-widest self-start">
                  <ShieldCheck size={14} /> Administrator
                </div>
              )}
              <button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all active:scale-95 self-start"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>

          {/* Usage Block */}
          <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 shadow-2xl flex-1 flex flex-col">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Activity size={18} className="text-brand-primary" /> Active Plan & Usage
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black border border-white/5 rounded-lg p-4 flex flex-col justify-center items-center gap-1 text-center">
                <p className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-1">Current Plan</p>
                <div className="text-xl font-black text-white">{(user.plan as any)?.name || "Free Tier"}</div>
              </div>
              
              <div className="bg-black border border-white/5 rounded-lg p-4 flex flex-col justify-center items-center gap-1 text-center">
                <p className="text-xs text-brand-muted uppercase tracking-widest font-semibold mb-1">Daily Tokens</p>
                <div className="text-xl font-black text-brand-primary">{user.dailyTokensUsed}</div>
              </div>
            </div>
            
            <button 
              onClick={() => navigate("/pricing")}
              className="mt-auto w-full group relative overflow-hidden rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <CreditCard size={18} className="text-brand-muted group-hover:text-white transition-colors" />
                Manage Billing
              </span>
              <ArrowRight size={18} className="text-brand-muted opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
