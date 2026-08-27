import { useId, useState } from "react";
import { Modal } from "./Modal";
import { FIXED_CATEGORIES, type Card, type FixedCategory, type FixedExpense } from "../types";

export function FixedExpenseModal({
  cards,
  initial,
  defaultCardId,
  onClose,
  onSave,
}: {
  cards: Card[];
  initial: FixedExpense | null;
  defaultCardId?: string;
  onClose: () => void;
  onSave: (data: Omit<FixedExpense, "id">) => void;
}) {
  const ids = {
    name: useId(),
    amount: useId(),
    category: useId(),
    card: useId(),
  };
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(
    initial ? String(initial.amount) : ""
  );
  const [category, setCategory] = useState<FixedCategory>(
    initial?.category ?? "Streaming"
  );
  const [cardId, setCardId] = useState(
    initial?.cardId ?? defaultCardId ?? cards[0]?.id ?? ""
  );
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!name.trim()) return setError("Escribe el nombre del gasto.");
    if (!Number.isFinite(amt) || amt <= 0)
      return setError("Indica un importe mayor que cero.");
    if (!cardId) return setError("Selecciona una tarjeta.");
    onSave({ name: name.trim(), amount: amt, category, cardId });
  }

  return (
    <Modal
      title={initial ? "Editar gasto fijo" : "Nuevo gasto fijo"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor={ids.name}>Nombre</label>
          <input
            id={ids.name}
            type="text"
            value={name}
            autoFocus
            placeholder="Netflix, Spotify, gimnasio…"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor={ids.amount}>Importe mensual</label>
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
              onChange={(e) => setCategory(e.target.value as FixedCategory)}
            >
              {FIXED_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor={ids.card}>Tarjeta</label>
          <select
            id={ids.card}
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
            {initial ? "Guardar cambios" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
