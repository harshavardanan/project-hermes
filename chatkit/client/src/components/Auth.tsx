import React, { useEffect, useRef, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { useAppConfig } from "../store/appConfig";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [state, setState] = useState<"idle" | "success">("idle");
  const [userName, setUserName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const endpoint = useAppConfig((s) => s.endpoint);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pollRef.current = null;
    timeoutRef.current = null;
  };

  const handleAuthSuccess = (user: any) => {
    stopPolling();
    const name = user?.displayName || user?.name || "Developer";
    const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
    const isNew = createdAt ? Date.now() - createdAt.getTime() < 15000 : false;
    setUserName(name);
    setIsNewUser(isNew);
    setState("success");
    timeoutRef.current = setTimeout(() => {
      onClose();
      // App.tsx will handle the query invalidation or the reload if needed.
    }, 2000);
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${endpoint}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const user = await res.json();
          if (user?._id) handleAuthSuccess(user);
        }
      } catch {
        // not logged in yet, keep polling
      }
    }, 1500);

    // stop after 2 minutes
    timeoutRef.current = setTimeout(stopPolling, 120000);
  };

  // The AuthModal only handles the UI "Success" animation.
  // The actual window reload is centralized in App.tsx to avoid race conditions.
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "HERMES_AUTH_SUCCESS" || event.data === "auth_success") {
        // We just let App.tsx handle the reload.
        // We can show the success UI here if we want, but since App.tsx reloads,
        // keep it simple or show the success state immediately.
        if (state === "idle") {
           // We'll trust the centralized listener to do the reload.
           // If we want to show the 'Success' checkmark here, we'd need to avoid the App.tsx reload 
           // for a second or two. For now, transparency is better.
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [state]);

  useEffect(() => {
    if (!isOpen) {
      setState("idle");
      stopPolling();
    }
  }, [isOpen]);

  // cleanup on unmount
  useEffect(() => () => stopPolling(), []);

  if (!isOpen) return null;

  const handleLogin = () => {
    const width = 500,
      height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(
      `${endpoint}/auth/google`,
      "auth-popup",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes`,
    );
    // Start polling immediately — works on mobile where postMessage fails
    startPolling();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={state === "idle" ? onClose : undefined}
      />

      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {state === "success" ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(57,255,20,0.08)",
                border: "1px solid rgba(57,255,20,0.25)",
                animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#39FF14"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div style={{ animation: "fadeUp 0.4s ease 0.15s both" }}>
              <p className="text-white font-bold text-xl tracking-tight">
                {isNewUser
                  ? `Welcome, ${userName}`
                  : `Welcome back, ${userName}`}
              </p>
              <p className="text-white/35 text-sm mt-1.5">
                {isNewUser
                  ? "Your account has been created."
                  : "You're authenticated successfully."}
              </p>
            </div>

            <div
              className="flex gap-1.5"
              style={{ animation: "fadeUp 0.4s ease 0.3s both" }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "rgba(57,255,20,0.5)",
                    animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/25 hover:text-white/50 transition-colors p-1"
            >
              <X size={15} />
            </button>

            <div className="px-8 pt-10 pb-8">
              <div className="mb-8">
                <div className="w-8 h-8 mb-4">
                  <img src="/vite.svg" alt="Hermes Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]" />
                </div>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1 leading-none">
                  Project Hermes
                </p>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Sign in
                </h2>
                <p className="text-white/30 text-sm mt-1">
                  to access your dashboard
                </p>
              </div>

              <button
                onClick={handleLogin}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-white transition-all active:scale-[0.98]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.09)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-white/15 font-mono">
                <ShieldCheck size={10} />
                <span>Encrypted · Zero data stored</span>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
