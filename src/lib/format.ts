import type { Settings } from "../types";

export function formatCurrency(value: number, settings: Settings): string {
  try {
    return new Intl.NumberFormat(settings.locale, {
      style: "currency",
      currency: settings.currency,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
  } catch {
    return `$${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
  }
}

/** Mes actual en zona horaria local (YYYY-MM). No usar toISOString (UTC). */
export function currentMonth(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Convierte "2026-08" en "ago 2026". */
export function formatMonth(month: string, locale = "es-MX"): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(locale, { month: "short", year: "numeric" });
}

/** Suma `count` meses a un mes "YYYY-MM". */
export function addMonths(month: string, count: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + count, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
