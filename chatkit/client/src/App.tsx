import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
import { useUserStore } from "./store/userStore";
import NotFound from "./components/NotFound";
import { getToken, setToken, clearToken, authFetch } from "./lib/authFetch";

const AppContent: React.FC<{
  isAuthOpen: boolean;
  setIsAuthOpen: (v: boolean) => void;
  isLoading: boolean;
}> = ({ isAuthOpen, setIsAuthOpen, isLoading }) => {
  const user = useUserStore((s) => s.user);

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar onSignInClick={() => setIsAuthOpen(true)} />

      <main className="min-h-screen bg-black text-white">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                user={user}
                loading={isLoading}
                onSignInClick={() => setIsAuthOpen(true)}
              />
            }
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
  const [isLoading, setIsLoading] = useState(true);
  const { setUser, clearUser } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (!token) {
        clearUser();
        setIsLoading(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          clearToken();
          clearUser();
          setIsLoading(false);
          return;
        }
      } catch {
        clearToken();
        clearUser();
        setIsLoading(false);
        return;
      }

      try {
        const res = await authFetch("/auth/me");
        if (res.ok) {
          const userData = await res.json();
          if (userData?._id) {
            setUser(userData);
          } else {
            clearUser();
          }
        } else {
          clearToken();
          clearUser();
        }
      } catch {
        clearUser();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [setUser, clearUser]);

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === "HERMES_AUTH_SUCCESS" && event.data.token) {
        setToken(event.data.token);
        setIsAuthOpen(false);

        authFetch("/auth/me")
          .then((res) => res.json())
          .then((userData) => {
            if (userData?._id) {
              setUser(userData);
            }
          })
          .catch(() => {
            window.location.reload();
          });
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, [setUser]);

  if (isLoading) return <div className="bg-black min-h-screen" />;

  return (
    <Router>
      <AppContent
        isAuthOpen={isAuthOpen}
        setIsAuthOpen={setIsAuthOpen}
        isLoading={isLoading}
      />
    </Router>
  );
};

export default App;
