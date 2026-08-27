import { useId, useRef, useState, type ChangeEvent } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { backupReadyMessage, copyBackupText, saveBackupFile } from "../lib/shareBackup";
import {
  backupFilename,
  backupSummary,
  parseBackupJson,
  serializeBackup,
  type ParseBackupResult,
} from "../store/backup";
import type { PersistedSlice } from "../store/persist";
import { ConfirmDialog } from "./ConfirmDialog";

type Status = { kind: "ok" | "err"; text: string } | null;

function countLabel(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

function summarizeBackup(slice: PersistedSlice): string {
  const s = backupSummary(slice);
  return `${countLabel(s.cards, "tarjeta", "tarjetas")}, ${countLabel(s.fixed, "fijo", "fijos")}, ${countLabel(s.installments, "mensualidad", "mensualidades")}`;
}

function currentJson(): string {
  const state = useFinanceStore.getState();
  return serializeBackup({
    cards: state.cards,
    fixed: state.fixed,
    installments: state.installments,
    settings: state.settings,
  });
}

export function BackupPanel({
  onImported,
}: {
  onImported?: (slice: PersistedSlice) => void;
}) {
  const importBackup = useFinanceStore((s) => s.importBackup);
  const [pendingImport, setPendingImport] = useState<PersistedSlice | null>(
    null
  );
  const [status, setStatus] = useState<Status>(null);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const backupFileId = useId();

  async function onExport() {
    setExporting(true);
    setStatus(null);
    try {
      const mode = await saveBackupFile(currentJson(), backupFilename());
      setStatus({ kind: "ok", text: backupReadyMessage(mode) });
    } catch {
      setStatus({
        kind: "err",
        text: "No se pudo exportar el respaldo. Prueba Copiar JSON.",
      });
    } finally {
      setExporting(false);
    }
  }

  async function onCopy() {
    setStatus(null);
    try {
      await copyBackupText(currentJson());
      setStatus({
        kind: "ok",
        text: "Archivo listo. El JSON se copió al portapapeles.",
      });
    } catch {
      setStatus({
        kind: "err",
        text: "No se pudo copiar. Usa Exportar respaldo y elige Guardar.",
      });
    }
  }

  function onPickBackup() {
    fileRef.current?.click();
  }

  async function onBackupFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setStatus(null);
    let parsed: ParseBackupResult;
    try {
      parsed = parseBackupJson(await file.text());
    } catch {
      setStatus({
        kind: "err",
        text: "No se pudo leer el archivo. No se modificaron tus datos.",
      });
      return;
    }
    if (!parsed.ok) {
      setStatus({ kind: "err", text: parsed.error });
      return;
    }
    setPendingImport(parsed.data);
  }

  function confirmImport() {
    if (!pendingImport) return;
    importBackup(pendingImport);
    onImported?.(pendingImport);
    setPendingImport(null);
    setStatus({
      kind: "ok",
      text: `Respaldo restaurado: ${summarizeBackup(pendingImport)}.`,
    });
  }

  return (
    <div className="card card--backup" id="respaldo">
      <h2>Respaldo</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Exporta un JSON con tarjetas, gastos fijos, mensualidades y ajustes.
        Hazlo <strong>antes de desinstalar</strong>. Actualizar encima no borra
        datos; desinstalar sí.
      </p>
      <div className="settings-actions">
        <button
          type="button"
          className="btn btn--backup"
          onClick={() => void onExport()}
          disabled={exporting}
        >
          {exporting ? "Preparando respaldo…" : "Exportar respaldo"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onPickBackup}>
          Importar respaldo
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => void onCopy()}
        >
          Copiar JSON
        </button>
        <input
          id={backupFileId}
          ref={fileRef}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          onChange={(e) => void onBackupFile(e)}
        />
      </div>
      {status && (
        <p
          className={
            status.kind === "ok"
              ? "settings-status settings-status--ok"
              : "settings-status settings-status--err"
          }
          role="status"
        >
          {status.text}
        </p>
      )}
      {pendingImport && (
        <ConfirmDialog
          title="Reemplazar todos los datos"
          message={`Se sustituirán tarjetas, gastos y mensualidades actuales por este respaldo: ${summarizeBackup(pendingImport)}. Esta acción no se puede deshacer.`}
          confirmLabel="Reemplazar todo"
          onCancel={() => setPendingImport(null)}
          onConfirm={confirmImport}
        />
      )}
    </div>
  );
}
