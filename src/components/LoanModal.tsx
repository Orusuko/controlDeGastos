import { useId, useState } from "react";
import { Modal } from "./Modal";
import type { Loan, LoanDirection, LoanParty } from "../types";

function partyRow(partial?: Partial<LoanParty>): LoanParty {
  return {
    id:
      partial?.id ??
      Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: partial?.name ?? "",
    shareAmount: partial?.shareAmount ?? 0,
  };
}

export function LoanModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Loan | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    direction: LoanDirection;
    parties: LoanParty[];
    note?: string;
  }) => void;
}) {
  const ids = { title: useId(), note: useId() };
  const [title, setTitle] = useState(initial?.title ?? "");
  const [direction, setDirection] = useState<LoanDirection>(
    initial?.direction ?? "a_favor"
  );
  const [parties, setParties] = useState<LoanParty[]>(
    initial?.parties.length
      ? initial.parties.map((p) => ({ ...p }))
      : [partyRow()]
  );
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);

  function setParty(id: string, patch: Partial<LoanParty>) {
    setParties((rows) => rows.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Ponle un nombre al préstamo.");
    const cleaned = parties
      .map((p) => ({
        ...p,
        name: p.name.trim(),
        shareAmount: Number(p.shareAmount),
      }))
      .filter((p) => p.name || p.shareAmount);
    if (cleaned.length === 0)
      return setError("Añade al menos una persona con importe.");
    if (cleaned.some((p) => !p.name))
      return setError("Cada persona necesita un nombre.");
    if (cleaned.some((p) => !Number.isFinite(p.shareAmount) || p.shareAmount <= 0))
      return setError("Cada persona necesita un importe mayor que cero.");
    onSave({
      title: title.trim(),
      direction,
      parties: cleaned,
      note: note.trim() || undefined,
    });
  }

  const total = parties.reduce((sum, p) => {
    const n = Number(p.shareAmount);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <Modal
      title={initial ? "Editar préstamo" : "Registrar préstamo"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <fieldset className="choice-set">
          <legend>Sentido del préstamo</legend>
          <div className="choice-grid">
            <button
              type="button"
              className={
                direction === "a_favor"
                  ? "choice-card choice-card--on"
                  : "choice-card"
              }
              aria-pressed={direction === "a_favor"}
              onClick={() => setDirection("a_favor")}
            >
              <strong>A favor</strong>
              <span>Me prestaron · yo debo</span>
            </button>
            <button
              type="button"
              className={
                direction === "en_contra"
                  ? "choice-card choice-card--on"
                  : "choice-card"
              }
              aria-pressed={direction === "en_contra"}
              onClick={() => setDirection("en_contra")}
            >
              <strong>En contra</strong>
              <span>Yo presté · me deben</span>
            </button>
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor={ids.title}>Nombre</label>
          <input
            id={ids.title}
            type="text"
            value={title}
            autoFocus
            placeholder={
              direction === "a_favor" ? "Préstamo de Ana…" : "Renta de Beto…"
            }
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="party-head">
          <span>Personas e importes</span>
          <button
            type="button"
            className="back-link"
            onClick={() => setParties((rows) => [...rows, partyRow()])}
          >
            Añadir persona
          </button>
        </div>
        {parties.map((p, index) => (
          <div className="party-row" key={p.id}>
            <div className="field">
              <label htmlFor={`${ids.title}-n-${p.id}`}>
                {direction === "a_favor" ? "Quién me prestó" : "Quién me debe"}{" "}
                {parties.length > 1 ? index + 1 : ""}
              </label>
              <input
                id={`${ids.title}-n-${p.id}`}
                type="text"
                value={p.name}
                placeholder="Nombre"
                onChange={(e) => setParty(p.id, { name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor={`${ids.title}-a-${p.id}`}>Importe</label>
              <input
                id={`${ids.title}-a-${p.id}`}
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={p.shareAmount ? String(p.shareAmount) : ""}
                placeholder="0.00"
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) =>
                  setParty(p.id, { shareAmount: Number(e.target.value) })
                }
              />
            </div>
            {parties.length > 1 && (
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                aria-label={`Quitar a ${p.name || "esta persona"}`}
                onClick={() =>
                  setParties((rows) => rows.filter((row) => row.id !== p.id))
                }
              >
                ×
              </button>
            )}
          </div>
        ))}

        <p className="muted">
          Total del préstamo: <strong>{total.toFixed(2)}</strong>
        </p>

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
