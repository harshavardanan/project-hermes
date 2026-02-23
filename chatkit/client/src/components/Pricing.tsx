import React, { useState, useEffect } from "react";
import { Check, Zap, ChevronDown } from "lucide-react";

const Pricing = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/plans", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch plans.");
        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  if (loading)
    return (
      <div className="pt-40 text-center text-brand-primary animate-pulse font-black uppercase tracking-widest">
        Initialising Tiers...
      </div>
    );

  return (
    <div className="bg-brand-bg min-h-screen pt-32 pb-20 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header & Toggle */}
        <div className="text-center mb-16">
          <div className="inline-block px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest mb-4">
            Release 2.0 Live
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
            Choose Your <span className="text-brand-primary">Power</span>
          </h1>
          <p className="text-brand-muted max-w-md mx-auto mb-10">
            Scale your application with our high-performance SDK. Simple
            pricing, no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-1 p-1 bg-brand-card border border-brand-border rounded-xl w-fit mx-auto">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-brand-primary text-black" : "text-brand-muted hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "yearly" ? "bg-brand-primary text-black" : "text-brand-muted hover:text-white"}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan) => {
            const isPopular = plan.planId === "standard"; // Or your 'Startup' plan

            return (
              <div
                key={plan._id}
                className={`relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300 ${
                  isPopular
                    ? "bg-brand-card border-brand-primary shadow-[0_0_40px_rgba(57,255,20,0.1)] scale-105 z-10"
                    : "bg-brand-card border-brand-border hover:border-brand-primary/50"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-black text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-black text-white">
                    $
                    {billingCycle === "monthly"
                      ? plan.monthlyPrice
                      : Math.floor(plan.monthlyPrice * 0.8)}
                  </span>
                  <span className="text-brand-muted font-bold">/mo</span>
                </div>
                <p className="text-brand-muted text-sm mb-8 font-medium">
                  {plan.planId === "free"
                    ? "Perfect for side projects."
                    : plan.planId === "standard"
                      ? "Everything you need to scale."
                      : "For high-volume production."}
                </p>

                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-3 text-sm font-bold text-white">
                    <Check size={18} className="text-brand-primary" />
                    {plan.dailyLimit.toLocaleString()} Daily Tokens
                  </li>
                  {plan.features?.map((feature: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-sm font-medium text-brand-muted"
                    >
                      <Check size={18} className="text-brand-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 ${
                    isPopular
                      ? "bg-brand-primary text-black shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:brightness-110"
                      : "bg-brand-bg text-white border border-brand-border hover:bg-brand-border"
                  }`}
                >
                  {plan.planId === "pro" ? "Contact Sales" : "Start Building"}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-white text-center mb-10">
            Frequently Asked Questions
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

// FAQ Helper Component
const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-white">{question}</span>
        <ChevronDown
          size={20}
          className={`text-brand-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-brand-muted text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export default Pricing;
