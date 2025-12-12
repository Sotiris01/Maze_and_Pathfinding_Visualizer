import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // Base URL for GitHub Pages deployment (must match repository name)
  base: "/Maze_and_Pathfinding_Visualizer/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@algorithms": path.resolve(__dirname, "./src/algorithms"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // Use esbuild for minification (faster than terser, built-in)
    minify: "esbuild",
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks(id) {
          // Vendor chunk: React core (changes rarely, cached separately)
          if (id.includes("node_modules/react")) {
            return "vendor-react";
          }
          // Algorithms chunk: Group all pathfinding algorithms together
          if (id.includes("/algorithms/")) {
            return "algorithms";
          }
          // Statistics chunk: Lazy-loaded component
          if (id.includes("/Statistics/")) {
            return "statistics";
          }
        },
        // Optimize chunk file names for caching
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Increase chunk size warning limit (React apps are typically larger)
    chunkSizeWarningLimit: 500,
  },
  // Enable esbuild optimizations
  esbuild: {
    drop: ["console", "debugger"], // Remove console.log and debugger in production
  },
});
