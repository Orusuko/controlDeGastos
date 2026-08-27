import { describe, expect, it } from "vitest";
import {
  BACKUP_ERRORS,
  BACKUP_FORMAT,
  backupFilename,
  backupSummary,
  parseBackupJson,
  serializeBackup,
} from "./backup";
import { DEFAULT_SETTINGS, PERSIST_NAME, PERSIST_VERSION } from "./persist";

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

describe("respaldo JSON", () => {
  it("hace roundtrip export → parse conservando tarjetas, fijos y meses", () => {
    const json = serializeBackup(LEGACY_V1, "2026-08-27T12:00:00.000Z");
    const parsed = parseBackupJson(json);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.cards.map((c) => c.name)).toEqual(["LikeU", "Nu"]);
    expect(parsed.data.fixed[0]?.name).toBe("Netflix");
    expect(parsed.data.installments[0]?.name).toBe("RTX4060");
    expect(parsed.data.settings.monthlySalary).toBe(10500);
    expect(parsed.data.settings.theme).toBe("system");
    const envelope = JSON.parse(json);
    expect(envelope.format).toBe(BACKUP_FORMAT);
    expect(envelope.persistName).toBe(PERSIST_NAME);
    expect(envelope.persistVersion).toBe(PERSIST_VERSION);
  });

  it("importa un JSON v1 antiguo (LikeU/Nu) con envelope de Zustand", () => {
    const raw = JSON.stringify({ state: LEGACY_V1, version: 1 });
    const parsed = parseBackupJson(raw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.cards.map((c) => c.name)).toEqual(["LikeU", "Nu"]);
    expect(parsed.data.fixed[0]?.amount).toBe(259);
    expect(parsed.data.installments[0]?.months).toBe(12);
    expect(parsed.data.settings.currency).toBe("MXN");
    expect(parsed.data.settings.fixedLayout).toBe("list");
  });

  it("importa el estado desnudo v1 (sin envelope)", () => {
    const parsed = parseBackupJson(JSON.stringify(LEGACY_V1));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.cards[1]?.name).toBe("Nu");
    expect(backupSummary(parsed.data)).toEqual({
      cards: 2,
      fixed: 1,
      installments: 1,
    });
  });

  it("rechaza JSON inválido o de otra forma y no inventa datos", () => {
    const badJson = parseBackupJson("{");
    expect(badJson.ok).toBe(false);
    if (!badJson.ok) expect(badJson.error).toBe(BACKUP_ERRORS.invalidJson);

    const other = parseBackupJson(JSON.stringify({ foo: 1 }));
    expect(other.ok).toBe(false);
    if (!other.ok) expect(other.error).toBe(BACKUP_ERRORS.invalidShape);

    expect(
      parseBackupJson(
        JSON.stringify({ cards: "nope", fixed: [], installments: [] })
      ).ok
    ).toBe(false);
    expect(
      parseBackupJson(JSON.stringify({ settings: DEFAULT_SETTINGS })).ok
    ).toBe(false);
  });

  it("acepta un respaldo vacío (arrays presentes)", () => {
    const parsed = parseBackupJson(
      JSON.stringify({ cards: [], fixed: [], installments: [] })
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.cards).toEqual([]);
    expect(parsed.data.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("nombra el archivo con la fecha local", () => {
    expect(backupFilename(new Date(2026, 7, 29))).toBe(
      "control-financiero-2026-08-29.json"
    );
  });
});
