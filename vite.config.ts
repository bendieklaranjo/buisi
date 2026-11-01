import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// `npm run dev:phone` serves over HTTPS (self-signed) so phone cameras and
// installable-app features work on your local network.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === "phone" ? [basicSsl()] : [])],
  server: {
    // AI requests go to the local proxy (npm run ai) so your API key never reaches the browser.
    proxy: { "/api": "http://localhost:8787" },
  },
}));
