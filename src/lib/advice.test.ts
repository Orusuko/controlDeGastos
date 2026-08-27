import { describe, expect, it } from "vitest";
import { generateAdvice } from "./advice";
import { computeTotals } from "./finance";
import type { FixedExpense, Installment, Settings } from "../types";

const settings: Settings = {
  monthlySalary: 20000,
  currency: "MXN",
  locale: "es-MX",
};

const fixed: FixedExpense[] = [
  { id: "f1", name: "Netflix", amount: 259, category: "Streaming", cardId: "c" },
  { id: "f2", name: "Gym", amount: 799, category: "Membresías", cardId: "c" },
];

const installments: Installment[] = [
  {
    id: "i1",
    name: "PowerBank",
    totalAmount: 1164,
    months: 4,
    cardId: "c",
    startMonth: "2026-08",
    payments: [],
  },
  {
    id: "i2",
    name: "RTX4060",
    totalAmount: 12000,
    months: 12,
    cardId: "c",
    startMonth: "2026-01",
    payments: [],
  },
];

describe("estrategias de ahorro", () => {
  it("nombra la mensualidad más corta y la más cara por mes", () => {
    const totals = computeTotals(fixed, installments);
    const advice = generateAdvice(settings, totals, fixed, installments);
    const titles = advice.map((a) => a.title);
    expect(titles.some((t) => t.includes("PowerBank"))).toBe(true);
    expect(titles.some((t) => t.includes("RTX4060"))).toBe(true);
    expect(advice.some((a) => a.kicker?.includes("bola de nieve"))).toBe(true);
    expect(advice.some((a) => a.kicker?.includes("interés implícito"))).toBe(
      true
    );
  });

  it("avisa si las mensualidades superan el 30% del sueldo", () => {
    const heavy: Installment[] = [
      {
        id: "i3",
        name: "Laptop",
        totalAmount: 24000,
        months: 3,
        cardId: "c",
        startMonth: "2026-08",
        payments: [],
      },
    ];
    const totals = computeTotals([], heavy);
    const advice = generateAdvice(settings, totals, [], heavy);
    expect(
      advice.some((a) => a.title.includes("No asumas más compras a meses"))
    ).toBe(true);
  });

  it("pide el sueldo pero sigue dando plan con deudas reales", () => {
    const noSalary = { ...settings, monthlySalary: 0 };
    const totals = computeTotals(fixed, installments);
    const advice = generateAdvice(noSalary, totals, fixed, installments);
    expect(advice.length).toBeGreaterThan(1);
    expect(advice.some((a) => a.title.includes("sueldo"))).toBe(true);
    expect(advice.some((a) => a.title.includes("PowerBank"))).toBe(true);
  });

  it("nunca deja la sección vacía", () => {
    const emptySettings = { ...settings, monthlySalary: 0 };
    const advice = generateAdvice(
      emptySettings,
      { fixed: 0, installments: 0, total: 0, remainingDebt: 0 },
      [],
      []
    );
    expect(advice.length).toBeGreaterThan(0);
    expect(advice[0].text.length).toBeGreaterThan(20);
  });
});
