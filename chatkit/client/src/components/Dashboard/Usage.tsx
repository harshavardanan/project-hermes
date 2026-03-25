import { useUserStore } from "../../store/userStore";
import { useQuery } from "@tanstack/react-query";
import { useAppConfig } from "../../store/appConfig";
import { 
  BarChart3, 
  CreditCard, 
  ArrowUpRight, 
  Info, 
  Calendar,
  Layout
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Usage() {
  const { user } = useUserStore();
  const endpoint = useAppConfig((s) => s.endpoint);
  const navigate = useNavigate();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch(`${endpoint}/api/projects`, { credentials: "include" });
      return res.json();
    }
  });

  if (!user) return null;

  const plan = user.plan as any;
  const dailyLimit = plan?.dailyLimit || 1000;
  const usedTokens = user.dailyTokensUsed || 0;
  const usagePct = Math.min((usedTokens / dailyLimit) * 100, 100);

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-brand-border pb-6 mb-8">
        <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-text mb-1 uppercase">
            Usage & Billing
          </h1>
          <p className="text-brand-muted text-sm max-w-2xl leading-relaxed">
            Monitor your account-wide resource consumption and manage your subscription.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Usage Card */}
          <div className="bg-brand-card border border-brand-border rounded-2xl p-8 relative overflow-hidden group">
             {/* Simple Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Daily Account Limit</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{usedTokens.toLocaleString()}</span>
                    <span className="text-xl font-bold text-brand-muted">/ {dailyLimit.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-2">Usage</p>
                  <span className={`text-3xl font-black ${usagePct > 90 ? 'text-red-500' : usagePct > 70 ? 'text-orange-500' : 'text-brand-primary'}`}>
                    {usagePct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Enhanced Usage Bar */}
              <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] ${
                    usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-orange-500' : 'bg-brand-primary'
                  }`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-brand-muted">
                <span className="flex items-center gap-1.5"><Calendar size={12} /> Resets at Midnight UTC</span>
                <span>{(dailyLimit - usedTokens).toLocaleString()} tokens remaining</span>
              </div>
            </div>
          </div>

          {/* Project Breakdown */}
          <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <Layout size={18} className="text-brand-muted" /> Project Contribution
              </h2>
              <span className="text-[10px] font-black bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full uppercase tracking-tighter">
                Today
              </span>
            </div>
            
            <div className="divide-y divide-white/5">
              {projects.length === 0 ? (
                 <div className="p-12 text-center text-brand-muted italic text-sm">
                   Initialize a project to see consumption metrics here.
                 </div>
              ) : (
                projects.map((p: any) => (
                  <div key={p._id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-brand-muted">
                         <Layout size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{p.projectName}</p>
                        <p className="text-[10px] font-mono text-brand-muted/70">{p.projectId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{p.usage?.dailyTokens?.toLocaleString() || 0} <span className="text-[10px] font-bold text-brand-muted uppercase ml-1">Tokens</span></p>
                      <div className="w-32 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-brand-primary/40 rounded-full"
                          style={{ width: `${Math.min(((p.usage?.dailyTokens || 0) / (usedTokens || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Plan Info */}
        <div className="space-y-6">
          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-2xl flex flex-col">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <CreditCard size={18} className="text-brand-primary" /> Active Plan
            </h3>
            
            <div className="bg-black/40 border border-brand-primary/20 rounded-xl p-6 mb-6 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-brand-primary/5 blur-xl pointer-events-none" />
               <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mb-2 relative z-10">Subscription</p>
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter relative z-10">
                 {plan?.name || "Free Tier"}
               </h2>
               <p className="text-xs text-brand-muted mt-2 relative z-10">
                 {plan?.monthlyPrice > 0 ? `$${plan.monthlyPrice}/month` : "Always Free"}
               </p>
            </div>

            <ul className="space-y-4 mb-8">
               {[
                 { label: "Total Members", value: plan?.maxUsers || "Unlimited" },
                 { label: "Active Rooms", value: plan?.maxRooms || "Unlimited" },
                 { label: "Global Presence", value: "Included" }
               ].map((feat, i) => (
                 <li key={i} className="flex justify-between items-center text-sm">
                   <span className="text-brand-muted font-medium">{feat.label}</span>
                   <span className="text-white font-bold px-2 py-0.5 bg-white/5 rounded border border-white/5">{feat.value}</span>
                 </li>
               ))}
            </ul>

            <button 
              onClick={() => navigate("/pricing")}
              className="mt-auto w-full group overflow-hidden rounded-xl bg-brand-primary p-px transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="bg-brand-primary flex items-center justify-between px-4 py-3 text-black font-black uppercase tracking-widest text-xs">
                <span>Manage Plan</span>
                <ArrowUpRight size={18} />
              </div>
            </button>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-2xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Info size={18} className="text-brand-primary" /> Need Help?
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed mb-6">
              Usage metrics are updated every 5 seconds. If you experience unexpected limits, check your active connections or contact our technical squad.
            </p>
            <button className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all">
              Enterprise Inquiry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
