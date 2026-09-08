import { describe, expect, it } from "vitest";
import {
  canRegisterLoanPayment,
  loanPartyRemaining,
  loanRemaining,
  loanTotal,
} from "./loans";
import type { Loan } from "../types";

const loan: Loan = {
  id: "l1",
  title: "Renta",
  direction: "en_contra",
  createdAt: "2026-09-01T00:00:00.000Z",
  parties: [
    { id: "p1", name: "Ana", shareAmount: 2000 },
    { id: "p2", name: "Beto", shareAmount: 1000 },
  ],
  payments: [
    {
      id: "pay1",
      partyId: "p1",
      amount: 500,
      paidAt: "2026-09-02T00:00:00.000Z",
    },
  ],
};

describe("saldos de préstamo", () => {
  it("suma partes y resta abonos por persona", () => {
    expect(loanTotal(loan)).toBe(3000);
    expect(loanPartyRemaining(loan, "p1")).toBe(1500);
    expect(loanPartyRemaining(loan, "p2")).toBe(1000);
    expect(loanRemaining(loan)).toBe(2500);
  });

  it("rechaza un abono mayor al restante de esa persona", () => {
    expect(canRegisterLoanPayment(loan, "p1", 1500)).toBe(true);
    expect(canRegisterLoanPayment(loan, "p1", 1500.01)).toBe(false);
    expect(canRegisterLoanPayment(loan, "p2", 0)).toBe(false);
  });
});
