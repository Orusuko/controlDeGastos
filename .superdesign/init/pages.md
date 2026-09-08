# Page dependency trees

## dashboard
Entry: src/pages/Dashboard.tsx
- src/store/useFinanceStore.ts
- src/lib/format.ts
- src/lib/finance.ts
- src/lib/expenses.ts
- src/lib/advice.ts
- src/components/EmptyState.tsx
- src/components/AdviceList.tsx
- src/components/icons.tsx
- src/lib/colors.ts

## expenses
Entry: src/pages/ExpensesPage.tsx
- src/components/ExpenseModal.tsx → Modal.tsx
- src/components/ExpenseItem.tsx → ItemActions.tsx
- src/components/ViewToolbar.tsx
- src/components/EmptyState.tsx
- src/lib/expenses.ts
- src/lib/sort.ts

## loans
Entry: src/pages/LoansPage.tsx
- src/components/LoanModal.tsx → Modal.tsx
- src/components/LoanItem.tsx
- src/components/LoanPaymentModal.tsx
- src/lib/loans.ts
- src/lib/sort.ts
