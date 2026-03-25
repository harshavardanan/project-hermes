import React from "react";
import { ChevronRight } from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
}

// Sidebar navigation item for the project detail tabs
const NavItem = ({
  icon,
  label,
  active,
  onClick,
  badge,
  isCollapsed,
}: NavItemProps & { isCollapsed?: boolean }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : ""}
    className={`w-full flex items-center rounded-lg border-none cursor-pointer transition-all duration-200 text-left font-sans text-sm
      ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}
      ${
        active
          ? "bg-brand-primary/10 text-brand-primary font-bold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
          : "bg-transparent text-slate-400 font-medium hover:bg-white/5 hover:text-slate-200"
      }`}
  >
    <span
      className={`shrink-0 ${active ? "text-brand-primary" : "text-slate-500"}`}
    >
      {icon}
    </span>
    {!isCollapsed && (
      <>
        <span className="flex-1 truncate">{label}</span>
        {badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-brand-primary/20 text-brand-primary font-bold tracking-wider shrink-0">
            {badge}
          </span>
        )}
        {active && (
          <ChevronRight size={14} className="opacity-60 text-brand-primary shrink-0" />
        )}
      </>
    )}
  </button>
);

export default NavItem;
