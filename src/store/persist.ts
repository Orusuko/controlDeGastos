import type {
  Card,
  Expense,
  ExpenseSort,
  FixedExpense,
  Installment,
  ListLayout,
  Loan,
  LoanSort,
  Settings,
  ThemePreference,
  FixedSort,
  InstallmentSort,
  SortDir,
} from "../types";

/** Clave de localStorage. NO cambiar: perdería los datos al actualizar el APK. */
export const PERSIST_NAME = "control-financiero:v1";

/**
 * Versión del esquema persistido. Al subirla hay que ofrecer `migrate`
 * que conserve cards/fixed/installments/expenses/loans.
 */
export const PERSIST_VERSION = 3;

export interface PersistedSlice {
  cards: Card[];
  fixed: FixedExpense[];
  installments: Installment[];
  expenses: Expense[];
  loans: Loan[];
  settings: Settings;
}

const THEMES: ThemePreference[] = ["system", "light", "dark"];
const LAYOUTS: ListLayout[] = ["list", "grid"];
const FIXED_SORTS: FixedSort[] = ["name", "amount", "category"];
const INSTALLMENT_SORTS: InstallmentSort[] = ["name", "amount", "remaining"];
const EXPENSE_SORTS: ExpenseSort[] = ["date", "amount", "name"];
const LOAN_SORTS: LoanSort[] = ["remaining", "amount", "name"];
const SORT_DIRS: SortDir[] = ["asc", "desc"];

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
  fixedSortDir: "asc",
  installmentSort: "remaining",
  installmentSortDir: "desc",
  expenseLayout: "list",
  expenseSort: "date",
  expenseSortDir: "desc",
  loanLayout: "list",
  loanSort: "remaining",
  loanSortDir: "desc",
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
    fixedSortDir: isOneOf(s.fixedSortDir, SORT_DIRS)
      ? s.fixedSortDir
      : DEFAULT_SETTINGS.fixedSortDir,
    installmentSortDir: isOneOf(s.installmentSortDir, SORT_DIRS)
      ? s.installmentSortDir
      : DEFAULT_SETTINGS.installmentSortDir,
    expenseLayout: isOneOf(s.expenseLayout, LAYOUTS)
      ? s.expenseLayout
      : DEFAULT_SETTINGS.expenseLayout,
    expenseSort: isOneOf(s.expenseSort, EXPENSE_SORTS)
      ? s.expenseSort
      : DEFAULT_SETTINGS.expenseSort,
    expenseSortDir: isOneOf(s.expenseSortDir, SORT_DIRS)
      ? s.expenseSortDir
      : DEFAULT_SETTINGS.expenseSortDir,
    loanLayout: isOneOf(s.loanLayout, LAYOUTS)
      ? s.loanLayout
      : DEFAULT_SETTINGS.loanLayout,
    loanSort: isOneOf(s.loanSort, LOAN_SORTS)
      ? s.loanSort
      : DEFAULT_SETTINGS.loanSort,
    loanSortDir: isOneOf(s.loanSortDir, SORT_DIRS)
      ? s.loanSortDir
      : DEFAULT_SETTINGS.loanSortDir,
  };
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Migra un snapshot persistido (cualquier versión anterior) al esquema actual.
 * Nunca descarta tarjetas, fijos, mensualidades, gastos ni préstamos.
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
    expenses: asArray<Expense>(p.expenses),
    loans: asArray<Loan>(p.loans),
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
    expenses: Array.isArray(persisted.expenses)
      ? persisted.expenses
      : currentState.expenses,
    loans: Array.isArray(persisted.loans)
      ? persisted.loans
      : currentState.loans,
    settings: normalizeSettings({
      ...currentState.settings,
      ...persisted.settings,
    }),
  };
}
