import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { useAppConfig } from "../store/appConfig";
import { useUserStore } from "../store/userStore";
import { useQueryClient } from "@tanstack/react-query";

interface Plan {
  _id: string;
  name: string;
  planId?: string;
  dailyLimit: number;
  monthlyPrice: number;
  features: string[];
}

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const endpoint = useAppConfig((s) => s.endpoint);
  const { user, setUser } = useUserStore();
  const queryClient = useQueryClient();
  const [upgradingId, setUpgradingId] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      alert("Please login to upgrade your plan.");
      return;
    }
    
    setUpgradingId(planId);
    try {
      const res = await fetch(`${endpoint}/api/user/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlanId: planId }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upgrade failed");
      
      const data = await res.json();
      setUser(data.user);
      // Refresh all auth-related queries
      queryClient.invalidateQueries({ queryKey: ["auth_me"] });
      alert(`Success: ${data.message}`);
    } catch (err: any) {
      alert(err.message || "Something went wrong during upgrade.");
    } finally {
      setUpgradingId(null);
    }
  };

  const { data: plansData, isLoading: loading } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await fetch(`${endpoint}/api/plans`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch plans.");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const plans: Plan[] = Array.isArray(plansData) ? plansData : [];

  if (loading)
    return (
      <div className="pt-40 text-center text-white  font-black uppercase tracking-widest">
        Initialising Tiers...
      </div>
    );

  return (
    <div className="bg-[var(--brand-bg)] min-h-screen pt-32 pb-20 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header & Toggle */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
            Choose Your <span className="text-white">Power</span>
          </h1>
          <p className="text-[var(--brand-muted)] max-w-md mx-auto mb-10 font-medium">
            Scale your application with the Hermes SDK. High-performance
            throughput, zero bottlenecking.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-1 p-1 bg-[var(--brand-card)] border border-[var(--brand-border)] rounded-xl w-fit mx-auto">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-[var(--brand-primary)] text-black" : "text-[var(--brand-muted)] hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "yearly" ? "bg-[var(--brand-primary)] text-black" : "text-[var(--brand-muted)] hover:text-white"}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan) => {
            const isPopular = plan.planId === "standard";

            return (
              <div
                key={plan._id}
                className={`relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300 ${
                  isPopular
                    ? "bg-[var(--brand-card)] border-[var(--brand-primary)] shadow-[0_0_40px_rgba(255,140,0,0.1)] scale-105 z-10"
                    : "bg-[var(--brand-card)] border-[var(--brand-border)] hover:border-[var(--brand-primary)]/50"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--brand-primary)] text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(255,140,0,0.4)]">
                    Optimal Choice
                  </div>
                )}

                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-black text-white">
                    $
                    {billingCycle === "monthly"
                      ? plan.monthlyPrice
                      : Math.floor(plan.monthlyPrice * 0.8)}
                  </span>
                  <span className="text-[var(--brand-muted)] font-bold">
                    /mo
                  </span>
                </div>
                <p className="text-[var(--brand-muted)] text-sm mb-8 font-medium italic">
                  {plan.planId === "free"
                    ? "// Perfect for side projects."
                    : plan.planId === "standard"
                      ? "// Everything you need to scale."
                      : "// For high-volume production."}
                </p>

                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-3 text-sm font-bold text-white">
                    <Check size={18} className="text-white" />
                    {plan.dailyLimit.toLocaleString()} Daily Tokens
                  </li>
                  {plan.features?.map((feature: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm font-medium text-[var(--brand-muted)]"
                    >
                      <Check size={18} className="text-white" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={upgradingId === plan._id || (user?.plan as any)?._id === plan._id}
                  onClick={() => handleUpgrade(plan._id)}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPopular
                      ? "bg-[var(--brand-primary)] text-black  hover:brightness-110"
                      : "bg-[var(--brand-bg)] text-white border border-[var(--brand-border)] hover:bg-[var(--brand-border)]"
                  }`}
                >
                  {upgradingId === plan._id 
                    ? "Processing..." 
                    : (user?.plan as any)?._id === plan._id 
                      ? "Current Plan" 
                      : plan.planId === "pro" 
                        ? "Contact Sales" 
                        : "Start Building"}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-white text-center mb-10 uppercase tracking-tighter">
            Frequent <span className="text-white">Queries</span>
          </h2>
          <div className="space-y-4">
            <FaqItem
              question="Can I change my plan later?"
              answer="Yes, you can upgrade or downgrade your plan at any time from your project settings."
            />
            <FaqItem
              question="Do you offer a free trial for Pro?"
              answer="We offer a 14-day free trial for all new Standard and Pro subscriptions."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-[var(--brand-card)] border border-[var(--brand-border)] rounded-2xl overflow-hidden transition-all hover:border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-white uppercase tracking-tight">
          {question}
        </span>
        <ChevronDown
          size={20}
          className={`text-[var(--brand-muted)] transition-transform ${isOpen ? "rotate-180 text-white" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-[var(--brand-muted)] text-sm leading-relaxed border-t border-[var(--brand-border)] pt-4">
          {answer}
        </div>
      )}
    </div>
  );
};

export default Pricing;
