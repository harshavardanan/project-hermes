import React from "react";
import { useAuthStore } from "../store/authStore";
import { LogIn, MessageSquare } from "lucide-react";

export const Login: React.FC = () => {
  const { login, setTestUser, loading, error } = useAuthStore();
  const [name, setName] = React.useState("");

  const handleTestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setTestUser(name.trim());
    }
  };

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center p-4" style={{ background: "var(--brand-bg)" }}>
      <div className="w-full max-w-md space-y-8 rounded-2xl glass p-10 shadow-premium">
        <div className="flex flex-col items-center">
          <div className="premium-gradient p-4 rounded-2xl shadow-lg mb-6">
            <MessageSquare className="w-10 h-10" style={{ color: "var(--brand-primary-fg)" }} />
          </div>
          <h1 className="text-4xl font-bold" style={{ color: "var(--brand-text)" }}>Hermes</h1>
          <p className="mt-3 text-center" style={{ color: "var(--brand-muted)" }}>
            Experience the next generation of real-time messaging.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="relative flex items-center py-2">
          <div className="flex-grow" style={{ borderTop: "1px solid var(--brand-border)" }}></div>
          <div className="flex-grow" style={{ borderTop: "1px solid var(--brand-border)" }}></div>
        </div>

        <button
          onClick={login}
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-3 rounded-2xl p-4 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: "var(--brand-primary)",
            color: "var(--brand-primary-fg)",
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          {loading ? "Connecting..." : "Continue with Google"}
          <div 
            className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all group-hover:border-white/20" 
          />
        </button>

        <div className="pt-8 text-center text-xs" style={{ color: "var(--brand-muted)" }}>
          <p>By continuing, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};
