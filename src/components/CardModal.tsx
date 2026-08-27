import { useState } from "react";
import { Modal } from "./Modal";
import { ColorSwatches } from "./ColorSwatches";
import { CARD_COLORS } from "../lib/colors";
import type { Card } from "../types";

export function CardModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Card | null;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? CARD_COLORS[0]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color);
  }

  return (
    <Modal
      title={initial ? "Editar tarjeta" : "Nueva tarjeta"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="card-name">Nombre de la tarjeta</label>
          <input
            id="card-name"
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
        <div className="field">
          <label>Color</label>
          <ColorSwatches value={color} onChange={setColor} />
        </div>
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
