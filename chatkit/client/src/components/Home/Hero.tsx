import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { UserData } from "../../types";

export default function Hero({
  onSignInClick,
  user,
}: {
  onSignInClick: () => void;
  user?: UserData | null;
}) {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (user) navigate("/dashboard");
    else onSignInClick();
  };

  return (
    <section className="relative pt-40 pb-28 px-6 w-full overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-white/[0.025] blur-[120px] rounded-full -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-5xl md:text-[4.5rem] font-black text-white tracking-tighter leading-[1.05] mb-6">
          Ship chat features
          <br />
          <span className="text-white/40">without the backend work.</span>
        </h1>

        {/* Subtext */}
        <p className="text-base md:text-lg text-white/35 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
          Hermes gives your application a complete messaging layer — rooms,
          presence, reactions, and history — with a single SDK import.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleCtaClick}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-zinc-100 text-black rounded-lg font-bold text-sm transition-all active:scale-95"
          >
            {user ? "Go to Dashboard" : "Start for free"}
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate("/documentation")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white rounded-lg font-semibold text-sm transition-all"
          >
            Read the docs
          </button>
        </div>
      </div>
    </section>
  );
}
