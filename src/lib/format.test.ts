import { describe, expect, it } from "vitest";
import { currentDate, currentMonth, formatMonth } from "./format";

describe("currentMonth", () => {
  it("usa el calendario local, no UTC", () => {
    const local = new Date(2026, 7, 1, 0, 30);
    expect(currentMonth(local)).toBe("2026-08");
  });

  it("no se adelanta al mes UTC cerca de medianoche", () => {
    const lateEvening = new Date(2026, 7, 31, 22, 0);
    expect(currentMonth(lateEvening)).toBe("2026-08");
  });
});

describe("currentDate", () => {
  it("usa el calendario local YYYY-MM-DD", () => {
    expect(currentDate(new Date(2026, 8, 8, 23, 0))).toBe("2026-09-08");
  });
});

describe("formatMonth", () => {
  it("formatea un mes YYYY-MM en español corto", () => {
    expect(formatMonth("2026-08")).toMatch(/ago/i);
    expect(formatMonth("2026-08")).toMatch(/2026/);
  });
});
