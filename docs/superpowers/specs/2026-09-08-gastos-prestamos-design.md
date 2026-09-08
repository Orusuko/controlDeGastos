# Gastos, préstamos y gesto de deslizamiento — diseño

Fecha: 2026-09-08
Producto: Control Financiero (`controlDeGastos`)
Alcance: auditoría, arreglo del swipe, apartados Registrar gastos y Registrar préstamos.

## Contexto

App **local-first** (React 19 + Vite + Zustand persist + Capacitor). No hay backend ni Supabase. La clave de `localStorage` `control-financiero:v1` no se cambia. Los textos de UI son en español.

Hoy existen: Resumen, Tarjetas, Gastos fijos (recurrentes), Compras a meses, Ahorro y Ajustes. Faltan gastos variables y préstamos entre personas. La navegación inferior ya tiene 6 botones. No hay pager ni gesto horizontal.

## Auditoría (hallazgos)

1. **Swipe / slide roto o ausente.** `.app__content` usa `touch-action: pan-y` y `overflow-x: hidden`. Eso desbloquea el scroll vertical (arreglo previo) pero **impide el deslizamiento horizontal** entre secciones. No hay detector de gesto. Recharts captura el puntero en las gráficas y puede bloquear el scroll cuando el dedo cae sobre el SVG.
2. **Nav saturada.** Seis pestañas a `0.62rem`. Añadir dos más sin reorganizar las vuelve ilegibles.
3. **Hueco de producto.** “Gastos fijos” no cubre un café, un taxi o un súper. No hay historial diario.
4. **Hueco de producto.** No hay deudas entre personas (me prestaron / yo presté / morosos / abonos).
5. **Respaldo incompleto para lo nuevo.** Export/import solo cubre `cards`, `fixed`, `installments`, `settings`. Hay que incluir `expenses` y `loans` sin romper JSON v1.
6. **Fijos exigen tarjeta.** Correcto para cargos a plástico. Los gastos de bolsillo no deben exigir tarjeta.
7. **Diferido (no bloquea).** No hay búsqueda, ni notificaciones de cobro, ni nube. El store sigue listo para un futuro remoto.

## Enfoques considerados

1. **Recomendado — pager con swipe + nav de 6 con “Más”.** Orden deslizable: Resumen → Gastos → Préstamos → Meses → Fijos → Tarjetas → Ahorro → Ajustes. Barra: Resumen, Gastos, Préstamos, Meses, Fijos, Más (Más cubre Tarjetas/Ahorro/Ajustes). Persistencia v3 en el mismo store.
2. **Ocho botones en nav con overflow-x.** Encaja peor en 320–390 px.
3. **Solo atajos desde Resumen.** No cumple “apartado dedicado”.

Se elige el enfoque 1.

## Arquitectura

- Tipos nuevos en `src/types.ts`.
- Cálculos puros en `src/lib/finance.ts` (gastos del mes, saldos de préstamo por persona).
- Clasificador de gesto en `src/lib/swipeNav.ts` (testeable, sin DOM).
- Persistencia: `PERSIST_VERSION = 3`; `migrate` rellena `expenses: []` y `loans: []`.
- UI: mismas clases (`.card`, `.row`, `.modal`, `.seg`, `.fab-add`). Sin segundo design system.
- Superdesign para los dos apartados nuevos; si el login de CLI falla, se implementa con el sistema visual existente.

## Gastos (Registrar gastos)

Gasto **variable**, no recurrente.

```ts
Expense {
  id: string
  name: string
  amount: number          // > 0
  category: ExpenseCategory
  date: string            // YYYY-MM-DD local
  cardId?: string         // opcional
  note?: string
}
```

Categorías: Comida, Transporte, Salud, Hogar, Entretenimiento, Ropa, Educación, Otros.

Pantalla: lista (más reciente primero), total del mes visible, alta/edición/borrado, historial por mes. No exige tarjeta. Entra en el total del dashboard del mes en curso.

## Préstamos (A favor / En contra)

Definición **explícita de producto** (aunque el español coloquial a veces lo invierte):

- **A favor** = me prestaron = **yo debo**. Abonos = pagos que yo hago.
- **En contra** = yo presté = **me deben** (morosos). Abonos = pagos que hace cada deudor.

```ts
LoanDirection = "a_favor" | "en_contra"
LoanParty { id, name, shareAmount }
LoanPayment { id, partyId, amount, paidAt, note? }
Loan { id, title, direction, createdAt, parties[], payments[], note? }
```

`total = Σ shareAmount`. `restante(persona) = max(0, share − Σ abonos de esa persona)`. Varias personas por préstamo. Un abono no puede superar el restante de esa persona. UI aclara “Me prestaron / Yo debo” y “Yo presté / Me deben”.

## Swipe

`classifySwipe({ dx, dy })`: horizontal si `|dx| ≥ 56` y `|dx| > |dy| * 1.15`; si no, vertical o ninguno. El pager cambia de vista; el scroll vertical de `.app__content` no se cancela. `touch-action: pan-x pan-y` en el contenido. Gráficas: `touch-action: pan-y` y sin `preventDefault` del chart. Modales: el gesto no cambia de pestaña.

## Navegación

`View` añade `expenses | loans | more`. `more` es un hub (Tarjetas, Ahorro, Ajustes). Las tres vistas hijas siguen existiendo y entran en el orden de swipe.

## Persistencia y respaldo

Misma clave. Versión 3. `resetAll` / `importBackup` / `serializeBackup` / `backupSummary` incluyen gastos y préstamos. JSON antiguo sigue importando.

## Dashboard y consejos

`Totals` suma gastos del mes. Mini-stats: “Debo” (préstamos a favor) y “Me deben” (en contra). El empty state menciona gastos y préstamos. Los tests de consejos actuales siguen pasando sin gastos/préstamos.

## Versión

`1.6.0` / `versionCode 20260908` (Ajustes + `android/app/build.gradle`).

## Fuera de alcance

Supabase, intereses compuestos, recordatorios, división automática “a partes iguales” como único modo (el usuario escribe el importe de cada persona), iOS nativo.

## Autocrítica de la spec

Sin TBD. A favor/En contra queda fijado. Swipe no sustituye el scroll. Un plan cubre el alcance.
