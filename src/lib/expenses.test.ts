import { describe, expect, it } from "vitest";
import { expensesInMonth, expensesTotal, uniqueExpenseMonths } from "./expenses";
import type { Expense } from "../types";

const items: Expense[] = [
  {
    id: "e1",
    name: "Tacos",
    amount: 120,
    category: "Comida",
    date: "2026-09-07",
  },
  {
    id: "e2",
    name: "Uber",
    amount: 80,
    category: "Transporte",
    date: "2026-08-30",
  },
];

describe("gastos del mes", () => {
  it("filtra por YYYY-MM y suma", () => {
    const sept = expensesInMonth(items, "2026-09");
    expect(sept.map((e) => e.name)).toEqual(["Tacos"]);
    expect(expensesTotal(sept)).toBe(120);
    expect(expensesTotal(items)).toBe(200);
  });

  it("lista meses únicos descendente e incluye el mes extra", () => {
    expect(uniqueExpenseMonths(items, "2026-09")).toEqual([
      "2026-09",
      "2026-08",
    ]);
    expect(uniqueExpenseMonths(items)).toEqual(["2026-09", "2026-08"]);
  });
});
