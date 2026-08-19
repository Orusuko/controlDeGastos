import { useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { Modal } from "../components/Modal";
import { formatCurrency } from "../lib/format";
import { FIXED_CATEGORIES, type FixedCategory } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: "#ec4899",
  Servicios: "#0ea5e9",
  Software: "#8b5cf6",
  Membresías: "#f59e0b",
  Telefonía: "#14b8a6",
  Otros: "#64748b",
};

export function FixedExpensesPage() {
  const { cards, fixed, settings, addFixed, removeFixed } = useFinanceStore();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<FixedCategory>("Streaming");
  const [cardId, setCardId] = useState("");

  function openModal() {
    setName("");
    setAmount("");
    setCategory("Streaming");
    setCardId(cards[0]?.id ?? "");
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!name.trim() || !Number.isFinite(amt) || amt <= 0 || !cardId) return;
    addFixed({ name: name.trim(), amount: amt, category, cardId });
    setOpen(false);
  }

  const cardName = (id: string) => cards.find((c) => c.id === id)?.name ?? "—";

  return (
    <>
      <div className="section-title">
        <span>Gastos fijos</span>
        {cards.length > 0 && (
          <button className="fab-add" onClick={openModal}>
            + Añadir
          </button>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="card empty">
          <span className="empty__emoji" aria-hidden>
            💳
          </span>
          Primero añade una tarjeta en la pestaña “Tarjetas” para asignar tus
          gastos fijos.
        </div>
      ) : fixed.length === 0 ? (
        <div className="card empty">
          <span className="empty__emoji" aria-hidden>
            🔁
          </span>
          Registra tus suscripciones y pagos recurrentes (Netflix, Spotify,
          gimnasio…) para saber cuánto se te va cada mes.
        </div>
      ) : (
        <div className="list">
          {fixed.map((f) => (
            <div className="row" key={f.id}>
              <div
                className="row__badge"
                style={{ background: CATEGORY_COLORS[f.category] ?? "#64748b" }}
                aria-hidden
              >
                {f.category.slice(0, 1)}
              </div>
              <div className="row__body">
                <div className="row__title">{f.name}</div>
                <div className="row__sub">
                  <span
                    className="tag"
                    style={{
                      background: `${CATEGORY_COLORS[f.category] ?? "#64748b"}22`,
                      color: CATEGORY_COLORS[f.category] ?? "#64748b",
                    }}
                  >
                    {f.category}
                  </span>{" "}
                  · {cardName(f.cardId)}
                </div>
              </div>
              <div className="row__amount">
                {formatCurrency(f.amount, settings)}
              </div>
              <button
                className="icon-btn"
                aria-label={`Eliminar ${f.name}`}
                onClick={() => removeFixed(f.id)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title="Nuevo gasto fijo" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                autoFocus
                placeholder="Netflix, Spotify, gimnasio…"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Importe mensual</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  placeholder="0.00"
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Categoría</label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as FixedCategory)
                  }
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
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn">
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
