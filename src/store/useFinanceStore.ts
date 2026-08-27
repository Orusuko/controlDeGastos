import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Card,
  FixedExpense,
  Installment,
  InstallmentPayment,
  Settings,
} from "../types";
import { currentMonth } from "../lib/format";
import { CARD_COLORS } from "../lib/colors";
import {
  DEFAULT_SETTINGS,
  PERSIST_NAME,
  PERSIST_VERSION,
  mergePersistedState,
  migratePersistedState,
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

      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
      importBackup: (slice) =>
        set({
          cards: slice.cards,
          fixed: slice.fixed,
          installments: slice.installments,
          settings: slice.settings,
        }),
      resetAll: () =>
        set({
          cards: [],
          fixed: [],
          installments: [],
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
        settings: state.settings,
      }),
    }
  )
);

export { uid, currentMonth, PERSIST_NAME, PERSIST_VERSION, DEFAULT_SETTINGS };
