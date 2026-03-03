import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      // Fix for Vite React plugin preamble detection
      // Remove jsxRuntime and babel config to use defaults
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      // Force single instance of scheduler and react-reconciler
      "scheduler": path.resolve(import.meta.dirname, "node_modules", "scheduler"),
      "react-reconciler": path.resolve(import.meta.dirname, "node_modules", "react-reconciler"),
    },
    dedupe: ["react", "react-dom", "use-sync-external-store"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "scheduler",
      "react-reconciler",
      "wouter",
      "use-sync-external-store",
      "use-sync-external-store/shim",
    ],
    force: true, // Force re-optimization
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
