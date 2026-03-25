import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Dashboard from "./components/Dashboard/Dashboard";
import Home from "./components/Home";
import Pricing from "./components/Pricing";
import Documentation from "./components/Documentation";
import Navbar from "./components/Navbar";
import AuthModal from "./components/Auth";
import ProjectDetail from "./components/ProjectDetail";
import AdminPanel from "./components/AdminPanel";
import DocEditor from "./components/DocumentEditor";
import { useUserStore } from "./store/userStore";
import { useAppConfig } from "./store/appConfig";
import NotFound from "./components/NotFound";

const AppContent: React.FC<{
  isAuthOpen: boolean;
  setIsAuthOpen: (v: boolean) => void;
}> = ({ isAuthOpen, setIsAuthOpen }) => {
  const user = useUserStore((s) => s.user);

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar onSignInClick={() => setIsAuthOpen(true)} />

      <main className={`min-h-screen bg-black text-white `}>
        <Routes>
          <Route
            path="/"
            element={<Home onSignInClick={() => setIsAuthOpen(true)} />}
          />

          <Route path="/pricing" element={<Pricing />} />

          <Route path="/documentation" element={<Documentation />} />
          <Route path="/documentation/:slug" element={<Documentation />} />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard/*"
            element={user ? <Dashboard /> : <Navigate to="/" replace />}
          />

          <Route
            path="/dashboard/projects/:id"
            element={user ? <ProjectDetail /> : <Navigate to="/" replace />}
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              user?.isAdmin ? <AdminPanel /> : <Navigate to="/" replace />
            }
          />

          <Route
            path="/doceditor"
            element={
              user?.isAdmin ? <DocEditor /> : <Navigate to="/" replace />
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { setUser, clearUser, setLoading } = useUserStore();
  const endpoint = useAppConfig((s) => s.endpoint);

  const { data, isLoading } = useQuery({
    queryKey: ["auth_me"],
    queryFn: async () => {
      const res = await fetch(`${endpoint}/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    setLoading(isLoading);
    if (data) {
      if (data.token) sessionStorage.setItem("hermes_token", data.token);
      setUser(data);
    } else if (!isLoading) {
      clearUser();
    }
  }, [data, isLoading, setUser, clearUser, setLoading]);

  // Centralized Auth Listener
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // Security Check: Origin validation
      const allowedOrigins = [endpoint, "http://localhost:5173", "https://antigravity.dev"];
      if (!allowedOrigins.some(o => event.origin.includes(o))) {
        // In dev, sometimes origin might be a variation, so we check carefully
        if (!event.origin.includes("localhost") && !event.origin.includes("railway.app")) return;
      }

      if (event.data?.type === "HERMES_AUTH_SUCCESS" || event.data === "auth_success") {
        setIsAuthOpen(false);
        // Smoother than window.location.reload()
        window.location.reload(); 
        // Note: keeping reload for now as it's the most robust way to sync all cookies 
        // across origins, but we can improve this if needed.
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [endpoint]);

  if (isLoading) return <div className="bg-black min-h-screen" />;

  return (
    <Router>
      <AppContent isAuthOpen={isAuthOpen} setIsAuthOpen={setIsAuthOpen} />
    </Router>
  );
};

export default App;
