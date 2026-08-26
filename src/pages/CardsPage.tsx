import { useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { Modal } from "../components/Modal";
import { formatCurrency } from "../lib/format";
import { monthlyTotalForCard } from "../lib/finance";
import { formString } from "../lib/form";

export function CardsPage() {
  const { cards, fixed, installments, settings, addCard, removeCard } =
    useFinanceStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cardName = formString(e.currentTarget, "name") || name;
    if (!cardName) return;
    addCard(cardName);
    setName("");
    setOpen(false);
  }

  return (
    <>
      <div className="section-title">
        <span>Mis tarjetas</span>
        <button className="fab-add" onClick={() => setOpen(true)}>
          + Añadir
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="card empty">
          <span className="empty__emoji" aria-hidden>
            💳
          </span>
          Aún no tienes tarjetas. Añade una (solo el nombre) para empezar a
          organizar tus gastos.
        </div>
      ) : (
        <div className="list">
          {cards.map((card) => {
            const total = monthlyTotalForCard(fixed, installments, card.id);
            const nFixed = fixed.filter((f) => f.cardId === card.id).length;
            const nInst = installments.filter(
              (i) => i.cardId === card.id
            ).length;
            return (
              <div className="row" key={card.id}>
                <div
                  className="row__badge"
                  style={{ background: card.color }}
                  aria-hidden
                >
                  {card.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="row__body">
                  <div className="row__title">{card.name}</div>
                  <div className="row__sub">
                    {nFixed} fijos · {nInst} a meses
                  </div>
                </div>
                <div>
                  <div className="row__amount">
                    {formatCurrency(total, settings)}
                  </div>
                  <div className="row__sub" style={{ textAlign: "right" }}>
                    al mes
                  </div>
                </div>
                <button
                  className="icon-btn"
                  aria-label={`Eliminar ${card.name}`}
                  onClick={() => {
                    if (
                      confirm(
                        `¿Eliminar "${card.name}"? También se borrarán sus gastos y mensualidades.`
                      )
                    ) {
                      removeCard(card.id);
                    }
                  }}
                >
                  🗑
                </button>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title="Nueva tarjeta" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="card-name">Nombre de la tarjeta</label>
              <input
                id="card-name"
                name="name"
                type="text"
                value={name}
                autoFocus
                placeholder="Ej. BBVA Oro, Nu, Amex…"
                onChange={(e) => setName(e.target.value)}
              />
              <span className="muted">
                No se guardan datos bancarios, solo un nombre para distinguirla.
              </span>
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
