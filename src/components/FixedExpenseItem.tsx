import { formatCurrency } from "../lib/format";
import type { FixedExpense, Settings } from "../types";
import { ItemActions } from "./ItemActions";

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: "#ec4899",
  Servicios: "#0ea5e9",
  Software: "#8b5cf6",
  Membresías: "#f59e0b",
  Telefonía: "#14b8a6",
  Otros: "#64748b",
};

export function FixedExpenseItem({
  expense,
  cardName,
  settings,
  onEdit,
  onDelete,
}: {
  expense: FixedExpense;
  cardName: string;
  settings: Settings;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color = CATEGORY_COLORS[expense.category] ?? "#64748b";
  return (
    <div className="row">
      <div className="row__badge" style={{ background: color }} aria-hidden>
        {expense.category.slice(0, 1)}
      </div>
      <div className="row__body">
        <div className="row__title">{expense.name}</div>
        <div className="row__sub">
          <span
            className="tag"
            style={{ background: `${color}22`, color }}
          >
            {expense.category}
          </span>{" "}
          · {cardName}
        </div>
      </div>
      <div className="row__amount-block">
        <div className="row__amount">
          {formatCurrency(expense.amount, settings)}
        </div>
        <div className="row__sub row__sub--end">al mes</div>
      </div>
      <ItemActions
        name={expense.name}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
