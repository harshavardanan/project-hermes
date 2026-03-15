import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/sdk"],
      outDir: "dist",
      rollupTypes: true,
      tsconfigPath: "./tsconfig.lib.json",
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/sdk/core/HermesClient.ts"),
        react: resolve(__dirname, "src/sdk/react.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        preserveModules: false,
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
  },
});
