import { useId, useState } from "react";
import { Modal } from "./Modal";
import type { Loan, LoanParty } from "../types";
import { canRegisterLoanPayment, loanPartyRemaining } from "../lib/loans";
import { formatCurrency } from "../lib/format";
import type { Settings } from "../types";

export function LoanPaymentModal({
  loan,
  party,
  settings,
  onClose,
  onSave,
}: {
  loan: Loan;
  party: LoanParty;
  settings: Settings;
  onClose: () => void;
  onSave: (amount: number, note?: string) => void;
}) {
  const ids = { amount: useId(), note: useId() };
  const remaining = loanPartyRemaining(loan, party.id);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const iPay = loan.direction === "a_favor";
  const amt = Number(amount);
  const previewLeft =
    Number.isFinite(amt) && amt > 0 ? Math.max(0, remaining - amt) : remaining;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextAmt = Number(amount);
    if (!canRegisterLoanPayment(loan, party.id, nextAmt)) {
      return setError(
        `El abono no puede pasar de ${formatCurrency(remaining, settings)}.`
      );
    }
    onSave(nextAmt, note.trim() || undefined);
  }

  return (
    <Modal
      title={iPay ? `Abono a ${party.name}` : `Abono de ${party.name}`}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <p className="confirm-msg">
          {iPay
            ? `Registras lo que tú le pagas a ${party.name}.`
            : `Registras lo que ${party.name} te pagó.`}{" "}
          Resta {formatCurrency(remaining, settings)}.
        </p>
        <div className="field">
          <label htmlFor={ids.amount}>Importe del abono</label>
          <input
            id={ids.amount}
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            max={remaining}
            value={amount}
            autoFocus
            placeholder="0.00"
            onWheel={(e) => e.currentTarget.blur()}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="amount-chips" role="group" aria-label="Atajos de importe">
          <button
            type="button"
            className="chip"
            onClick={() => setAmount(String(remaining / 2))}
          >
            La mitad
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => setAmount(String(remaining))}
          >
            Todo el restante
          </button>
        </div>
        <p className="muted">
          Después restan {formatCurrency(previewLeft, settings)}.
        </p>
        <div className="field">
          <label htmlFor={ids.note}>Nota</label>
          <input
            id={ids.note}
            type="text"
            value={note}
            placeholder="Opcional"
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn">
            Registrar abono
          </button>
        </div>
      </form>
    </Modal>
  );
}
