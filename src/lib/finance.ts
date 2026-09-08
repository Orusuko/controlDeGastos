import type { Card, Expense, FixedExpense, Installment, Loan } from "../types";
import { expenseMonth, expensesInMonth, expensesTotal } from "./expenses";
import { currentMonth } from "./format";
import { loanOwedTotal, loanReceivableTotal } from "./loans";

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

export function expenseTotalForCard(
  expenses: Expense[],
  cardId: string,
  month: string
): number {
  return expenses
    .filter((e) => e.cardId === cardId && expenseMonth(e) === month)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function monthlyTotalForCard(
  fixed: FixedExpense[],
  installments: Installment[],
  cardId: string,
  expenses: Expense[] = [],
  month: string = currentMonth()
): number {
  return (
    fixedTotalForCard(fixed, cardId) +
    installmentMonthlyForCard(installments, cardId) +
    expenseTotalForCard(expenses, cardId, month)
  );
}

export interface Totals {
  fixed: number;
  installments: number;
  expenses: number;
  total: number;
  remainingDebt: number;
  loanOwed: number;
  loanReceivable: number;
}

export function computeTotals(
  fixed: FixedExpense[],
  installments: Installment[],
  expenses: Expense[] = [],
  loans: Loan[] = [],
  month: string = currentMonth()
): Totals {
  const fixedTotal = fixed.reduce((sum, f) => sum + f.amount, 0);
  const installmentsTotal = installments
    .filter(isActive)
    .reduce((sum, i) => sum + monthlyAmount(i), 0);
  const remainingDebt = installments.reduce(
    (sum, i) => sum + remainingAmount(i),
    0
  );
  const expensesMonth = expensesTotal(expensesInMonth(expenses, month));
  return {
    fixed: fixedTotal,
    installments: installmentsTotal,
    expenses: expensesMonth,
    total: fixedTotal + installmentsTotal + expensesMonth,
    remainingDebt,
    loanOwed: loanOwedTotal(loans),
    loanReceivable: loanReceivableTotal(loans),
  };
}

export interface CardBreakdown {
  card: Card;
  fixed: number;
  installments: number;
  expenses: number;
  total: number;
}

export function cardBreakdowns(
  cards: Card[],
  fixed: FixedExpense[],
  installments: Installment[],
  expenses: Expense[] = [],
  month: string = currentMonth()
): CardBreakdown[] {
  return cards
    .map((card) => {
      const expenseAmt = expenseTotalForCard(expenses, card.id, month);
      return {
        card,
        fixed: fixedTotalForCard(fixed, card.id),
        installments: installmentMonthlyForCard(installments, card.id),
        expenses: expenseAmt,
        total: monthlyTotalForCard(
          fixed,
          installments,
          card.id,
          expenses,
          month
        ),
      };
    })
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

export interface PieSlice {
  key: string;
  name: string;
  value: number;
  colorKey: string;
}

export function monthPieSlices(
  fixed: FixedExpense[],
  expenses: Expense[],
  installmentsTotal: number,
  month: string
): PieSlice[] {
  const slices: PieSlice[] = categoryBreakdown(fixed).map((c) => ({
    key: `fixed:${c.category}`,
    name: `Fijos · ${c.category}`,
    value: c.total,
    colorKey: c.category,
  }));
  const map = new Map<string, number>();
  for (const e of expensesInMonth(expenses, month)) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  for (const [category, value] of map) {
    slices.push({
      key: `expense:${category}`,
      name: `Gastos · ${category}`,
      value,
      colorKey: category,
    });
  }
  if (installmentsTotal > 0) {
    slices.push({
      key: "installments",
      name: "Mensualidades",
      value: installmentsTotal,
      colorKey: "Mensualidades",
    });
  }
  return slices.filter((s) => s.value > 0);
}
