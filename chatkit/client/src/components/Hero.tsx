import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Code2 } from "lucide-react";

interface HeroProps {
  user?: any;
  onSignInClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ user, onSignInClick }) => {
  const navigate = useNavigate();

  // Smart routing: Go to dashboard if logged in, otherwise open Auth modal
  const handleCtaClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      onSignInClick();
    }
  };

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-primary/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
          Build Chat Apps with <br />
          <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]">
            Hermes SDK
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
            className="px-10 py-4 bg-brand-primary hover:brightness-110 text-black rounded-brand font-black transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(57,255,20,0.25)] active:scale-95"
          >
            {user ? "Go to Dashboard" : "Start Building for Free"}{" "}
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => navigate("/documentation")}
            className="px-10 py-4 bg-brand-card hover:bg-brand-card/80 border border-brand-border text-white rounded-brand font-bold transition-all flex items-center justify-center gap-2"
          >
            <Code2 size={20} className="text-brand-muted" /> Explore the SDK
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
