import { describe, expect, it } from "vitest";
import {
  AUTO_BACKUP_FILENAME,
  AUTO_BACKUP_FOLDER,
  AUTO_BACKUP_LABEL_DOCUMENTS,
  AUTO_BACKUP_RELATIVE,
  hasLocalFinanceData,
  shouldOfferRestore,
  shouldPromptBackupSetup,
  shouldWriteAutoBackup,
} from "./autoBackup";
import { DEFAULT_SETTINGS } from "../store/persist";

describe("ruta de respaldo automático", () => {
  it("usa un archivo fijo en Documentos/ControlFinanciero", () => {
    expect(AUTO_BACKUP_FOLDER).toBe("ControlFinanciero");
    expect(AUTO_BACKUP_FILENAME).toBe("control-financiero.json");
    expect(AUTO_BACKUP_RELATIVE).toBe(
      "ControlFinanciero/control-financiero.json"
    );
    expect(AUTO_BACKUP_LABEL_DOCUMENTS).toMatch(/Documentos/);
  });
});

describe("wizard al inicio", () => {
  it("pide la ruta si aún no se configuró", () => {
    expect(shouldPromptBackupSetup({})).toBe(true);
    expect(shouldPromptBackupSetup({ autoBackupSetupDone: false })).toBe(true);
    expect(shouldPromptBackupSetup({ autoBackupSetupDone: true })).toBe(false);
  });

  it("ofrece restaurar solo si el teléfono está vacío y hay JSON", () => {
    expect(
      shouldOfferRestore({ hasLocalData: false, hasBackupFile: true })
    ).toBe(true);
    expect(
      shouldOfferRestore({ hasLocalData: true, hasBackupFile: true })
    ).toBe(false);
    expect(
      shouldOfferRestore({ hasLocalData: false, hasBackupFile: false })
    ).toBe(false);
  });

  it("detecta datos locales reales, no un store vacío", () => {
    expect(
      hasLocalFinanceData({
        cards: [],
        fixed: [],
        installments: [],
        expenses: [],
        loans: [],
        settings: DEFAULT_SETTINGS,
      })
    ).toBe(false);
    expect(
      hasLocalFinanceData({
        cards: [],
        fixed: [],
        installments: [],
        expenses: [{ id: "e", name: "Tacos", amount: 1, category: "Comida", date: "2026-09-08" }],
        loans: [],
        settings: DEFAULT_SETTINGS,
      })
    ).toBe(true);
  });

  it("no escribe el JSON automático si el teléfono está vacío", () => {
    expect(
      shouldWriteAutoBackup({
        cards: [],
        fixed: [],
        installments: [],
        expenses: [],
        loans: [],
        settings: DEFAULT_SETTINGS,
      })
    ).toBe(false);
    expect(
      shouldWriteAutoBackup({
        cards: [],
        fixed: [],
        installments: [],
        expenses: [{ id: "e", name: "Tacos", amount: 1, category: "Comida", date: "2026-09-08" }],
        loans: [],
        settings: DEFAULT_SETTINGS,
      })
    ).toBe(true);
  });
});
