import { useId, useState } from "react";
import { Modal } from "./Modal";
import { EXPENSE_CATEGORIES, type Card, type Expense, type ExpenseCategory } from "../types";
import { currentDate } from "../lib/format";

export function ExpenseModal({
  cards,
  initial,
  onClose,
  onSave,
}: {
  cards: Card[];
  initial: Expense | null;
  onClose: () => void;
  onSave: (data: Omit<Expense, "id">) => void;
}) {
  const ids = {
    name: useId(),
    amount: useId(),
    category: useId(),
    date: useId(),
    card: useId(),
    note: useId(),
  };
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState<ExpenseCategory>(
    initial?.category ?? "Comida"
  );
  const [date, setDate] = useState(initial?.date ?? currentDate());
  const [cardId, setCardId] = useState(initial?.cardId ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!name.trim()) return setError("Escribe el nombre del gasto.");
    if (!Number.isFinite(amt) || amt <= 0)
      return setError("Indica un importe mayor que cero.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
      return setError("Indica una fecha válida.");
    onSave({
      name: name.trim(),
      amount: amt,
      category,
      date,
      cardId: cardId || undefined,
      note: note.trim() || undefined,
    });
  }

  return (
    <Modal
      title={initial ? "Editar gasto" : "Registrar gasto"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor={ids.name}>Qué pagaste</label>
          <input
            id={ids.name}
            type="text"
            value={name}
            autoFocus
            placeholder="Tacos, Uber, súper…"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor={ids.amount}>Importe</label>
            <input
              id={ids.amount}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={amount}
              placeholder="0.00"
              onWheel={(e) => e.currentTarget.blur()}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={ids.category}>Categoría</label>
            <select
              id={ids.category}
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor={ids.date}>Fecha</label>
          <input
            id={ids.date}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor={ids.card}>Tarjeta (opcional)</label>
          <select
            id={ids.card}
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
          >
            <option value="">Efectivo / sin tarjeta</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={ids.note}>Nota</label>
          <input
            id={ids.note}
            type="text"
            value={note}
            placeholder="Opcional"
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn">
            {initial ? "Guardar cambios" : "Registrar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
