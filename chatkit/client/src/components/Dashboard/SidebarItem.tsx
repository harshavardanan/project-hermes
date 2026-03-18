interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}

export default function SidebarItem({
  icon,
  label,
  active,
  onClick,
  isCollapsed,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : ""} // Shows a tooltip on hover when collapsed
      className={`flex items-center p-2.5 rounded-lg transition-all overflow-hidden ${
        isCollapsed ? "justify-center" : "gap-3 px-3"
      } ${
        active
          ? "bg-brand-primary/10 text-brand-primary font-semibold"
          : "text-brand-muted hover:bg-brand-accent hover:text-brand-text"
      }`}
    >
      <div className="shrink-0">{icon}</div>

      {!isCollapsed && (
        <span className="text-sm tracking-wide whitespace-nowrap">{label}</span>
      )}
    </button>
  );
}
