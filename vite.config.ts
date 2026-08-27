import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// En desarrollo la app se sirve en la raíz ("/"). En producción (build y
// preview) se sirve bajo el subpath del repositorio para GitHub Pages
// (https://<usuario>.github.io/controlDeGastos/). En el modo "capacitor" se
// genera un build aparte (dist-android) con rutas relativas, ya que la app
// nativa de Android sirve los assets desde la raíz del propio paquete.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base:
    mode === "capacitor" ? "./" : mode === "production" ? "/controlDeGastos/" : "/",
  build: {
    outDir: mode === "capacitor" ? "dist-android" : "dist",
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
}));
