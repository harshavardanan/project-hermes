import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useUserStore } from "../store/userStore";

interface NavbarProps {
  onSignInClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSignInClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const user = useUserStore((s) => s.user);



  const navLinks = [
    { name: "SDK", path: "/" },
    { name: "Pricing", path: "/pricing" },
    { name: "Docs", path: "/documentation" },
  ];

  const isActivePath = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <nav className="bg-brand-bg/80 backdrop-blur-md border-b border-brand-border w-full fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 font-black text-xl text-white cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
              <img src="/vite.svg" alt="Hermes Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
            </div>
            <span className="tracking-tighter uppercase whitespace-nowrap">
              Project <span className="text-white">Hermes</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`text-xs font-semibold uppercase tracking-widest transition-all duration-200 ${
                  isActivePath(link.path)
                    ? "text-white"
                    : "text-brand-muted hover:text-white"
                }`}
              >
                {link.name}
              </button>
            ))}

            {user && (
              <button
                onClick={() => navigate("/dashboard")}
                className={`text-xs font-semibold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${
                  isActivePath("/dashboard")
                    ? "text-white"
                    : "text-brand-muted hover:text-white"
                }`}
              >
                <LayoutDashboard size={14} /> Dashboard
              </button>
            )}

            <div className="h-6 w-[1px] bg-brand-border mx-2" />

            {user ? (
              <button 
                onClick={() => navigate("/dashboard/profile")}
                className="flex items-center gap-3 pl-2 group"
              >
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${user.displayName}&background=18181b&color=ffffff`
                  }
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border border-brand-border group-hover:border-white/40 transition-all p-0.5 bg-brand-card shadow-lg"
                />
              </button>
            ) : (
              <button
                onClick={onSignInClick}
                className="bg-white text-black px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${user.displayName}&background=18181b&color=ffffff`
                }
                alt="User avatar"
                className="w-7 h-7 rounded-full border border-brand-border"
              />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-1"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
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
                className={`block w-full text-left font-bold text-lg uppercase tracking-tighter ${
                  isActivePath(link.path) ? "text-white" : "text-brand-muted"
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
                className="block w-full text-left font-bold text-lg uppercase tracking-tighter text-brand-text"
              >
                Dashboard
              </button>
            )}
          </div>

          <div className="pt-4 border-t border-brand-border">
            {user ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigate("/dashboard/profile");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 pb-3 border-b border-brand-border"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.displayName}&background=18181b&color=ffffff`
                    }
                    alt="User avatar"
                    className="w-9 h-9 rounded-full border border-brand-border"
                  />
                  <div>
                    <p className="text-white text-sm font-bold">
                      {user.displayName}
                    </p>
                    <p className="text-brand-muted text-xs">
                      {user.isAdmin ? "Admin" : "Member"}
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onSignInClick();
                  setIsOpen(false);
                }}
                className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all"
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
