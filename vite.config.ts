import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo la app se sirve en la raíz ("/").
// En el build de GitHub Pages se usa el subpath del repositorio.
// En el build de Android (Capacitor) los assets se cargan desde el WebView
// nativo, así que el base debe ser "/".
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base:
    mode === "android"
      ? "/"
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
