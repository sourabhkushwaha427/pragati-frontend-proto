import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import history from "connect-history-api-fallback";
import type { Connect } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "spa-fallback",
      configureServer(server) {
        const connectMiddleware = history({
          index: "/index.html",
          disableDotRule: true,
          htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
        }) as unknown as Connect.NextHandleFunction; // 👈 type cast fix

        server.middlewares.use(connectMiddleware);
      },
    },
  ],
});
