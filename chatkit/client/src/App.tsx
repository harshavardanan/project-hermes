import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  // useLocation,
} from "react-router-dom";

import Dashboard from "./components/Dashboard/Dashboard";
import Home from "./components/Home";
import Pricing from "./components/Pricing";
import Documentation from "./components/Documentation";
import Navbar from "./components/Navbar";
import AuthModal from "./components/Auth";
import ProjectDetail from "./components/ProjectDetail";
import AdminPanel from "./components/AdminPanel";
import DocEditor from "./components/DocumentEditor";
import type { UserData } from "./types";

// const FULL_HEIGHT_ROUTES = ["/documentation", "/doceditor", "/admin"];

const AppContent: React.FC<{
  user: UserData | null;
  isAuthOpen: boolean;
  setIsAuthOpen: (v: boolean) => void;
}> = ({ user, isAuthOpen, setIsAuthOpen }) => {
  // const location = useLocation();

  // const isFullHeight = FULL_HEIGHT_ROUTES.some((r) =>
  //   location.pathname.startsWith(r),
  // );

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar onSignInClick={() => setIsAuthOpen(true)} user={user} />

      <main className={`min-h-screen bg-black text-white `}>
        <Routes>
          <Route
            path="/"
            element={
              <Home user={user} onSignInClick={() => setIsAuthOpen(true)} />
            }
          />

          <Route path="/pricing" element={<Pricing />} />

          <Route path="/documentation" element={<Documentation />} />
          <Route path="/documentation/:slug" element={<Documentation />} />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
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
        </Routes>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () => {
    fetch(`${import.meta.env.VITE_ENDPOINT}/auth/me`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.token) sessionStorage.setItem("hermes_token", data.token);
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== import.meta.env.VITE_ENDPOINT) return;

      if (event.data === "auth_success") {
        setIsAuthOpen(false);
        fetchUser();
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, []);

  if (loading) return <div className="bg-black min-h-screen" />;

  return (
    <Router>
      <AppContent
        user={user}
        isAuthOpen={isAuthOpen}
        setIsAuthOpen={setIsAuthOpen}
      />
    </Router>
  );
};

export default App;
