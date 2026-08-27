import { useId, useState } from "react";
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
  const nameId = useId();
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? CARD_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Escribe un nombre para distinguir la tarjeta.");
      return;
    }
    onSave(name.trim(), color);
  }

  return (
    <Modal
      title={initial ? "Editar tarjeta" : "Nueva tarjeta"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor={nameId}>Nombre de la tarjeta</label>
          <input
            id={nameId}
            type="text"
            value={name}
            autoFocus
            placeholder="Ej. BBVA Oro, Nu, Amex…"
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
          />
          <span className="muted">
            No se guardan datos bancarios, solo un nombre para distinguirla.
          </span>
        </div>
        <div className="field">
          <span className="field__label">Color</span>
          <ColorSwatches value={color} onChange={setColor} />
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
