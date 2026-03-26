import { useState } from "react";
import {
  X,
  Copy,
  Check,
  Loader2,
  Rocket,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { authFetch } from "../../lib/authFetch";

interface Props {
  show: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateProjectModal({
  show,
  onClose,
  onCreated,
}: Props) {
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [copied, setCopied] = useState(false);
  
  if (!show) return null;

  const createProject = async () => {
    if (!projectName.trim()) return;
    setCreating(true);

    try {
      const res = await authFetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName }),
      });

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setCreating(false);
    }
  };

  const snippet = data
    ? `const hermesConfig = {
  projectId: "${String(data.projectId)}",
  apiKey: "${String(data.apiKey)}",
  apiSecret: "${String(data.secret)}"
};`
    : "";

  const copy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onClose();
    if (data) onCreated(); // Only trigger refresh if a project was actually made
    // Reset state for next time
    setTimeout(() => {
      setData(null);
      setProjectName("");
    }, 300);
  };

  return (
    // ── BACKDROP (z-[100] ensures it covers the pure CSS animations) ──
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* ── MODAL BOX ── */}
      <div className="bg-brand-card border border-white/10 rounded-2xl w-full max-w-[90vw] md:max-w-lg relative overflow-y-auto max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200 m-4">
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {!data ? (
            /* ── STATE 1: INITIALIZE FORM ── */
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <Rocket size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Initialize Project
                </h2>
              </div>

              <p className="text-white/50 text-sm mb-8">
                Give your project a name to generate your secure edge network
                keys.
              </p>

              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Project Name
                </label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Production App"
                  autoFocus
                  className="w-full border border-white/10 rounded-xl p-3.5 bg-black/50 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && createProject()}
                />
              </div>

              <button
                onClick={createProject}
                disabled={creating || !projectName.trim()}
                className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed font-bold rounded-xl p-3.5 flex justify-center items-center gap-2 transition-colors"
              >
                {creating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Provisioning...
                  </>
                ) : (
                  "Create Project"
                )}
              </button>
            </>
          ) : (
            /* ── STATE 2: SUCCESS & KEY REVEAL ── */
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Project Ready
                </h2>
              </div>

              <p className="text-emerald-400/80 text-sm mb-6 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                <strong>Important:</strong> Save these keys now. Your API secret
                will not be shown again.
              </p>

              {/* Code Snippet Block */}
              <div className="bg-black border border-white/10 rounded-xl overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                  <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
                    <Terminal size={14} />
                    config.js
                  </div>
                  <button
                    onClick={copy}
                    className="flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied ? (
                      <span className="text-emerald-400">Copied!</span>
                    ) : (
                      "Copy"
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono leading-relaxed text-blue-200">
                    <code>
                      <span className="text-purple-400">const</span>{" "}
                      hermesConfig = {"{"}
                      <br />
                      {"  "}projectId:{" "}
                      <span className="text-emerald-300">
                        "{String(data.projectId)}"
                      </span>
                      ,
                      <br />
                      {"  "}apiKey:{" "}
                      <span className="text-emerald-300">
                        "{String(data.apiKey)}"
                      </span>
                      ,
                      <br />
                      {"  "}apiSecret:{" "}
                      <span className="text-emerald-300">
                        "{String(data.secret)}"
                      </span>
                      <br />
                      {"}"};
                    </code>
                  </pre>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/5 font-bold rounded-xl p-3.5 transition-colors"
              >
                I've saved my keys
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
