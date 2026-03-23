import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  FilePen,
  ShieldCheck,
} from "lucide-react";

import type { UserData } from "../types";

interface NavbarProps {
  onSignInClick: () => void;
  user: UserData | null;
}

const Navbar: React.FC<NavbarProps> = ({ onSignInClick, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
    window.location.href = `${import.meta.env.VITE_ENDPOINT}/auth/logout`;
  };

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
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 overflow-hidden">
              <img
                src="/vite.svg"
                alt="Hermes"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="tracking-tighter uppercase">
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

            {user?.isAdmin && (
              <>
                <div className="h-6 w-[1px] bg-brand-border" />
                <button
                  onClick={() => navigate("/doceditor")}
                  className={`text-xs font-semibold uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5 ${
                    isActivePath("/doceditor")
                      ? "text-white"
                      : "text-brand-muted hover:text-white"
                  }`}
                >
                  <FilePen size={14} /> Doc Editor
                </button>
                <button
                  onClick={() => navigate("/admin")}
                  className={`text-xs font-semibold uppercase tracking-widest transition-all duration-200 flex items-center gap-1.5 ${
                    isActivePath("/admin")
                      ? "text-white"
                      : "text-brand-muted hover:text-white"
                  }`}
                >
                  <ShieldCheck size={14} /> Admin
                </button>
              </>
            )}

            <div className="h-6 w-[1px] bg-brand-border mx-2" />

            {user ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-white text-[10px] font-bold leading-none uppercase tracking-tighter">
                      {user.displayName}
                    </span>
                    {user.isAdmin && (
                      <span className="text-[8px] font-bold uppercase tracking-widest bg-white/10 text-white border border-white/20 px-1.5 py-0.5 rounded-full leading-none">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[8px] text-brand-muted hover:text-red-400 uppercase tracking-widest font-bold transition-colors"
                  >
                    Logout
                  </button>
                </div>
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${user.displayName}&background=18181b&color=ffffff`
                  }
                  alt="User avatar"
                  className="w-8 h-8 rounded-full border border-brand-border hover:border-white/40 transition-all p-0.5 bg-brand-card"
                />
              </div>
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

            {user?.isAdmin && (
              <>
                <div className="h-px bg-brand-border" />
                <button
                  onClick={() => {
                    navigate("/doceditor");
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left font-bold text-lg uppercase tracking-tighter text-white"
                >
                  <FilePen size={18} /> Doc Editor
                </button>
                <button
                  onClick={() => {
                    navigate("/admin");
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left font-bold text-lg uppercase tracking-tighter text-white"
                >
                  <ShieldCheck size={18} /> Admin
                </button>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-brand-border">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-brand-border">
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
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500/10 text-red-400 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Logout
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
