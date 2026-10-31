import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // In dev, forward API calls to the Express server so cookies stay same-origin.
    proxy: { "/api": "http://localhost:8800" },
  },
});
