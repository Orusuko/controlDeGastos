import { describe, expect, it } from "vitest";
import { sortFixed, sortInstallments } from "./sort";
import type { FixedExpense, Installment } from "../types";

const fixed: FixedExpense[] = [
  { id: "1", name: "Spotify", amount: 129, category: "Streaming", cardId: "c" },
  { id: "2", name: "Gym", amount: 499, category: "Membresías", cardId: "c" },
  { id: "3", name: "iCloud", amount: 29, category: "Software", cardId: "c" },
];

const installments: Installment[] = [
  {
    id: "a",
    name: "RTX4060",
    totalAmount: 12000,
    months: 12,
    cardId: "c",
    startMonth: "2026-01",
    payments: [{ month: "2026-01", amount: 1000, paidAt: "x" }],
  },
  {
    id: "b",
    name: "PowerBank",
    totalAmount: 1164,
    months: 4,
    cardId: "c",
    startMonth: "2026-08",
    payments: [],
  },
];

describe("ordenamiento", () => {
  it("ordena fijos por importe descendente", () => {
    expect(sortFixed(fixed, "amount").map((f) => f.name)).toEqual([
      "Gym",
      "Spotify",
      "iCloud",
    ]);
  });

  it("ordena fijos por categoría", () => {
    expect(sortFixed(fixed, "category").map((f) => f.category)).toEqual([
      "Membresías",
      "Software",
      "Streaming",
    ]);
  });

  it("ordena mensualidades por meses restantes (más pendientes primero)", () => {
    expect(sortInstallments(installments, "remaining").map((i) => i.name)).toEqual([
      "RTX4060",
      "PowerBank",
    ]);
  });
});
