import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __API_BASE_URL__: JSON.stringify('http://localhost:5297'),
    __WEB_SOCKET_URL__: JSON.stringify('ws://localhost:5297'),
  },
});