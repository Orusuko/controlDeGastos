import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useFinanceStore } from "../store/useFinanceStore";
import { formatCurrency } from "../lib/format";
import {
  cardBreakdowns,
  categoryBreakdown,
  computeTotals,
} from "../lib/finance";
import { generateAdvice, type AdviceLevel } from "../lib/advice";
import type { View } from "../components/BottomNav";
import { EmptyState } from "../components/EmptyState";

const CATEGORY_COLORS: Record<string, string> = {
  Streaming: "#ec4899",
  Servicios: "#0ea5e9",
  Software: "#8b5cf6",
  Membresías: "#f59e0b",
  Telefonía: "#14b8a6",
  Otros: "#64748b",
  Mensualidades: "#4f46e5",
};

const ADVICE_ICON: Record<AdviceLevel, string> = {
  good: "✓",
  info: "i",
  warn: "!",
  danger: "⚠",
};

function truncateLabel(value: string, max = 8): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function Dashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { cards, fixed, installments, settings } = useFinanceStore();
  const totals = computeTotals(fixed, installments);
  const advice = generateAdvice(settings, totals, fixed);
  const salary = settings.monthlySalary;

  const hasData = fixed.length > 0 || installments.length > 0;

  if (cards.length === 0 && !hasData) {
    return (
      <EmptyState
        emoji="👋"
        action={
          <button
            type="button"
            className="btn"
            onClick={() => onNavigate("cards")}
          >
            Añadir mi primera tarjeta
          </button>
        }
      >
        Empieza con una tarjeta y registra tus gastos fijos y compras a meses.
        Todo se queda en este teléfono.
      </EmptyState>
    );
  }

  const usageRatio = salary > 0 ? totals.total / salary : 0;
  const usageColor =
    usageRatio >= 1
      ? "var(--danger)"
      : usageRatio > 0.7
      ? "var(--warn)"
      : "var(--good)";

  const pieData = [
    ...categoryBreakdown(fixed).map((c) => ({
      name: c.category,
      value: c.total,
    })),
    ...(totals.installments > 0
      ? [{ name: "Mensualidades", value: totals.installments }]
      : []),
  ];

  const bars = cardBreakdowns(cards, fixed, installments).filter(
    (b) => b.total > 0
  );

  return (
    <>
      <div className="hero-stat">
        <div className="hero-stat__label">Pagos de este mes</div>
        <div className="hero-stat__value">
          {formatCurrency(totals.total, settings)}
        </div>

        {salary > 0 && (
          <div className="usage">
            <div
              className="usage__track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(Math.min(100, usageRatio * 100))}
              aria-label="Porcentaje del sueldo destinado a pagos"
            >
              <div
                className="usage__fill"
                style={{
                  width: `${Math.min(100, usageRatio * 100)}%`,
                  background: usageColor,
                }}
              />
            </div>
            <div className="usage__legend">
              <span>{Math.round(usageRatio * 100)}% de tu sueldo</span>
              <span>{formatCurrency(salary, settings)}</span>
            </div>
          </div>
        )}

        <div className="hero-stat__row">
          <div className="hero-stat__pill">
            <span>Gastos fijos</span>
            <strong>{formatCurrency(totals.fixed, settings)}</strong>
          </div>
          <div className="hero-stat__pill">
            <span>Mensualidades</span>
            <strong>{formatCurrency(totals.installments, settings)}</strong>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="mini-stat">
          <span>Deuda a meses pendiente</span>
          <strong>{formatCurrency(totals.remainingDebt, settings)}</strong>
        </div>
        <div className="mini-stat">
          <span>Disponible tras pagos</span>
          <strong
            style={{
              color: salary - totals.total < 0 ? "var(--danger)" : undefined,
            }}
          >
            {salary > 0 ? formatCurrency(salary - totals.total, settings) : "—"}
          </strong>
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="card">
          <h2>Distribución de gastos</h2>
          <div className="chart-box chart-box--donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="var(--surface)"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CATEGORY_COLORS[entry.name] ?? "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value), settings)}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--text)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-donut-center" aria-hidden>
              <span>Total</span>
              <strong>{formatCurrency(totals.total, settings)}</strong>
            </div>
          </div>
          <div className="legend">
            {pieData.map((d) => (
              <div className="legend__item" key={d.name}>
                <span
                  className="dot"
                  style={{ background: CATEGORY_COLORS[d.name] ?? "#94a3b8" }}
                />
                <span className="legend__name">{d.name}</span>
                <span className="legend__value">
                  {formatCurrency(d.value, settings)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {bars.length > 0 && (
        <div className="card">
          <h2>Gasto mensual por tarjeta</h2>
          <div className="chart-box chart-box--bars">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bars.map((b) => ({
                  name: b.card.name,
                  total: b.total,
                  color: b.card.color,
                }))}
                margin={{ top: 8, right: 4, left: 0, bottom: 4 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                  tickFormatter={(v) => truncateLabel(String(v))}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value), settings)}
                  cursor={{ fill: "rgba(99,102,241,0.08)" }}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--text)",
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {bars.map((b) => (
                    <Cell key={b.card.id} fill={b.card.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="section-title">
        <h2>Consejos financieros</h2>
      </div>
      <div className="list">
        {advice.map((a, i) => (
          <div className={`advice advice--${a.level}`} key={i}>
            <div className="advice__icon" aria-hidden>
              {ADVICE_ICON[a.level]}
            </div>
            <div>
              <div className="advice__title">{a.title}</div>
              <div className="advice__text">{a.text}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
