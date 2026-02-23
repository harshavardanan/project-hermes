import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Zap, // Swapped icon for "Hermes" theme
  LogOut,
  LayoutDashboard,
} from "lucide-react";

interface NavbarProps {
  onSignInClick: () => void;
}

interface UserData {
  displayName: string;
  avatar?: string;
  email: string;
}

const Navbar: React.FC<NavbarProps> = ({ onSignInClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserStatus = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStatus();
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:8080") return;
      if (event.data === "auth_success") fetchUserStatus();
    };
    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, []);

  const handleLogout = () => {
    window.location.href = "http://localhost:8080/auth/logout";
  };

  const navLinks = [
    { name: "SDK", path: "/" },
    { name: "Pricing", path: "/pricing" },
    { name: "Docs", path: "/documentation" },
  ];

  return (
    <nav className="bg-brand-bg/80 backdrop-blur-md border-b border-brand-border w-full fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section - Changed to Project Hermes */}
          <div
            className="flex items-center gap-2 font-black text-xl text-white cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="bg-brand-primary p-1.5 rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.4)] text-black transition-transform group-hover:scale-110">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="tracking-tighter uppercase">
              Project <span className="text-brand-primary">Hermes</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  className={`text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                    isActive
                      ? "text-brand-primary drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]"
                      : "text-brand-muted hover:text-brand-primary"
                  }`}
                >
                  {link.name}
                </button>
              );
            })}

            {user && (
              <button
                onClick={() => navigate("/dashboard")}
                className={`text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${
                  location.pathname.startsWith("/dashboard")
                    ? "text-brand-primary drop-shadow-[0_0_8px_rgba(57,255,20,0.5)]"
                    : "text-brand-muted hover:text-brand-primary"
                }`}
              >
                <LayoutDashboard size={14} /> Dashboard
              </button>
            )}

            <div className="h-6 w-[1px] bg-brand-border mx-2" />

            {/* Identity / Auth Section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-brand-card animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="flex flex-col items-end">
                  <span className="text-white text-[10px] font-black leading-none mb-1 uppercase tracking-tighter">
                    {user.displayName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-[8px] text-brand-muted hover:text-red-500 uppercase tracking-widest font-black transition-colors"
                  >
                    Logout
                  </button>
                </div>
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${user.displayName}&background=0D0D0D&color=39FF14`
                  }
                  alt="User avatar"
                  className="w-9 h-9 rounded-full border border-brand-border hover:border-brand-primary transition-all p-0.5 bg-brand-card"
                />
              </div>
            ) : (
              <button
                onClick={onSignInClick}
                className="bg-brand-primary text-black px-6 py-2 rounded-brand font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-primary p-1"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden bg-brand-bg border-b border-brand-border p-6 space-y-6 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  navigate(link.path);
                  setIsOpen(false);
                }}
                className={`block w-full text-left font-black text-lg uppercase tracking-tighter ${
                  location.pathname === link.path
                    ? "text-brand-primary"
                    : "text-brand-text"
                }`}
              >
                {link.name}
              </button>
            ))}
            {user && (
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setIsOpen(false);
                }}
                className="block w-full text-left font-black text-lg uppercase tracking-tighter text-brand-text"
              >
                Dashboard
              </button>
            )}
          </div>
          <div className="pt-4 border-t border-brand-border">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full bg-red-500/10 text-red-500 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <LogOut size={20} /> Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  onSignInClick();
                  setIsOpen(false);
                }}
                className="w-full bg-brand-primary text-black py-4 rounded-xl font-black uppercase tracking-widest"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
