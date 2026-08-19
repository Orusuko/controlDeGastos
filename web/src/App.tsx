import { useEffect, useMemo, useState } from "react";
import { api, type Expense, type Summary } from "./api";

const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const CATEGORY_COLORS: Record<string, string> = {
  Alimentación: "#f97316",
  Transporte: "#3b82f6",
  Vivienda: "#8b5cf6",
  Ocio: "#ec4899",
  Salud: "#10b981",
  Otros: "#64748b",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentación");
  const [date, setDate] = useState(today());

  async function refresh() {
    const [exp, sum] = await Promise.all([
      api.listExpenses(),
      api.getSummary(),
    ]);
    setExpenses(exp);
    setSummary(sum);
  }

  useEffect(() => {
    (async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.createExpense({
        description,
        amount: Number(amount),
        category,
        date,
      });
      setDescription("");
      setAmount("");
      setDate(today());
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el gasto");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await api.deleteExpense(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  }

  const maxCategoryTotal = useMemo(
    () => Math.max(1, ...(summary?.byCategory.map((c) => c.total) ?? [1])),
    [summary]
  );

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__brand">
          <span className="hero__logo" aria-hidden>
            €
          </span>
          <div>
            <h1>controlDeGastos</h1>
            <p>Gestiona tus gastos personales de forma sencilla.</p>
          </div>
        </div>
        <div className="hero__total">
          <span>Total gastado</span>
          <strong>{currency.format(summary?.total ?? 0)}</strong>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      <main className="layout">
        <section className="card form-card">
          <h2>Nuevo gasto</h2>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Descripción
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Compra del supermercado"
                required
              />
            </label>
            <div className="form__row">
              <label>
                Importe (€)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </label>
              <label>
                Fecha
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>
            </div>
            <label>
              Categoría
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Añadir gasto"}
            </button>
          </form>
        </section>

        <section className="card summary-card">
          <h2>Resumen por categoría</h2>
          {summary && summary.byCategory.length > 0 ? (
            <ul className="bars">
              {summary.byCategory.map((c) => (
                <li key={c.category}>
                  <div className="bars__label">
                    <span
                      className="dot"
                      style={{
                        background: CATEGORY_COLORS[c.category] ?? "#64748b",
                      }}
                    />
                    {c.category}
                    <span className="bars__value">
                      {currency.format(c.total)}
                    </span>
                  </div>
                  <div className="bars__track">
                    <div
                      className="bars__fill"
                      style={{
                        width: `${(c.total / maxCategoryTotal) * 100}%`,
                        background: CATEGORY_COLORS[c.category] ?? "#64748b",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">Aún no hay datos que resumir.</p>
          )}
        </section>

        <section className="card list-card">
          <h2>Movimientos {expenses.length > 0 && `(${expenses.length})`}</h2>
          {loading ? (
            <p className="empty">Cargando…</p>
          ) : expenses.length === 0 ? (
            <p className="empty">Todavía no has registrado ningún gasto.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th className="right">Importe</th>
                  <th aria-label="acciones" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td>{exp.description}</td>
                    <td>
                      <span
                        className="tag"
                        style={{
                          background: `${
                            CATEGORY_COLORS[exp.category] ?? "#64748b"
                          }22`,
                          color: CATEGORY_COLORS[exp.category] ?? "#64748b",
                        }}
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td className="right amount">
                      {currency.format(exp.amount)}
                    </td>
                    <td className="right">
                      <button
                        className="icon-btn"
                        onClick={() => handleDelete(exp.id)}
                        aria-label={`Eliminar ${exp.description}`}
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
