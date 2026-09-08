# UX préstamos, abonos y paridad de listas — design

**Date:** 2026-09-08
**Status:** approved by follow-up order (execute in session; one branch)

## Problem

The loans feature ships, but three UX bugs make it dangerous or opaque:

1. The payment modal prefills the remaining balance. A tap on Registrar can liquidate $10k when the user meant $2k.
2. List rows show leftover of total (`$8,000 de $10,000`) and never “llevo $2,000”.
3. Primary labels are A favor / En contra. People read those as bank language, not “yo debo / me deben”.

Dashboard pie keys collide on “Otros”, card bars ignore variable expenses, advice ignores loans/gastos, Más aliases to cards in swipe, nav is 6 cramped columns, expenses dump unlabeled history.

## Decisions

- Keep persist key `control-financiero:v1` and `PERSIST_VERSION` 3. Add `loanLayout` via `normalizeSettings` only.
- Do not bump `APP_VERSION_NAME` (stays 1.6.0). This is a UX patch.
- Primary copy: **Yo debo** (`a_favor`) / **Me deben** (`en_contra`). A favor / En contra stay as secondary hint.
- Payment modal amount starts empty. Chips: mitad / restante. Live preview: “Después restan X”.
- `canRegisterLoanPayment` stays the guard. Store still no-ops invalid amounts (assert that); the modal shows the error.
- Editing a loan prunes payments whose party disappeared and drops newest payments that would exceed the new share.
- Swipe model: `more` is a first-class view. Order: dashboard → expenses → loans → installments → fixed → more → cards → strategies → settings. Do not alias `more` to `cards`.
- Nav: keep 6 Spanish items; make the bar horizontally scrollable with slightly tighter labels so 320px does not crush “Préstamos”.
- Charts: keep chart plot `pointer-events: none` so swipe lives. Inspect via legend tap (and legend `pointer-events: auto`).
- Expenses: month selector (unique YYYY-MM + current). No unlabeled history pile.
- Loans: `ViewToolbar` like expenses (layout + sort already in settings).
- Pie slices use unique keys (`fixed:Otros` vs `expense:Otros`) and distinct Spanish names.
- Card bars include this month’s variable expenses with `cardId`.
- Advice mentions loan balances and monthly variable expenses when those totals are > 0.
- Spanish copy only. Existing ledger CSS. No second design system.

## Test plan

- TDD unit/store/component tests (Vitest + happy-dom; RTL for modal/row).
- `npx tsc --noEmit` and `npx vitest run`.
- Browser E2E: Xbox 10k, abono 2k → list and detail show llevo 2k / restan 8k; modal empty; swipe Más; expenses month; dashboard stats.
