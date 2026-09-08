import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LoanPaymentModal } from "./LoanPaymentModal";
import type { Loan, LoanParty, Settings } from "../types";

afterEach(() => cleanup());

const settings: Settings = {
  monthlySalary: 0,
  currency: "MXN",
  locale: "es-MX",
};

const party: LoanParty = { id: "p1", name: "Tienda", shareAmount: 10000 };

const loan: Loan = {
  id: "l1",
  title: "Xbox",
  direction: "a_favor",
  createdAt: "2026-09-08T00:00:00.000Z",
  parties: [party],
  payments: [],
};

describe("LoanPaymentModal", () => {
  it("abre con el importe vacío, no con el restante", () => {
    render(
      <LoanPaymentModal
        loan={loan}
        party={party}
        settings={settings}
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    const input = screen.getByLabelText("Importe del abono") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("chips de mitad y restante y preview del saldo", () => {
    render(
      <LoanPaymentModal
        loan={loan}
        party={party}
        settings={settings}
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "La mitad" }));
    expect(
      (screen.getByLabelText("Importe del abono") as HTMLInputElement).value
    ).toBe("5000");
    expect(screen.getByText(/Después restan/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Todo el restante" }));
    expect(
      (screen.getByLabelText("Importe del abono") as HTMLInputElement).value
    ).toBe("10000");
  });
});
