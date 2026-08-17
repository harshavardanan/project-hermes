import React from "react";
import { useAuthStore } from "../store/authStore";
import { MessageSquare, Zap, Shield, Globe } from "lucide-react";

const FEATURES = [
  { Icon: Zap,    text: "Sub-50ms WebSocket delivery" },
  { Icon: Shield, text: "AES-256-GCM encryption at rest" },
  { Icon: Globe,  text: "Embeddable in any web app" },
];

export const Login: React.FC = () => {
  const { login, loading, error } = useAuthStore();

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden" style={{ background: "var(--brand-bg)" }}>

      {/* ── Left hero panel ───────────────────────────────────── */}
      <div
        className="hidden md:flex flex-col justify-between relative overflow-hidden w-[46%] xl:w-1/2 shrink-0 p-12"
        style={{ background: "linear-gradient(145deg, #1a1745 0%, #2e1b6e 45%, #4a1787 100%)" }}
      >
        {/* Ambient blobs */}
        <div style={{ position: "absolute", top: "-120px", right: "-120px", width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-100px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "42%", left: "25%", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />

        {/* Top logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(10px)" }}
          >
            <MessageSquare className="w-5 h-5" style={{ color: "#c4b5fd" }} />
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">Hermes</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.1] mb-5">
            Real-time<br />messaging,<br />
            <span style={{ color: "#c4b5fd" }}>reimagined.</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-sm" style={{ color: "rgba(196,181,253,0.75)" }}>
            Chat infrastructure for modern applications — fast, reliable, and beautifully simple.
          </p>

          <div className="mt-10 space-y-3">
            {FEATURES.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: "#c4b5fd" }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(224,211,255,0.8)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footnote */}
        <div className="text-xs relative z-10" style={{ color: "rgba(196,181,253,0.45)" }}>
          Powered by Hermes Chat SDK
        </div>
      </div>

      {/* ── Right auth panel ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[360px]">

          {/* Mobile-only logo */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--brand-primary)" }}
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--brand-text)" }}>Hermes</span>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--brand-text)" }}>
            Sign in
          </h2>
          <p className="mb-10 text-sm" style={{ color: "var(--brand-muted)" }}>
            Welcome back. Continue with your Google account.
          </p>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3.5 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            onClick={login}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl p-4 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--brand-primary)",
              color: "var(--brand-primary-fg)",
              boxShadow: "0 4px 24px var(--brand-primary-glow)",
            }}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            {loading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="my-8 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "var(--brand-border)" }} />
            <span className="text-xs px-1" style={{ color: "var(--brand-muted)" }}>secure sign-in</span>
            <div className="flex-1 h-px" style={{ background: "var(--brand-border)" }} />
          </div>

          <p className="text-center text-xs leading-relaxed" style={{ color: "var(--brand-muted)", opacity: 0.6 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
