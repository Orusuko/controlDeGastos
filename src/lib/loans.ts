import type { Loan, LoanParty, LoanPayment } from "../types";

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
