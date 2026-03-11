import React, { useState } from "react";
import { X, Copy, Check, Loader2 } from "lucide-react";

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
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!show) return null;

  const createProject = async () => {
    setCreating(true);

    const res = await fetch("http://localhost:8080/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName }),
      credentials: "include",
    });

    const json = await res.json();
    setData(json);
    setCreating(false);
  };

  const snippet = data
    ? `const hermesConfig = {
  projectId: "${data.projectId}",
  apiKey: "${data.apiKey}",
  apiSecret: "${data.secret}"
};`
    : "";

  const copy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg p-8 w-full max-w-xl relative">
        <button
          onClick={() => {
            onClose();
            onCreated();
          }}
          className="absolute top-4 right-4"
        >
          <X size={20} />
        </button>

        {!data ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Create Project</h2>

            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My App"
              className="w-full border border-border rounded-md p-3 bg-background mb-4"
            />

            <button
              onClick={createProject}
              className="w-full bg-primary text-primary-foreground rounded-md p-3 flex justify-center gap-2"
            >
              {creating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Create"
              )}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Project Ready</h2>

            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              <code>{snippet}</code>
            </pre>

            <button
              onClick={copy}
              className="mt-3 flex items-center gap-2 text-sm"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
