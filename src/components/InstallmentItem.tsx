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

  return (
    <div className="card inst-card">
      <div className="row" style={{ border: "none", padding: 0 }}>
        <div className="row__body">
          <div className="row__title">{inst.name}</div>
          <div className="row__sub">
            {cardName} · {formatCurrency(monthlyAmount(inst), settings)}/mes
          </div>
        </div>
        <div className="row__amount">
          {formatCurrency(remainingAmount(inst), settings)}
          <div className="row__sub" style={{ textAlign: "right" }}>
            pendiente
          </div>
        </div>
        <ItemActions
          name={inst.name}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <div className="progress">
        <div className="progress__track">
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
          <span>{done ? "¡Liquidada! 🎉" : `${left} meses restantes`}</span>
        </div>
      </div>

      {!done && (
        <div style={{ marginTop: 12 }}>
          {paidThisMonth ? (
            <button
              className="btn btn--ghost btn--sm"
              onClick={onUndoPayment}
            >
              {compact
                ? "Deshacer pago"
                : `✓ Pagado en ${formatMonth(thisMonth, settings.locale)} · deshacer`}
            </button>
          ) : (
            <button className="btn btn--sm" onClick={onRegisterPayment}>
              {compact
                ? "Registrar pago"
                : `Registrar pago de ${formatMonth(thisMonth, settings.locale)}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
