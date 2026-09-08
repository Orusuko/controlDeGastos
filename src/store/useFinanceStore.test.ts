import { beforeEach, describe, expect, it } from "vitest";
import { loanPaid, loanRemaining } from "../lib/loans";
import { useFinanceStore } from "./useFinanceStore";

beforeEach(() => {
  useFinanceStore.getState().resetAll();
});

describe("abonos de préstamo en el store", () => {
  it("Xbox 10k con abono 2k deja restante 8k y pagado 2k", () => {
    const { addLoan, registerLoanPayment } = useFinanceStore.getState();
    addLoan({
      title: "Xbox",
      direction: "a_favor",
      parties: [{ id: "p1", name: "Tienda", shareAmount: 10000 }],
    });
    const loan = useFinanceStore.getState().loans[0];
    registerLoanPayment(loan.id, {
      partyId: loan.parties[0].id,
      amount: 2000,
      paidAt: "2026-09-08T12:00:00.000Z",
    });
    const updated = useFinanceStore.getState().loans[0];
    expect(loanPaid(updated)).toBe(2000);
    expect(loanRemaining(updated)).toBe(8000);
  });

  it("rechaza en silencio un abono mayor al restante", () => {
    const { addLoan, registerLoanPayment } = useFinanceStore.getState();
    addLoan({
      title: "Xbox",
      direction: "a_favor",
      parties: [{ id: "p1", name: "Tienda", shareAmount: 10000 }],
    });
    const loan = useFinanceStore.getState().loans[0];
    registerLoanPayment(loan.id, {
      partyId: loan.parties[0].id,
      amount: 10001,
      paidAt: "2026-09-08T12:00:00.000Z",
    });
    const updated = useFinanceStore.getState().loans[0];
    expect(updated.payments).toHaveLength(0);
    expect(loanPaid(updated)).toBe(0);
    expect(loanRemaining(updated)).toBe(10000);
  });

  it("al editar y quitar una persona, borra sus abonos", () => {
    const { addLoan, updateLoan, registerLoanPayment } =
      useFinanceStore.getState();
    addLoan({
      title: "Renta",
      direction: "en_contra",
      parties: [
        { id: "p1", name: "Ana", shareAmount: 2000 },
        { id: "p2", name: "Beto", shareAmount: 1000 },
      ],
    });
    const loan = useFinanceStore.getState().loans[0];
    registerLoanPayment(loan.id, {
      partyId: "p1",
      amount: 500,
      paidAt: "2026-09-02T00:00:00.000Z",
    });
    updateLoan(loan.id, {
      parties: [{ id: "p2", name: "Beto", shareAmount: 1000 }],
    });
    const updated = useFinanceStore.getState().loans[0];
    expect(updated.payments).toHaveLength(0);
    expect(loanPaid(updated)).toBe(0);
    expect(loanRemaining(updated)).toBe(1000);
  });
});
