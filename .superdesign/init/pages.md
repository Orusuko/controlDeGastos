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
- src/lib/expenses.ts (uniqueExpenseMonths, expensesInMonth)
- src/lib/sort.ts

## loans
Entry: src/pages/LoansPage.tsx
- src/components/LoanModal.tsx → Modal.tsx (choice cards Yo debo / Me deben)
- src/components/LoanItem.tsx (Llevas / restan + progress)
- src/components/LoanPaymentModal.tsx (empty amount, chips, preview)
- src/components/ViewToolbar.tsx
- src/lib/loans.ts
- src/lib/sort.ts

## more
Entry: src/pages/MorePage.tsx
- src/components/icons.tsx
- src/components/BottomNav.tsx (View type)

## cards
Entry: src/pages/CardsPage.tsx
- src/components/CardModal.tsx → Modal.tsx, ColorSwatches.tsx
- src/components/FixedExpenseModal.tsx
- src/components/InstallmentModal.tsx
- src/components/FixedExpenseItem.tsx
- src/components/InstallmentItem.tsx
- src/components/ItemActions.tsx
- src/lib/finance.ts

## strategies
Entry: src/pages/StrategiesPage.tsx
- src/lib/finance.ts
- src/lib/advice.ts
- src/components/AdviceList.tsx

## settings
Entry: src/pages/SettingsPage.tsx
- src/store/backup.ts
- src/lib/shareBackup.ts
- src/lib/appVersion.ts
- src/components/ConfirmDialog.tsx

## installments
Entry: src/pages/InstallmentsPage.tsx
- src/components/InstallmentModal.tsx
- src/components/InstallmentItem.tsx
- src/components/ViewToolbar.tsx
- src/lib/finance.ts
- src/lib/sort.ts

## fixed
Entry: src/pages/FixedExpensesPage.tsx
- src/components/FixedExpenseModal.tsx
- src/components/FixedExpenseItem.tsx
- src/components/ViewToolbar.tsx
- src/lib/sort.ts
