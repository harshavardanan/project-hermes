import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Activity, BarChart3, User, Settings as SettingsIcon, ShieldAlert, FilePen } from "lucide-react";
import AppSidebar from "./AppSidebar";
import { useUserStore } from "../../store/userStore";
import Projects from "../Projects";
import SystemStatus from "./SystemStatus";
import CreateProjectModal from "./CreateProjectModal";
import Profile from "./Profile";
import Usage from "./Usage";
import Settings from "./Settings";

export default function Dashboard() {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const user = useUserStore((s) => s.user);

  // Derive active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname.split("/").pop();
    if (path === "profile") return "Profile";
    if (path === "usage") return "Usage & Billing";
    if (path === "settings") return "Settings";
    if (path === "status") return "System Status";
    if (path === "support") return "Support";
    return "Projects";
  };

  const activeTab: string = getActiveTab();

  return (
    <div className="flex min-h-screen bg-brand-bg text-brand-text">
      <AppSidebar activeTab={activeTab} />

      <main className="flex-1 px-4 sm:px-8 pt-24 pb-24 md:pb-6">
        {activeTab === "Projects" && (
          <Projects key={refreshKey} onOpenForm={() => setShowModal(true)} />
        )}

        {activeTab === "System Status" && <SystemStatus />}

        {activeTab === "Profile" && <Profile />}
        
        {activeTab === "Usage & Billing" && <Usage />}

        {activeTab === "Settings" && <Settings />}

        {activeTab === "Support" && (
          <div className="bg-brand-card border border-brand-border rounded-lg p-6">
            Support content
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-bg/95 backdrop-blur-md border-t border-brand-border flex md:hidden items-center justify-start overflow-x-auto gap-8 px-6 py-3 z-50 scrollbar-hide">
        <Link to="/dashboard" className={`shrink-0 flex flex-col items-center gap-1 ${activeTab === 'Projects' ? 'text-brand-primary' : 'text-brand-muted'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-bold">Projects</span>
        </Link>
        <Link to="/dashboard/status" className={`shrink-0 flex flex-col items-center gap-1 ${activeTab === 'System Status' ? 'text-brand-primary' : 'text-brand-muted'}`}>
          <Activity size={20} />
          <span className="text-[10px] font-bold">Status</span>
        </Link>
        <Link to="/dashboard/usage" className={`shrink-0 flex flex-col items-center gap-1 ${activeTab === 'Usage & Billing' ? 'text-brand-primary' : 'text-brand-muted'}`}>
          <BarChart3 size={20} />
          <span className="text-[10px] font-bold">Usage</span>
        </Link>
        <Link to="/dashboard/profile" className={`shrink-0 flex flex-col items-center gap-1 ${activeTab === 'Profile' ? 'text-brand-primary' : 'text-brand-muted'}`}>
          <User size={20} />
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
        <Link to="/dashboard/settings" className={`shrink-0 flex flex-col items-center gap-1 ${activeTab === 'Settings' ? 'text-brand-primary' : 'text-brand-muted'}`}>
          <SettingsIcon size={20} />
          <span className="text-[10px] font-bold">Settings</span>
        </Link>
        {user?.isAdmin && (
          <>
            <Link to="/doceditor" className="shrink-0 flex flex-col items-center gap-1 text-brand-muted hover:text-brand-primary">
              <FilePen size={20} />
              <span className="text-[10px] font-bold">Docs</span>
            </Link>
            <Link to="/admin" className="shrink-0 flex flex-col items-center gap-1 text-brand-muted hover:text-brand-primary">
              <ShieldAlert size={20} />
              <span className="text-[10px] font-bold">Admin</span>
            </Link>
          </>
        )}
      </nav>

      <CreateProjectModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
