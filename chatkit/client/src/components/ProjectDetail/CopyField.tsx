import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyFieldProps {
  label: string;
  value: string;
  masked?: boolean;
}

// Single field row with copy-to-clipboard and optional masked reveal
const CopyField = ({ label, value, masked }: CopyFieldProps) => {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const display = masked && !revealed ? "•".repeat(32) : value;
  return (
    <div className="mb-5 group">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-sans mb-1.5">
        {label}
      </div>
      <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-lg p-3 transition-colors group-hover:border-white/20">
        <code
          className={`flex-1 font-mono text-[13px] overflow-hidden text-ellipsis whitespace-nowrap
          ${masked && !revealed ? "text-slate-500 tracking-[0.2em]" : "text-brand-primary"}`}
        >
          {display}
        </code>
        {masked && (
          <button
            onClick={() => setRevealed((r) => !r)}
            className="bg-transparent border-none cursor-pointer px-2 text-slate-400 text-[10px] font-bold font-sans tracking-wider hover:text-white transition-colors"
          >
            {revealed ? "HIDE" : "SHOW"}
          </button>
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-sans text-xs font-bold transition-all
            ${
              copied
                ? "bg-brand-primary/20 border border-brand-primary/40 text-brand-primary"
                : "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
};

export default CopyField;
