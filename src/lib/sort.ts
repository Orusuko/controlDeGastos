import type { FixedExpense, Installment, FixedSort, InstallmentSort } from "../types";
import { remainingAmount, remainingMonths } from "./finance";

export function sortFixed(
  items: FixedExpense[],
  sort: FixedSort | undefined
): FixedExpense[] {
  const copy = [...items];
  switch (sort) {
    case "amount":
      return copy.sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name, "es"));
    case "category":
      return copy.sort(
        (a, b) =>
          a.category.localeCompare(b.category, "es") ||
          a.name.localeCompare(b.name, "es")
      );
    case "name":
    default:
      return copy.sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      );
  }
}

export function sortInstallments(
  items: Installment[],
  sort: InstallmentSort | undefined
): Installment[] {
  const copy = [...items];
  switch (sort) {
    case "amount":
      return copy.sort(
        (a, b) => remainingAmount(b) - remainingAmount(a) || a.name.localeCompare(b.name, "es")
      );
    case "name":
      return copy.sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      );
    case "remaining":
    default:
      return copy.sort((a, b) => {
        const months = remainingMonths(b) - remainingMonths(a);
        if (months !== 0) return months;
        return remainingAmount(b) - remainingAmount(a);
      });
  }
}
