import { useNavigate } from "react-router-dom";
import { ArrowRight, Code2 } from "lucide-react";
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
    if (user) {
      navigate("/dashboard");
    } else {
      onSignInClick();
    }
  };

  return (
    <section className="relative pt-36 pb-24 px-6 overflow-hidden w-full">
      {/* Subtle radial vignette */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-white/[0.02] blur-[140px] rounded-full -z-10" />

      <div className="max-w-5xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[1.05]">
          Build messenger apps,
          <br />
          <span className="relative inline-block">
            {/* Animated shimmer underline */}
            <span className="relative z-10">at lightning speed.</span>
            <span
              className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
              style={{
                maskImage:
                  "linear-gradient(90deg,transparent,white 30%,white 70%,transparent)",
              }}
            />
          </span>
        </h1>

        <p className="text-lg md:text-xl text-brand-muted max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          The ultimate communication infrastructure for modern applications.
          Integrate robust, secure, and infinitely scalable chat features into
          your React apps in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCtaClick}
            className="px-10 py-4 bg-white hover:bg-zinc-100 text-black rounded-lg font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {user ? "Go to Dashboard" : "Start Building for Free"}{" "}
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => navigate("/documentation")}
            className="px-10 py-4 bg-brand-card hover:bg-brand-accent border border-brand-border text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Code2 size={20} className="text-brand-muted" /> Explore the SDK
          </button>
        </div>
      </div>
    </section>
  );
}
