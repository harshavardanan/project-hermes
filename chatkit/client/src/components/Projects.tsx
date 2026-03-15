import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe, Terminal, Loader2, ChevronRight, Plus } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
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

export default function Projects({
  onOpenForm,
}: {
  onOpenForm: () => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_ENDPOINT || "http://localhost:8080"}/api/projects`, {
        credentials: "include",
      });

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
      <Card className="p-10 text-center bg-[#111] border-red-500/20 max-w-md mx-auto mt-10">
        <CardTitle className="text-red-400">Error Loading Projects</CardTitle>
        <CardDescription className="mt-3 text-slate-400 text-sm">
          {error}
        </CardDescription>
        <Button
          variant="outline"
          className="mt-6 border-white/10 text-white hover:bg-white/10"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Card>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Projects
          </h1>
          <p className="text-slate-400 text-base mt-1">
            Manage your Hermes SDK projects and environments.
          </p>
        </div>
        <Button
          onClick={onOpenForm}
          className="bg-brand-primary text-black hover:brightness-110 shadow-lg shadow-brand-primary/20 font-bold transition-all"
        >
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      {/* ── PROJECT COUNT ── */}
      <div className="flex items-center gap-3">
        <div className="h-px bg-white/10 flex-1"></div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          Active Projects
          <span className="bg-white/10 text-white py-0.5 px-2 rounded-full text-[10px]">
            {projects.length}
          </span>
        </div>
        <div className="h-px bg-white/10 flex-1"></div>
      </div>

      {/* ── GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <Card className="col-span-full text-center p-16 bg-[#111] border-white/10 shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
              <Globe className="text-slate-500" size={32} strokeWidth={1.5} />
            </div>
            <CardTitle className="text-2xl text-white tracking-tight">
              No projects yet
            </CardTitle>
            <CardDescription className="mt-3 text-slate-400 max-w-sm mx-auto text-base">
              Create your first Hermes project to generate secure API keys and
              start building your chat app.
            </CardDescription>
            <Button
              className="mt-8 bg-brand-primary text-black hover:brightness-110 font-bold transition-all"
              onClick={onOpenForm}
            >
              <Plus size={16} className="mr-2" />
              Create Project
            </Button>
          </Card>
        ) : (
          projects.map((p) => (
            <Link
              key={p._id}
              to={`/dashboard/projects/${p._id}`}
              className="group block h-full"
            >
              <Card className="bg-[#111] border-white/10 shadow-sm transition-all duration-300 hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/10 h-full flex flex-col overflow-hidden relative">
                {/* Subtle top glow effect on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary/0 group-hover:bg-brand-primary/80 transition-colors duration-300" />

                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary group-hover:bg-brand-primary group-hover:text-black transition-colors duration-300 shadow-sm">
                      <Terminal size={18} />
                    </div>
                    <CardTitle className="text-lg text-white group-hover:text-brand-primary transition-colors tracking-tight">
                      {p.projectName}
                    </CardTitle>
                  </div>
                  <ChevronRight
                    size={20}
                    className="opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand-primary"
                  />
                </CardHeader>

                <CardContent className="space-y-5 mt-auto pb-6">
                  {/* Project ID Block */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Project ID
                    </span>
                    <p className="text-xs text-slate-400 font-mono bg-black/50 p-2.5 rounded-lg border border-white/5 truncate">
                      {p.projectId || "Unknown"}
                    </p>
                  </div>

                  {/* Region Badge */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Edge Region
                    </span>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]"></div>
                      <span className="text-xs text-slate-300 font-medium">
                        {p.region || "Global"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
