import {
  DEFAULT_SETTINGS,
  PERSIST_NAME,
  PERSIST_VERSION,
  migratePersistedState,
  type PersistedSlice,
} from "./persist";

/** Identificador del archivo de respaldo. No es la clave de Zustand. */
export const BACKUP_FORMAT = "control-financiero-backup";
export const BACKUP_FORMAT_VERSION = 1;

export const BACKUP_ERRORS = {
  invalidJson:
    "El archivo no es un JSON válido. No se modificaron tus datos.",
  invalidShape:
    "Este archivo no parece un respaldo de Control Financiero. No se modificaron tus datos.",
} as const;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  exportedAt: string;
  persistVersion: number;
  persistName: typeof PERSIST_NAME;
  state: PersistedSlice;
}

export type ParseBackupResult =
  | { ok: true; data: PersistedSlice }
  | { ok: false; error: string };

export function pickPersistedSlice(state: PersistedSlice): PersistedSlice {
  return {
    cards: state.cards,
    fixed: state.fixed,
    installments: state.installments,
    settings: state.settings ?? DEFAULT_SETTINGS,
  };
}

export function backupFilename(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `control-financiero-${y}-${m}-${d}.json`;
}

export function buildBackup(
  state: PersistedSlice,
  exportedAt = new Date().toISOString()
): BackupFile {
  return {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt,
    persistVersion: PERSIST_VERSION,
    persistName: PERSIST_NAME,
    state: pickPersistedSlice(state),
  };
}

export function serializeBackup(
  state: PersistedSlice,
  exportedAt = new Date().toISOString()
): string {
  return `${JSON.stringify(buildBackup(state, exportedAt), null, 2)}\n`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Forma mínima: cards, fixed e installments deben ser arrays.
 * settings es opcional (se rellena al migrar).
 */
export function isPersistedSliceShape(value: unknown): value is PersistedSlice {
  if (!isRecord(value)) return false;
  return (
    Array.isArray(value.cards) &&
    Array.isArray(value.fixed) &&
    Array.isArray(value.installments)
  );
}

function extractSlice(raw: unknown): PersistedSlice | null {
  if (!isRecord(raw)) return null;

  if (raw.format === BACKUP_FORMAT) {
    return isPersistedSliceShape(raw.state) ? raw.state : null;
  }

  if (isPersistedSliceShape(raw.state)) {
    return raw.state;
  }

  if (isPersistedSliceShape(raw)) {
    return raw;
  }

  return null;
}

export function parseBackup(raw: unknown): ParseBackupResult {
  const slice = extractSlice(raw);
  if (!slice) {
    return { ok: false, error: BACKUP_ERRORS.invalidShape };
  }
  return {
    ok: true,
    data: migratePersistedState(slice, PERSIST_VERSION),
  };
}

export function parseBackupJson(text: string): ParseBackupResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: BACKUP_ERRORS.invalidJson };
  }
  return parseBackup(raw);
}

export function backupSummary(slice: PersistedSlice): {
  cards: number;
  fixed: number;
  installments: number;
} {
  return {
    cards: slice.cards.length,
    fixed: slice.fixed.length,
    installments: slice.installments.length,
  };
}
