import React from "react";
import {
  LayoutDashboard,
  Activity,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";
import SidebarItem from "./SidebarItem";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AppSidebar({ activeTab, setActiveTab }: Props) {
  const tabs = [
    { id: "Projects", label: "Projects", icon: <LayoutDashboard size={18} /> },
    {
      id: "System Status",
      label: "System Status",
      icon: <Activity size={18} />,
    },
    { id: "Settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col bg-black border-r border-white/10 p-4">
      {/* Logo */}

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {tabs.map((tab) => (
          <SidebarItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}

        <div className="h-px bg-border my-2" />

        <SidebarItem
          icon={<HelpCircle size={18} />}
          label="Support"
          active={activeTab === "Support"}
          onClick={() => setActiveTab("Support")}
        />
      </nav>

      {/* Status */}
      <div className="mt-auto p-3 bg-muted border border-border rounded-lg text-xs">
        <div className="font-medium">All Systems Operational</div>
        <div className="text-muted-foreground">Engine v2.4 Live</div>
      </div>
    </aside>
  );
}
