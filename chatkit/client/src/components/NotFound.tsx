import { useLocation, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Search, Terminal } from "lucide-react";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-brand-text font-sans selection:bg-brand-primary/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center space-y-8">
        {/* 404 Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-2 shadow-2xl shadow-brand-primary/20">
            <Search className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter">
            404
          </h1>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Page not found
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto">
            We couldn't find the page you're looking for at{" "}
            <code className="text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded ml-1">
              {location.pathname}
            </code>
          </p>
        </div>

        {/* Terminal decorative block */}
        <div className="w-full max-w-lg bg-brand-bg border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <Terminal className="w-4 h-4 text-white/40" />
            <span className="text-xs font-mono text-white/40">hermes-cli</span>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="flex text-white/60">
              <span className="text-brand-primary mr-2">❯</span>
              <span>cd {location.pathname}</span>
            </div>
            <div className="text-red-400 mt-1 mb-3">
              cd: no such file or directory: {location.pathname}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full max-w-md">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-primary text-white font-medium hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/25 transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Home className="w-4 h-4 text-white/90" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
