import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// - Desarrollo: raíz "/".
// - GitHub Pages: subpath "/controlDeGastos/".
// - Android (Capacitor): rutas relativas "./" para cargar assets desde el WebView.
export default defineConfig(({ mode, command }) => ({
  plugins: [react()],
  base:
    process.env.CAPACITOR === "1"
      ? "./"
      : command === "build" && mode === "production"
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
