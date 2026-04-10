import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useAppConfig } from "../../store/appConfig";
import type { Project } from "./types";

const HermesConfigJson = ({ project, showSecret = false }: { project: Project; showSecret?: boolean }) => {
  const endpointFallback = useAppConfig((s) => s.endpoint);
  const [copied, setCopied] = useState(false);

  const config = {
    projectId: project.projectId ?? "",
    apiKey: project.apiKey ?? "",
    secret: project.secret ?? "",
    endpoint: project.endpoint || endpointFallback || "",
  };

  const raw = JSON.stringify(config, null, 2);

  const displayConfig = {
    ...config,
    secret: showSecret ? config.secret : "••••••••••••••••••••••••••••••••",
  };
  const lines = JSON.stringify(displayConfig, null, 2).split("\n");

  const colorLine = (line: string) => {
    const m = line.match(/^(\s*)("[\w]+")(\s*:\s*)(.+)$/);
    if (!m) return <span className="text-slate-500">{line}</span>;
    const [, indent, key, colon, val] = m;
    const isSecret = key === '"secret"';
    const isBracket = val === "{" || val === "}";
    return (
      <>
        <span>{indent}</span>
        <span className="text-[#93c5fd]">{key}</span>
        <span className="text-slate-500">{colon}</span>
        <span
          className={
            isBracket
              ? "text-slate-400"
              : isSecret
                ? "text-slate-500 tracking-widest"
                : "text-[#86efac]"
          }
        >
          {val}
        </span>
      </>
    );
  };

  return (
    <div className="bg-brand-card border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
              <div
                key={c}
                style={{ background: c }}
                className="w-3 h-3 rounded-full opacity-80"
              />
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md px-3 py-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="font-mono text-xs font-semibold text-slate-300 tracking-wide">
              Hermes.config.json
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(raw);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-sans text-xs font-bold transition-all
            ${
              copied
                ? "bg-brand-primary/20 border border-brand-primary/40 text-brand-primary"
                : "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy file"}
        </button>
      </div>

      <div className="p-5 font-mono text-[13px] leading-6 overflow-x-auto">
        <table className="border-collapse w-full">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-white/[0.025] transition-colors group/row">
                <td className="pr-5 text-right text-slate-600 text-[11px] select-none w-6 align-top pt-px group-hover/row:text-slate-500 transition-colors">
                  {i + 1}
                </td>
                <td className="whitespace-pre">{colorLine(line)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HermesConfigJson;
