import type { Card, FixedExpense, Installment } from "../types";

export function monthlyAmount(inst: Installment): number {
  if (!inst.months) return 0;
  return inst.totalAmount / inst.months;
}

export function paidAmount(inst: Installment): number {
  return inst.payments.reduce((sum, p) => sum + p.amount, 0);
}

export function remainingAmount(inst: Installment): number {
  return Math.max(0, inst.totalAmount - paidAmount(inst));
}

export function paidCount(inst: Installment): number {
  return inst.payments.length;
}

export function remainingMonths(inst: Installment): number {
  return Math.max(0, inst.months - paidCount(inst));
}

export function isActive(inst: Installment): boolean {
  return remainingMonths(inst) > 0;
}

export function isPaidForMonth(inst: Installment, month: string): boolean {
  return inst.payments.some((p) => p.month === month);
}

export function progress(inst: Installment): number {
  if (!inst.months) return 0;
  return Math.min(1, paidCount(inst) / inst.months);
}

export function fixedTotalForCard(fixed: FixedExpense[], cardId: string): number {
  return fixed
    .filter((f) => f.cardId === cardId)
    .reduce((sum, f) => sum + f.amount, 0);
}

export function installmentMonthlyForCard(
  installments: Installment[],
  cardId: string
): number {
  return installments
    .filter((i) => i.cardId === cardId && isActive(i))
    .reduce((sum, i) => sum + monthlyAmount(i), 0);
}

export function monthlyTotalForCard(
  fixed: FixedExpense[],
  installments: Installment[],
  cardId: string
): number {
  return (
    fixedTotalForCard(fixed, cardId) +
    installmentMonthlyForCard(installments, cardId)
  );
}

export interface Totals {
  fixed: number;
  installments: number;
  total: number;
  remainingDebt: number;
}

export function computeTotals(
  fixed: FixedExpense[],
  installments: Installment[]
): Totals {
  const fixedTotal = fixed.reduce((sum, f) => sum + f.amount, 0);
  const installmentsTotal = installments
    .filter(isActive)
    .reduce((sum, i) => sum + monthlyAmount(i), 0);
  const remainingDebt = installments.reduce(
    (sum, i) => sum + remainingAmount(i),
    0
  );
  return {
    fixed: fixedTotal,
    installments: installmentsTotal,
    total: fixedTotal + installmentsTotal,
    remainingDebt,
  };
}

export interface CardBreakdown {
  card: Card;
  fixed: number;
  installments: number;
  total: number;
}

export function cardBreakdowns(
  cards: Card[],
  fixed: FixedExpense[],
  installments: Installment[]
): CardBreakdown[] {
  return cards
    .map((card) => ({
      card,
      fixed: fixedTotalForCard(fixed, card.id),
      installments: installmentMonthlyForCard(installments, card.id),
      total: monthlyTotalForCard(fixed, installments, card.id),
    }))
    .sort((a, b) => b.total - a.total);
}

export function categoryBreakdown(
  fixed: FixedExpense[]
): { category: string; total: number }[] {
  const map = new Map<string, number>();
  for (const f of fixed) {
    map.set(f.category, (map.get(f.category) ?? 0) + f.amount);
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}
