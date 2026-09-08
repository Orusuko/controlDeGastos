import { formatCurrency } from "../lib/format";
import { loanRemaining, loanTotal } from "../lib/loans";
import type { Loan, Settings } from "../types";
import { ItemActions } from "./ItemActions";
import { IconChevron } from "./icons";

export function directionLabel(direction: Loan["direction"]): {
  badge: string;
  hint: string;
} {
  return direction === "a_favor"
    ? { badge: "A favor", hint: "Yo debo" }
    : { badge: "En contra", hint: "Me deben" };
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
  const leftover = loanRemaining(loan);
  const total = loanTotal(loan);
  const copy = directionLabel(loan.direction);
  const people = loan.parties.map((p) => p.name).join(", ");

  return (
    <div
      className="row row--tap"
      role="link"
      tabIndex={0}
      aria-label={`${loan.title}, ${copy.badge}, restante ${formatCurrency(leftover, settings)}`}
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
          de {formatCurrency(total, settings)}
        </div>
      </div>
      <ItemActions
        name={loan.title}
        onEdit={onEdit}
        onDelete={onDelete}
        deleteMessage={`¿Eliminar “${loan.title}” y sus abonos?`}
      />
      <span className="row__chevron" aria-hidden>
        <IconChevron />
      </span>
    </div>
  );
}
