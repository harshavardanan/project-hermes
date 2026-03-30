import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
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
    <section className="relative pt-40 pb-28 px-6 w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-primary/10 blur-[120px] rounded-full -z-10"
      />

      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-[4.5rem] font-black text-brand-text tracking-tighter leading-[1.05] mb-6"
        >
          Ship chat features
          <br />
          <span className="text-brand-muted">without the backend work.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-base md:text-lg text-brand-muted max-w-xl mx-auto mb-10 leading-relaxed font-medium"
        >
          Hermes gives your application a complete messaging layer — rooms,
          presence, reactions, and history — with a single SDK import.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={handleCtaClick}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-fg rounded-lg font-bold text-sm transition-all active:scale-95 shadow-xl shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Loading..."
              : user
                ? "Go to Dashboard"
                : "Start for free"}
            {!loading && <ArrowRight size={16} />}
          </button>
          <button
            onClick={() => navigate("/documentation")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-brand-border hover:border-brand-primary/50 bg-brand-card hover:bg-brand-accent text-brand-muted hover:text-brand-text rounded-lg font-semibold text-sm transition-all shadow-xl"
          >
            Read the docs
          </button>
        </motion.div>
      </div>
    </section>
  );
}
