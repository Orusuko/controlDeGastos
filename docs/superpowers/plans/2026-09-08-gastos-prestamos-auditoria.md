# Gastos, préstamos y swipe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auditar la app, desbloquear el gesto de deslizamiento, y añadir apartados persistentes de gastos variables y préstamos (A favor / En contra) con abonos.

**Architecture:** Lógica pura (gastos, saldos, swipe) en `src/lib` con TDD; persistencia Zustand v3 sin cambiar la clave `control-financiero:v1`; UI en las mismas clases CSS; pager de vistas + nav de 6 con hub “Más”.

**Tech Stack:** React 19, TypeScript, Vite, Zustand persist, Vitest + happy-dom, CSS existente, Capacitor (sin cambios nativos salvo versionCode).

## Global Constraints

- UI copy in Spanish.
- Persist key stays `control-financiero:v1`; bump `PERSIST_VERSION` to `3`.
- Do not introduce a second design system or a remote backend.
- Do not push and do not open a pull request.
- Stay on branch `cursor/finanzas-gastos-prestamos-cf63`.
- Superdesign uses `npx --yes @superdesign/cli@latest` and `--no-open` in this headless environment; if login fails, continue via design-with-your-model / existing CSS.

---

## File map

- Create: `src/lib/swipeNav.ts`, `src/lib/swipeNav.test.ts` — classify swipe + next/prev view.
- Create: `src/lib/loans.ts`, `src/lib/loans.test.ts` — party/loan balances and payment guards.
- Create: `src/lib/expenses.ts`, `src/lib/expenses.test.ts` — month filter and totals.
- Create: `src/components/SwipePager.tsx` — pointer listeners that call `classifySwipe`.
- Create: `src/pages/ExpensesPage.tsx`, `src/components/ExpenseModal.tsx`, `src/components/ExpenseItem.tsx`.
- Create: `src/pages/LoansPage.tsx`, `src/pages/LoanDetailPage.tsx`, `src/components/LoanModal.tsx`, `src/components/LoanPaymentModal.tsx`, `src/components/LoanItem.tsx`.
- Create: `src/pages/MorePage.tsx` — hub Tarjetas / Ahorro / Ajustes.
- Modify: `src/types.ts` — Expense, Loan, View-related settings.
- Modify: `src/lib/finance.ts` — optional expenses/loans on `computeTotals`.
- Modify: `src/lib/format.ts` — `currentDate`.
- Modify: `src/lib/colors.ts` — colors for expense categories.
- Modify: `src/lib/sort.ts` — sort expenses and loans.
- Modify: `src/store/persist.ts`, `src/store/useFinanceStore.ts`, `src/store/backup.ts` — v3 slice.
- Modify: `src/App.tsx`, `src/components/BottomNav.tsx`, `src/index.css`, `src/index.scroll.test.ts`.
- Modify: `src/pages/Dashboard.tsx`, `src/pages/SettingsPage.tsx`.
- Modify: tests of persist/backup/format/appVersion.
- Modify: `src/lib/appVersion.ts`, `android/app/build.gradle`, `package.json` — 1.6.0 / 20260908.
- Superdesign: `.superdesign/init/*`, drafts for Gastos and Préstamos.

---

### Task 1: Clasificador de swipe (TDD)

**Files:**
- Create: `src/lib/swipeNav.ts`
- Test: `src/lib/swipeNav.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `SWIPE_VIEWS`, `SwipeView`, `classifySwipe`, `adjacentView`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { adjacentView, classifySwipe, SWIPE_VIEWS } from "./swipeNav";

describe("classifySwipe", () => {
  it("ignora un toque corto", () => {
    expect(classifySwipe({ dx: 10, dy: 4 })).toEqual({ kind: "none" });
  });

  it("detecta desliz horizontal a la siguiente vista", () => {
    expect(classifySwipe({ dx: -80, dy: 12 })).toEqual({
      kind: "horizontal",
      direction: "next",
    });
  });

  it("detecta desliz horizontal a la vista anterior", () => {
    expect(classifySwipe({ dx: 90, dy: -8 })).toEqual({
      kind: "horizontal",
      direction: "prev",
    });
  });

  it("cede el gesto al scroll vertical", () => {
    expect(classifySwipe({ dx: 20, dy: 70 })).toEqual({ kind: "vertical" });
  });
});

describe("adjacentView", () => {
  it("avanza y no se sale del borde", () => {
    expect(adjacentView("dashboard", "next")).toBe("expenses");
    expect(adjacentView("settings", "next")).toBe("settings");
    expect(adjacentView("dashboard", "prev")).toBe("dashboard");
    expect(SWIPE_VIEWS).toContain("loans");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/swipeNav.test.ts`
Expected: FAIL because `./swipeNav` cannot be resolved.

- [ ] **Step 3: Write minimal implementation**

```ts
export const SWIPE_VIEWS = [
  "dashboard",
  "expenses",
  "loans",
  "installments",
  "fixed",
  "cards",
  "strategies",
  "settings",
] as const;

export type SwipeView = (typeof SWIPE_VIEWS)[number];

export type SwipeDecision =
  | { kind: "none" }
  | { kind: "vertical" }
  | { kind: "horizontal"; direction: "next" | "prev" };

export function classifySwipe(input: { dx: number; dy: number }): SwipeDecision {
  const absX = Math.abs(input.dx);
  const absY = Math.abs(input.dy);
  if (absX < 48 && absY < 48) return { kind: "none" };
  if (absX >= 56 && absX > absY * 1.15) {
    return { kind: "horizontal", direction: input.dx < 0 ? "next" : "prev" };
  }
  if (absY >= 24 && absY >= absX) return { kind: "vertical" };
  return { kind: "none" };
}

export function adjacentView(
  current: SwipeView,
  direction: "next" | "prev"
): SwipeView {
  const i = SWIPE_VIEWS.indexOf(current);
  const n = direction === "next" ? i + 1 : i - 1;
  if (n < 0 || n >= SWIPE_VIEWS.length) return current;
  return SWIPE_VIEWS[n];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/swipeNav.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/swipeNav.ts src/lib/swipeNav.test.ts
git commit -m "test: clasificador de swipe entre secciones"
```

---

### Task 2: Saldos de préstamos (TDD)

**Files:**
- Create: `src/lib/loans.ts`
- Modify: `src/types.ts` (añadir tipos de préstamo)
- Test: `src/lib/loans.test.ts`

**Interfaces:**
- Consumes: `Loan`, `LoanParty`, `LoanPayment` from `src/types.ts`
- Produces: `loanTotal`, `loanPartyPaid`, `loanPartyRemaining`, `loanRemaining`, `canRegisterLoanPayment`

- [ ] **Step 1: Add types to `src/types.ts`**

```ts
export type LoanDirection = "a_favor" | "en_contra";

export interface LoanParty {
  id: string;
  name: string;
  shareAmount: number;
}

export interface LoanPayment {
  id: string;
  partyId: string;
  amount: number;
  paidAt: string;
  note?: string;
}

export interface Loan {
  id: string;
  title: string;
  direction: LoanDirection;
  createdAt: string;
  parties: LoanParty[];
  payments: LoanPayment[];
  note?: string;
}
```

- [ ] **Step 2: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  canRegisterLoanPayment,
  loanPartyRemaining,
  loanRemaining,
  loanTotal,
} from "./loans";
import type { Loan } from "../types";

const loan: Loan = {
  id: "l1",
  title: "Renta",
  direction: "en_contra",
  createdAt: "2026-09-01T00:00:00.000Z",
  parties: [
    { id: "p1", name: "Ana", shareAmount: 2000 },
    { id: "p2", name: "Beto", shareAmount: 1000 },
  ],
  payments: [
    {
      id: "pay1",
      partyId: "p1",
      amount: 500,
      paidAt: "2026-09-02T00:00:00.000Z",
    },
  ],
};

describe("saldos de préstamo", () => {
  it("suma partes y resta abonos por persona", () => {
    expect(loanTotal(loan)).toBe(3000);
    expect(loanPartyRemaining(loan, "p1")).toBe(1500);
    expect(loanPartyRemaining(loan, "p2")).toBe(1000);
    expect(loanRemaining(loan)).toBe(2500);
  });

  it("rechaza un abono mayor al restante de esa persona", () => {
    expect(canRegisterLoanPayment(loan, "p1", 1500)).toBe(true);
    expect(canRegisterLoanPayment(loan, "p1", 1500.01)).toBe(false);
    expect(canRegisterLoanPayment(loan, "p2", 0)).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/loans.test.ts`
Expected: FAIL (module or functions missing)

- [ ] **Step 4: Write `src/lib/loans.ts`**

```ts
import type { Loan } from "../types";

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

export function canRegisterLoanPayment(
  loan: Loan,
  partyId: string,
  amount: number
): boolean {
  if (!Number.isFinite(amount) || amount <= 0) return false;
  return amount <= loanPartyRemaining(loan, partyId) + 1e-9;
}
```

- [ ] **Step 5: Run tests and commit**

Run: `npx vitest run src/lib/loans.test.ts`
Expected: PASS

```bash
git add src/types.ts src/lib/loans.ts src/lib/loans.test.ts
git commit -m "feat: saldos de préstamo por persona"
```

---

### Task 3: Totales de gastos del mes (TDD)

**Files:**
- Create: `src/lib/expenses.ts`, `src/lib/expenses.test.ts`
- Modify: `src/types.ts`, `src/lib/format.ts`, `src/lib/format.test.ts`, `src/lib/finance.ts`

**Interfaces:**
- Consumes: `Expense`, `currentMonth`
- Produces: `EXPENSE_CATEGORIES`, `expensesInMonth`, `expensesTotal`, `currentDate`, `computeTotals` with `expenses`/`loans`

- [ ] **Step 1: Add expense types and `currentDate`**

In `src/types.ts`:

```ts
export const EXPENSE_CATEGORIES = [
  "Comida",
  "Transporte",
  "Salud",
  "Hogar",
  "Entretenimiento",
  "Ropa",
  "Educación",
  "Otros",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  cardId?: string;
  note?: string;
}
```

In `src/lib/format.ts`:

```ts
export function currentDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
```

Add a format test: `currentDate(new Date(2026, 8, 8, 23, 0)) === "2026-09-08"`.

- [ ] **Step 2: Failing expenses test**

```ts
import { describe, expect, it } from "vitest";
import { expensesInMonth, expensesTotal } from "./expenses";
import type { Expense } from "../types";

const items: Expense[] = [
  {
    id: "e1",
    name: "Tacos",
    amount: 120,
    category: "Comida",
    date: "2026-09-07",
  },
  {
    id: "e2",
    name: "Uber",
    amount: 80,
    category: "Transporte",
    date: "2026-08-30",
  },
];

describe("gastos del mes", () => {
  it("filtra por YYYY-MM y suma", () => {
    const sept = expensesInMonth(items, "2026-09");
    expect(sept.map((e) => e.name)).toEqual(["Tacos"]);
    expect(expensesTotal(sept)).toBe(120);
    expect(expensesTotal(items)).toBe(200);
  });
});
```

- [ ] **Step 3: Implement `src/lib/expenses.ts` and extend `computeTotals`**

```ts
import type { Expense } from "../types";

export function expenseMonth(expense: Expense): string {
  return expense.date.slice(0, 7);
}

export function expensesInMonth(items: Expense[], month: string): Expense[] {
  return items.filter((e) => expenseMonth(e) === month);
}

export function expensesTotal(items: Expense[]): number {
  return items.reduce((sum, e) => sum + e.amount, 0);
}
```

In `computeTotals`, add optional `expenses: Expense[] = []` and `loans: Loan[] = []`. Extend `Totals` with `expenses`, `loanOwed`, `loanReceivable`. `total` = fixed + installments + expenses of `currentMonth()` (or passed month). `loanOwed` = sum `loanRemaining` where `direction === "a_favor"`. `loanReceivable` = same for `"en_contra"`.

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/lib/expenses.test.ts src/lib/format.test.ts src/lib/advice.test.ts`
Expected: PASS (advice uses `computeTotals` without new args)

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/lib/format.ts src/lib/format.test.ts src/lib/expenses.ts src/lib/expenses.test.ts src/lib/finance.ts
git commit -m "feat: gastos del mes en totales"
```

---

### Task 4: Persistencia v3 y store

**Files:**
- Modify: `src/store/persist.ts`, `src/store/useFinanceStore.ts`, `src/store/backup.ts`
- Modify: `src/store/persist.test.ts`, `src/store/backup.test.ts`, `src/store/backup-import.test.ts`, `src/store/persist-hydrate.test.ts`

**Interfaces:**
- Consumes: `Expense[]`, `Loan[]`
- Produces: `PersistedSlice.expenses`, `PersistedSlice.loans`, store actions `addExpense`, `updateExpense`, `removeExpense`, `addLoan`, `updateLoan`, `removeLoan`, `registerLoanPayment`, `removeLoanPayment`

- [ ] **Step 1: Update persist tests first**

Change `expect(PERSIST_VERSION).toBe(2)` to `toBe(3)`. In migrate tests, expect `next.expenses` and `next.loans` to be `[]` when absent. Update `backupSummary` expectations to include `expenses: 0, loans: 0` on legacy files.

- [ ] **Step 2: Run to see failures**

Run: `npx vitest run src/store/persist.test.ts src/store/backup.test.ts`
Expected: FAIL on version `2` vs `3` and missing keys.

- [ ] **Step 3: Implement**

`PersistedSlice` gains `expenses: Expense[]` and `loans: Loan[]`. `migratePersistedState` uses `asArray`. `mergePersistedState` keeps arrays if present. Store initial state empty arrays. Actions:

```ts
addExpense: (data: Omit<Expense, "id">) => void
updateExpense: (id: string, patch: Partial<Omit<Expense, "id">>) => void
removeExpense: (id: string) => void
addLoan: (data: Omit<Loan, "id" | "payments" | "createdAt"> & { createdAt?: string }) => void
updateLoan: (id: string, patch: Partial<Omit<Loan, "id" | "payments">>) => void
removeLoan: (id: string) => void
registerLoanPayment: (loanId: string, payment: Omit<LoanPayment, "id">) => void
removeLoanPayment: (loanId: string, paymentId: string) => void
```

`registerLoanPayment` no-ops if `!canRegisterLoanPayment`. `importBackup` / `resetAll` / `partialize` / `pickPersistedSlice` include both arrays. `backupSummary` returns five counts. `removeCard` does not delete expenses that only referenced the card: set `cardId` to undefined or leave orphan id (prefer clear `cardId` when it matches).

- [ ] **Step 4: Run store tests and commit**

Run: `npx vitest run src/store`
Expected: PASS

```bash
git add src/store src/types.ts
git commit -m "feat: persistencia v3 de gastos y préstamos"
```

---

### Task 5: Superdesign (init + drafts)

**Files:**
- Create: `.superdesign/init/components.md`, `layouts.md`, `routes.md`, `theme.md`, `pages.md`, `extractable-components.md`
- Create: `.superdesign/design-system.md`

- [ ] **Step 1: Preflight**

Run: `npx --yes @superdesign/cli@latest`
If `auth:` is not authenticated: `npx --yes @superdesign/cli@latest login`. If login fails in headless CI, document the error and continue implementing UI from the ledger tokens (do not block).

- [ ] **Step 2: Write the six init files** from the current repo (custom CSS, App shell, BottomNav, view map). Init-complete = six non-empty files.

- [ ] **Step 3: If authenticated, create project and two drafts**

```bash
npx --yes @superdesign/cli@latest create-project --title "Control Financiero — Gastos y préstamos" --no-open
npx --yes @superdesign/cli@latest create-design-draft --project-id <id> --title "Registrar gastos" --device mobile --no-open -p "..." --context-file .superdesign/design-system.md --context-file .superdesign/init/theme.md
npx --yes @superdesign/cli@latest create-design-draft --project-id <id> --title "Registrar préstamos A favor / En contra" --device mobile --no-open -p "..." --context-file .superdesign/design-system.md --context-file .superdesign/init/theme.md
```

Record `canvas:` and `preview:` URLs in the parent summary.

- [ ] **Step 4: Commit init artifacts (not tmp HTML)**

```bash
git add .superdesign/init .superdesign/design-system.md .gitignore
git commit -m "docs: contexto Superdesign del ledger existente"
```

---

### Task 6: Shell de swipe + nav

**Files:**
- Create: `src/components/SwipePager.tsx`, `src/pages/MorePage.tsx`
- Modify: `src/App.tsx`, `src/components/BottomNav.tsx`, `src/index.css`, `src/index.scroll.test.ts`, `src/components/icons.tsx`

**Interfaces:**
- Consumes: `classifySwipe`, `adjacentView`, `SWIPE_VIEWS`
- Produces: View union with `expenses | loans | more`; swipe changes view; Más hub

- [ ] **Step 1: Update scroll CSS test**

`.app__content` must match `touch-action:\s*pan-x pan-y` (not only `pan-y`). Keep overflow-y auto, min-height 0, `-webkit-overflow-scrolling: touch`.

- [ ] **Step 2: Run to fail**

Run: `npx vitest run src/index.scroll.test.ts`
Expected: FAIL on touch-action.

- [ ] **Step 3: Implement CSS + pager + nav**

`SwipePager` tracks pointerdown/up on the content (ignore if `html[data-modal-open]`). On horizontal decision, `onChange(adjacentView(view, direction))`. Buttons keep `touch-action: manipulation`. Nav items: Resumen, Gastos, Préstamos, Meses, Fijos, Más. Active Más when view is `more | cards | strategies | settings`. `MorePage` lists those three destinations as `.row.row--tap`. Grid nav stays `repeat(6, 1fr)`. Charts: `.chart-box { touch-action: pan-y; }`.

- [ ] **Step 4: Typecheck pages still compile** — temporarily render placeholder headings for expenses/loans until Task 7–8.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components src/pages/MorePage.tsx src/index.css src/index.scroll.test.ts
git commit -m "fix: swipe horizontal entre secciones y nav Más"
```

---

### Task 7: UI Registrar gastos

**Files:**
- Create: `src/pages/ExpensesPage.tsx`, `src/components/ExpenseModal.tsx`, `src/components/ExpenseItem.tsx`
- Modify: `src/lib/sort.ts`, `src/lib/colors.ts`, `src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: store expense actions, `EXPENSE_CATEGORIES`, `formatCurrency`, `currentDate`
- Produces: list/add/edit/delete UI in Spanish

- [ ] **Step 1: Add `sortExpenses` in `src/lib/sort.ts` with a small test in `src/lib/sort.test.ts`** (date desc default).

- [ ] **Step 2: Implement page + modal matching `FixedExpenseModal` field patterns.** Optional card select with option “Sin tarjeta / efectivo”. Dashboard hero includes gastos del mes; empty copy mentions gastos.

- [ ] **Step 3: Run `npx vitest run` and `npx tsc --noEmit`**

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: apartado Registrar gastos con historial local"
```

---

### Task 8: UI Registrar préstamos

**Files:**
- Create: `src/pages/LoansPage.tsx`, `src/pages/LoanDetailPage.tsx`, `src/components/LoanModal.tsx`, `src/components/LoanPaymentModal.tsx`, `src/components/LoanItem.tsx`
- Modify: `src/App.tsx`, `src/pages/Dashboard.tsx`, `src/pages/SettingsPage.tsx`

**Interfaces:**
- Consumes: loan helpers and store actions
- Produces: direction choice, N personas, abonos, remaining per party

- [ ] **Step 1: LoanModal** — segmented control A favor / En contra with clarifying subtitle; title; dynamic party rows (name + share); total = sum; reject empty names or non-positive shares.

- [ ] **Step 2: List + filters Todos / A favor / En contra; detail with remaining bars; payment modal bound to one party; disable amount above remaining.**

- [ ] **Step 3: Dashboard mini-stats Debo / Me deben. Settings backup copy mentions gastos y préstamos. `summarizeBackup` counts them.**

- [ ] **Step 4: Add store integration test for addLoan + payment + persist roundtrip in `src/store/backup-import.test.ts`.**

- [ ] **Step 5: Run full test suite and commit**

```bash
git commit -am "feat: préstamos a favor y en contra con abonos"
```

---

### Task 9: Versión 1.6.0 y verificación

**Files:**
- Modify: `src/lib/appVersion.ts`, `android/app/build.gradle`, `package.json`, `README.md`

- [ ] **Step 1: Fail `src/lib/appVersion.test.ts` by bumping TS constants first, then gradle + package.json to `1.6.0` / `20260908`.**

- [ ] **Step 2: `npm test` and `npm run build`**

- [ ] **Step 3: Browser — gastos, préstamo a favor, en contra, abonos, swipe, nav Más, respaldo copy.**

- [ ] **Step 4: Walkthrough artifacts under `/opt/cursor/artifacts`.**

- [ ] **Step 5: Commit**

```bash
git commit -am "chore: subir versión a 1.6.0"
```

---

## Self-review

1. Spec coverage: swipe, gastos, préstamos, persist, backup, dashboard, nav, Superdesign, audit deferred items — each has a task.
2. No TBD/placeholder steps.
3. Types (`Loan`, `Expense`, `SWIPE_VIEWS`, `PERSIST_VERSION = 3`) are consistent across tasks.
