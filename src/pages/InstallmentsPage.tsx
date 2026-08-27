import { useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { InstallmentModal } from "../components/InstallmentModal";
import { InstallmentItem } from "../components/InstallmentItem";
import { ViewToolbar } from "../components/ViewToolbar";
import { currentMonth } from "../lib/format";
import { monthlyAmount } from "../lib/finance";
import { sortInstallments } from "../lib/sort";
import type { Installment, InstallmentSort, ListLayout } from "../types";

const SORT_OPTIONS: { value: InstallmentSort; label: string }[] = [
  { value: "remaining", label: "Meses restantes" },
  { value: "amount", label: "Pendiente" },
  { value: "name", label: "Nombre" },
];

export function InstallmentsPage() {
  const {
    cards,
    installments,
    settings,
    addInstallment,
    updateInstallment,
    removeInstallment,
    registerPayment,
    removePayment,
    updateSettings,
  } = useFinanceStore();

  const [modal, setModal] = useState<Installment | null | "new">(null);
  const layout: ListLayout = settings.installmentLayout ?? "list";
  const sort: InstallmentSort = settings.installmentSort ?? "remaining";
  const items = sortInstallments(installments, sort);
  const cardName = (id: string) => cards.find((c) => c.id === id)?.name ?? "—";
  const thisMonth = currentMonth();

  return (
    <>
      <div className="section-title">
        <span>Compras a meses</span>
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
          Añade una tarjeta primero para registrar tus compras a meses.
        </div>
      ) : installments.length === 0 ? (
        <div className="card empty">
          <span className="empty__emoji" aria-hidden>
            🗓️
          </span>
          Registra una compra a mensualidades: indica el total y a cuántos meses,
          y ve marcando cada pago para saber cuánto te falta.
        </div>
      ) : (
        <>
          <ViewToolbar
            layout={layout}
            onLayout={(installmentLayout) =>
              updateSettings({ installmentLayout })
            }
            sort={sort}
            sortOptions={SORT_OPTIONS}
            onSort={(installmentSort) => updateSettings({ installmentSort })}
          />
          <div className={`list${layout === "grid" ? " list--grid" : ""}`}>
            {items.map((inst) => (
              <InstallmentItem
                key={inst.id}
                inst={inst}
                cardName={cardName(inst.cardId)}
                settings={settings}
                compact={layout === "grid"}
                onEdit={() => setModal(inst)}
                onDelete={() => removeInstallment(inst.id)}
                onRegisterPayment={() =>
                  registerPayment(inst.id, {
                    month: thisMonth,
                    amount: monthlyAmount(inst),
                    paidAt: new Date().toISOString(),
                  })
                }
                onUndoPayment={() => removePayment(inst.id, thisMonth)}
              />
            ))}
          </div>
        </>
      )}

      {modal !== null && (
        <InstallmentModal
          cards={cards}
          settings={settings}
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === "new") addInstallment(data);
            else updateInstallment(modal.id, data);
            setModal(null);
          }}
        />
      )}
    </>
  );
}
