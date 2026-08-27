import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  PERSIST_NAME,
  PERSIST_VERSION,
  mergePersistedState,
  migratePersistedState,
  normalizeSettings,
  type PersistedSlice,
} from "./persist";

const LEGACY_V1 = {
  cards: [
    { id: "c1", name: "LikeU", color: "#6366f1" },
    { id: "c2", name: "Nu", color: "#0ea5e9" },
  ],
  fixed: [
    {
      id: "f1",
      name: "Netflix",
      amount: 259,
      category: "Streaming" as const,
      cardId: "c2",
    },
  ],
  installments: [
    {
      id: "i1",
      name: "RTX4060",
      totalAmount: 12000,
      months: 12,
      cardId: "c1",
      startMonth: "2026-01",
      payments: [],
    },
  ],
  settings: {
    monthlySalary: 10500,
    currency: "MXN",
    locale: "es-MX",
  },
};

describe("persistencia local", () => {
  it("mantiene la clave de localStorage para no perder datos al actualizar el APK", () => {
    expect(PERSIST_NAME).toBe("control-financiero:v1");
    expect(PERSIST_VERSION).toBe(2);
  });

  it("rellena settings nuevos sin tocar sueldo ni moneda de un JSON v1", () => {
    const settings = normalizeSettings(LEGACY_V1.settings);
    expect(settings.monthlySalary).toBe(10500);
    expect(settings.currency).toBe("MXN");
    expect(settings.locale).toBe("es-MX");
    expect(settings.theme).toBe("system");
    expect(settings.fixedLayout).toBe("list");
    expect(settings.installmentLayout).toBe("list");
    expect(settings.fixedSort).toBe("name");
    expect(settings.installmentSort).toBe("remaining");
    expect(settings.fixedSortDir).toBe("asc");
    expect(settings.installmentSortDir).toBe("desc");
  });

  it("migra un snapshot v1 conservando tarjetas, fijos y mensualidades", () => {
    const next = migratePersistedState(LEGACY_V1, 1);
    expect(next.cards).toEqual(LEGACY_V1.cards);
    expect(next.fixed).toEqual(LEGACY_V1.fixed);
    expect(next.installments).toEqual(LEGACY_V1.installments);
    expect(next.settings.monthlySalary).toBe(10500);
    expect(next.settings.theme).toBe("system");
  });

  it("no descarta arrays si settings viene incompleto o ausente", () => {
    const next = migratePersistedState(
      { cards: LEGACY_V1.cards, fixed: LEGACY_V1.fixed, installments: LEGACY_V1.installments },
      0
    );
    expect(next.cards).toHaveLength(2);
    expect(next.fixed).toHaveLength(1);
    expect(next.installments).toHaveLength(1);
    expect(next.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("hace merge anidado de settings sobre el estado vivo", () => {
    const current: PersistedSlice = {
      cards: [],
      fixed: [],
      installments: [],
      settings: DEFAULT_SETTINGS,
    };
    const merged = mergePersistedState(LEGACY_V1, current);
    expect(merged.cards[0].name).toBe("LikeU");
    expect(merged.fixed[0].name).toBe("Netflix");
    expect(merged.installments[0].name).toBe("RTX4060");
    expect(merged.settings.theme).toBe("system");
    expect(merged.settings.monthlySalary).toBe(10500);
    expect(merged.settings.fixedSortDir).toBe("asc");
    expect(merged.settings.installmentSortDir).toBe("desc");
  });
});
