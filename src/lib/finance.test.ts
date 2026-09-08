import { describe, expect, it } from "vitest";
import { cardBreakdowns, computeTotals, monthPieSlices } from "./finance";
import type { Card, Expense, FixedExpense, Loan } from "../types";

const fixed: FixedExpense[] = [
  { id: "f1", name: "VPN", amount: 100, category: "Otros", cardId: "c1" },
];
const expenses: Expense[] = [
  {
    id: "e1",
    name: "Taxi",
    amount: 80,
    category: "Otros",
    date: "2026-09-08",
    cardId: "c1",
  },
  { id: "e2", name: "Viejo", amount: 50, category: "Comida", date: "2026-08-01" },
];
const cards: Card[] = [{ id: "c1", name: "Nu", color: "#0ea5e9" }];
const loans: Loan[] = [
  {
    id: "l1",
    title: "Xbox",
    direction: "a_favor",
    createdAt: "2026-09-08T00:00:00.000Z",
    parties: [{ id: "p1", name: "Tienda", shareAmount: 10000 }],
    payments: [
      {
        id: "pay",
        partyId: "p1",
        amount: 2000,
        paidAt: "2026-09-08T12:00:00.000Z",
      },
    ],
  },
  {
    id: "l2",
    title: "Renta",
    direction: "en_contra",
    createdAt: "2026-09-01T00:00:00.000Z",
    parties: [{ id: "p2", name: "Beto", shareAmount: 3000 }],
    payments: [],
  },
];

describe("computeTotals", () => {
  it("mete gastos del mes actual en totals.total y totals.expenses", () => {
    const totals = computeTotals(fixed, [], expenses, [], "2026-09");
    expect(totals.expenses).toBe(80);
    expect(totals.total).toBe(180);
  });

  it("expone loanOwed y loanReceivable", () => {
    const totals = computeTotals([], [], [], loans, "2026-09");
    expect(totals.loanOwed).toBe(8000);
    expect(totals.loanReceivable).toBe(3000);
  });
});

describe("monthPieSlices", () => {
  it("separa Otros fijo y Otros gasto con keys distintas", () => {
    const slices = monthPieSlices(fixed, expenses, 0, "2026-09");
    const keys = slices.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain("fixed:Otros");
    expect(keys).toContain("expense:Otros");
  });
});

describe("cardBreakdowns", () => {
  it("incluye gastos variables con cardId en la barra de la tarjeta", () => {
    const bars = cardBreakdowns(cards, fixed, [], expenses, "2026-09");
    expect(bars[0].expenses).toBe(80);
    expect(bars[0].total).toBe(180);
  });
});
