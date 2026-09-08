import type { Expense } from "../types";

export function expenseMonth(expense: Expense): string {
  return expense.date.slice(0, 7);
}

export function expensesInMonth(items: Expense[], month: string): Expense[] {
  return items.filter((e) => expenseMonth(e) === month);
}

export function expensesTotal(items: Expense[]): number {
  return items.reduce((sum, e) => sum + e.amount, 0);
}

export function uniqueExpenseMonths(items: Expense[], extra?: string): string[] {
  const set = new Set(items.map(expenseMonth));
  if (extra) set.add(extra);
  return [...set].sort((a, b) => b.localeCompare(a));
}
