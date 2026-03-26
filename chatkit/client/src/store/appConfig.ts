import { create } from "zustand";

interface AppConfig {
  appName: string;
  appTagline: string;
  appVersion: string;
  supportEmail: string;
  docsUrl: string;
  githubUrl: string;
  endpoint: string;
  getApiUrl: (path: string) => string;
}

export const useAppConfig = create<AppConfig>(() => ({
  appName: "Project Hermes",
  appTagline: "Real-time infrastructure that just works.",
  appVersion: "1.0.0",
  supportEmail: "support@antigravity.dev",
  docsUrl: "https://docs.hermes.dev",
  githubUrl: "https://github.com/antigravity/hermes",
  endpoint: import.meta.env.VITE_SERVER_ENDPOINT,
  getApiUrl: (path: string) => {
    const base = (import.meta.env.VITE_SERVER_ENDPOINT || "").replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${cleanPath}`;
  },
}));
