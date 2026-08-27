import { useState } from "react";
import { Modal } from "./Modal";
import { currentMonth, formatCurrency } from "../lib/format";
import type { Card, Installment, Settings } from "../types";

export function InstallmentModal({
  cards,
  settings,
  initial,
  defaultCardId,
  onClose,
  onSave,
}: {
  cards: Card[];
  settings: Settings;
  initial: Installment | null;
  defaultCardId?: string;
  onClose: () => void;
  onSave: (data: Omit<Installment, "id" | "payments">) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [total, setTotal] = useState(
    initial ? String(initial.totalAmount) : ""
  );
  const [months, setMonths] = useState(
    initial ? String(initial.months) : ""
  );
  const [cardId, setCardId] = useState(
    initial?.cardId ?? defaultCardId ?? cards[0]?.id ?? ""
  );
  const [startMonth, setStartMonth] = useState(
    initial?.startMonth ?? currentMonth()
  );
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const totalAmount = Number(total);
    const m = Number(months);

    if (!name.trim()) return setError("Escribe qué compraste.");
    if (!Number.isFinite(totalAmount) || totalAmount <= 0)
      return setError("Indica un total pendiente mayor que cero.");
    if (!Number.isInteger(m) || m <= 0)
      return setError("Indica un número de meses válido (entero mayor que 0).");
    if (!cardId) return setError("Selecciona una tarjeta.");

    onSave({
      name: name.trim(),
      totalAmount,
      months: m,
      cardId,
      startMonth,
    });
  }

  return (
    <Modal
      title={initial ? "Editar compra a meses" : "Nueva compra a meses"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="field">
          <label>¿Qué compraste?</label>
          <input
            type="text"
            value={name}
            autoFocus
            placeholder="Celular, laptop, viaje…"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Total pendiente</label>
            <input
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={total}
              placeholder="0.00"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Nº de meses</label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={months}
              placeholder="12"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setMonths(e.target.value)}
            />
          </div>
        </div>
        {Number(total) > 0 && Number(months) > 0 && (
          <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
            Pago mensual estimado:{" "}
            <strong>
              {formatCurrency(Number(total) / Number(months), settings)}
            </strong>
          </p>
        )}
        <div className="field-row">
          <div className="field">
            <label>Tarjeta</label>
            <select
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Mes de inicio</label>
            <input
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
            />
          </div>
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn">
            {initial ? "Guardar cambios" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
