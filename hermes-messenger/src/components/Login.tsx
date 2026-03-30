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
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl glass p-10 shadow-premium premium-border">
        <div className="flex flex-col items-center">
          <div className="premium-gradient p-4 rounded-2xl shadow-lg mb-6">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Hermes</h1>
          <p className="mt-3 text-gray-500 text-center">
            Experience the next generation of real-time messaging.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* <form onSubmit={handleTestLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 ml-1">
              Test Invitation
            </label>
            <input 
              type="text" 
              placeholder="Enter your name to join..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full rounded-2xl bg-accent-600 p-4 text-sm font-bold text-white transition-all hover:bg-accent-500 active:scale-[0.98] disabled:opacity-50"
          >
            Join as Guest
          </button>
        </form> */}

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/5"></div>

          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <button
          onClick={login}
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-black transition-all hover:bg-accent-50 active:scale-[0.98] disabled:opacity-50"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          {loading ? "Connecting..." : "Continue with Google"}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-all group-hover:border-accent-400/30" />
        </button>

        <div className="pt-8 text-center text-xs text-gray-500">
          <p>By continuing, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};
