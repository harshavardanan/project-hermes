import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Pricing from "./components/Pricing";
import Documentation from "./components/Documentation";
import Navbar from "./components/Navbar";
import AuthModal from "./components/Auth";
import ProjectDetail from "./components/ProjectDetail";
import AdminPanel from "./components/AdminPanel"; // 👈 Create this next

const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user status on load to see if they are Admin
  useEffect(() => {
    fetch("http://localhost:8080/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-brand-bg min-h-screen" />;

  return (
    <Router>
      <Navbar onSignInClick={() => setIsAuthOpen(true)} user={user} />

      <main className="min-h-screen bg-brand-bg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/dashboard/projects/:id" element={<ProjectDetail />} />

          {/* 🔒 PROTECTED ADMIN ROUTE */}
          <Route
            path="/admin"
            element={
              user?.isAdmin ? <AdminPanel /> : <Navigate to="/" replace />
            }
          />
        </Routes>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </Router>
  );
};

export default App;
