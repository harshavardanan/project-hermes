import { useState } from "react";
import AppSidebar from "./AppSidebar";
import Projects from "../Projects";
import SystemStatus from "./SystemStatus";
import CreateProjectModal from "./CreateProjectModal";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Projects");
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex min-h-screen bg-black text-white">
      <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 px-8 py-6">
        {activeTab === "Projects" && (
          <Projects key={refreshKey} onOpenForm={() => setShowModal(true)} />
        )}

        {activeTab === "System Status" && <SystemStatus />}

        {activeTab === "Settings" && (
          <div
            className="bg-neutral-900 border border-white/10
 rounded-lg p-6"
          >
            Settings coming soon
          </div>
        )}

        {activeTab === "Support" && (
          <div className="bg-neutral-900 border border-white/10 rounded-lg p-6">
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
