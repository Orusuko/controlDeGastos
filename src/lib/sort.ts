import type {
  FixedExpense,
  Installment,
  FixedSort,
  InstallmentSort,
  SortDir,
} from "../types";
import { remainingAmount, remainingMonths } from "./finance";

function dirMul(dir: SortDir | undefined): 1 | -1 {
  return dir === "desc" ? -1 : 1;
}

function byName(a: string, b: string, dir: SortDir | undefined): number {
  return (
    dirMul(dir) * a.localeCompare(b, "es", { sensitivity: "base" })
  );
}

export function sortFixed(
  items: FixedExpense[],
  sort: FixedSort | undefined,
  dir: SortDir | undefined = "asc"
): FixedExpense[] {
  const copy = [...items];
  switch (sort) {
    case "amount":
      return copy.sort(
        (a, b) =>
          dirMul(dir) * (a.amount - b.amount) || byName(a.name, b.name, "asc")
      );
    case "category":
      return copy.sort(
        (a, b) =>
          byName(a.category, b.category, dir) || byName(a.name, b.name, "asc")
      );
    case "name":
    default:
      return copy.sort((a, b) => byName(a.name, b.name, dir));
  }
}

export function sortInstallments(
  items: Installment[],
  sort: InstallmentSort | undefined,
  dir: SortDir | undefined = "desc"
): Installment[] {
  const copy = [...items];
  switch (sort) {
    case "amount":
      return copy.sort(
        (a, b) =>
          dirMul(dir) * (remainingAmount(a) - remainingAmount(b)) ||
          byName(a.name, b.name, "asc")
      );
    case "name":
      return copy.sort((a, b) => byName(a.name, b.name, dir));
    case "remaining":
    default:
      return copy.sort((a, b) => {
        const months =
          dirMul(dir) * (remainingMonths(a) - remainingMonths(b));
        if (months !== 0) return months;
        return remainingAmount(b) - remainingAmount(a);
      });
  }
}
