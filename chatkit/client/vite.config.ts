import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_ENDPOINT;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": backend,
        "/auth": backend,
        "/hermes": {
          target: backend,
          ws: true,
        },
        "/socket.io": {
          target: backend,
          ws: true,
        },
      },
    },
  };
});