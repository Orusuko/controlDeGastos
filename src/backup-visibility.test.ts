import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const settings = readFileSync(
  resolve(__dirname, "./pages/SettingsPage.tsx"),
  "utf8"
);
const panel = readFileSync(
  resolve(__dirname, "./components/BackupPanel.tsx"),
  "utf8"
);
const app = readFileSync(resolve(__dirname, "./App.tsx"), "utf8");
const dashboard = readFileSync(
  resolve(__dirname, "./pages/Dashboard.tsx"),
  "utf8"
);
const persist = readFileSync(resolve(__dirname, "./store/persist.ts"), "utf8");
const gradle = readFileSync(
  resolve(__dirname, "../android/app/build.gradle"),
  "utf8"
);

describe("exportar e importar respaldo visibles", () => {
  it("Ajustes muestra Exportar e Importar antes de Apariencia y de borrar datos", () => {
    expect(settings.indexOf("<BackupPanel")).toBeGreaterThanOrEqual(0);
    expect(settings.indexOf("<BackupPanel")).toBeLessThan(
      settings.indexOf("Apariencia")
    );
    expect(settings.indexOf("<BackupPanel")).toBeLessThan(
      settings.indexOf("Borrar todos los datos")
    );
    expect(panel).toMatch(/Exportar respaldo/);
    expect(panel).toMatch(/Importar respaldo/);
    expect(panel).toMatch(/Copiar JSON/);
    expect(panel).toMatch(/Archivo listo/);
  });

  it("hay acceso Respaldo en el header y Exportar en el Dashboard", () => {
    expect(app).toMatch(/className="app__header-backup"/);
    expect(app).toMatch(/>\s*Respaldo\s*</);
    expect(dashboard).toMatch(/Exportar respaldo/);
    expect(dashboard).toMatch(/onNavigate\("settings"\)/);
  });

  it("no cambia la clave de persistencia ni el applicationId", () => {
    expect(persist).toMatch(
      /export const PERSIST_NAME = "control-financiero:v1"/
    );
    expect(gradle).toContain('applicationId "com.controlfinanciero.app"');
    expect(gradle).toMatch(/versionName "1\.6\.0"/);
    expect(gradle).toMatch(/versionCode 20260831/);
  });
});
