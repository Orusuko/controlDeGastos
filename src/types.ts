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

export interface Settings {
  monthlySalary: number;
  currency: string;
  locale: string;
}
