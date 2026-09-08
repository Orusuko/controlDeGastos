import { formatCurrency } from "../lib/format";
import { loanPaid, loanRemaining, loanTotal } from "../lib/loans";
import type { Loan, Settings } from "../types";
import { ItemActions } from "./ItemActions";

export function directionLabel(direction: Loan["direction"]): {
  badge: string;
  hint: string;
} {
  return direction === "a_favor"
    ? { badge: "Yo debo", hint: "A favor" }
    : { badge: "Me deben", hint: "En contra" };
}

export function LoanItem({
  loan,
  settings,
  onOpen,
  onEdit,
  onDelete,
}: {
  loan: Loan;
  settings: Settings;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const paid = loanPaid(loan);
  const leftover = loanRemaining(loan);
  const total = loanTotal(loan);
  const ratio = total > 0 ? paid / total : 0;
  const copy = directionLabel(loan.direction);
  const people = loan.parties.map((p) => p.name).join(", ");

  return (
    <div
      className="row row--tap row--loan"
      role="link"
      tabIndex={0}
      aria-label={`${loan.title}, ${copy.badge}, llevas ${formatCurrency(paid, settings)}, restan ${formatCurrency(leftover, settings)}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div
        className={
          loan.direction === "a_favor"
            ? "row__badge row__badge--warn"
            : "row__badge row__badge--good"
        }
        aria-hidden
      >
        {copy.badge.slice(0, 1)}
      </div>
      <div className="row__body">
        <div className="row__title">{loan.title}</div>
        <div className="row__sub">
          {copy.badge} · {copy.hint} · {people}
        </div>
      </div>
      <div className="row__amount-block">
        <div className="row__amount">{formatCurrency(leftover, settings)}</div>
        <div className="row__sub row__sub--end">
          Llevas {formatCurrency(paid, settings)} · restan{" "}
          {formatCurrency(leftover, settings)}
        </div>
      </div>
      <ItemActions
        name={loan.title}
        onEdit={onEdit}
        onDelete={onDelete}
        deleteMessage={`¿Eliminar “${loan.title}” y sus abonos?`}
      />
      <div className="progress progress--row">
        <div className="progress__track">
          <div
            className="progress__fill"
            style={{ width: `${Math.min(100, ratio * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
