import { useMemo, useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { ExpenseModal } from "../components/ExpenseModal";
import { ExpenseItem } from "../components/ExpenseItem";
import { ViewToolbar } from "../components/ViewToolbar";
import { EmptyState } from "../components/EmptyState";
import { IconPlus, IconReceipt } from "../components/icons";
import { currentMonth, formatCurrency, formatMonth } from "../lib/format";
import {
  expensesInMonth,
  expensesTotal,
  uniqueExpenseMonths,
} from "../lib/expenses";
import { sortExpenses } from "../lib/sort";
import type { Expense, ExpenseSort, ListLayout, SortDir } from "../types";

const SORT_OPTIONS: { value: ExpenseSort; label: string }[] = [
  { value: "date", label: "Fecha" },
  { value: "amount", label: "Importe" },
  { value: "name", label: "Nombre" },
];

const DIR_LABELS: Record<ExpenseSort, { asc: string; desc: string }> = {
  date: { asc: "Más viejos", desc: "Más recientes" },
  amount: { asc: "Más baratos", desc: "Más caros" },
  name: { asc: "A → Z", desc: "Z → A" },
};

export function ExpensesPage() {
  const {
    cards,
    expenses,
    settings,
    addExpense,
    updateExpense,
    removeExpense,
    updateSettings,
  } = useFinanceStore();
  const [modal, setModal] = useState<Expense | null | "new">(null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const layout: ListLayout = settings.expenseLayout ?? "list";
  const sort: ExpenseSort = settings.expenseSort ?? "date";
  const sortDir: SortDir = settings.expenseSortDir ?? "desc";
  const months = useMemo(
    () => uniqueExpenseMonths(expenses, currentMonth()),
    [expenses]
  );
  const monthItems = useMemo(
    () => sortExpenses(expensesInMonth(expenses, selectedMonth), sort, sortDir),
    [expenses, selectedMonth, sort, sortDir]
  );
  const monthTotal = expensesTotal(monthItems);
  const cardName = (id?: string) =>
    id ? cards.find((c) => c.id === id)?.name : undefined;

  return (
    <>
      <div className="section-title">
        <h2>Registrar gastos</h2>
        <button type="button" className="fab-add" onClick={() => setModal("new")}>
          <IconPlus /> Añadir
        </button>
      </div>

      <div className="hero-stat">
        <div className="hero-stat__label">
          Gastos de {formatMonth(selectedMonth)}
        </div>
        <div className="hero-stat__value">
          {formatCurrency(monthTotal, settings)}
        </div>
        <p className="strategy-hero__note">
          Comidas, transporte y demás del día a día. No son suscripciones.
        </p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon={<IconReceipt />}
          action={
            <button type="button" className="btn" onClick={() => setModal("new")}>
              Registrar mi primer gasto
            </button>
          }
        >
          Anota un gasto variable (efectivo o tarjeta). Queda en el historial
          de este teléfono.
        </EmptyState>
      ) : (
        <>
          <div
            className="seg seg--grow month-seg"
            role="tablist"
            aria-label="Mes de gastos"
          >
            {months.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={selectedMonth === m}
                aria-pressed={selectedMonth === m}
                onClick={() => setSelectedMonth(m)}
              >
                {formatMonth(m)}
              </button>
            ))}
          </div>
          <ViewToolbar
            layout={layout}
            onLayout={(expenseLayout) => updateSettings({ expenseLayout })}
            sort={sort}
            sortOptions={SORT_OPTIONS}
            onSort={(expenseSort) => updateSettings({ expenseSort })}
            sortDir={sortDir}
            onSortDir={(expenseSortDir) => updateSettings({ expenseSortDir })}
            dirLabels={DIR_LABELS[sort]}
          />
          {monthItems.length === 0 ? (
            <p className="muted">
              Aún no hay gastos en {formatMonth(selectedMonth)}.
            </p>
          ) : (
            <div className={`list${layout === "grid" ? " list--grid" : ""}`}>
              {monthItems.map((e) => (
                <ExpenseItem
                  key={e.id}
                  expense={e}
                  cardName={cardName(e.cardId)}
                  settings={settings}
                  onEdit={() => setModal(e)}
                  onDelete={() => removeExpense(e.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {modal !== null && (
        <ExpenseModal
          cards={cards}
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === "new") addExpense(data);
            else updateExpense(modal.id, data);
            setModal(null);
          }}
        />
      )}
    </>
  );
}
