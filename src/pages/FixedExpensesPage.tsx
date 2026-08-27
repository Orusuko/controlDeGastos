import { useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { FixedExpenseModal } from "../components/FixedExpenseModal";
import { FixedExpenseItem } from "../components/FixedExpenseItem";
import { ViewToolbar } from "../components/ViewToolbar";
import { sortFixed } from "../lib/sort";
import type { FixedExpense, FixedSort, ListLayout } from "../types";

const SORT_OPTIONS: { value: FixedSort; label: string }[] = [
  { value: "name", label: "Nombre" },
  { value: "amount", label: "Importe" },
  { value: "category", label: "Categoría" },
];

export function FixedExpensesPage() {
  const { cards, fixed, settings, addFixed, updateFixed, removeFixed, updateSettings } =
    useFinanceStore();
  const [modal, setModal] = useState<FixedExpense | null | "new">(null);

  const layout: ListLayout = settings.fixedLayout ?? "list";
  const sort: FixedSort = settings.fixedSort ?? "name";
  const items = sortFixed(fixed, sort);
  const cardName = (id: string) => cards.find((c) => c.id === id)?.name ?? "—";

  return (
    <>
      <div className="section-title">
        <span>Gastos fijos</span>
        {cards.length > 0 && (
          <button className="fab-add" onClick={() => setModal("new")}>
            + Añadir
          </button>
        )}
      </div>

      {cards.length === 0 ? (
        <div className="card empty">
          <span className="empty__emoji" aria-hidden>
            💳
          </span>
          Primero añade una tarjeta en la pestaña “Tarjetas” para asignar tus
          gastos fijos.
        </div>
      ) : fixed.length === 0 ? (
        <div className="card empty">
          <span className="empty__emoji" aria-hidden>
            🔁
          </span>
          Registra tus suscripciones y pagos recurrentes (Netflix, Spotify,
          gimnasio…) para saber cuánto se te va cada mes.
        </div>
      ) : (
        <>
          <ViewToolbar
            layout={layout}
            onLayout={(fixedLayout) => updateSettings({ fixedLayout })}
            sort={sort}
            sortOptions={SORT_OPTIONS}
            onSort={(fixedSort) => updateSettings({ fixedSort })}
          />
          <div className={`list${layout === "grid" ? " list--grid" : ""}`}>
            {items.map((f) => (
              <FixedExpenseItem
                key={f.id}
                expense={f}
                cardName={cardName(f.cardId)}
                settings={settings}
                onEdit={() => setModal(f)}
                onDelete={() => removeFixed(f.id)}
              />
            ))}
          </div>
        </>
      )}

      {modal !== null && (
        <FixedExpenseModal
          cards={cards}
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === "new") addFixed(data);
            else updateFixed(modal.id, data);
            setModal(null);
          }}
        />
      )}
    </>
  );
}
