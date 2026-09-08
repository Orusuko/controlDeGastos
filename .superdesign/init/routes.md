# Routes

No URL router. `App` holds a `View` state. Swipe order: dashboard → expenses → loans → installments → fixed → more → cards → strategies → settings. `more` is first-class (not an alias of cards). Hub children (cards/strategies/settings) remain after Más.

| View | Page | Role |
| --- | --- | --- |
| dashboard | src/pages/Dashboard.tsx | Totales del mes, gráficas, Yo debo / Me deben / este mes |
| expenses | src/pages/ExpensesPage.tsx | Gastos variables con selector de mes |
| loans | src/pages/LoansPage.tsx | Préstamos Yo debo / Me deben, llevo/resta, abonos |
| installments | src/pages/InstallmentsPage.tsx | Compras a meses |
| fixed | src/pages/FixedExpensesPage.tsx | Suscripciones |
| more | src/pages/MorePage.tsx | Hub de Más |
| cards | src/pages/CardsPage.tsx | Tarjetas |
| strategies | src/pages/StrategiesPage.tsx | Ahorro |
| settings | src/pages/SettingsPage.tsx | Tema, sueldo, respaldo |

Estado: Zustand persist `control-financiero:v1`.
