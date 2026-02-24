import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Pricing from "./components/Pricing";
import Documentation from "./components/Documentation";
import Navbar from "./components/Navbar";
import AuthModal from "./components/Auth";
import ProjectDetail from "./components/ProjectDetail";
import AdminPanel from "./components/AdminPanel";
import DocEditor from "./components/DocumentEditor";

// Pages that manage their own full-height layout (no navbar offset needed)
const FULL_HEIGHT_ROUTES = ["/documentation", "/doceditor", "/admin"];

const AppContent: React.FC<{
  user: any;
  isAuthOpen: boolean;
  setIsAuthOpen: (v: boolean) => void;
}> = ({ user, isAuthOpen, setIsAuthOpen }) => {
  const location = useLocation();

  // Check if current route is a full-height page
  const isFullHeight = FULL_HEIGHT_ROUTES.some((r) =>
    location.pathname.startsWith(r),
  );

  return (
    <>
      <Navbar onSignInClick={() => setIsAuthOpen(true)} user={user} />

      {/* pt-16 offsets the fixed navbar (h-16 = 64px).
          Full-height pages like /documentation handle their own top spacing. */}
      <main
        className={`min-h-screen bg-[#050505] ${isFullHeight ? "" : "pt-16"}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />

          <Route path="/documentation" element={<Documentation />} />
          <Route path="/documentation/:slug" element={<Documentation />} />

          <Route path="/dashboard/projects/:id" element={<ProjectDetail />} />

          {/* 🔒 Protected Admin Routes */}
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
    </>
  );
};

const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-[#050505] min-h-screen" />;

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
