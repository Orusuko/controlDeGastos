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
