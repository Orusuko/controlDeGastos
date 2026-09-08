import { describe, expect, it } from "vitest";
import { adjacentView, classifySwipe, SWIPE_VIEWS } from "./swipeNav";

describe("classifySwipe", () => {
  it("ignora un toque corto", () => {
    expect(classifySwipe({ dx: 10, dy: 4 })).toEqual({ kind: "none" });
  });

  it("detecta desliz horizontal a la siguiente vista", () => {
    expect(classifySwipe({ dx: -80, dy: 12 })).toEqual({
      kind: "horizontal",
      direction: "next",
    });
  });

  it("detecta desliz horizontal a la vista anterior", () => {
    expect(classifySwipe({ dx: 90, dy: -8 })).toEqual({
      kind: "horizontal",
      direction: "prev",
    });
  });

  it("cede el gesto al scroll vertical", () => {
    expect(classifySwipe({ dx: 20, dy: 70 })).toEqual({ kind: "vertical" });
  });
});

describe("adjacentView", () => {
  it("avanza y no se sale del borde", () => {
    expect(adjacentView("dashboard", "next")).toBe("expenses");
    expect(adjacentView("settings", "next")).toBe("settings");
    expect(adjacentView("dashboard", "prev")).toBe("dashboard");
    expect(SWIPE_VIEWS).toContain("loans");
  });
});
