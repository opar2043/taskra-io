import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Routes are eagerly imported (no React.lazy), so the app chunk is larger by
    // design; vendor libs are still split via manualChunks below.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          query: ["@tanstack/react-query"],
          axios: ["axios"],
          firebase: ["firebase/app", "firebase/auth"],
          charts: ["recharts"],
          motion: ["framer-motion"],
          editor: ["react-quill-new"],
          pdf: ["jspdf", "html2canvas-pro"],
          calendar: ["react-big-calendar", "date-fns"],
          swiper: ["swiper"],
        },
      },
    },
  },
});
