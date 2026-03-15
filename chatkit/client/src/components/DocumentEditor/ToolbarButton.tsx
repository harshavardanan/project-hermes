import React from "react";

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  active?: boolean;
  title?: string;
}

// Reusable toolbar button for the TipTap editor
const ToolbarButton = ({ onClick, icon, active, title }: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-md transition-all duration-150 ${
      active
        ? "bg-[var(--brand-primary)] text-black shadow-[0_0_10px_rgba(255,255,255,0.12)]"
        : "text-[var(--brand-muted)] hover:bg-white/5 hover:text-[var(--brand-text)]"
    }`}
  >
    {icon}
  </button>
);

export default ToolbarButton;
