import type { Loan, LoanParty, LoanPayment, LoanPaymentDraft } from "../types";
import {
  currentDate,
  currentTime,
  isValidPaidDate,
  isValidPaidTime,
  localDateTimeToIso,
} from "./format";

export function loanTotal(loan: Loan): number {
  return loan.parties.reduce((sum, p) => sum + p.shareAmount, 0);
}

export function loanPartyPaid(loan: Loan, partyId: string): number {
  return loan.payments
    .filter((p) => p.partyId === partyId)
    .reduce((sum, p) => sum + p.amount, 0);
}

export function loanPartyRemaining(loan: Loan, partyId: string): number {
  const party = loan.parties.find((p) => p.id === partyId);
  if (!party) return 0;
  return Math.max(0, party.shareAmount - loanPartyPaid(loan, partyId));
}

export function loanRemaining(loan: Loan): number {
  return loan.parties.reduce(
    (sum, p) => sum + loanPartyRemaining(loan, p.id),
    0
  );
}

export function loanPaid(loan: Loan): number {
  return loan.payments.reduce((sum, p) => sum + p.amount, 0);
}

export function canRegisterLoanPayment(
  loan: Loan,
  partyId: string,
  amount: number
): boolean {
  if (!Number.isFinite(amount) || amount <= 0) return false;
  return amount <= loanPartyRemaining(loan, partyId) + 1e-9;
}

export function reconcileLoanPayments(
  parties: LoanParty[],
  payments: LoanPayment[]
): LoanPayment[] {
  const allowed = new Set(parties.map((p) => p.id));
  const grouped = new Map<string, LoanPayment[]>();
  for (const pay of payments) {
    if (!allowed.has(pay.partyId)) continue;
    const list = grouped.get(pay.partyId) ?? [];
    list.push(pay);
    grouped.set(pay.partyId, list);
  }
  const kept: LoanPayment[] = [];
  for (const party of parties) {
    let spent = 0;
    for (const pay of grouped.get(party.id) ?? []) {
      if (spent + pay.amount <= party.shareAmount + 1e-9) {
        kept.push(pay);
        spent += pay.amount;
      }
    }
  }
  return kept;
}

export function paymentReceipt(
  payment: Pick<LoanPayment, "amount" | "paidAt"> &
    Partial<Pick<LoanPayment, "paidDate" | "paidTime">>
): {
  date: string;
  time: string;
  amount: number;
} {
  const when = new Date(payment.paidAt);
  return {
    date:
      payment.paidDate && isValidPaidDate(payment.paidDate)
        ? payment.paidDate
        : Number.isNaN(when.getTime())
          ? ""
          : currentDate(when),
    time:
      payment.paidTime && isValidPaidTime(payment.paidTime)
        ? payment.paidTime
        : Number.isNaN(when.getTime())
          ? ""
          : currentTime(when),
    amount: payment.amount,
  };
}

export function normalizeLoanPayment(
  input: Omit<LoanPaymentDraft, "paidAt"> & { paidAt?: string }
): LoanPaymentDraft | null {
  if (!Number.isFinite(input.amount) || input.amount <= 0) return null;
  if (!input.partyId) return null;

  let paidDate = input.paidDate;
  let paidTime = input.paidTime;
  let paidAt = input.paidAt;

  if (paidDate && paidTime) {
    if (!isValidPaidDate(paidDate) || !isValidPaidTime(paidTime)) return null;
    paidAt = localDateTimeToIso(paidDate, paidTime);
  } else if (paidAt) {
    const when = new Date(paidAt);
    if (Number.isNaN(when.getTime())) return null;
    paidDate = paidDate && isValidPaidDate(paidDate) ? paidDate : currentDate(when);
    paidTime = paidTime && isValidPaidTime(paidTime) ? paidTime : currentTime(when);
  } else {
    return null;
  }

  return {
    ...input,
    amount: input.amount,
    paidAt,
    paidDate,
    paidTime,
  };
}

export function loanOwedTotal(loans: Loan[]): number {
  return loans
    .filter((l) => l.direction === "a_favor")
    .reduce((sum, l) => sum + loanRemaining(l), 0);
}

export function loanReceivableTotal(loans: Loan[]): number {
  return loans
    .filter((l) => l.direction === "en_contra")
    .reduce((sum, l) => sum + loanRemaining(l), 0);
}
