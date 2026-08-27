import { Modal } from "./Modal";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel} role="alertdialog">
      <p className="confirm-msg">{message}</p>
      <div className="modal__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
