import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { directionLabel, LoanItem } from "./LoanItem";
import type { Loan, Settings } from "../types";

afterEach(() => cleanup());

const settings: Settings = {
  monthlySalary: 0,
  currency: "MXN",
  locale: "es-MX",
};

const loan: Loan = {
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
};

describe("directionLabel", () => {
  it("usa Yo debo / Me deben como etiqueta principal", () => {
    expect(directionLabel("a_favor")).toEqual({
      badge: "Yo debo",
      hint: "A favor",
    });
    expect(directionLabel("en_contra")).toEqual({
      badge: "Me deben",
      hint: "En contra",
    });
  });
});

describe("LoanItem", () => {
  it("muestra llevo y resta, no solo el sobrante del total", () => {
    render(
      <LoanItem
        loan={loan}
        settings={settings}
        onOpen={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText(/Llevas/)).toBeTruthy();
    expect(screen.getByText(/restan/)).toBeTruthy();
  });
});
