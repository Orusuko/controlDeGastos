import { formatCurrency, formatMonth, currentMonth } from "../lib/format";
import {
  monthlyAmount,
  paidCount,
  progress,
  remainingAmount,
  remainingMonths,
  isPaidForMonth,
} from "../lib/finance";
import type { Installment, Settings } from "../types";
import { ItemActions } from "./ItemActions";

export function InstallmentItem({
  inst,
  cardName,
  settings,
  compact,
  onEdit,
  onDelete,
  onRegisterPayment,
  onUndoPayment,
}: {
  inst: Installment;
  cardName: string;
  settings: Settings;
  compact?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRegisterPayment: () => void;
  onUndoPayment: () => void;
}) {
  const thisMonth = currentMonth();
  const paid = paidCount(inst);
  const left = remainingMonths(inst);
  const done = left === 0;
  const paidThisMonth = isPaidForMonth(inst, thisMonth);
  const monthly = formatCurrency(monthlyAmount(inst), settings);

  return (
    <article className="card inst-card">
      <div className="inst-card__head">
        <div className="inst-card__identity">
          <h3 className="inst-card__name">{inst.name}</h3>
          <p className="inst-card__meta">
            {cardName}
            {compact ? ` · ${monthly}/mes` : null}
          </p>
        </div>
        <div className="inst-card__figures">
          <div className="inst-card__remain">
            {formatCurrency(remainingAmount(inst), settings)}
          </div>
          <div className="inst-card__monthly">
            {done ? "Liquidada" : compact ? "por pagar" : `${monthly} al mes`}
          </div>
        </div>
        <ItemActions name={inst.name} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="progress">
        <div
          className="progress__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={inst.months}
          aria-valuenow={paid}
          aria-label={`${paid} de ${inst.months} pagos`}
        >
          <div
            className="progress__fill"
            style={{
              width: `${progress(inst) * 100}%`,
              background: done ? "var(--good)" : "var(--primary)",
            }}
          />
        </div>
        <div className="progress__legend">
          <span>
            {paid} de {inst.months} pagos
          </span>
          <span>{done ? "¡Liquidada!" : `${left} meses restantes`}</span>
        </div>
      </div>

      {!done && (
        <div className="inst-card__action">
          {paidThisMonth ? (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={onUndoPayment}
            >
              {compact
                ? "Deshacer pago"
                : `Pagado en ${formatMonth(thisMonth, settings.locale)} · deshacer`}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--sm"
              onClick={onRegisterPayment}
            >
              {compact
                ? "Registrar pago"
                : `Registrar pago de ${formatMonth(thisMonth, settings.locale)}`}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
