import { describe, expect, it } from "vitest";
import { sortExpenses, sortFixed, sortInstallments, sortLoans } from "./sort";
import type { Expense, FixedExpense, Installment, Loan } from "../types";

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
  {
    id: "c",
    name: "Auriculares",
    totalAmount: 2400,
    months: 6,
    cardId: "c",
    startMonth: "2026-07",
    payments: [],
  },
];

describe("ordenamiento", () => {
  it("ordena fijos por importe descendente (más caras)", () => {
    expect(sortFixed(fixed, "amount", "desc").map((f) => f.name)).toEqual([
      "Gym",
      "Spotify",
      "iCloud",
    ]);
  });

  it("ordena fijos por importe ascendente (más baratas)", () => {
    expect(sortFixed(fixed, "amount", "asc").map((f) => f.name)).toEqual([
      "iCloud",
      "Spotify",
      "Gym",
    ]);
  });

  it("ordena fijos por nombre A→Z y Z→A", () => {
    expect(sortFixed(fixed, "name", "asc").map((f) => f.name)).toEqual([
      "Gym",
      "iCloud",
      "Spotify",
    ]);
    expect(sortFixed(fixed, "name", "desc").map((f) => f.name)).toEqual([
      "Spotify",
      "iCloud",
      "Gym",
    ]);
  });

  it("ordena fijos por categoría", () => {
    expect(sortFixed(fixed, "category", "asc").map((f) => f.category)).toEqual([
      "Membresías",
      "Software",
      "Streaming",
    ]);
  });

  it("ordena mensualidades por meses restantes (más tiempo primero)", () => {
    expect(
      sortInstallments(installments, "remaining", "desc").map((i) => i.name)
    ).toEqual(["RTX4060", "Auriculares", "PowerBank"]);
  });

  it("ordena mensualidades por meses restantes (casi acaban primero)", () => {
    expect(
      sortInstallments(installments, "remaining", "asc").map((i) => i.name)
    ).toEqual(["PowerBank", "Auriculares", "RTX4060"]);
  });

  it("ordena mensualidades por pendiente más baratas vs más caras", () => {
    expect(
      sortInstallments(installments, "amount", "asc").map((i) => i.name)
    ).toEqual(["PowerBank", "Auriculares", "RTX4060"]);
    expect(
      sortInstallments(installments, "amount", "desc").map((i) => i.name)
    ).toEqual(["RTX4060", "Auriculares", "PowerBank"]);
  });

  it("ordena mensualidades por nombre A→Z y Z→A", () => {
    expect(
      sortInstallments(installments, "name", "asc").map((i) => i.name)
    ).toEqual(["Auriculares", "PowerBank", "RTX4060"]);
    expect(
      sortInstallments(installments, "name", "desc").map((i) => i.name)
    ).toEqual(["RTX4060", "PowerBank", "Auriculares"]);
  });

  it("ordena gastos por fecha más reciente primero", () => {
    const expenses: Expense[] = [
      { id: "1", name: "Tacos", amount: 80, category: "Comida", date: "2026-09-01" },
      { id: "2", name: "Uber", amount: 40, category: "Transporte", date: "2026-09-08" },
      { id: "3", name: "Farmacia", amount: 200, category: "Salud", date: "2026-09-05" },
    ];
    expect(sortExpenses(expenses, "date", "desc").map((e) => e.name)).toEqual([
      "Uber",
      "Farmacia",
      "Tacos",
    ]);
  });

  it("ordena préstamos por saldo restante", () => {
    const loans: Loan[] = [
      {
        id: "a",
        title: "Ana",
        direction: "en_contra",
        createdAt: "x",
        parties: [{ id: "p1", name: "Ana", shareAmount: 500 }],
        payments: [],
      },
      {
        id: "b",
        title: "Beto",
        direction: "a_favor",
        createdAt: "x",
        parties: [{ id: "p2", name: "Beto", shareAmount: 2000 }],
        payments: [],
      },
    ];
    expect(sortLoans(loans, "remaining", "desc").map((l) => l.title)).toEqual([
      "Beto",
      "Ana",
    ]);
  });

  it("sin dirección usa el default previo (fijos A→Z, meses más tiempo)", () => {
    expect(sortFixed(fixed, "amount").map((f) => f.name)).toEqual([
      "iCloud",
      "Spotify",
      "Gym",
    ]);
    expect(sortInstallments(installments, "remaining").map((i) => i.name)).toEqual(
      ["RTX4060", "Auriculares", "PowerBank"]
    );
  });
});
