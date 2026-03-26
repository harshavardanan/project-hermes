import { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart3,
  Settings,
  ShieldAlert,
  FilePen,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { useUserStore } from "../../store/userStore";

interface Props {
  activeTab: string;
}

export default function AppSidebar({ activeTab }: Props) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useUserStore((s) => s.user);

  const tabs = [
    { id: "Projects", label: "Projects", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    {
      id: "System Status",
      label: "System Status",
      path: "/dashboard/status",
      icon: <Activity size={18} />,
    },
    { id: "Usage & Billing", label: "Usage & Billing", path: "/dashboard/usage", icon: <BarChart3 size={18} /> },
    { id: "Profile", label: "Profile", path: "/dashboard/profile", icon: <User size={18} /> },
    { id: "Settings", label: "Settings", path: "/dashboard/settings", icon: <Settings size={18} /> },
  ];

  return (
    <aside
      className={`hidden md:flex sticky top-16 h-[calc(100vh-4rem)] flex-col border-r bg-brand-card border-brand-border p-4 transition-all duration-300 ease-in-out z-40 shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header & Toggle Button */}
      <div
        className={`flex items-center mb-8 mt-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <div
            className="flex items-center gap-2 font-bold tracking-widest text-[11px] uppercase truncate px-2 text-brand-muted"
          >
            <img src="/vite.svg" alt="Logo" className="w-4 h-4 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]" />
            Dashboard
          </div>
        )}
        {isCollapsed && (
          <img src="/vite.svg" alt="Logo" className="w-5 h-5 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.05)]" />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-brand-accent transition-colors text-brand-muted"
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
            onClick={() => navigate(tab.path)}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Admin Panel Link */}
      {user?.isAdmin && (
        <div className="mt-auto border-t border-white/5 pt-4 flex flex-col gap-1">
          <Link
            to="/doceditor"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-sans font-bold text-sm
              ${isCollapsed ? "justify-center" : "justify-start"}
              text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary group relative
            `}
            title={isCollapsed ? "Doc Editor" : undefined}
          >
            <FilePen size={18} />
            {!isCollapsed && <span>Doc Editor</span>}
          </Link>
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-sans font-bold text-sm
              ${isCollapsed ? "justify-center" : "justify-start"}
              text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary group relative
            `}
            title={isCollapsed ? "Admin Control" : undefined}
          >
            <ShieldAlert size={18} />
            {!isCollapsed && <span>Admin Control</span>}
          </Link>
        </div>
      )}
    </aside>
  );
}
