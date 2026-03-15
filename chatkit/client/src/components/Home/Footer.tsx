// Removed React import
import { useNavigate } from "react-router-dom";
import { Share2, Rss, Zap } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-brand-bg border-t border-brand-border py-16">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
          <div className="col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 flex items-center justify-center bg-brand-primary rounded-lg text-black">
                <Zap size={20} fill="currentColor" />
              </div>
              <h2 className="text-white text-xl font-extrabold tracking-tight uppercase">
                Hermes
              </h2>
            </div>
            <p className="text-brand-muted text-sm max-w-[300px] leading-relaxed">
              The ultimate chat infrastructure for developers who care about
              speed, security, and scalability.
            </p>
            <div className="flex gap-4 mt-2">
              <button className="size-10 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-primary hover:border-brand-primary transition-all">
                <Share2 size={18} />
              </button>
              <button className="size-10 rounded-full border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-primary hover:border-brand-primary transition-all">
                <Rss size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">
              Product
            </h4>
            <button
              onClick={() => navigate("/pricing")}
              className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left"
            >
              Pricing
            </button>
            <button
              onClick={() => navigate("/documentation")}
              className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left"
            >
              SDK Docs
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left"
            >
              Dashboard
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">
              Resources
            </h4>
            <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
              Blog
            </button>
            <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
              Help Center
            </button>
            <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
              Security
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-2">
              Company
            </h4>
            <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
              About
            </button>
            <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
              Contact
            </button>
            <button className="text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors text-left">
              Terms
            </button>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-brand-muted/50 text-xs font-mono">
            © {new Date().getFullYear()} HERMES INFRASTRUCTURE INC. BUILT FOR
            SPEED.
          </p>
          <div className="flex gap-8">
            <button className="text-brand-muted/50 hover:text-white text-xs transition-colors">
              Privacy Policy
            </button>
            <button className="text-brand-muted/50 hover:text-white text-xs transition-colors">
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Giant watermark wordmark */}
      <div className="w-full overflow-hidden select-none pointer-events-none mt-6">
        <p
          className="text-center font-black uppercase leading-none tracking-tighter"
          style={{
            fontSize: "clamp(80px, 20vw, 260px)",
            color: "rgba(255,255,255,0.035)",
            letterSpacing: "-0.04em",
          }}
        >
          HERMES
        </p>
      </div>
    </footer>
  );
};

export default Footer;
