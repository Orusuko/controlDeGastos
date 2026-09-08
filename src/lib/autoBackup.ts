import type { PersistedSlice } from "../store/persist";

export const AUTO_BACKUP_FOLDER = "ControlFinanciero";
export const AUTO_BACKUP_FILENAME = "control-financiero.json";
export const AUTO_BACKUP_RELATIVE = `${AUTO_BACKUP_FOLDER}/${AUTO_BACKUP_FILENAME}`;
export const AUTO_BACKUP_LABEL_DOCUMENTS = "Documentos/ControlFinanciero/";

export function shouldPromptBackupSetup(settings: {
  autoBackupSetupDone?: boolean;
}): boolean {
  return settings.autoBackupSetupDone !== true;
}

export function hasLocalFinanceData(
  slice: Pick<
    PersistedSlice,
    "cards" | "fixed" | "installments" | "expenses" | "loans" | "settings"
  >
): boolean {
  return (
    slice.cards.length > 0 ||
    slice.fixed.length > 0 ||
    slice.installments.length > 0 ||
    slice.expenses.length > 0 ||
    slice.loans.length > 0 ||
    (slice.settings.monthlySalary ?? 0) > 0
  );
}

export function shouldOfferRestore(input: {
  hasLocalData: boolean;
  hasBackupFile: boolean;
}): boolean {
  return !input.hasLocalData && input.hasBackupFile;
}

/** No escribir un store vacío encima del JSON que sobrevive a desinstalar. */
export function shouldWriteAutoBackup(
  slice: Pick<
    PersistedSlice,
    "cards" | "fixed" | "installments" | "expenses" | "loans" | "settings"
  >
): boolean {
  return hasLocalFinanceData(slice);
}
