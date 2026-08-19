import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo la app se sirve en la raíz ("/"). En producción (build y
// preview) se sirve bajo el subpath del repositorio para GitHub Pages
// (https://<usuario>.github.io/controlDeGastos/).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? "/controlDeGastos/" : "/",
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
}));
