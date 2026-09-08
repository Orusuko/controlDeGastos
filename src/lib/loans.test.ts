import { describe, expect, it } from "vitest";
import {
  canRegisterLoanPayment,
  loanPartyRemaining,
  loanRemaining,
  loanTotal,
  normalizeLoanPayment,
  paymentReceipt,
  reconcileLoanPayments,
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

  it("elimina abonos de una persona que ya no está en el préstamo", () => {
    const parties = [{ id: "p2", name: "Beto", shareAmount: 1000 }];
    const payments = [
      {
        id: "pay1",
        partyId: "p1",
        amount: 500,
        paidAt: "2026-09-02T00:00:00.000Z",
      },
      {
        id: "pay2",
        partyId: "p2",
        amount: 100,
        paidAt: "2026-09-03T00:00:00.000Z",
      },
    ];
    expect(reconcileLoanPayments(parties, payments).map((p) => p.id)).toEqual([
      "pay2",
    ]);
  });

  it("tira los abonos más nuevos si el cupo de la persona baja", () => {
    const parties = [{ id: "p1", name: "Ana", shareAmount: 400 }];
    const payments = [
      { id: "a", partyId: "p1", amount: 300, paidAt: "2026-09-01T00:00:00.000Z" },
      { id: "b", partyId: "p1", amount: 200, paidAt: "2026-09-02T00:00:00.000Z" },
    ];
    expect(reconcileLoanPayments(parties, payments).map((p) => p.id)).toEqual([
      "a",
    ]);
  });
});

describe("respaldo de abono (fecha, hora, monto)", () => {
  it("guarda fecha, hora y monto locales para cotejar la transferencia", () => {
    const n = normalizeLoanPayment({
      partyId: "p1",
      amount: 2000,
      paidDate: "2026-09-08",
      paidTime: "14:30",
    });
    expect(n).not.toBeNull();
    expect(n?.amount).toBe(2000);
    expect(n?.paidDate).toBe("2026-09-08");
    expect(n?.paidTime).toBe("14:30");
    const when = new Date(n!.paidAt);
    expect(when.getHours()).toBe(14);
    expect(when.getMinutes()).toBe(30);
    expect(paymentReceipt(n!).amount).toBe(2000);
    expect(paymentReceipt(n!).date).toBe("2026-09-08");
    expect(paymentReceipt(n!).time).toBe("14:30");
  });

  it("completa fecha y hora si un JSON viejo solo trae paidAt", () => {
    const n = normalizeLoanPayment({
      partyId: "p1",
      amount: 500,
      paidAt: new Date(2026, 8, 8, 9, 15).toISOString(),
    });
    expect(n?.paidDate).toBe("2026-09-08");
    expect(n?.paidTime).toBe("09:15");
    expect(n?.amount).toBe(500);
  });

  it("rechaza un abono sin fecha u hora válidas", () => {
    expect(
      normalizeLoanPayment({
        partyId: "p1",
        amount: 2000,
        paidDate: "ayer",
        paidTime: "14:30",
      })
    ).toBeNull();
  });
});
