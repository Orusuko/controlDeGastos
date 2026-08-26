import type {
  Card,
  FixedExpense,
  Installment,
  ListLayout,
  Settings,
  ThemePreference,
  FixedSort,
  InstallmentSort,
} from "../types";

/** Clave de localStorage. NO cambiar: perdería los datos al actualizar el APK. */
export const PERSIST_NAME = "control-financiero:v1";

/**
 * Versión del esquema persistido. Al subirla hay que ofrecer `migrate`
 * que conserve cards/fixed/installments.
 */
export const PERSIST_VERSION = 2;

export interface PersistedSlice {
  cards: Card[];
  fixed: FixedExpense[];
  installments: Installment[];
  settings: Settings;
}

const THEMES: ThemePreference[] = ["system", "light", "dark"];
const LAYOUTS: ListLayout[] = ["list", "grid"];
const FIXED_SORTS: FixedSort[] = ["name", "amount", "category"];
const INSTALLMENT_SORTS: InstallmentSort[] = ["name", "amount", "remaining"];

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

export const DEFAULT_SETTINGS: Settings = {
  monthlySalary: 0,
  currency: "MXN",
  locale: "es-MX",
  theme: "system",
  fixedLayout: "list",
  installmentLayout: "list",
  fixedSort: "name",
  installmentSort: "remaining",
};

/** Completa campos nuevos sin pisar sueldo/moneda/locale de un JSON antiguo. */
export function normalizeSettings(raw: unknown): Settings {
  const s = (raw ?? {}) as Partial<Settings>;
  const monthlySalary =
    typeof s.monthlySalary === "number" && Number.isFinite(s.monthlySalary)
      ? s.monthlySalary
      : 0;
  return {
    monthlySalary,
    currency:
      typeof s.currency === "string" && s.currency.trim()
        ? s.currency
        : DEFAULT_SETTINGS.currency,
    locale:
      typeof s.locale === "string" && s.locale.trim()
        ? s.locale
        : DEFAULT_SETTINGS.locale,
    theme: isOneOf(s.theme, THEMES) ? s.theme : DEFAULT_SETTINGS.theme,
    fixedLayout: isOneOf(s.fixedLayout, LAYOUTS)
      ? s.fixedLayout
      : DEFAULT_SETTINGS.fixedLayout,
    installmentLayout: isOneOf(s.installmentLayout, LAYOUTS)
      ? s.installmentLayout
      : DEFAULT_SETTINGS.installmentLayout,
    fixedSort: isOneOf(s.fixedSort, FIXED_SORTS)
      ? s.fixedSort
      : DEFAULT_SETTINGS.fixedSort,
    installmentSort: isOneOf(s.installmentSort, INSTALLMENT_SORTS)
      ? s.installmentSort
      : DEFAULT_SETTINGS.installmentSort,
  };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Migra un snapshot persistido (cualquier versión anterior) al esquema actual.
 * Nunca descarta tarjetas, fijos ni mensualidades.
 */
export function migratePersistedState(
  persisted: unknown,
  _fromVersion: number
): PersistedSlice {
  const p = (persisted ?? {}) as Partial<PersistedSlice>;
  return {
    cards: asArray<Card>(p.cards),
    fixed: asArray<FixedExpense>(p.fixed),
    installments: asArray<Installment>(p.installments),
    settings: normalizeSettings(p.settings),
  };
}

/**
 * Merge superficial del slice persistido sobre el estado vivo, con settings
 * anidados para que un JSON v1 (sin theme/layout/sort) no borre los defaults.
 */
export function mergePersistedState<T extends PersistedSlice>(
  persistedState: unknown,
  currentState: T
): T {
  const persisted = (persistedState ?? {}) as Partial<PersistedSlice>;
  return {
    ...currentState,
    cards: Array.isArray(persisted.cards) ? persisted.cards : currentState.cards,
    fixed: Array.isArray(persisted.fixed) ? persisted.fixed : currentState.fixed,
    installments: Array.isArray(persisted.installments)
      ? persisted.installments
      : currentState.installments,
    settings: normalizeSettings({
      ...currentState.settings,
      ...persisted.settings,
    }),
  };
}
