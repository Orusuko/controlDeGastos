import { useId, useRef, useState, type ChangeEvent } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { formatCurrency } from "../lib/format";
import { APP_VERSION_CODE, APP_VERSION_NAME } from "../lib/appVersion";
import { saveBackupFile } from "../lib/shareBackup";
import {
  backupFilename,
  backupSummary,
  parseBackupJson,
  serializeBackup,
  type ParseBackupResult,
} from "../store/backup";
import type { PersistedSlice } from "../store/persist";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type { ThemePreference } from "../types";

const CURRENCIES: { code: string; label: string; locale: string }[] = [
  { code: "MXN", label: "Peso mexicano (MXN)", locale: "es-MX" },
  { code: "USD", label: "Dólar (USD)", locale: "en-US" },
  { code: "EUR", label: "Euro (EUR)", locale: "es-ES" },
  { code: "COP", label: "Peso colombiano (COP)", locale: "es-CO" },
  { code: "ARS", label: "Peso argentino (ARS)", locale: "es-AR" },
  { code: "CLP", label: "Peso chileno (CLP)", locale: "es-CL" },
  { code: "PEN", label: "Sol peruano (PEN)", locale: "es-PE" },
];

const THEMES: { value: ThemePreference; label: string; hint: string }[] = [
  { value: "system", label: "Automático", hint: "Como el teléfono" },
  { value: "light", label: "Claro", hint: "Fondo claro" },
  { value: "dark", label: "Oscuro", hint: "Fondo oscuro" },
];

type Status = { kind: "ok" | "err"; text: string } | null;

export function SettingsPage() {
  const { settings, updateSettings, resetAll, importBackup } = useFinanceStore();
  const [salary, setSalary] = useState(
    settings.monthlySalary ? String(settings.monthlySalary) : ""
  );
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingImport, setPendingImport] = useState<PersistedSlice | null>(
    null
  );
  const [status, setStatus] = useState<Status>(null);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const theme: ThemePreference = settings.theme ?? "system";
  const salaryId = useId();
  const currencyId = useId();
  const backupFileId = useId();

  function saveSalary(value: string) {
    setSalary(value);
    const n = Number(value);
    updateSettings({ monthlySalary: Number.isFinite(n) && n > 0 ? n : 0 });
  }

  function changeCurrency(code: string) {
    const c = CURRENCIES.find((x) => x.code === code) ?? CURRENCIES[0];
    updateSettings({ currency: c.code, locale: c.locale });
  }

  async function onExport() {
    setExporting(true);
    setStatus(null);
    try {
      const state = useFinanceStore.getState();
      const json = serializeBackup({
        cards: state.cards,
        fixed: state.fixed,
        installments: state.installments,
        settings: state.settings,
      });
      const mode = await saveBackupFile(json, backupFilename());
      setStatus({
        kind: "ok",
        text:
          mode === "shared"
            ? "Elige dónde guardar o enviar el archivo JSON."
            : "Respaldo descargado. Guárdalo fuera del teléfono si vas a desinstalar.",
      });
    } catch {
      setStatus({
        kind: "err",
        text: "No se pudo exportar el respaldo. Inténtalo de nuevo.",
      });
    } finally {
      setExporting(false);
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
    setSalary(
      pendingImport.settings.monthlySalary
        ? String(pendingImport.settings.monthlySalary)
        : ""
    );
    const s = backupSummary(pendingImport);
    setPendingImport(null);
    setStatus({
      kind: "ok",
      text: `Respaldo restaurado: ${s.cards} tarjetas, ${s.fixed} fijos, ${s.installments} mensualidades.`,
    });
  }

  const importSummary = pendingImport ? backupSummary(pendingImport) : null;

  return (
    <>
      <div className="card">
        <h2>Apariencia</h2>
        <div className="theme-card__preview" aria-hidden />
        <p className="muted" style={{ marginTop: 0 }}>
          Elige si la app se ve clara u oscura. Automático sigue el tema del
          teléfono.
        </p>
        <div className="seg seg--grow" role="radiogroup" aria-label="Tema">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={theme === t.value}
              aria-pressed={theme === t.value}
              title={t.hint}
              onClick={() => updateSettings({ theme: t.value })}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Sueldo mensual</h2>
        <div className="field">
          <label htmlFor={salaryId}>¿Cuánto ganas al mes (aprox.)?</label>
          <input
            id={salaryId}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={salary}
            placeholder="0.00"
            onWheel={(e) => e.currentTarget.blur()}
            onChange={(e) => saveSalary(e.target.value)}
          />
          <span className="muted">
            Sirve para ver qué parte de tu sueldo se va en pagos. Nunca sale de
            tu teléfono.
          </span>
        </div>
        {settings.monthlySalary > 0 && (
          <p className="muted">
            Sueldo actual:{" "}
            <strong>{formatCurrency(settings.monthlySalary, settings)}</strong>
          </p>
        )}
      </div>

      <div className="card">
        <h2>Moneda</h2>
        <div className="field">
          <label htmlFor={currencyId}>Moneda</label>
          <select
            id={currencyId}
            value={settings.currency}
            onChange={(e) => changeCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <h2>Respaldo</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Exporta un JSON con tarjetas, gastos fijos, mensualidades y ajustes.
          Hazlo <strong>antes de desinstalar</strong>. Actualizar encima no
          borra datos; desinstalar sí. Si Android bloquea la instalación por
          otra firma, exporta → desinstala → instala → importa.
        </p>
        <div className="settings-actions">
          <button
            type="button"
            className="btn"
            onClick={() => void onExport()}
            disabled={exporting}
          >
            {exporting ? "Preparando respaldo…" : "Exportar respaldo"}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onPickBackup}
          >
            Importar respaldo
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
      </div>

      <div className="card">
        <h2>Datos</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Toda tu información se guarda en este dispositivo. Actualizar la app
          no borra tus datos; desinstalarla sí.
        </p>
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => setConfirmReset(true)}
        >
          Borrar todos los datos
        </button>
      </div>

      <p className="muted" style={{ textAlign: "center" }}>
        Control Financiero · v{APP_VERSION_NAME} ({APP_VERSION_CODE})
        <br />
        Datos locales en tu teléfono
      </p>

      {confirmReset && (
        <ConfirmDialog
          title="Borrar todos los datos"
          message="Se eliminarán tarjetas, gastos y mensualidades. Esta acción no se puede deshacer."
          confirmLabel="Borrar todo"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            resetAll();
            setSalary("");
            setConfirmReset(false);
          }}
        />
      )}

      {pendingImport && importSummary && (
        <ConfirmDialog
          title="Reemplazar todos los datos"
          message={`Se sustituirán tarjetas, gastos y mensualidades actuales por este respaldo: ${importSummary.cards} tarjetas, ${importSummary.fixed} fijos, ${importSummary.installments} mensualidades. Esta acción no se puede deshacer.`}
          confirmLabel="Reemplazar todo"
          onCancel={() => setPendingImport(null)}
          onConfirm={confirmImport}
        />
      )}
    </>
  );
}
