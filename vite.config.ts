import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // The Electron production window loads dist/index.html via file://.
  // Relative asset URLs are required there; the dev server still serves
  // them normally from the project root.
  base: "./",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },
});