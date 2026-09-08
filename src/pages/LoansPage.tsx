import { useMemo, useState } from "react";
import { useFinanceStore } from "../store/useFinanceStore";
import { LoanModal } from "../components/LoanModal";
import { LoanItem, directionLabel } from "../components/LoanItem";
import { LoanPaymentModal } from "../components/LoanPaymentModal";
import { EmptyState } from "../components/EmptyState";
import { ItemActions } from "../components/ItemActions";
import { IconBack, IconLoan, IconPlus } from "../components/icons";
import { formatCurrency } from "../lib/format";
import {
  loanOwedTotal,
  loanPartyPaid,
  loanPartyRemaining,
  loanReceivableTotal,
  loanRemaining,
  loanTotal,
} from "../lib/loans";
import { sortLoans } from "../lib/sort";
import type { Loan, LoanDirection, LoanParty, LoanSort, SortDir } from "../types";

type Filter = "all" | LoanDirection;

export function LoansPage() {
  const {
    loans,
    settings,
    addLoan,
    updateLoan,
    removeLoan,
    registerLoanPayment,
    removeLoanPayment,
  } = useFinanceStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<Loan | null | "new">(null);
  const [payParty, setPayParty] = useState<LoanParty | null>(null);
  const sort: LoanSort = settings.loanSort ?? "remaining";
  const sortDir: SortDir = settings.loanSortDir ?? "desc";

  const selected = loans.find((l) => l.id === selectedId) ?? null;
  const visible = useMemo(() => {
    const filtered =
      filter === "all" ? loans : loans.filter((l) => l.direction === filter);
    return sortLoans(filtered, sort, sortDir);
  }, [loans, filter, sort, sortDir]);

  if (selected) {
    return (
      <LoanDetail
        loan={selected}
        settings={settings}
        onBack={() => {
          setSelectedId(null);
          setPayParty(null);
        }}
        onEdit={() => setModal(selected)}
        onDelete={() => {
          removeLoan(selected.id);
          setSelectedId(null);
        }}
        onPay={setPayParty}
        onUndo={(paymentId) => removeLoanPayment(selected.id, paymentId)}
        modal={modal}
        payParty={payParty}
        onCloseModal={() => setModal(null)}
        onClosePay={() => setPayParty(null)}
        onSaveLoan={(data) => {
          updateLoan(selected.id, data);
          setModal(null);
        }}
        onSavePay={(amount, note) => {
          if (!payParty) return;
          registerLoanPayment(selected.id, {
            partyId: payParty.id,
            amount,
            paidAt: new Date().toISOString(),
            note,
          });
          setPayParty(null);
        }}
      />
    );
  }

  return (
    <>
      <div className="section-title">
        <h2>Registrar préstamos</h2>
        <button type="button" className="fab-add" onClick={() => setModal("new")}>
          <IconPlus /> Añadir
        </button>
      </div>

      <div className="stat-grid">
        <div className="mini-stat">
          <span>Debo (a favor)</span>
          <strong>{formatCurrency(loanOwedTotal(loans), settings)}</strong>
        </div>
        <div className="mini-stat mini-stat--good">
          <span>Me deben (en contra)</span>
          <strong>
            {formatCurrency(loanReceivableTotal(loans), settings)}
          </strong>
        </div>
      </div>

      <div className="seg seg--grow" role="tablist" aria-label="Filtro de préstamos">
        {(
          [
            ["all", "Todos"],
            ["a_favor", "A favor"],
            ["en_contra", "En contra"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loans.length === 0 ? (
        <EmptyState
          icon={<IconLoan />}
          action={
            <button type="button" className="btn" onClick={() => setModal("new")}>
              Registrar un préstamo
            </button>
          }
        >
          Elige A favor si te prestaron (tú debes) o En contra si tú prestaste
          (te deben). Puedes apuntar a varias personas y sus abonos.
        </EmptyState>
      ) : visible.length === 0 ? (
        <p className="muted">No hay préstamos en este filtro.</p>
      ) : (
        <div className="list">
          {visible.map((loan) => (
            <LoanItem
              key={loan.id}
              loan={loan}
              settings={settings}
              onOpen={() => setSelectedId(loan.id)}
              onEdit={() => setModal(loan)}
              onDelete={() => removeLoan(loan.id)}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <LoanModal
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === "new") addLoan(data);
            else updateLoan(modal.id, data);
            setModal(null);
          }}
        />
      )}
    </>
  );
}

function LoanDetail({
  loan,
  settings,
  onBack,
  onEdit,
  onDelete,
  onPay,
  onUndo,
  modal,
  payParty,
  onCloseModal,
  onClosePay,
  onSaveLoan,
  onSavePay,
}: {
  loan: Loan;
  settings: ReturnType<typeof useFinanceStore.getState>["settings"];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPay: (party: LoanParty) => void;
  onUndo: (paymentId: string) => void;
  modal: Loan | null | "new";
  payParty: LoanParty | null;
  onCloseModal: () => void;
  onClosePay: () => void;
  onSaveLoan: (data: {
    title: string;
    direction: Loan["direction"];
    parties: LoanParty[];
    note?: string;
  }) => void;
  onSavePay: (amount: number, note?: string) => void;
}) {
  const copy = directionLabel(loan.direction);
  const leftover = loanRemaining(loan);
  const total = loanTotal(loan);
  const iPay = loan.direction === "a_favor";

  return (
    <>
      <button type="button" className="back-link" onClick={onBack}>
        <IconBack /> Todos los préstamos
      </button>

      <div className="card-hero">
        <div className="card-hero__top">
          <div
            className={
              loan.direction === "a_favor"
                ? "row__badge row__badge--warn"
                : "row__badge row__badge--good"
            }
            aria-hidden
          >
            {copy.badge.slice(0, 1)}
          </div>
          <div className="row__body">
            <div className="row__title">{loan.title}</div>
            <div className="row__sub">
              {copy.badge} · {copy.hint}
            </div>
          </div>
          <ItemActions
            name={loan.title}
            onEdit={onEdit}
            onDelete={onDelete}
            deleteMessage={`¿Eliminar “${loan.title}” y sus abonos?`}
          />
        </div>
        <div className="card-hero__meta">
          <div>
            <span>Restante</span>
            <strong>{formatCurrency(leftover, settings)}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatCurrency(total, settings)}</strong>
          </div>
        </div>
        {loan.note && <p className="muted">{loan.note}</p>}
      </div>

      <div className="section-title">
        <h2>Personas</h2>
      </div>
      <div className="list">
        {loan.parties.map((party) => {
          const left = loanPartyRemaining(loan, party.id);
          const paid = loanPartyPaid(loan, party.id);
          const ratio = party.shareAmount > 0 ? paid / party.shareAmount : 0;
          return (
            <div className="card inst-card" key={party.id}>
              <div className="inst-card__head">
                <div className="inst-card__identity">
                  <h3 className="inst-card__name">{party.name}</h3>
                  <p className="inst-card__meta">
                    {formatCurrency(paid, settings)} pagado de{" "}
                    {formatCurrency(party.shareAmount, settings)}
                  </p>
                </div>
                <div className="inst-card__figures">
                  <div className="inst-card__remain">
                    {formatCurrency(left, settings)}
                  </div>
                  <div className="inst-card__monthly">resta</div>
                </div>
              </div>
              <div className="progress">
                <div className="progress__track">
                  <div
                    className="progress__fill"
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
                  />
                </div>
              </div>
              <div className="inst-card__action">
                <button
                  type="button"
                  className="btn btn--sm"
                  disabled={left <= 0}
                  onClick={() => onPay(party)}
                >
                  {left <= 0
                    ? "Liquidado"
                    : iPay
                      ? "Registrar mi abono"
                      : "Registrar su abono"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {loan.payments.length > 0 && (
        <>
          <div className="section-title">
            <h2>Abonos</h2>
          </div>
          <div className="list">
            {[...loan.payments]
              .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
              .map((p) => {
                const who =
                  loan.parties.find((x) => x.id === p.partyId)?.name ?? "—";
                return (
                  <div className="row" key={p.id}>
                    <div className="row__body">
                      <div className="row__title">{who}</div>
                      <div className="row__sub">
                        {new Date(p.paidAt).toLocaleString(settings.locale)}
                        {p.note ? ` · ${p.note}` : ""}
                      </div>
                    </div>
                    <div className="row__amount">
                      {formatCurrency(p.amount, settings)}
                    </div>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => onUndo(p.id)}
                    >
                      Deshacer
                    </button>
                  </div>
                );
              })}
          </div>
        </>
      )}

      {modal && modal !== "new" && (
        <LoanModal
          initial={loan}
          onClose={onCloseModal}
          onSave={onSaveLoan}
        />
      )}
      {payParty && (
        <LoanPaymentModal
          loan={loan}
          party={payParty}
          settings={settings}
          onClose={onClosePay}
          onSave={onSavePay}
        />
      )}
    </>
  );
}
