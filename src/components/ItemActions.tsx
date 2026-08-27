import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

export function ItemActions({
  name,
  onEdit,
  onDelete,
  deleteMessage,
}: {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
  deleteMessage?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="icon-btn icon-btn--edit"
        aria-label={`Editar ${name}`}
        onClick={onEdit}
      >
        ✎
      </button>
      <button
        type="button"
        className="icon-btn icon-btn--danger"
        aria-label={`Eliminar ${name}`}
        onClick={() => setConfirming(true)}
      >
        🗑
      </button>
      {confirming && (
        <ConfirmDialog
          title={`Eliminar ${name}`}
          message={
            deleteMessage ??
            `¿Eliminar “${name}”? Esta acción no se puede deshacer.`
          }
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete();
          }}
        />
      )}
    </div>
  );
}
