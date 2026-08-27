import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PERSIST_NAME } from "./persist";

const LEGACY_JSON = JSON.stringify({
  state: {
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
  },
  version: 1,
});

describe("hidratación del store desde JSON v1", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("hidrata tarjetas, fijos y mensualidades sin disparar resetAll", async () => {
    localStorage.setItem(PERSIST_NAME, LEGACY_JSON);

    const { useFinanceStore } = await import("./useFinanceStore");
    await useFinanceStore.persist.rehydrate();

    const state = useFinanceStore.getState();
    expect(state.cards.map((c) => c.name)).toEqual(["LikeU", "Nu"]);
    expect(state.fixed[0]?.name).toBe("Spotify");
    expect(state.fixed[0]?.amount).toBe(129);
    expect(state.installments[0]?.name).toBe("PowerBank TK");
    expect(state.installments[0]?.payments).toEqual([]);
    expect(state.settings.monthlySalary).toBe(10500);
    expect(state.settings.currency).toBe("MXN");
    expect(state.settings.theme).toBe("system");
    expect(state.settings.fixedLayout).toBe("list");
    expect(state.cards).toHaveLength(2);
  });

  it("sigue usando la misma clave de persistencia", async () => {
    const { PERSIST_NAME: name } = await import("./useFinanceStore");
    expect(name).toBe("control-financiero:v1");
  });
});
