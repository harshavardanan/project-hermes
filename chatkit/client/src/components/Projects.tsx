import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe, Terminal, Loader2, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Project {
  _id: string;
  projectName: string;
  projectId?: string;
  region?: string;
  createdAt: string;
  stats?: {
    messagesStats?: Record<string, number>;
  };
}

export default function Projects({ onOpenForm }: { onOpenForm: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_ENDPOINT}/api/projects`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Session expired. Please login again.");

        throw new Error("Failed to load projects.");
      }

      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 animate-in fade-in duration-500">
        <Loader2 className="animate-spin mb-4 text-brand-primary" size={36} />
        <p className="font-bold text-xs uppercase tracking-widest text-slate-500">
          Loading Projects...
        </p>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error) {
    return (
      <div className="p-10 text-center bg-white/[0.02] rounded-2xl max-w-md mx-auto mt-10">
        <h3 className="text-xl font-bold text-red-400 mb-2">
          Error Loading Projects
        </h3>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <Button
          variant="outline"
          className="border-white/10 text-white hover:bg-white/10"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">
            Projects
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Manage your Hermes SDK projects and environments.
          </p>
        </div>
        {projects.length > 0 && (
          <Button
            onClick={onOpenForm}
            className="bg-white text-black hover:bg-gray-200 shadow-lg font-bold transition-colors duration-300 py-5 px-6 rounded-lg"
          >
            <Plus size={18} strokeWidth={2.5} className="mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* ── GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          /* ── EMPTY STATE CARD ── */
          <div
            className="col-span-full group cursor-pointer relative overflow-hidden rounded-2xl bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-700 min-h-[450px] flex flex-col items-center justify-center"
            onClick={onOpenForm}
          >
            {/* Pure CSS Animated Dot Pattern (pointer-events-none prevents click issues) */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 1.5px, transparent 1.5px), radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 1px, transparent 1px)`,
                backgroundSize: "28px 28px",
                backgroundPosition: "0 0, 14px 14px",
                WebkitMaskImage:
                  "radial-gradient(350px circle at center, white, transparent)",
                maskImage:
                  "radial-gradient(350px circle at center, white, transparent)",
              }}
            />

            {/* Content Wrapper (Natural stacking, no z-10 required) */}
            <div className="relative flex flex-col items-center p-8 md:p-16 text-center w-full h-full justify-center">
              <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/10 rounded-2xl rotate-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" />
                <div className="absolute inset-0 bg-[#111]/80 backdrop-blur-md rounded-2xl -rotate-3 group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500 flex items-center justify-center shadow-xl">
                  <Globe
                    className="text-white/40 group-hover:text-blue-400 transition-colors duration-500"
                    size={32}
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">
                No projects yet
              </h3>

              <p className="text-white/50 max-w-md mx-auto text-sm leading-relaxed mb-10 group-hover:text-white/70 transition-colors">
                Create your first Hermes project to generate secure API keys and
                start building your real-time chat infrastructure.
              </p>

              <button
                className="relative bg-white text-black hover:bg-gray-200 font-bold px-6 py-4 rounded-lg transition-colors duration-300 group/btn shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenForm();
                }}
              >
                <span className="flex items-center gap-2 text-sm">
                  <Plus
                    size={18}
                    strokeWidth={2.5}
                    className="group-hover/btn:rotate-90 transition-transform duration-300"
                  />
                  Initialize Project
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* ── POPULATED STATE (BORDERLESS CARDS) ── */
          projects.map((p) => (
            <Link
              key={p._id}
              to={`/dashboard/projects/${p._id}`}
              className="group block h-full"
            >
              <div className="bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl transition-all duration-300 h-full flex flex-col overflow-hidden relative border-none">
                {/* Accent line on the left that expands on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/5 group-hover:bg-blue-500 transition-colors duration-500" />

                {/* Soft glow that follows the hover state */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none" />

                <div className="p-6 relative z-10 flex flex-col h-full">
                  <div className="flex flex-row items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-black/40 text-white/50 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors duration-300">
                        <Terminal size={20} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                        {p.projectName}
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white text-white/30 transition-all duration-300">
                      <ChevronRight
                        size={16}
                        strokeWidth={2}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 mt-auto">
                    {/* Project ID Block */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Project ID
                      </span>
                      <p className="text-xs text-white/60 font-mono bg-black/40 py-2.5 px-3 rounded-lg truncate select-all">
                        {p.projectId || "Unknown"}
                      </p>
                    </div>

                    {/* Region Badge */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Edge Region
                      </span>
                      <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
                        <span className="text-xs text-white/70 font-medium">
                          {p.region || "Global"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
