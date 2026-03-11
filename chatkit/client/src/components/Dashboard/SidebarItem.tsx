import React from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export default function SidebarItem({ icon, label, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all border-l-2
      ${
        active
          ? "border-brand-primary bg-brand-primary/10 text-brand-primary font-bold"
          : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white font-medium"
      }`}
    >
      <span className={`shrink-0 ${active ? "opacity-100" : "opacity-70"}`}>
        {icon}
      </span>

      <span className="flex-1 text-left">{label}</span>

      {/* Changed text-green-400 to text-brand-primary */}
      {active && <ChevronRight size={16} className="text-brand-primary" />}
    </button>
  );
}
