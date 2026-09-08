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

  it("pide fecha y hora del abono y las envía al guardar", () => {
    let saved: {
      amount: number;
      paidDate: string;
      paidTime: string;
      note?: string;
    } | null = null;
    render(
      <LoanPaymentModal
        loan={loan}
        party={party}
        settings={settings}
        onClose={() => {}}
        onSave={(data) => {
          saved = data;
        }}
      />
    );
    const date = screen.getByLabelText("Fecha de la transferencia") as HTMLInputElement;
    const time = screen.getByLabelText("Hora de la transferencia") as HTMLInputElement;
    expect(date.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(time.value).toMatch(/^\d{2}:\d{2}/);
    fireEvent.change(screen.getByLabelText("Importe del abono"), {
      target: { value: "2000" },
    });
    fireEvent.change(date, { target: { value: "2026-09-08" } });
    fireEvent.change(time, { target: { value: "14:30" } });
    fireEvent.submit(
      screen.getByRole("button", { name: "Registrar abono" }).closest("form")!
    );
    expect(saved).toEqual({
      amount: 2000,
      paidDate: "2026-09-08",
      paidTime: "14:30",
      note: undefined,
    });
  });
});
