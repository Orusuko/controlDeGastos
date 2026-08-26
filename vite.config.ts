import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Capacitor carga el build desde el sistema de archivos del dispositivo y
  // necesita rutas relativas. GitHub Pages conserva su subruta pública.
  base:
    mode === "android"
      ? "./"
      : mode === "production"
        ? "/controlDeGastos/"
        : "/",
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
}));
