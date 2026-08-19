import { useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { Modal } from "../components/Modal";
import { currentMonth, formatCurrency, formatMonth } from "../lib/format";
import {
  monthlyAmount,
  paidCount,
  progress,
  remainingAmount,
  remainingMonths,
  isPaidForMonth,
} from "../lib/finance";

export function InstallmentsPage() {
  const {
    cards,
    installments,
    settings,
    addInstallment,
    removeInstallment,
    registerPayment,
    removePayment,
  } = useFinanceStore();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");
  const [months, setMonths] = useState("");
  const [cardId, setCardId] = useState("");
  const [startMonth, setStartMonth] = useState(currentMonth());

  const thisMonth = currentMonth();

  function openModal() {
    setName("");
    setTotal("");
    setMonths("");
    setCardId(cards[0]?.id ?? "");
    setStartMonth(currentMonth());
    setOpen(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const totalAmount = Number(total);
    const m = Number(months);
    if (
      !name.trim() ||
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0 ||
      !Number.isInteger(m) ||
      m <= 0 ||
      !cardId
    )
      return;
    addInstallment({ name: name.trim(), totalAmount, months: m, cardId, startMonth });
    setOpen(false);
  }

  const cardName = (id: string) => cards.find((c) => c.id === id)?.name ?? "—";

  return (
    <>
      <div className="section-title">
        <span>Compras a meses</span>
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
          Añade una tarjeta primero para registrar tus compras a meses.
        </div>
      ) : installments.length === 0 ? (
        <div className="card empty">
          <span className="empty__emoji" aria-hidden>
            🗓️
          </span>
          Registra una compra a mensualidades: indica el total y a cuántos meses,
          y ve marcando cada pago para saber cuánto te falta.
        </div>
      ) : (
        <div className="list">
          {installments.map((inst) => {
            const paid = paidCount(inst);
            const left = remainingMonths(inst);
            const done = left === 0;
            const paidThisMonth = isPaidForMonth(inst, thisMonth);
            return (
              <div className="card" key={inst.id}>
                <div className="row" style={{ border: "none", padding: 0 }}>
                  <div className="row__body">
                    <div className="row__title">{inst.name}</div>
                    <div className="row__sub">
                      {cardName(inst.cardId)} ·{" "}
                      {formatCurrency(monthlyAmount(inst), settings)}/mes
                    </div>
                  </div>
                  <div className="row__amount">
                    {formatCurrency(remainingAmount(inst), settings)}
                    <div className="row__sub" style={{ textAlign: "right" }}>
                      pendiente
                    </div>
                  </div>
                  <button
                    className="icon-btn"
                    aria-label={`Eliminar ${inst.name}`}
                    onClick={() => {
                      if (confirm(`¿Eliminar "${inst.name}"?`))
                        removeInstallment(inst.id);
                    }}
                  >
                    🗑
                  </button>
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
                    <span>
                      {done ? "¡Liquidada! 🎉" : `${left} meses restantes`}
                    </span>
                  </div>
                </div>

                {!done && (
                  <div style={{ marginTop: 12 }}>
                    {paidThisMonth ? (
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => removePayment(inst.id, thisMonth)}
                      >
                        ✓ Pagado en {formatMonth(thisMonth, settings.locale)} ·
                        deshacer
                      </button>
                    ) : (
                      <button
                        className="btn btn--sm"
                        onClick={() =>
                          registerPayment(inst.id, {
                            month: thisMonth,
                            amount: monthlyAmount(inst),
                            paidAt: new Date().toISOString(),
                          })
                        }
                      >
                        Registrar pago de{" "}
                        {formatMonth(thisMonth, settings.locale)}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title="Nueva compra a meses" onClose={() => setOpen(false)}>
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
