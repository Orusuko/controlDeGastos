import { CATEGORY_COLORS, CATEGORY_FALLBACK } from "../lib/colors";
import { formatCurrency } from "../lib/format";
import type { Expense, Settings } from "../types";
import { ItemActions } from "./ItemActions";

function formatDay(date: string, locale: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function ExpenseItem({
  expense,
  cardName,
  settings,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  cardName?: string;
  settings: Settings;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color = CATEGORY_COLORS[expense.category] ?? CATEGORY_FALLBACK;
  return (
    <div className="row">
      <div className="row__badge" style={{ background: color }} aria-hidden>
        {expense.category.slice(0, 1)}
      </div>
      <div className="row__body">
        <div className="row__title">{expense.name}</div>
        <div className="row__sub">
          <span className="tag" style={{ background: `${color}22`, color }}>
            {expense.category}
          </span>{" "}
          · {formatDay(expense.date, settings.locale)}
          {cardName ? ` · ${cardName}` : ""}
          {expense.note ? ` · ${expense.note}` : ""}
        </div>
      </div>
      <div className="row__amount-block">
        <div className="row__amount">
          {formatCurrency(expense.amount, settings)}
        </div>
      </div>
      <ItemActions name={expense.name} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}
