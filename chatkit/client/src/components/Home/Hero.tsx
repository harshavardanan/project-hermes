import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { UserData } from "../../types";

export default function Hero({
  onSignInClick,
  user,
  loading = false,
}: {
  onSignInClick: () => void;
  user?: UserData | null;
  loading?: boolean;
}) {
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (loading) return;
    if (user) navigate("/dashboard");
    else onSignInClick();
  };

  return (
    <section className="relative pt-40 pb-0 px-6 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-end mb-14">
          {/* Left — eyebrow + headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <a
              href="/documentation"
              onClick={(e) => {
                e.preventDefault();
                navigate("/documentation");
              }}
              className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-white transition-colors mb-5"
            >
              Read the SDK release notes
              <ArrowRight size={13} />
            </a>
            <h1 className="text-[2.75rem] sm:text-6xl md:text-[4rem] font-black tracking-tighter leading-[1.05] text-white">
              Your all-in-one
              <br />
              chat infrastructure.
            </h1>
          </motion.div>

          {/* Right — copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <p className="text-base md:text-lg text-brand-muted leading-relaxed max-w-md">
              Hermes gives your application a complete messaging layer:
              rooms, presence, reactions, and history, all with a single SDK
              import.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCtaClick}
                disabled={loading}
                className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-white/90 text-black rounded-lg font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Loading..."
                  : user
                    ? "Go to Dashboard"
                    : "Get Started"}
              </button>
              <button
                onClick={onSignInClick}
                className="inline-flex items-center justify-center px-6 py-3 border border-brand-border hover:border-white/30 text-white rounded-lg font-semibold text-sm transition-all"
              >
                Sign in
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
