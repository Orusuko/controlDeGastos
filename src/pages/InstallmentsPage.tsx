import { useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { Modal } from "../components/Modal";
import { currentMonth, formatCurrency, formatMonth } from "../lib/format";
import { formInt, formNumber, formString } from "../lib/form";
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
  const [error, setError] = useState<string | null>(null);

  const thisMonth = currentMonth();

  function openModal() {
    setName("");
    setTotal("");
    setMonths("");
    setCardId(cards[0]?.id ?? "");
    setStartMonth(currentMonth());
    setError(null);
    setOpen(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const itemName = formString(form, "name");
    const totalAmount = formNumber(form, "total");
    const m = formInt(form, "months");
    const selectedCard = formString(form, "cardId") || cardId;
    const start = formString(form, "startMonth") || startMonth;

    if (!itemName) return setError("Escribe qué compraste.");
    if (!Number.isFinite(totalAmount) || totalAmount <= 0)
      return setError("Indica un total pendiente mayor que cero.");
    if (!Number.isFinite(m) || m <= 0)
      return setError("Indica un número de meses válido (entero mayor que 0).");
    if (!selectedCard) return setError("Selecciona una tarjeta.");

    addInstallment({
      name: itemName,
      totalAmount,
      months: m,
      cardId: selectedCard,
      startMonth: start,
    });
    setError(null);
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
                name="name"
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
                  name="total"
                  type="text"
                  inputMode="decimal"
                  value={total}
                  placeholder="0.00"
                  onChange={(e) => setTotal(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Nº de meses</label>
                <input
                  name="months"
                  type="text"
                  inputMode="numeric"
                  value={months}
                  placeholder="12"
                  onChange={(e) => setMonths(e.target.value)}
                />
              </div>
            </div>
            {Number(total.replace(",", ".")) > 0 &&
              Number(months.replace(",", ".")) > 0 && (
              <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
                Pago mensual estimado:{" "}
                <strong>
                  {formatCurrency(
                    Number(total.replace(",", ".")) /
                      Number(months.replace(",", ".")),
                    settings
                  )}
                </strong>
              </p>
            )}
            <div className="field-row">
              <div className="field">
                <label>Tarjeta</label>
                <select
                  name="cardId"
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
                  name="startMonth"
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
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
