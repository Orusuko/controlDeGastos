import { Modal } from "./Modal";
import { AUTO_BACKUP_LABEL_DOCUMENTS } from "../lib/autoBackup";

export function BackupSetupModal({
  busy,
  error,
  canPickFolder,
  onUseDocuments,
  onPickFolder,
  onSkip,
}: {
  busy: boolean;
  error: string | null;
  canPickFolder: boolean;
  onUseDocuments: () => void;
  onPickFolder: () => void;
  onSkip: () => void;
}) {
  return (
    <Modal title="Carpeta de respaldo" onClose={onSkip}>
      <p className="confirm-msg">
        Al desinstalar se borra lo que vive en la app. Elige ahora una carpeta
        fuera (en el teléfono: Documentos) y el JSON se actualizará solo, con
        fecha, hora, montos, gastos y préstamos. Si reinstalas, apunta a la
        misma ruta para recuperarlo.
      </p>
      <p className="muted">Ruta por defecto: {AUTO_BACKUP_LABEL_DOCUMENTS}</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="modal__actions modal__actions--stack">
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={onUseDocuments}
        >
          Usar Documentos
        </button>
        {canPickFolder && (
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={onPickFolder}
          >
            Elegir otra carpeta
          </button>
        )}
        <button
          type="button"
          className="btn btn--ghost"
          disabled={busy}
          onClick={onSkip}
        >
          Ahora no
        </button>
      </div>
    </Modal>
  );
}
