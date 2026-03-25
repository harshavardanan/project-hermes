import { useState } from "react";
import { useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
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

      <main className="flex-1 px-8 pt-24 pb-6">
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

      <CreateProjectModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
