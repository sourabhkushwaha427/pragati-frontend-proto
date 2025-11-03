import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import history from "connect-history-api-fallback";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 👇 Add custom middleware to handle SPA routing
    {
      name: "spa-fallback",
      configureServer(server) {
        server.middlewares.use(
          history({
            index: "/index.html",
            disableDotRule: true,
            htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
          })
        );
      },
    },
  ],
});
