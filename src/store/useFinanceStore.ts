import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Card,
  Expense,
  FixedExpense,
  Installment,
  InstallmentPayment,
  Loan,
  LoanPayment,
  Settings,
} from "../types";
import { currentMonth } from "../lib/format";
import { canRegisterLoanPayment, normalizeLoanPayment, reconcileLoanPayments } from "../lib/loans";
import { CARD_COLORS } from "../lib/colors";
import {
  DEFAULT_SETTINGS,
  PERSIST_NAME,
  PERSIST_VERSION,
  mergePersistedState,
  migratePersistedState,
  normalizeSettings,
  type PersistedSlice,
} from "./persist";

function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

interface FinanceState {
  cards: Card[];
  fixed: FixedExpense[];
  installments: Installment[];
  expenses: Expense[];
  loans: Loan[];
  settings: Settings;

  addCard: (name: string, color?: string) => void;
  updateCard: (id: string, patch: Partial<Omit<Card, "id">>) => void;
  removeCard: (id: string) => void;

  addFixed: (data: Omit<FixedExpense, "id">) => void;
  updateFixed: (id: string, patch: Partial<Omit<FixedExpense, "id">>) => void;
  removeFixed: (id: string) => void;

  addInstallment: (
    data: Omit<Installment, "id" | "payments">
  ) => void;
  updateInstallment: (
    id: string,
    patch: Partial<Omit<Installment, "id" | "payments">>
  ) => void;
  removeInstallment: (id: string) => void;
  registerPayment: (id: string, payment: InstallmentPayment) => void;
  removePayment: (id: string, month: string) => void;

  addExpense: (data: Omit<Expense, "id">) => void;
  updateExpense: (id: string, patch: Partial<Omit<Expense, "id">>) => void;
  removeExpense: (id: string) => void;

  addLoan: (
    data: Omit<Loan, "id" | "payments" | "createdAt"> & { createdAt?: string }
  ) => void;
  updateLoan: (
    id: string,
    patch: Partial<Omit<Loan, "id" | "payments">>
  ) => void;
  removeLoan: (id: string) => void;
  registerLoanPayment: (
    loanId: string,
    payment: Omit<LoanPayment, "id" | "paidAt"> & { paidAt?: string }
  ) => void;
  removeLoanPayment: (loanId: string, paymentId: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  importBackup: (slice: PersistedSlice) => void;
  resetAll: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      cards: [],
      fixed: [],
      installments: [],
      expenses: [],
      loans: [],
      settings: DEFAULT_SETTINGS,

      addCard: (name, color) =>
        set((state) => ({
          cards: [
            ...state.cards,
            {
              id: uid(),
              name: name.trim(),
              color:
                color ?? CARD_COLORS[state.cards.length % CARD_COLORS.length],
            },
          ],
        })),
      updateCard: (id, patch) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
          fixed: state.fixed.filter((f) => f.cardId !== id),
          installments: state.installments.filter((i) => i.cardId !== id),
          expenses: state.expenses.map((e) =>
            e.cardId === id ? { ...e, cardId: undefined } : e
          ),
        })),

      addFixed: (data) =>
        set((state) => ({
          fixed: [...state.fixed, { ...data, id: uid() }],
        })),
      updateFixed: (id, patch) =>
        set((state) => ({
          fixed: state.fixed.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),
      removeFixed: (id) =>
        set((state) => ({
          fixed: state.fixed.filter((f) => f.id !== id),
        })),

      addInstallment: (data) =>
        set((state) => ({
          installments: [
            ...state.installments,
            { ...data, id: uid(), payments: [] },
          ],
        })),
      updateInstallment: (id, patch) =>
        set((state) => ({
          installments: state.installments.map((i) =>
            i.id === id ? { ...i, ...patch } : i
          ),
        })),
      removeInstallment: (id) =>
        set((state) => ({
          installments: state.installments.filter((i) => i.id !== id),
        })),
      registerPayment: (id, payment) =>
        set((state) => ({
          installments: state.installments.map((i) => {
            if (i.id !== id) return i;
            if (i.payments.some((p) => p.month === payment.month)) return i;
            return { ...i, payments: [...i.payments, payment] };
          }),
        })),
      removePayment: (id, month) =>
        set((state) => ({
          installments: state.installments.map((i) =>
            i.id === id
              ? { ...i, payments: i.payments.filter((p) => p.month !== month) }
              : i
          ),
        })),

      addExpense: (data) =>
        set((state) => ({
          expenses: [...state.expenses, { ...data, id: uid() }],
        })),
      updateExpense: (id, patch) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...patch } : e
          ),
        })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addLoan: (data) =>
        set((state) => ({
          loans: [
            ...state.loans,
            {
              ...data,
              id: uid(),
              createdAt: data.createdAt ?? new Date().toISOString(),
              payments: [],
            },
          ],
        })),
      updateLoan: (id, patch) =>
        set((state) => ({
          loans: state.loans.map((l) => {
            if (l.id !== id) return l;
            const next = { ...l, ...patch };
            if (patch.parties) {
              next.payments = reconcileLoanPayments(
                next.parties,
                next.payments
              );
            }
            return next;
          }),
        })),
      removeLoan: (id) =>
        set((state) => ({
          loans: state.loans.filter((l) => l.id !== id),
        })),
      registerLoanPayment: (loanId, payment) =>
        set((state) => ({
          loans: state.loans.map((l) => {
            if (l.id !== loanId) return l;
            const stamp = normalizeLoanPayment(payment);
            if (!stamp) return l;
            if (!canRegisterLoanPayment(l, stamp.partyId, stamp.amount)) {
              return l;
            }
            return {
              ...l,
              payments: [...l.payments, { ...stamp, id: uid() }],
            };
          }),
        })),
      removeLoanPayment: (loanId, paymentId) =>
        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === loanId
              ? {
                  ...l,
                  payments: l.payments.filter((p) => p.id !== paymentId),
                }
              : l
          ),
        })),

      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      importBackup: (slice) =>
        set({
          cards: slice.cards,
          fixed: slice.fixed,
          installments: slice.installments,
          expenses: slice.expenses,
          loans: slice.loans,
          settings: normalizeSettings(slice.settings),
        }),
      resetAll: () =>
        set({
          cards: [],
          fixed: [],
          installments: [],
          expenses: [],
          loans: [],
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: PERSIST_NAME,
      version: PERSIST_VERSION,
      migrate: (persisted, fromVersion) =>
        migratePersistedState(persisted, fromVersion),
      merge: (persistedState, currentState) =>
        mergePersistedState(persistedState, currentState),
      partialize: (state) => ({
        cards: state.cards,
        fixed: state.fixed,
        installments: state.installments,
        expenses: state.expenses,
        loans: state.loans,
        settings: state.settings,
      }),
    }
  )
);

export { uid, currentMonth, PERSIST_NAME, PERSIST_VERSION, DEFAULT_SETTINGS };
