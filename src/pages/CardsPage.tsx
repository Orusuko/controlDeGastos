import { useMemo, useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { CardModal } from "../components/CardModal";
import { FixedExpenseModal } from "../components/FixedExpenseModal";
import { InstallmentModal } from "../components/InstallmentModal";
import { FixedExpenseItem } from "../components/FixedExpenseItem";
import { InstallmentItem } from "../components/InstallmentItem";
import { ItemActions } from "../components/ItemActions";
import { formatCurrency } from "../lib/format";
import {
  monthlyAmount,
  monthlyTotalForCard,
  remainingAmount,
} from "../lib/finance";
import type { Card, FixedExpense, Installment } from "../types";

export function CardsPage() {
  const {
    cards,
    fixed,
    installments,
    settings,
    addCard,
    updateCard,
    removeCard,
    addFixed,
    updateFixed,
    removeFixed,
    addInstallment,
    updateInstallment,
    removeInstallment,
    registerPayment,
    removePayment,
  } = useFinanceStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardModal, setCardModal] = useState<Card | null | "new">(null);
  const [fixedModal, setFixedModal] = useState<FixedExpense | null | "new">(
    null
  );
  const [instModal, setInstModal] = useState<Installment | null | "new">(null);

  const selected = cards.find((c) => c.id === selectedId) ?? null;

  if (selected) {
    return (
      <CardDetail
        card={selected}
        fixed={fixed.filter((f) => f.cardId === selected.id)}
        installments={installments.filter((i) => i.cardId === selected.id)}
        allCards={cards}
        settings={settings}
        onBack={() => setSelectedId(null)}
        onEditCard={() => setCardModal(selected)}
        onDeleteCard={() => {
          removeCard(selected.id);
          setSelectedId(null);
        }}
        onAddFixed={() => setFixedModal("new")}
        onEditFixed={(f) => setFixedModal(f)}
        onDeleteFixed={removeFixed}
        onAddInst={() => setInstModal("new")}
        onEditInst={(i) => setInstModal(i)}
        onDeleteInst={removeInstallment}
        onRegisterPayment={registerPayment}
        onUndoPayment={removePayment}
        cardModal={cardModal}
        fixedModal={fixedModal}
        instModal={instModal}
        onCloseCardModal={() => setCardModal(null)}
        onCloseFixedModal={() => setFixedModal(null)}
        onCloseInstModal={() => setInstModal(null)}
        onSaveCard={(name, color) => {
          if (cardModal && cardModal !== "new") {
            updateCard(cardModal.id, { name, color });
          }
          setCardModal(null);
        }}
        onSaveFixed={(data) => {
          if (fixedModal && fixedModal !== "new") updateFixed(fixedModal.id, data);
          else addFixed(data);
          setFixedModal(null);
        }}
        onSaveInst={(data) => {
          if (instModal && instModal !== "new")
            updateInstallment(instModal.id, data);
          else addInstallment(data);
          setInstModal(null);
        }}
      />
    );
  }

  return (
    <>
      <div className="section-title">
        <span>Mis tarjetas</span>
        <button className="fab-add" onClick={() => setCardModal("new")}>
          + Añadir
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="card empty">
          <span className="empty__emoji" aria-hidden>
            💳
          </span>
          Aún no tienes tarjetas. Añade una (solo el nombre) para empezar a
          organizar tus gastos.
        </div>
      ) : (
        <div className="list">
          {cards.map((card) => {
            const total = monthlyTotalForCard(fixed, installments, card.id);
            const nFixed = fixed.filter((f) => f.cardId === card.id).length;
            const nInst = installments.filter(
              (i) => i.cardId === card.id
            ).length;
            return (
              <div
                className="row row--tap"
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(card.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedId(card.id);
                  }
                }}
              >
                <div
                  className="row__badge"
                  style={{ background: card.color }}
                  aria-hidden
                >
                  {card.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="row__body">
                  <div className="row__title">{card.name}</div>
                  <div className="row__sub">
                    {nFixed} fijos · {nInst} a meses
                  </div>
                </div>
                <div>
                  <div className="row__amount">
                    {formatCurrency(total, settings)}
                  </div>
                  <div className="row__sub" style={{ textAlign: "right" }}>
                    al mes
                  </div>
                </div>
                <ItemActions
                  name={card.name}
                  onEdit={() => setCardModal(card)}
                  onDelete={() => removeCard(card.id)}
                  deleteMessage={`¿Eliminar "${card.name}"? También se borrarán sus gastos y mensualidades.`}
                />
              </div>
            );
          })}
        </div>
      )}

      {cardModal !== null && (
        <CardModal
          initial={cardModal === "new" ? null : cardModal}
          onClose={() => setCardModal(null)}
          onSave={(name, color) => {
            if (cardModal === "new") addCard(name, color);
            else updateCard(cardModal.id, { name, color });
            setCardModal(null);
          }}
        />
      )}
    </>
  );
}

function CardDetail({
  card,
  fixed,
  installments,
  allCards,
  settings,
  onBack,
  onEditCard,
  onDeleteCard,
  onAddFixed,
  onEditFixed,
  onDeleteFixed,
  onAddInst,
  onEditInst,
  onDeleteInst,
  onRegisterPayment,
  onUndoPayment,
  cardModal,
  fixedModal,
  instModal,
  onCloseCardModal,
  onCloseFixedModal,
  onCloseInstModal,
  onSaveCard,
  onSaveFixed,
  onSaveInst,
}: {
  card: Card;
  fixed: FixedExpense[];
  installments: Installment[];
  allCards: Card[];
  settings: ReturnType<typeof useFinanceStore.getState>["settings"];
  onBack: () => void;
  onEditCard: () => void;
  onDeleteCard: () => void;
  onAddFixed: () => void;
  onEditFixed: (f: FixedExpense) => void;
  onDeleteFixed: (id: string) => void;
  onAddInst: () => void;
  onEditInst: (i: Installment) => void;
  onDeleteInst: (id: string) => void;
  onRegisterPayment: ReturnType<typeof useFinanceStore.getState>["registerPayment"];
  onUndoPayment: ReturnType<typeof useFinanceStore.getState>["removePayment"];
  cardModal: Card | null | "new";
  fixedModal: FixedExpense | null | "new";
  instModal: Installment | null | "new";
  onCloseCardModal: () => void;
  onCloseFixedModal: () => void;
  onCloseInstModal: () => void;
  onSaveCard: (name: string, color: string) => void;
  onSaveFixed: (data: Omit<FixedExpense, "id">) => void;
  onSaveInst: (data: Omit<Installment, "id" | "payments">) => void;
}) {
  const totals = useMemo(() => {
    const fixedTotal = fixed.reduce((s, f) => s + f.amount, 0);
    const instMonthly = installments.reduce((s, i) => {
      const left = i.months - i.payments.length;
      return s + (left > 0 ? monthlyAmount(i) : 0);
    }, 0);
    const debt = installments.reduce((s, i) => s + remainingAmount(i), 0);
    return { fixedTotal, instMonthly, monthly: fixedTotal + instMonthly, debt };
  }, [fixed, installments]);

  return (
    <>
      <button type="button" className="back-link" onClick={onBack}>
        ← Todas las tarjetas
      </button>

      <div className="card-hero" style={{ ["--card-accent" as string]: card.color }}>
        <div className="card-hero__top">
          <div
            className="row__badge"
            style={{ background: card.color }}
            aria-hidden
          >
            {card.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="row__body">
            <div className="row__title">{card.name}</div>
            <div className="row__sub">Detalle de esta tarjeta</div>
          </div>
          <ItemActions
            name={card.name}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
            deleteMessage={`¿Eliminar "${card.name}"? También se borrarán sus gastos y mensualidades.`}
          />
        </div>
        <div className="card-hero__meta">
          <div>
            <span>Al mes</span>
            <strong>{formatCurrency(totals.monthly, settings)}</strong>
          </div>
          <div>
            <span>Deuda pendiente</span>
            <strong>{formatCurrency(totals.debt, settings)}</strong>
          </div>
          <div>
            <span>Gastos fijos</span>
            <strong>{formatCurrency(totals.fixedTotal, settings)}</strong>
          </div>
          <div>
            <span>Mensualidades</span>
            <strong>{formatCurrency(totals.instMonthly, settings)}</strong>
          </div>
        </div>
      </div>

      <div className="section-title">
        <span>Gastos fijos</span>
        <button className="fab-add" onClick={onAddFixed}>
          + Añadir
        </button>
      </div>
      {fixed.length === 0 ? (
        <div className="card empty">
          No hay gastos fijos en esta tarjeta.
        </div>
      ) : (
        <div className="list">
          {fixed.map((f) => (
            <FixedExpenseItem
              key={f.id}
              expense={f}
              cardName={card.name}
              settings={settings}
              onEdit={() => onEditFixed(f)}
              onDelete={() => onDeleteFixed(f.id)}
            />
          ))}
        </div>
      )}

      <div className="section-title">
        <span>Compras a meses</span>
        <button className="fab-add" onClick={onAddInst}>
          + Añadir
        </button>
      </div>
      {installments.length === 0 ? (
        <div className="card empty">
          No hay compras a meses en esta tarjeta.
        </div>
      ) : (
        <div className="list">
          {installments.map((inst) => (
            <InstallmentItem
              key={inst.id}
              inst={inst}
              cardName={card.name}
              settings={settings}
              onEdit={() => onEditInst(inst)}
              onDelete={() => onDeleteInst(inst.id)}
              onRegisterPayment={() =>
                onRegisterPayment(inst.id, {
                  month: new Date().toISOString().slice(0, 7),
                  amount: monthlyAmount(inst),
                  paidAt: new Date().toISOString(),
                })
              }
              onUndoPayment={() =>
                onUndoPayment(inst.id, new Date().toISOString().slice(0, 7))
              }
            />
          ))}
        </div>
      )}

      {cardModal && cardModal !== "new" && (
        <CardModal
          initial={cardModal}
          onClose={onCloseCardModal}
          onSave={onSaveCard}
        />
      )}
      {fixedModal !== null && (
        <FixedExpenseModal
          cards={allCards}
          initial={fixedModal === "new" ? null : fixedModal}
          defaultCardId={card.id}
          onClose={onCloseFixedModal}
          onSave={onSaveFixed}
        />
      )}
      {instModal !== null && (
        <InstallmentModal
          cards={allCards}
          settings={settings}
          initial={instModal === "new" ? null : instModal}
          defaultCardId={card.id}
          onClose={onCloseInstModal}
          onSave={onSaveInst}
        />
      )}
    </>
  );
}
