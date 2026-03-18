import { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AppSidebar({ activeTab, setActiveTab }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: "Projects", label: "Projects", icon: <LayoutDashboard size={18} /> },
    {
      id: "System Status",
      label: "System Status",
      icon: <Activity size={18} />,
    },
  ];

  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] flex flex-col border-r p-4 transition-all duration-300 ease-in-out z-40 shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
      style={{
        backgroundColor: "var(--brand-card)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Header & Toggle Button */}
      <div
        className={`flex items-center mb-8 mt-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <div
            className="flex items-center gap-2 font-bold tracking-widest text-[11px] uppercase truncate px-2"
            style={{ color: "var(--brand-muted)" }}
          >
            Dashboard
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-white/[0.05] transition-colors"
          style={{ color: "var(--brand-muted)" }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {tabs.map((tab) => (
          <SidebarItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </aside>
  );
}
