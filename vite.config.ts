import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// `npm run dev:phone` serves over HTTPS (self-signed) so phone cameras and
// installable-app features work on your local network.
// BASE_PATH is set by the GitHub Pages workflow (.github/workflows/deploy.yml),
// because the demo is served from https://<user>.github.io/<repo>/.
export default defineConfig(({ mode }) => ({
  base: process.env.BASE_PATH || "/",
  plugins: [react(), ...(mode === "phone" ? [basicSsl()] : [])],
}));
