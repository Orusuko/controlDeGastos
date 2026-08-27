import { useFinanceStore } from "../store/useFinanceStore";
import { formatCurrency } from "../lib/format";
import { computeTotals } from "../lib/finance";
import { generateAdvice } from "../lib/advice";
import { AdviceList } from "../components/AdviceList";
import type { View } from "../components/BottomNav";

export function StrategiesPage({
  onNavigate,
}: {
  onNavigate: (v: View) => void;
}) {
  const { fixed, installments, settings } = useFinanceStore();
  const totals = computeTotals(fixed, installments);
  const advice = generateAdvice(settings, totals, fixed, installments);
  const salary = settings.monthlySalary;
  const available = salary > 0 ? salary - totals.total : 0;
  const usage = salary > 0 ? totals.total / salary : 0;

  return (
    <>
      <div className="section-title">
        <h2>Estrategias de ahorro</h2>
      </div>

      <div className="hero-stat">
        <div className="hero-stat__label">Plan con tus números de este mes</div>
        <div className="hero-stat__value">
          {salary > 0 ? formatCurrency(Math.max(0, available), settings) : "—"}
        </div>
        <p className="strategy-hero__note">
          {salary > 0
            ? `Sobrante tras fijos y mensualidades · ${Math.round(usage * 100)}% del sueldo ya comprometido`
            : "Pon el sueldo en Ajustes para ver el porcentaje real"}
        </p>
        <div className="hero-stat__row">
          <div className="hero-stat__pill">
            <span>Fijos</span>
            <strong>{formatCurrency(totals.fixed, settings)}</strong>
          </div>
          <div className="hero-stat__pill">
            <span>A meses</span>
            <strong>{formatCurrency(totals.installments, settings)}</strong>
          </div>
        </div>
      </div>

      <p className="muted strategy-lead">
        Orden de ataque: cierra primero lo que ya casi acaba, recorta el fijo
        más caro y no abras otra mensualidad si el mes ya se come demasiado
        sueldo. Los nombres salen de tus tarjetas, no de un texto genérico.
      </p>

      <AdviceList items={advice} />

      <div className="strategy-links">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onNavigate("installments")}
        >
          Ir a Meses
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onNavigate("fixed")}
        >
          Ir a Fijos
        </button>
        {salary <= 0 && (
          <button
            type="button"
            className="btn"
            onClick={() => onNavigate("settings")}
          >
            Configurar sueldo
          </button>
        )}
      </div>
    </>
  );
}
