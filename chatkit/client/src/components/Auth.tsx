import React, { useEffect } from "react";
import { Github, Mail, Laptop, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  // Listen for the "success" message from the backend popup window
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // Security Check: Only listen to messages from your backend origin
      if (event.origin !== "http://localhost:8080") return;

      if (event.data === "auth_success") {
        console.log("OAuth Login Successful!");
        onClose(); // Close the modal overlay

        // We redirect to dashboard to trigger a fresh state load
        // The backend session cookie will now be present in the browser
        window.location.href = "/dashboard";
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [onClose]);

  if (!isOpen) return null;

  const handleLogin = (provider: string) => {
    // Standard dimensions for OAuth popups
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // This opens the backend initiation route (James/Tom chooses their account)
    window.open(
      `http://localhost:8080/auth/${provider}`,
      "auth-popup",
      `width=${width},height=${height},left=${left},top=${top},status=unadorned,resizable=yes`,
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur - Clicking this closes the modal */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-[#161B2C] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm">
            Sign in to manage your SDKs and Projects
          </p>
        </div>

        <div className="space-y-3">
          <SocialButton
            icon={<Mail size={20} className="text-red-500" />}
            text="Google"
            onClick={() => handleLogin("google")}
          />
          <SocialButton
            icon={<Github size={20} className="text-white" />}
            text="GitHub"
            onClick={() => handleLogin("github")}
          />
          <SocialButton
            icon={<Laptop size={20} className="text-blue-400" />}
            text="Microsoft"
            onClick={() => handleLogin("microsoft")}
          />
        </div>

        <p className="mt-8 text-center text-[10px] text-slate-600 px-6 uppercase tracking-widest font-semibold">
          Secure Session Authorization
        </p>
      </div>
    </div>
  );
};

// Internal sub-component for buttons to keep code clean
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
    className="w-full flex items-center justify-between px-6 bg-[#0B0F1A] hover:bg-slate-800 border border-slate-800 py-4 rounded-2xl text-white font-semibold transition-all duration-200 group active:scale-[0.98]"
  >
    <div className="flex items-center gap-3">
      <div className="group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <span>Continue with {text}</span>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-slate-500 translate-x-[-4px] group-hover:translate-x-0">
      →
    </div>
  </button>
);

export default AuthModal;
