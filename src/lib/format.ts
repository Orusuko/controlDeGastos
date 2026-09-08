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

/** Fecha local YYYY-MM-DD. No usar toISOString (UTC). */
export function currentDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Hora local HH:mm. No usar toISOString (UTC). */
export function currentTime(now: Date = new Date()): string {
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

export function isValidPaidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

export function isValidPaidTime(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [h, min] = value.split(":").map(Number);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

/** Instant ISO a partir de fecha y hora del reloj local (para cotejar el banco). */
export function localDateTimeToIso(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0).toISOString();
}

export function formatPaymentWhen(
  stamp: { paidDate?: string; paidTime?: string; paidAt: string },
  locale = "es-MX"
): string {
  const date =
    stamp.paidDate && isValidPaidDate(stamp.paidDate)
      ? stamp.paidDate
      : currentDate(new Date(stamp.paidAt));
  const time =
    stamp.paidTime && isValidPaidTime(stamp.paidTime)
      ? stamp.paidTime
      : currentTime(new Date(stamp.paidAt));
  const [y, m, d] = date.split("-").map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${label} · ${time}`;
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
