import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { useFinanceStore } from "../store/useFinanceStore";
import { currentMonth, formatCurrency } from "../lib/format";
import {
  cardBreakdowns,
  computeTotals,
  monthPieSlices,
  type PieSlice,
} from "../lib/finance";
import { generateAdvice } from "../lib/advice";
import type { View } from "../components/BottomNav";
import { EmptyState } from "../components/EmptyState";
import { AdviceList } from "../components/AdviceList";
import { IconCard } from "../components/icons";
import { CATEGORY_COLORS, CATEGORY_FALLBACK } from "../lib/colors";

function truncateLabel(value: string, max = 8): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function Dashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { cards, fixed, installments, expenses, loans, settings } =
    useFinanceStore();
  const [inspect, setInspect] = useState<PieSlice | null>(null);
  const [barInspect, setBarInspect] = useState<string | null>(null);
  const totals = computeTotals(fixed, installments, expenses, loans);
  const advice = generateAdvice(settings, totals, fixed, installments);
  const salary = settings.monthlySalary;
  const month = currentMonth();

  const hasData =
    fixed.length > 0 ||
    installments.length > 0 ||
    expenses.length > 0 ||
    loans.length > 0;

  if (!hasData && cards.length === 0) {
    return (
      <EmptyState
        icon={<IconCard />}
        action={
          <button
            type="button"
            className="btn"
            onClick={() => onNavigate("expenses")}
          >
            Registrar un gasto
          </button>
        }
      >
        Empieza con un gasto del día, un préstamo o una tarjeta. Todo se queda
        en este teléfono.
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

  const pieData = monthPieSlices(
    fixed,
    expenses,
    totals.installments,
    month
  );

  const bars = cardBreakdowns(
    cards,
    fixed,
    installments,
    expenses,
    month
  ).filter((b) => b.total > 0);

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
          <div className="hero-stat__pill">
            <span>Este mes</span>
            <strong>{formatCurrency(totals.expenses, settings)}</strong>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="mini-stat">
          <span>Deuda a meses pendiente</span>
          <strong>{formatCurrency(totals.remainingDebt, settings)}</strong>
        </div>
        <div className="mini-stat">
          <span>Yo debo</span>
          <strong>{formatCurrency(totals.loanOwed, settings)}</strong>
        </div>
        <div className="mini-stat mini-stat--good">
          <span>Me deben</span>
          <strong>{formatCurrency(totals.loanReceivable, settings)}</strong>
        </div>
        <div className="mini-stat mini-stat--good">
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
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="var(--surface)"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.key}
                      fill={
                        CATEGORY_COLORS[entry.colorKey] ?? CATEGORY_FALLBACK
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-donut-center" aria-hidden>
              <span>Total</span>
              <strong>{formatCurrency(totals.total, settings)}</strong>
            </div>
          </div>
          <div className="legend">
            {pieData.map((d) => (
              <button
                type="button"
                className={
                  inspect?.key === d.key
                    ? "legend__item legend__item--on"
                    : "legend__item"
                }
                key={d.key}
                onClick={() =>
                  setInspect((cur) => (cur?.key === d.key ? null : d))
                }
              >
                <span
                  className="dot"
                  style={{
                    background: CATEGORY_COLORS[d.colorKey] ?? CATEGORY_FALLBACK,
                  }}
                />
                <span className="legend__name">{d.name}</span>
                <span className="legend__value">
                  {formatCurrency(d.value, settings)}
                </span>
              </button>
            ))}
          </div>
          {inspect && (
            <p className="chart-inspect" role="status">
              {inspect.name}: {formatCurrency(inspect.value, settings)}
            </p>
          )}
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
                <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={48}>
                  {bars.map((b) => (
                    <Cell key={b.card.id} fill={b.card.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            {bars.map((b) => (
              <button
                type="button"
                className={
                  barInspect === b.card.id
                    ? "legend__item legend__item--on"
                    : "legend__item"
                }
                key={b.card.id}
                onClick={() =>
                  setBarInspect((cur) => (cur === b.card.id ? null : b.card.id))
                }
              >
                <span className="dot" style={{ background: b.card.color }} />
                <span className="legend__name">{b.card.name}</span>
                <span className="legend__value">
                  {formatCurrency(b.total, settings)}
                </span>
              </button>
            ))}
          </div>
          {barInspect &&
            bars
              .filter((b) => b.card.id === barInspect)
              .map((b) => (
                <p className="chart-inspect" role="status" key={b.card.id}>
                  {b.card.name}: {formatCurrency(b.total, settings)}
                  {b.expenses > 0
                    ? ` · gastos ${formatCurrency(b.expenses, settings)}`
                    : ""}
                </p>
              ))}
        </div>
      )}

      <div className="section-title">
        <h2>Estrategias de ahorro</h2>
        <button
          type="button"
          className="back-link"
          onClick={() => onNavigate("strategies")}
        >
          Ver plan
        </button>
      </div>
      <AdviceList items={advice.slice(0, 3)} />
      {advice.length > 3 && (
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onNavigate("strategies")}
        >
          Ver las {advice.length} estrategias
        </button>
      )}
    </>
  );
}
