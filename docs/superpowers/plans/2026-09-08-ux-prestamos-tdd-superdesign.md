# UX préstamos TDD + Superdesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer los abonos a prueba de error, mostrar “llevo / resta” en préstamos, copiar Yo debo / Me deben, alinear totales/gráficas/consejos/nav/swipe y paridad de listas, con TDD y borradores Superdesign.

**Architecture:** Lógica pura en `src/lib` (saldos, pie, meses, swipe). Store Zustand reconcilia abonos al editar. UI reusa clases ledger. `more` es vista de swipe de primera clase. Gráficas se inspeccionan por leyenda, no capturan el pan.

**Tech Stack:** React 19, TypeScript, Vite, Zustand persist, Vitest + happy-dom, Testing Library, CSS existente, Superdesign CLI (`--no-open`).

## Global Constraints

- UI copy in Spanish.
- Persist key stays `control-financiero:v1`. Do not bump `PERSIST_VERSION` (stays `3`).
- Do not bump `APP_VERSION_NAME` / `versionName` (stays `1.6.0`) unless `appVersion.ts` is already edited for another reason.
- Do not introduce a second design system or a remote backend.
- One branch: `cursor/ux-prestamos-tdd-superdesign-cf63` from `cursor/finanzas-gastos-prestamos-cf63`.
- Superdesign: `npx --yes @superdesign/cli@latest`, `--no-open`. If login fails after one retry, continue via design-with-your-model.md.
- Expand vitest `include` to `src/**/*.{test,spec}.{ts,tsx}` before the first component test.
- `npx tsc --noEmit` and `npx vitest run` must pass before claiming done.

---

## File map

- Create: `src/lib/finance.test.ts` — totals, pie keys, card bars with expenses.
- Create: `src/store/useFinanceStore.test.ts` — Xbox 10k/2k, reject overpay, prune on edit.
- Create: `src/components/LoanPaymentModal.test.tsx` — empty amount, chips, preview.
- Create: `src/components/LoanItem.test.tsx` — llevo/resta + directionLabel.
- Create: `src/lib/loanCopy.test.ts` — directionLabel if extracted, else keep tests next to LoanItem.
- Modify: `src/lib/loans.ts` — `reconcileLoanPayments`, keep `canRegisterLoanPayment`.
- Modify: `src/lib/loans.test.ts` — prune/cap cases.
- Modify: `src/lib/expenses.ts` — `uniqueExpenseMonths`.
- Modify: `src/lib/expenses.test.ts` — month helper.
- Modify: `src/lib/finance.ts` — `expenseTotalForCard`, `monthPieSlices`, card breakdown expenses.
- Modify: `src/lib/advice.ts` / `src/lib/advice.test.ts` — loan + variable expense tips.
- Modify: `src/lib/swipeNav.ts` / `src/lib/swipeNav.test.ts` — `more` first-class, export `toSwipeView`.
- Modify: `src/store/useFinanceStore.ts` — `updateLoan` reconciles payments.
- Modify: `src/store/persist.ts` — `loanLayout` default `list` via normalize.
- Modify: `src/types.ts` — `loanLayout?: ListLayout`.
- Modify: `src/components/LoanPaymentModal.tsx` — empty initial, chips, preview.
- Modify: `src/components/LoanItem.tsx` — progress, “Llevas / restan”, Yo debo / Me deben.
- Modify: `src/components/LoanModal.tsx` — choice cards primary Yo debo / Me deben.
- Modify: `src/pages/LoansPage.tsx` — filters, empty, detail progress, ViewToolbar.
- Modify: `src/pages/ExpensesPage.tsx` — month selector, drop unlabeled pile.
- Modify: `src/pages/Dashboard.tsx` — unique pie keys, card expenses, legend inspect.
- Modify: `src/pages/StrategiesPage.tsx` — same advice signature (totals already carry loans/expenses).
- Modify: `src/App.tsx` — subtitle copy; SwipePager uses exported `toSwipeView`.
- Modify: `src/components/SwipePager.tsx` — import `toSwipeView` from swipeNav.
- Modify: `src/components/BottomNav.tsx` + `src/index.css` — scrollable nav.
- Modify: `src/index.scroll.test.ts` — nav overflow-x.
- Modify: `vite.config.ts` — vitest include tsx; `package.json` — `@testing-library/react`.
- Modify: `.superdesign/init/pages.md`, `routes.md`, `design-system.md` — Más, cards, strategies, settings, installments, fixed.
- Superdesign drafts: loan list/detail, payment modal, choice cards, nav+Más, dashboard.

---

### Task 1: Vitest include + Testing Library

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing vitest config
- Produces: tests matching `src/**/*.{test,spec}.{ts,tsx}`

- [ ] **Step 1: Write a failing include probe**

Create `src/components/_rtl_probe.test.tsx` temporarily is unnecessary. Instead change include first then add real tsx tests in Task 4. For this task, only expand include and install RTL so later RED tests compile.

- [ ] **Step 2: Expand include**

In `vite.config.ts` set:

```ts
test: {
  environment: "happy-dom",
  include: ["src/**/*.{test,spec}.{ts,tsx}"],
},
```

- [ ] **Step 3: Install RTL**

```bash
npm install -D @testing-library/react @testing-library/dom
```

Do not add jest-dom. Use Testing Library queries + vitest `expect`.

- [ ] **Step 4: Run existing tests**

```bash
npx vitest run
```

Expected: PASS (same `.test.ts` suite).

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts package.json package-lock.json
git commit -m "test: incluir TSX y Testing Library en Vitest"
```

---

### Task 2: Store Xbox 10k + abono 2k y rechazo de exceso

**Files:**
- Create: `src/store/useFinanceStore.test.ts`
- Modify: none yet if register already works; tests document current reject-as-noop

**Interfaces:**
- Consumes: `useFinanceStore.addLoan`, `registerLoanPayment`, `loanPaid`, `loanRemaining`
- Produces: regression for partial payment and silent reject

- [ ] **Step 1: Write the failing tests**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { loanPaid, loanRemaining } from "../lib/loans";
import { useFinanceStore } from "./useFinanceStore";

beforeEach(() => {
  useFinanceStore.getState().resetAll();
});

describe("abonos de préstamo en el store", () => {
  it("Xbox 10k con abono 2k deja restante 8k y pagado 2k", () => {
    const { addLoan, registerLoanPayment } = useFinanceStore.getState();
    addLoan({
      title: "Xbox",
      direction: "a_favor",
      parties: [{ id: "p1", name: "Tienda", shareAmount: 10000 }],
    });
    const loan = useFinanceStore.getState().loans[0];
    registerLoanPayment(loan.id, {
      partyId: loan.parties[0].id,
      amount: 2000,
      paidAt: "2026-09-08T12:00:00.000Z",
    });
    const updated = useFinanceStore.getState().loans[0];
    expect(loanPaid(updated)).toBe(2000);
    expect(loanRemaining(updated)).toBe(8000);
  });

  it("rechaza en silencio un abono mayor al restante", () => {
    const { addLoan, registerLoanPayment } = useFinanceStore.getState();
    addLoan({
      title: "Xbox",
      direction: "a_favor",
      parties: [{ id: "p1", name: "Tienda", shareAmount: 10000 }],
    });
    const loan = useFinanceStore.getState().loans[0];
    registerLoanPayment(loan.id, {
      partyId: loan.parties[0].id,
      amount: 10001,
      paidAt: "2026-09-08T12:00:00.000Z",
    });
    const updated = useFinanceStore.getState().loans[0];
    expect(updated.payments).toHaveLength(0);
    expect(loanPaid(updated)).toBe(0);
    expect(loanRemaining(updated)).toBe(10000);
  });
});
```

- [ ] **Step 2: Run to verify RED or GREEN**

```bash
npx vitest run src/store/useFinanceStore.test.ts
```

Expected: GREEN for both if `registerLoanPayment` already uses `canRegisterLoanPayment`. If RED, implement the guard (already in store). Do not change silent no-op: the test asserts it.

- [ ] **Step 3: Commit**

```bash
git add src/store/useFinanceStore.test.ts
git commit -m "test: abono parcial Xbox 2k y rechazo de exceso"
```

---

### Task 3: Reconciliar abonos al editar el préstamo

**Files:**
- Modify: `src/lib/loans.ts`
- Modify: `src/lib/loans.test.ts`
- Modify: `src/store/useFinanceStore.ts`
- Modify: `src/store/useFinanceStore.test.ts`

**Interfaces:**
- Consumes: `LoanParty[]`, `LoanPayment[]`
- Produces: `reconcileLoanPayments(parties, payments): LoanPayment[]`

- [ ] **Step 1: Write the failing tests in `src/lib/loans.test.ts`**

```ts
import { reconcileLoanPayments } from "./loans";

it("elimina abonos de una persona que ya no está en el préstamo", () => {
  const parties = [{ id: "p2", name: "Beto", shareAmount: 1000 }];
  const payments = [
    { id: "pay1", partyId: "p1", amount: 500, paidAt: "2026-09-02T00:00:00.000Z" },
    { id: "pay2", partyId: "p2", amount: 100, paidAt: "2026-09-03T00:00:00.000Z" },
  ];
  expect(reconcileLoanPayments(parties, payments).map((p) => p.id)).toEqual([
    "pay2",
  ]);
});

it("tira los abonos más nuevos si el cupo de la persona baja", () => {
  const parties = [{ id: "p1", name: "Ana", shareAmount: 400 }];
  const payments = [
    { id: "a", partyId: "p1", amount: 300, paidAt: "2026-09-01T00:00:00.000Z" },
    { id: "b", partyId: "p1", amount: 200, paidAt: "2026-09-02T00:00:00.000Z" },
  ];
  expect(reconcileLoanPayments(parties, payments).map((p) => p.id)).toEqual([
    "a",
  ]);
});
```

- [ ] **Step 2: Run to verify RED**

```bash
npx vitest run src/lib/loans.test.ts
```

Expected: FAIL `reconcileLoanPayments is not exported`.

- [ ] **Step 3: Minimal implementation in `src/lib/loans.ts`**

```ts
import type { Loan, LoanParty, LoanPayment } from "../types";

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
```

- [ ] **Step 4: Store test — updateLoan prunes**

```ts
it("al editar y quitar una persona, borra sus abonos", () => {
  const { addLoan, updateLoan } = useFinanceStore.getState();
  addLoan({
    title: "Renta",
    direction: "en_contra",
    parties: [
      { id: "p1", name: "Ana", shareAmount: 2000 },
      { id: "p2", name: "Beto", shareAmount: 1000 },
    ],
  });
  const loan = useFinanceStore.getState().loans[0];
  useFinanceStore.getState().registerLoanPayment(loan.id, {
    partyId: "p1",
    amount: 500,
    paidAt: "2026-09-02T00:00:00.000Z",
  });
  updateLoan(loan.id, {
    parties: [{ id: "p2", name: "Beto", shareAmount: 1000 }],
  });
  const updated = useFinanceStore.getState().loans[0];
  expect(updated.payments).toHaveLength(0);
  expect(loanPaid(updated)).toBe(0);
  expect(loanRemaining(updated)).toBe(1000);
});
```

- [ ] **Step 5: GREEN `updateLoan`**

```ts
updateLoan: (id, patch) =>
  set((state) => ({
    loans: state.loans.map((l) => {
      if (l.id !== id) return l;
      const next = { ...l, ...patch };
      if (patch.parties) {
        next.payments = reconcileLoanPayments(next.parties, next.payments);
      }
      return next;
    }),
  })),
```

- [ ] **Step 6: Run tests**

```bash
npx vitest run src/lib/loans.test.ts src/store/useFinanceStore.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/loans.ts src/lib/loans.test.ts src/store/useFinanceStore.ts src/store/useFinanceStore.test.ts
git commit -m "fix: reconciliar abonos al editar personas del préstamo"
```

---

### Task 4: Modal de abono vacío + chips + preview (TDD)

**Files:**
- Create: `src/components/LoanPaymentModal.test.tsx`
- Modify: `src/components/LoanPaymentModal.tsx`
- Modify: `src/index.css` — `.amount-chips`

**Interfaces:**
- Consumes: `canRegisterLoanPayment`, `loanPartyRemaining`, `formatCurrency`
- Produces: empty initial amount; chips `La mitad` and `Todo el restante`; text `Después restan …`

- [ ] **Step 1: Write the failing component test**

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoanPaymentModal } from "./LoanPaymentModal";
import type { Loan, LoanParty, Settings } from "../types";

const settings: Settings = {
  monthlySalary: 0,
  currency: "MXN",
  locale: "es-MX",
};

const party: LoanParty = { id: "p1", name: "Tienda", shareAmount: 10000 };

const loan: Loan = {
  id: "l1",
  title: "Xbox",
  direction: "a_favor",
  createdAt: "2026-09-08T00:00:00.000Z",
  parties: [party],
  payments: [],
};

describe("LoanPaymentModal", () => {
  it("abre con el importe vacío, no con el restante", () => {
    render(
      <LoanPaymentModal
        loan={loan}
        party={party}
        settings={settings}
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    const input = screen.getByLabelText("Importe del abono") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("chips de mitad y restante y preview del saldo", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(
      <LoanPaymentModal
        loan={loan}
        party={party}
        settings={settings}
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "La mitad" }));
    expect(
      (screen.getByLabelText("Importe del abono") as HTMLInputElement).value
    ).toBe("5000");
    expect(screen.getByText(/Después restan/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Todo el restante" }));
    expect(
      (screen.getByLabelText("Importe del abono") as HTMLInputElement).value
    ).toBe("10000");
  });
});
```

- [ ] **Step 2: Run RED**

```bash
npx vitest run src/components/LoanPaymentModal.test.tsx
```

Expected: FAIL — input value is `"10000"` (prefilled remaining).

- [ ] **Step 3: GREEN modal**

```tsx
const remaining = loanPartyRemaining(loan, party.id);
const [amount, setAmount] = useState("");
const amt = Number(amount);
const previewLeft =
  Number.isFinite(amt) && amt > 0 ? Math.max(0, remaining - amt) : remaining;

// chips
<div className="amount-chips" role="group" aria-label="Atajos de importe">
  <button type="button" className="chip" onClick={() => setAmount(String(remaining / 2))}>
    La mitad
  </button>
  <button type="button" className="chip" onClick={() => setAmount(String(remaining))}>
    Todo el restante
  </button>
</div>
<p className="muted">Después restan {formatCurrency(previewLeft, settings)}.</p>
```

Initial `useState("")` not `String(remaining)`. Keep `canRegisterLoanPayment` on submit.

- [ ] **Step 4: CSS chips**

```css
.amount-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 12px;
}
.chip {
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text);
  border-radius: 999px;
  min-height: 36px;
  padding: 6px 12px;
  font-size: 0.82rem;
  font-weight: 650;
}
```

- [ ] **Step 5: Run PASS and commit**

```bash
npx vitest run src/components/LoanPaymentModal.test.tsx
git add src/components/LoanPaymentModal.tsx src/components/LoanPaymentModal.test.tsx src/index.css
git commit -m "fix: modal de abono vacío con chips y preview del restante"
```

---

### Task 5: Lista “Llevas / restan” + barra

**Files:**
- Create: `src/components/LoanItem.test.tsx`
- Modify: `src/components/LoanItem.tsx`
- Modify: `src/pages/LoansPage.tsx` (detail hero)
- Modify: `src/index.css` — compact progress on row

**Interfaces:**
- Consumes: `loanPaid`, `loanRemaining`, `loanTotal`
- Produces: copy `Llevas $X · restan $Y` and progress width `paid/total`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoanItem } from "./LoanItem";
import type { Loan, Settings } from "../types";

const settings: Settings = { monthlySalary: 0, currency: "MXN", locale: "es-MX" };

const loan: Loan = {
  id: "l1",
  title: "Xbox",
  direction: "a_favor",
  createdAt: "2026-09-08T00:00:00.000Z",
  parties: [{ id: "p1", name: "Tienda", shareAmount: 10000 }],
  payments: [
    { id: "pay", partyId: "p1", amount: 2000, paidAt: "2026-09-08T12:00:00.000Z" },
  ],
};

it("muestra llevo y resta, no solo el sobrante del total", () => {
  render(
    <LoanItem loan={loan} settings={settings} onOpen={() => {}} onEdit={() => {}} onDelete={() => {}} />
  );
  expect(screen.getByText(/Llevas/)).toBeTruthy();
  expect(screen.getByText(/restan/)).toBeTruthy();
});
```

- [ ] **Step 2: RED then GREEN LoanItem**

```tsx
const paid = loanPaid(loan);
const leftover = loanRemaining(loan);
const total = loanTotal(loan);
const ratio = total > 0 ? paid / total : 0;

<div className="row__amount">{formatCurrency(leftover, settings)}</div>
<div className="row__sub row__sub--end">
  Llevas {formatCurrency(paid, settings)} · restan {formatCurrency(leftover, settings)}
</div>
<div className="progress progress--row">
  <div className="progress__track">
    <div className="progress__fill" style={{ width: `${Math.min(100, ratio * 100)}%` }} />
  </div>
</div>
```

Detail hero: same legend plus Restante / Pagado / Total.

- [ ] **Step 3: Commit**

```bash
git add src/components/LoanItem.tsx src/components/LoanItem.test.tsx src/pages/LoansPage.tsx src/index.css
git commit -m "feat: fila y detalle de préstamo con llevo, resta y barra"
```

---

### Task 6: Copy Yo debo / Me deben

**Files:**
- Modify: `src/components/LoanItem.tsx` (`directionLabel`)
- Modify: `src/components/LoanItem.test.tsx`
- Modify: `src/components/LoanModal.tsx`
- Modify: `src/pages/LoansPage.tsx`
- Modify: `src/pages/Dashboard.tsx` mini-stats
- Modify: `src/App.tsx` subtitle

**Interfaces:**
- Consumes: `LoanDirection`
- Produces: `{ badge: "Yo debo" | "Me deben", hint: "A favor" | "En contra" }`

- [ ] **Step 1: Failing tests**

```ts
import { directionLabel } from "./LoanItem";

it("usa Yo debo / Me deben como etiqueta principal", () => {
  expect(directionLabel("a_favor")).toEqual({ badge: "Yo debo", hint: "A favor" });
  expect(directionLabel("en_contra")).toEqual({ badge: "Me deben", hint: "En contra" });
});
```

Current implementation is inverted (badge A favor). RED.

- [ ] **Step 2: GREEN directionLabel**

```ts
export function directionLabel(direction: Loan["direction"]): {
  badge: string;
  hint: string;
} {
  return direction === "a_favor"
    ? { badge: "Yo debo", hint: "A favor" }
    : { badge: "Me deben", hint: "En contra" };
}
```

Choice cards:

```tsx
<strong>Yo debo</strong>
<span>A favor · me prestaron</span>
…
<strong>Me deben</strong>
<span>En contra · yo presté</span>
```

Filters: `["all", "Todos"]`, `["a_favor", "Yo debo"]`, `["en_contra", "Me deben"]`.

Empty: `Elige Yo debo si te prestaron, o Me deben si tú prestaste. A favor / En contra queda como nota.`

Dashboard: `<span>Yo debo</span>` / `<span>Me deben</span>` / keep “Gastos del mes”.

App subtitle loans: `"Yo debo y me deben"`.

- [ ] **Step 3: Commit**

```bash
git add src/components/LoanItem.tsx src/components/LoanItem.test.tsx src/components/LoanModal.tsx src/pages/LoansPage.tsx src/pages/Dashboard.tsx src/App.tsx
git commit -m "feat: etiquetas Yo debo y Me deben como copy principal"
```

---

### Task 7: computeTotals, pie único, barras con gastos, consejos

**Files:**
- Create: `src/lib/finance.test.ts`
- Modify: `src/lib/finance.ts`
- Modify: `src/lib/advice.ts`
- Modify: `src/lib/advice.test.ts`
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/index.css` — `.legend__item` button, `.chart-inspect`

**Interfaces:**
- Consumes: `expensesInMonth`, `categoryBreakdown`, `loanOwedTotal`
- Produces: `monthPieSlices`, `expenseTotalForCard`, `cardBreakdowns(..., expenses, month)`

- [ ] **Step 1: Failing finance tests**

```ts
import { describe, expect, it } from "vitest";
import {
  cardBreakdowns,
  computeTotals,
  monthPieSlices,
} from "./finance";
import type { Card, Expense, FixedExpense } from "../types";

const fixed: FixedExpense[] = [
  { id: "f1", name: "VPN", amount: 100, category: "Otros", cardId: "c1" },
];
const expenses: Expense[] = [
  { id: "e1", name: "Taxi", amount: 80, category: "Otros", date: "2026-09-08", cardId: "c1" },
  { id: "e2", name: "Viejo", amount: 50, category: "Comida", date: "2026-08-01" },
];
const cards: Card[] = [{ id: "c1", name: "Nu", color: "#0ea5e9" }];

it("metes gastos del mes actual en totals.total y totals.expenses", () => {
  const totals = computeTotals(fixed, [], expenses, [], "2026-09");
  expect(totals.expenses).toBe(80);
  expect(totals.total).toBe(180);
  expect(totals.loanOwed).toBe(0);
});

it("separa Otros fijo y Otros gasto con keys distintas", () => {
  const slices = monthPieSlices(fixed, expenses, 0, "2026-09");
  const keys = slices.map((s) => s.key);
  expect(new Set(keys).size).toBe(keys.length);
  expect(keys).toContain("fixed:Otros");
  expect(keys).toContain("expense:Otros");
});

it("incluye gastos variables con cardId en la barra de la tarjeta", () => {
  const bars = cardBreakdowns(cards, fixed, [], expenses, "2026-09");
  expect(bars[0].expenses).toBe(80);
  expect(bars[0].total).toBe(180);
});
```

- [ ] **Step 2: RED then implement**

```ts
export interface PieSlice {
  key: string;
  name: string;
  value: number;
}

export function monthPieSlices(
  fixed: FixedExpense[],
  expenses: Expense[],
  installmentsTotal: number,
  month: string
): PieSlice[] {
  const slices: PieSlice[] = categoryBreakdown(fixed).map((c) => ({
    key: `fixed:${c.category}`,
    name: `Fijos · ${c.category}`,
    value: c.total,
  }));
  const map = new Map<string, number>();
  for (const e of expensesInMonth(expenses, month)) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  for (const [category, value] of map) {
    slices.push({
      key: `expense:${category}`,
      name: `Gastos · ${category}`,
      value,
    });
  }
  if (installmentsTotal > 0) {
    slices.push({ key: "installments", name: "Mensualidades", value: installmentsTotal });
  }
  return slices.filter((s) => s.value > 0);
}

export function expenseTotalForCard(
  expenses: Expense[],
  cardId: string,
  month: string
): number {
  return expenses
    .filter((e) => e.cardId === cardId && expenseMonth(e) === month)
    .reduce((sum, e) => sum + e.amount, 0);
}
```

Extend `CardBreakdown` with `expenses: number`. `monthlyTotalForCard` and `cardBreakdowns` add expenses + month args defaulting to `[]` and `currentMonth()`.

- [ ] **Step 3: Advice RED**

```ts
it("menciona préstamos y gastos variables cuando hay saldo", () => {
  const totals = {
    fixed: 0,
    installments: 0,
    expenses: 400,
    total: 400,
    remainingDebt: 0,
    loanOwed: 8000,
    loanReceivable: 1500,
  };
  const advice = generateAdvice(settings, totals, [], []);
  const text = advice.map((a) => `${a.title} ${a.text}`).join(" ");
  expect(text).toMatch(/debo|préstamo/i);
  expect(text).toMatch(/gasto/i);
});
```

GREEN: after budget block, if `totals.loanOwed > 0` push warn “Tienes préstamos que tú debes”; if `totals.loanReceivable > 0` push info “Te deben dinero”; if `totals.expenses > 0` push info “Los gastos del mes ya suman…”. Treat expenses/loans as commitments so empty-state early return does not skip them:

```ts
const hasCommitments =
  fixed.length > 0 ||
  active.length > 0 ||
  totals.expenses > 0 ||
  totals.loanOwed > 0 ||
  totals.loanReceivable > 0;
```

- [ ] **Step 4: Dashboard pie keys + legend inspect**

Use `monthPieSlices`. `<Cell key={entry.key}>`. Legend:

```tsx
<button type="button" className="legend__item" onClick={() => setInspect(d)}>
```

Show `chart-inspect` under the chart with the selected slice. Keep `.chart-box { pointer-events: none; }`. Legend stays outside the dead plot so swipe still works on the donut.

- [ ] **Step 5: Commit**

```bash
git add src/lib/finance.ts src/lib/finance.test.ts src/lib/advice.ts src/lib/advice.test.ts src/pages/Dashboard.tsx src/index.css
git commit -m "feat: pie con keys únicas, barras con gastos y consejos de préstamos"
```

---

### Task 8: Swipe con vista `more` de primera clase

**Files:**
- Modify: `src/lib/swipeNav.ts`
- Modify: `src/lib/swipeNav.test.ts`
- Modify: `src/components/SwipePager.tsx`

**Interfaces:**
- Consumes: view string including `"more"`
- Produces: `toSwipeView`, `SWIPE_VIEWS` including `more` between `fixed` and `cards`

- [ ] **Step 1: Failing tests**

```ts
import { adjacentView, toSwipeView, SWIPE_VIEWS } from "./swipeNav";

it("trata Más como vista propia, no como alias de tarjetas", () => {
  expect(toSwipeView("more")).toBe("more");
  expect(adjacentView("fixed", "next")).toBe("more");
  expect(adjacentView("more", "next")).toBe("cards");
  expect(adjacentView("more", "prev")).toBe("fixed");
  expect(SWIPE_VIEWS.indexOf("more")).toBeLessThan(SWIPE_VIEWS.indexOf("cards"));
});
```

Current: `more` not in `SWIPE_VIEWS`; pager aliases to cards. RED.

- [ ] **Step 2: GREEN**

```ts
export const SWIPE_VIEWS = [
  "dashboard",
  "expenses",
  "loans",
  "installments",
  "fixed",
  "more",
  "cards",
  "strategies",
  "settings",
] as const;

export function toSwipeView(view: string): SwipeView {
  if (isSwipeView(view)) return view;
  return "dashboard";
}
```

SwipePager imports `toSwipeView` from `swipeNav` and deletes the local alias.

- [ ] **Step 3: Commit**

```bash
git add src/lib/swipeNav.ts src/lib/swipeNav.test.ts src/components/SwipePager.tsx
git commit -m "fix: swipe trata Más como vista propia"
```

---

### Task 9: Nav scrollable 6 ítems en 320px

**Files:**
- Modify: `src/index.css`
- Modify: `src/index.scroll.test.ts`
- Modify: `src/components/BottomNav.tsx` (optional `nav__label`)

**Interfaces:**
- Consumes: existing 6 Spanish labels
- Produces: horizontally scrollable nav; labels still Spanish

- [ ] **Step 1: Failing CSS test**

```ts
it("la nav de 6 ítems puede desplazarse en 320px", () => {
  expect(css).toMatch(/\.nav \{[^}]*overflow-x:\s*auto/s);
  expect(css).not.toMatch(/grid-template-columns:\s*repeat\(6/);
});
```

- [ ] **Step 2: GREEN CSS**

```css
.nav {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 2px;
  scrollbar-width: none;
}
.nav::-webkit-scrollbar { display: none; }
.nav button {
  flex: 1 0 auto;
  min-width: 3.4rem;
  font-size: 0.58rem;
  padding: 6px 4px;
}
```

Keep labels: Resumen, Gastos, Préstamos, Meses, Fijos, Más.

- [ ] **Step 3: Commit**

```bash
git add src/index.css src/index.scroll.test.ts src/components/BottomNav.tsx
git commit -m "fix: nav inferior desplazable para etiquetas en español"
```

---

### Task 10: ViewToolbar en préstamos + selector de mes en gastos

**Files:**
- Modify: `src/types.ts` — `loanLayout?: ListLayout`
- Modify: `src/store/persist.ts` — default `loanLayout: "list"`
- Modify: `src/store/persist.test.ts`
- Modify: `src/lib/expenses.ts` — `uniqueExpenseMonths`
- Modify: `src/lib/expenses.test.ts`
- Modify: `src/pages/LoansPage.tsx`
- Modify: `src/pages/ExpensesPage.tsx`

**Interfaces:**
- Consumes: `ViewToolbar`, `sortLoans`, `expensesInMonth`
- Produces: `uniqueExpenseMonths(items: Expense[], extra?: string): string[]`

- [ ] **Step 1: Failing month helper test**

```ts
it("lista meses únicos descendente e incluye el mes extra", () => {
  expect(uniqueExpenseMonths(items, "2026-09")).toEqual(["2026-09", "2026-08"]);
  expect(uniqueExpenseMonths(items)).toEqual(["2026-09", "2026-08"]);
});
```

- [ ] **Step 2: GREEN helper**

```ts
export function uniqueExpenseMonths(items: Expense[], extra?: string): string[] {
  const set = new Set(items.map(expenseMonth));
  if (extra) set.add(extra);
  return [...set].sort((a, b) => b.localeCompare(a));
}
```

- [ ] **Step 3: ExpensesPage month selector**

State `selectedMonth` default `currentMonth()`. Toolbar of months from `uniqueExpenseMonths(expenses, currentMonth())` using `.seg.seg--grow` or prev/next plus label `formatMonth(selectedMonth)`. List only `expensesInMonth(expenses, selectedMonth)`. Delete the unlabeled `history` pile.

- [ ] **Step 4: LoansPage ViewToolbar**

```tsx
const layout: ListLayout = settings.loanLayout ?? "list";
<ViewToolbar
  layout={layout}
  onLayout={(loanLayout) => updateSettings({ loanLayout })}
  sort={sort}
  sortOptions={[
    { value: "remaining", label: "Restante" },
    { value: "amount", label: "Importe" },
    { value: "name", label: "Nombre" },
  ]}
  onSort={(loanSort) => updateSettings({ loanSort })}
  sortDir={sortDir}
  onSortDir={(loanSortDir) => updateSettings({ loanSortDir })}
  dirLabels={
    sort === "name"
      ? { asc: "A → Z", desc: "Z → A" }
      : sort === "amount"
        ? { asc: "Más chicos", desc: "Más grandes" }
        : { asc: "Menos saldo", desc: "Más saldo" }
  }
/>
```

`normalizeSettings` adds `loanLayout`. Persist test expects `"list"`.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/store/persist.ts src/store/persist.test.ts src/lib/expenses.ts src/lib/expenses.test.ts src/pages/LoansPage.tsx src/pages/ExpensesPage.tsx
git commit -m "feat: toolbar en préstamos y selector de mes en gastos"
```

---

### Task 11: Superdesign (init refresh + drafts)

**Files:**
- Modify: `.superdesign/init/pages.md`
- Modify: `.superdesign/init/routes.md`
- Modify: `.superdesign/design-system.md` — nav scrollable, Yo debo / Me deben, chips
- Create: `.superdesign/resume.json` after first successful draft

**Interfaces:**
- Consumes: `.superdesign/init/*` (all six non-empty)
- Produces: canvas + preview URLs for five targets

- [ ] **Step 1: Preflight**

```bash
npx --yes @superdesign/cli@latest
```

If `auth:` says not authenticated: `npx --yes @superdesign/cli@latest login --no-browser`. Retry once. If still failing, skip generation and author HTML via `design-with-your-model.md` / implement UI from this plan.

- [ ] **Step 2: Refresh pages.md**

Add trees for `more`, `cards`, `strategies`, `settings`, `installments`, `fixed` (same format as dashboard/expenses/loans). Update routes.md swipe order to include `more` before `cards`.

- [ ] **Step 3: Drafts (mobile 390, Spanish, `--no-open`)**

Targets:

1. Lista + detalle préstamo (Llevas / restan, barra)
2. Modal de abono (campo vacío, chips, preview)
3. Choice cards Yo debo / Me deben
4. Bottom nav + hub Más
5. Resumen (debo / me deben / este mes; pie keys)

Use `--device mobile` or `--width 390`. Pass `--context-file` under payload budget (theme.md tokens + design-system.md + trimmed page JSX).

- [ ] **Step 4: Record canvas/preview URLs in the PR body. Commit init + resume if the files are non-secret.**

---

### Task 12: Verificación, walkthrough, PR

**Files:** none new except artifacts under `/opt/cursor/artifacts`

- [ ] **Step 1:** `npx tsc --noEmit` — exit 0
- [ ] **Step 2:** `npx vitest run` — 0 failures
- [ ] **Step 3:** Browser E2E at Vite 5173 or preview 4173: create Xbox 10k, abono 2k, assert list+detail, empty modal, swipe Más, expenses month, dashboard stats. Record walkthrough artifacts.
- [ ] **Step 4:** Push `cursor/ux-prestamos-tdd-superdesign-cf63`. Open PR against `cursor/finanzas-gastos-prestamos-cf63` (Spanish title/body, draft false after verification). Do not merge. Do not force-push.

---

## Self-review

1. Spec coverage: abono vacío, Xbox 2k, reject overpay, llevo/resta, Yo debo/Me deben, totals+pie+bars+advice, swipe more, nav, ViewToolbar, month filter, prune payments, RTL include, Superdesign, no version bump, persist key.
2. Placeholders: none.
3. Types: `PieSlice.key`, `reconcileLoanPayments`, `toSwipeView`, `uniqueExpenseMonths`, `loanLayout` used consistently.
