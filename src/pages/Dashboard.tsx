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

export function Dashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { cards, fixed, installments, settings } = useFinanceStore();
  const totals = computeTotals(fixed, installments);
  const advice = generateAdvice(settings, totals, fixed);
  const salary = settings.monthlySalary;

  const hasData = fixed.length > 0 || installments.length > 0;

  if (cards.length === 0 && !hasData) {
    return (
      <div className="card empty">
        <span className="empty__emoji" aria-hidden>
          👋
        </span>
        <p style={{ marginTop: 0 }}>
          ¡Bienvenido! Empieza añadiendo una tarjeta y registrando tus gastos
          fijos y compras a meses.
        </p>
        <button className="btn" onClick={() => onNavigate("cards")}>
          Añadir mi primera tarjeta
        </button>
      </div>
    );
  }

  const usageRatio = salary > 0 ? totals.total / salary : 0;
  const usageColor =
    usageRatio >= 1
      ? "var(--danger)"
      : usageRatio > 0.7
      ? "var(--warn)"
      : "var(--good)";

  // Datos para la gráfica de dona (obligaciones del mes por categoría).
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
            <div className="usage__track">
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
          <strong style={{ color: salary - totals.total < 0 ? "var(--danger)" : undefined }}>
            {salary > 0 ? formatCurrency(salary - totals.total, settings) : "—"}
          </strong>
        </div>
      </div>

      {pieData.length > 0 && (
        <div className="card">
          <h2>Distribución de gastos</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
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
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            {pieData.map((d) => (
              <div className="legend__item" key={d.name}>
                <span
                  className="dot"
                  style={{ background: CATEGORY_COLORS[d.name] ?? "#94a3b8" }}
                />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {bars.length > 0 && (
        <div className="card">
          <h2>Gasto mensual por tarjeta</h2>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bars.map((b) => ({
                  name: b.card.name,
                  total: b.total,
                  color: b.card.color,
                }))}
                margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value), settings)}
                  cursor={{ fill: "rgba(99,102,241,0.08)" }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {bars.map((b) => (
                    <Cell key={b.card.id} fill={b.card.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="section-title" style={{ marginTop: 4 }}>
        <span>Consejos financieros</span>
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
