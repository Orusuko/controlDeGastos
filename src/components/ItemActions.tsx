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
        onClick={() => {
          if (
            confirm(deleteMessage ?? `¿Eliminar "${name}"?`)
          ) {
            onDelete();
          }
        }}
      >
        🗑
      </button>
    </div>
  );
}
