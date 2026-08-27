import type { ThemePreference } from "../types";

export type ResolvedTheme = "light" | "dark";

export function resolveTheme(
  preference: ThemePreference | undefined,
  systemDark = false
): ResolvedTheme {
  if (preference === "light" || preference === "dark") return preference;
  return systemDark ? "dark" : "light";
}

/** Lee la preferencia guardada en el JSON de Zustand persist (antes de hidratar React). */
export function readStoredThemePreference(): ThemePreference | undefined {
  try {
    const raw = localStorage.getItem("control-financiero:v1");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as {
      state?: { settings?: { theme?: ThemePreference } };
    };
    const theme = parsed?.state?.settings?.theme;
    if (theme === "light" || theme === "dark" || theme === "system") return theme;
    return undefined;
  } catch {
    return undefined;
  }
}

export function applyResolvedTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#16123A" : "#241C6A");
  }
}
