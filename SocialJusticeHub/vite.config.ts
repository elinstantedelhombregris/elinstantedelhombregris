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
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          const nodeModulesSegment = "/node_modules/";
          const nodeModulesIndex = normalizedId.lastIndexOf(nodeModulesSegment);

          if (nodeModulesIndex === -1) return undefined;

          const packagePath = normalizedId.slice(nodeModulesIndex + nodeModulesSegment.length);
          const segments = packagePath.split("/");
          const packageName = segments[0]?.startsWith("@")
            ? `${segments[0]}/${segments[1] || ""}`
            : segments[0];

          if (!packageName) return "vendor-misc";

          if (packageName === "@react-three/fiber" || packageName === "@react-three/drei" || packageName === "three" || packageName === "@types/three") {
            return "vendor-3d";
          }
          if (packageName === "recharts" || packageName.startsWith("d3")) {
            return "vendor-charts";
          }
          if (packageName.startsWith("@radix-ui/")) {
            return "vendor-radix";
          }
          if (packageName === "framer-motion" || packageName === "motion") {
            return "vendor-motion";
          }
          if (packageName === "@xenova/transformers") {
            return "vendor-nlp";
          }
          if (packageName === "lucide-react" || packageName === "react-icons") {
            return "vendor-icons";
          }
          if (packageName === "react" || packageName === "react-dom" || packageName === "scheduler" || packageName === "use-sync-external-store") {
            return "vendor-react-core";
          }
          if (packageName === "@tanstack/react-query" || packageName === "wouter") {
            return "vendor-react-data";
          }
          return "vendor-misc";
        },
      },
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
