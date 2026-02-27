import React, { useEffect } from "react";
import {
  Github,
  Mail,
  Laptop,
  X,
  ChevronRight,
  Zap,
  ShieldCheck,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // Only trust your backend origin
      if (event.origin !== "http://localhost:8080") return;

      // Support both the Object format and the String format
      const isSuccess =
        event.data === "auth_success" ||
        (event.data && event.data.type === "AUTH_SUCCESS");

      if (isSuccess) {
        console.log("Hermes: Auth Signal Captured");
        onClose();

        // Since your Navbar is also listening, it should refresh.
        // But we will force a small delay then a redirect to be safe.
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [onClose]);

  if (!isOpen) return null;

  const handleLogin = (provider: string) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `http://localhost:8080/auth/${provider}`,
      "auth-popup",
      `width=${width},height=${height},left=${left},top=${top},status=unadorned,resizable=yes`,
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop - Uses brand-bg variable for consistency */}
      <div
        className="absolute inset-0 bg-brand-bg/90 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card - Matched to Hermes Orange/Dark Theme */}
      <div className="relative bg-brand-card border border-brand-border w-full max-w-md rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,140,0,0.15)] animate-in zoom-in-95 duration-200">
        {/* Aesthetic Orange Accent Bar */}
        <div className="h-1.5 bg-brand-primary w-full shadow-[0_0_15px_rgba(255,140,0,0.5)]" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-brand-muted hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary/10 rounded-xl mb-4 border border-brand-primary/20">
              <Zap size={24} className="text-brand-primary fill-current" />
            </div>
            <h2 className="text-3xl font-black text-white mb-1 uppercase tracking-tighter">
              Hermes <span className="text-brand-primary">Authentication</span>
            </h2>
            <p className="text-brand-muted text-[10px] font-black uppercase tracking-widest">
              Synchronize credentials with the Hermes engine
            </p>
          </div>

          <div className="space-y-3">
            <SocialButton
              icon={<Mail size={18} className="text-brand-primary" />}
              text="Google"
              onClick={() => handleLogin("google")}
            />
            <SocialButton
              icon={<Github size={18} className="text-white" />}
              text="GitHub"
              onClick={() => handleLogin("github")}
            />
            <SocialButton
              icon={<Laptop size={18} className="text-blue-400" />}
              text="Microsoft"
              onClick={() => handleLogin("microsoft")}
            />
          </div>

          {/* Security Footer */}
          <div className="mt-10 flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-brand-muted/40">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} />
              Protocol.Secure
            </div>
            <div className="w-1 h-1 bg-brand-border rounded-full" />
            <span>v1.0.4-Stable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Social Buttons to maintain clean hierarchy
const SocialButton = ({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-6 bg-white/[0.03] hover:bg-white/[0.08] border border-brand-border py-4 rounded-xl text-white transition-all duration-200 group active:scale-[0.98]"
  >
    <div className="flex items-center gap-4">
      <div className="group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-widest leading-none">
        Continue with {text}
      </span>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-brand-primary translate-x-[-4px] group-hover:translate-x-0">
      <ChevronRight size={16} strokeWidth={3} />
    </div>
  </button>
);

export default AuthModal;
