# Routes

No URL router. `App` holds a `View` state. Swipe order: dashboard → expenses → loans → installments → fixed → cards → strategies → settings. `more` is a hub for cards/strategies/settings.

| View | Page | Role |
| --- | --- | --- |
| dashboard | src/pages/Dashboard.tsx | Totales del mes, gráficas, consejos |
| expenses | src/pages/ExpensesPage.tsx | Registrar gastos variables |
| loans | src/pages/LoansPage.tsx | Préstamos A favor / En contra |
| installments | src/pages/InstallmentsPage.tsx | Compras a meses |
| fixed | src/pages/FixedExpensesPage.tsx | Suscripciones |
| cards | src/pages/CardsPage.tsx | Tarjetas |
| strategies | src/pages/StrategiesPage.tsx | Ahorro |
| settings | src/pages/SettingsPage.tsx | Tema, sueldo, respaldo |
| more | src/pages/MorePage.tsx | Hub de Más |

Estado: Zustand persist `control-financiero:v1`.
