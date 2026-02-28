import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe, Terminal, Loader2, ChevronRight, Plus } from "lucide-react";

interface ProjectsProps {
  onOpenForm: () => void;
}

const Projects = ({ onOpenForm }: ProjectsProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/projects", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401)
          throw new Error("Session expired. Please login again.");
        throw new Error("Failed to load projects.");
      }

      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-brand-muted">
        <Loader2 className="animate-spin mb-4 text-brand-primary" size={32} />
        <p className="font-bold tracking-widest text-xs uppercase">
          Syncing Workspace...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 text-center">
        <p className="font-black uppercase tracking-tighter text-2xl">
          Sync Error
        </p>
        <p className="text-sm opacity-70 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-xs underline font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Project Workspace
          </h1>
          <p className="text-brand-muted mt-1">
            Manage your credentials in the{" "}
            <span className="text-brand-primary font-bold">Neon</span> zone.
          </p>
        </div>
        <button
          type="button" // Prevents accidental form submissions
          onClick={(e) => {
            e.preventDefault();
            console.log("New Project button clicked!");
            if (typeof onOpenForm === "function") {
              onOpenForm();
            } else {
              console.error(
                "❌ ERROR: onOpenForm prop is missing from Dashboard!",
              );
              alert("Prop is missing! Check your Dashboard component.");
            }
          }}
          className="bg-brand-primary hover:opacity-90 text-black px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(57,255,20,0.4)]"
        >
          <Plus size={18} className="inline mr-1" /> New Project
        </button>
      </header>

      <div className="flex items-center justify-between px-2">
        <h2 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em]">
          Active Projects ({projects.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-brand-border rounded-2xl text-brand-muted">
            <Globe className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-bold text-white">No active projects found.</p>
            <p className="text-sm mt-1">
              Create your first SDK project to get started.
            </p>
            <button
              onClick={onOpenForm}
              className="mt-6 text-brand-primary font-bold text-sm hover:underline"
            >
              Get Started &rarr;
            </button>
          </div>
        ) : (
          projects.map((p) => (
            <Link
              to={`/dashboard/projects/${p._id}`}
              key={p._id}
              className="group block"
            >
              <div className="relative h-full p-6 rounded-2xl bg-brand-card border border-brand-border transition-all duration-300 group-hover:border-brand-primary/50 group-hover:shadow-[0_0_30px_rgba(57,255,20,0.05)] overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 blur-[40px] -mr-12 -mt-12 group-hover:bg-brand-primary/10 transition-all" />

                <div className="flex justify-between items-start mb-6">
                  <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary border border-brand-primary/20">
                    <Terminal size={18} />
                  </div>
                  <div className="text-[10px] font-black text-brand-muted bg-brand-bg px-2 py-1 rounded border border-brand-border uppercase tracking-widest">
                    {p.region || "Global"}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white group-hover:text-brand-primary transition-colors flex items-center gap-2">
                    {p.projectName}
                    <ChevronRight
                      size={16}
                      className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all text-brand-primary"
                    />
                  </h3>
                  <p className="text-[10px] font-mono text-brand-muted uppercase tracking-tighter">
                    ID: {p.projectId ? p.projectId.substring(0, 12) : "Unknown"}
                    ...
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Manage Project
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-brand-border group-hover:bg-brand-primary/30 transition-colors"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
