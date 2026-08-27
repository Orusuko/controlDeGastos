import { describe, expect, it } from "vitest";
import { resolveTheme } from "./theme";

describe("tema", () => {
  it("usa la preferencia guardada si el usuario ya eligió", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });

  it("respeta prefers-color-scheme si no hay elección (system o ausente)", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme(undefined, true)).toBe("dark");
    expect(resolveTheme(undefined, false)).toBe("light");
  });
});
