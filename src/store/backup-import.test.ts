import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseBackupJson, serializeBackup } from "./backup";
import { PERSIST_NAME } from "./persist";

const LEGACY_V1 = {
  cards: [
    { id: "c1", name: "LikeU", color: "#6366f1" },
    { id: "c2", name: "Nu", color: "#0ea5e9" },
  ],
  fixed: [
    {
      id: "f1",
      name: "Spotify",
      amount: 129,
      category: "Streaming",
      cardId: "c2",
    },
  ],
  installments: [
    {
      id: "i1",
      name: "PowerBank TK",
      totalAmount: 1164,
      months: 4,
      cardId: "c1",
      startMonth: "2026-08",
      payments: [],
    },
  ],
  settings: {
    monthlySalary: 10500,
    currency: "MXN",
    locale: "es-MX",
  },
};

describe("importar respaldo en el store", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("hidrata LikeU/Nu desde un JSON v1 antiguo y reemplaza el estado", async () => {
    const { useFinanceStore } = await import("./useFinanceStore");
    await useFinanceStore.persist.rehydrate();
    useFinanceStore.getState().addCard("Temporal");
    expect(useFinanceStore.getState().cards.some((c) => c.name === "Temporal")).toBe(
      true
    );

    const parsed = parseBackupJson(JSON.stringify(LEGACY_V1));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    useFinanceStore.getState().importBackup(parsed.data);

    const state = useFinanceStore.getState();
    expect(state.cards.map((c) => c.name)).toEqual(["LikeU", "Nu"]);
    expect(state.fixed[0]?.name).toBe("Spotify");
    expect(state.installments[0]?.name).toBe("PowerBank TK");
    expect(state.settings.monthlySalary).toBe(10500);
    expect(state.settings.theme).toBe("system");
    expect(state.cards.some((c) => c.name === "Temporal")).toBe(false);
  });

  it("roundtrip export → reset → import restaura el slice persistido", async () => {
    const { useFinanceStore } = await import("./useFinanceStore");
    await useFinanceStore.persist.rehydrate();
    const parsedIn = parseBackupJson(JSON.stringify(LEGACY_V1));
    expect(parsedIn.ok).toBe(true);
    if (!parsedIn.ok) return;
    useFinanceStore.getState().importBackup(parsedIn.data);

    const json = serializeBackup({
      cards: useFinanceStore.getState().cards,
      fixed: useFinanceStore.getState().fixed,
      installments: useFinanceStore.getState().installments,
      expenses: useFinanceStore.getState().expenses,
      loans: useFinanceStore.getState().loans,
      settings: useFinanceStore.getState().settings,
    });
    useFinanceStore.getState().resetAll();
    expect(useFinanceStore.getState().cards).toHaveLength(0);

    const parsedOut = parseBackupJson(json);
    expect(parsedOut.ok).toBe(true);
    if (!parsedOut.ok) return;
    useFinanceStore.getState().importBackup(parsedOut.data);

    const state = useFinanceStore.getState();
    expect(state.cards.map((c) => c.name)).toEqual(["LikeU", "Nu"]);
    expect(state.fixed[0]?.amount).toBe(129);
    expect(state.installments[0]?.totalAmount).toBe(1164);
  });

  it("no borra datos si el JSON es inválido (no se llama importBackup)", async () => {
    const { useFinanceStore } = await import("./useFinanceStore");
    await useFinanceStore.persist.rehydrate();
    useFinanceStore.getState().addCard("LikeU", "#6366f1");
    const before = useFinanceStore.getState().cards.map((c) => c.name);

    const parsed = parseBackupJson("esto no es json {");
    expect(parsed.ok).toBe(false);
    if (parsed.ok) {
      useFinanceStore.getState().importBackup(parsed.data);
    }

    expect(useFinanceStore.getState().cards.map((c) => c.name)).toEqual(before);
    expect(PERSIST_NAME).toBe("control-financiero:v1");
  });

  it("conserva gastos y préstamos en el roundtrip de respaldo", async () => {
    const { useFinanceStore } = await import("./useFinanceStore");
    await useFinanceStore.persist.rehydrate();
    useFinanceStore.getState().addExpense({
      name: "Tacos",
      amount: 120,
      category: "Comida",
      date: "2026-09-07",
    });
    useFinanceStore.getState().addLoan({
      title: "Renta",
      direction: "en_contra",
      parties: [
        { id: "p1", name: "Ana", shareAmount: 2000 },
        { id: "p2", name: "Beto", shareAmount: 1000 },
      ],
    });
    const loanId = useFinanceStore.getState().loans[0]?.id;
    expect(loanId).toBeTruthy();
    useFinanceStore.getState().registerLoanPayment(loanId, {
      partyId: "p1",
      amount: 500,
      paidAt: "2026-09-08T00:00:00.000Z",
    });

    const json = serializeBackup({
      cards: useFinanceStore.getState().cards,
      fixed: useFinanceStore.getState().fixed,
      installments: useFinanceStore.getState().installments,
      expenses: useFinanceStore.getState().expenses,
      loans: useFinanceStore.getState().loans,
      settings: useFinanceStore.getState().settings,
    });
    useFinanceStore.getState().resetAll();
    expect(useFinanceStore.getState().expenses).toHaveLength(0);

    const parsed = parseBackupJson(json);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    useFinanceStore.getState().importBackup(parsed.data);

    const state = useFinanceStore.getState();
    expect(state.expenses[0]?.name).toBe("Tacos");
    expect(state.loans[0]?.title).toBe("Renta");
    expect(state.loans[0]?.payments).toHaveLength(1);
    expect(state.loans[0]?.payments[0]?.amount).toBe(500);
    expect(state.loans[0]?.payments[0]?.paidDate).toBeTruthy();
    expect(state.loans[0]?.payments[0]?.paidTime).toBeTruthy();
  });
});
