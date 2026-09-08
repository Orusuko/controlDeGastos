export interface Card {
  id: string;
  name: string;
  color: string;
}

export const FIXED_CATEGORIES = [
  "Streaming",
  "Servicios",
  "Software",
  "Membresías",
  "Telefonía",
  "Otros",
] as const;

export type FixedCategory = (typeof FIXED_CATEGORIES)[number];

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: FixedCategory;
  cardId: string;
  /** Día del mes en el que se cobra (1-31), opcional. */
  dayOfMonth?: number;
}

export interface InstallmentPayment {
  /** Mes al que corresponde el pago, formato YYYY-MM. */
  month: string;
  amount: number;
  /** Fecha ISO en la que se registró el pago. */
  paidAt: string;
}

export interface Installment {
  id: string;
  name: string;
  totalAmount: number;
  months: number;
  cardId: string;
  /** Mes de inicio, formato YYYY-MM. */
  startMonth: string;
  payments: InstallmentPayment[];
}

export const EXPENSE_CATEGORIES = [
  "Comida",
  "Transporte",
  "Salud",
  "Hogar",
  "Entretenimiento",
  "Ropa",
  "Educación",
  "Otros",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  /** Fecha local YYYY-MM-DD. */
  date: string;
  cardId?: string;
  note?: string;
}

export type LoanDirection = "a_favor" | "en_contra";

export interface LoanParty {
  id: string;
  name: string;
  shareAmount: number;
}

export interface LoanPayment {
  id: string;
  partyId: string;
  amount: number;
  paidAt: string;
  note?: string;
}

export interface Loan {
  id: string;
  title: string;
  direction: LoanDirection;
  createdAt: string;
  parties: LoanParty[];
  payments: LoanPayment[];
  note?: string;
}

export type ThemePreference = "system" | "light" | "dark";
export type ListLayout = "list" | "grid";
export type FixedSort = "name" | "amount" | "category";
export type InstallmentSort = "name" | "amount" | "remaining";
export type ExpenseSort = "date" | "amount" | "name";
export type LoanSort = "remaining" | "amount" | "name";
export type SortDir = "asc" | "desc";

export interface Settings {
  monthlySalary: number;
  currency: string;
  locale: string;
  /**
   * Apariencia. Ausente en datos viejos → se trata como "system"
   * (respeta prefers-color-scheme).
   */
  theme?: ThemePreference;
  /** Vista de gastos fijos. Ausente → "list". */
  fixedLayout?: ListLayout;
  /** Vista de compras a meses. Ausente → "list". */
  installmentLayout?: ListLayout;
  /** Orden de gastos fijos. Ausente → "name". */
  fixedSort?: FixedSort;
  /** Dirección del orden de fijos. Ausente → "asc" (A→Z / más baratas). */
  fixedSortDir?: SortDir;
  /** Orden de mensualidades. Ausente → "remaining". */
  installmentSort?: InstallmentSort;
  /**
   * Dirección del orden de mensualidades. Ausente → "desc"
   * (más meses restantes / más caras primero, el comportamiento previo).
   */
  installmentSortDir?: SortDir;
  /** Vista de gastos variables. Ausente → "list". */
  expenseLayout?: ListLayout;
  /** Orden de gastos variables. Ausente → "date". */
  expenseSort?: ExpenseSort;
  /** Dirección del orden de gastos. Ausente → "desc" (más recientes). */
  expenseSortDir?: SortDir;
  /** Vista de préstamos. Ausente → "list". */
  loanLayout?: ListLayout;
  /** Orden de préstamos. Ausente → "remaining". */
  loanSort?: LoanSort;
  /** Dirección del orden de préstamos. Ausente → "desc" (más saldo). */
  loanSortDir?: SortDir;
}
