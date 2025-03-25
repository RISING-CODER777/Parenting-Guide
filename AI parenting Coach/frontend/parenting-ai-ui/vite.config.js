import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Buffer } from "buffer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
    Buffer: ["buffer", "Buffer"],
    "process.env": {},
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
});
