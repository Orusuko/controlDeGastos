import { describe, expect, it } from "vitest";
import {
  currentDate,
  currentMonth,
  currentTime,
  formatMonth,
  formatPaymentWhen,
  isValidPaidDate,
  isValidPaidTime,
  localDateTimeToIso,
} from "./format";

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

describe("hora local HH:mm", () => {
  it("no usa UTC", () => {
    expect(currentTime(new Date(2026, 8, 8, 14, 5))).toBe("14:05");
  });
});

describe("fecha y hora de un abono", () => {
  it("arma ISO desde YYYY-MM-DD y HH:mm del reloj local", () => {
    const iso = localDateTimeToIso("2026-09-08", "14:30");
    const d = new Date(iso);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8);
    expect(d.getDate()).toBe(8);
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
  });

  it("acepta solo fecha YYYY-MM-DD y hora HH:mm", () => {
    expect(isValidPaidDate("2026-09-08")).toBe(true);
    expect(isValidPaidDate("08/09/2026")).toBe(false);
    expect(isValidPaidTime("14:30")).toBe(true);
    expect(isValidPaidTime("2:30pm")).toBe(false);
  });

  it("muestra fecha y hora para cotejar el banco, no un ISO crudo", () => {
    const label = formatPaymentWhen(
      {
        paidDate: "2026-09-08",
        paidTime: "14:30",
        paidAt: localDateTimeToIso("2026-09-08", "14:30"),
      },
      "es-MX"
    );
    expect(label).toMatch(/2026/);
    expect(label).toMatch(/14:30/);
    expect(label).not.toMatch(/T14:30/);
  });
});
