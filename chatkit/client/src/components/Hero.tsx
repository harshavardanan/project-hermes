import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-primary/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black mb-8 tracking-widest uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
          </span>
          System Status: Optimal
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
          Deploy Faster with <br />
          <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            Project Hermes
          </span>
        </h1>

        <p className="text-lg md:text-xl text-brand-muted max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          The high-speed communication layer for modern engineering teams.
          Manage SDKs, secrets, and global deployments with sub-10ms latency.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-10 py-4 bg-brand-primary hover:brightness-110 text-black rounded-brand font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(57,255,20,0.25)] active:scale-95"
          >
            Launch Console <ArrowRight size={20} />
          </button>
          <button className="px-10 py-4 bg-brand-card hover:bg-brand-card/80 border border-brand-border text-white rounded-brand font-bold transition-all">
            Read Documentation
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
