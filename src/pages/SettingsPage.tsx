import { useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { formatCurrency } from "../lib/format";
import { isNativeApp } from "../lib/native";

const CURRENCIES: { code: string; label: string; locale: string }[] = [
  { code: "MXN", label: "Peso mexicano (MXN)", locale: "es-MX" },
  { code: "USD", label: "Dólar (USD)", locale: "en-US" },
  { code: "EUR", label: "Euro (EUR)", locale: "es-ES" },
  { code: "COP", label: "Peso colombiano (COP)", locale: "es-CO" },
  { code: "ARS", label: "Peso argentino (ARS)", locale: "es-AR" },
  { code: "CLP", label: "Peso chileno (CLP)", locale: "es-CL" },
  { code: "PEN", label: "Sol peruano (PEN)", locale: "es-PE" },
];

export function SettingsPage() {
  const { settings, updateSettings, resetAll } = useFinanceStore();
  const [salary, setSalary] = useState(
    settings.monthlySalary ? String(settings.monthlySalary) : ""
  );

  function saveSalary(value: string) {
    setSalary(value);
    const n = Number(value);
    updateSettings({ monthlySalary: Number.isFinite(n) && n > 0 ? n : 0 });
  }

  function changeCurrency(code: string) {
    const c = CURRENCIES.find((x) => x.code === code) ?? CURRENCIES[0];
    updateSettings({ currency: c.code, locale: c.locale });
  }

  return (
    <>
      <div className="card">
        <h2>Sueldo mensual</h2>
        <div className="field">
          <label>¿Cuánto ganas al mes (aprox.)?</label>
          <input
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
            Se usa para calcular qué porcentaje de tu sueldo destinas a pagos y
            darte consejos. Nunca sale de tu teléfono.
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
          <label>Divisa</label>
          <select
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
        <h2>Datos</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Toda tu información se guarda localmente en este dispositivo.
          Nunca sale del teléfono. Está preparada para migrarse a una base
          de datos en la nube más adelante.
        </p>
        <button
          className="btn btn--danger"
          onClick={() => {
            if (
              confirm(
                "¿Borrar todos los datos (tarjetas, gastos y mensualidades)? Esta acción no se puede deshacer."
              )
            ) {
              resetAll();
              setSalary("");
            }
          }}
        >
          Borrar todos los datos
        </button>
      </div>

      <p className="muted" style={{ textAlign: "center" }}>
        Control Financiero ·{" "}
        {isNativeApp() ? "app Android · " : ""}datos locales en tu teléfono
      </p>
    </>
  );
}
