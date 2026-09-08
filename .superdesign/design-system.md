# Control Financiero — design system

Ledger / talonario: tinta índigo, papel lila, hilo violeta. No SaaS púrpura genérico.

## Color
- Primary: #5348e8 (light) / #a99bff (dark)
- Canvas: #f1eff7 / #0b0914
- Surface: #fffbff / #16122a
- Text: #1a1633 / #eee9fb
- Good #0f766e, Warn #c2410c, Danger #c81e1e

## Type
- Display: Bricolage Grotesque Variable, tracking tight, weights 700–800
- Body: Source Sans 3 Variable
- Tabular nums for money

## Layout
- Mobile-first, max 480px column
- Cards radius 18, rows 16
- Bottom nav 6 Spanish items, horizontally scrollable at 320px, blur backdrop
- Spanish copy only

## Components
- `.btn` full-width primary, `.btn--ghost`, `.btn--danger`
- `.fab-add` pill
- `.modal` bottom sheet
- `.choice-card` primary Yo debo / Me deben; secondary hint A favor / En contra
- `.chip` amount shortcuts in payment modal (empty field, preview “Después restan”)
- `.row` list rows with badge + amount + `.progress--row` for loans (Llevas / restan)
- `.legend__item` tappable inspect (charts stay `pointer-events: none` so swipe lives)
- `.month-seg` month chips on expenses

## Motion
- Short scale on tap. Honor prefers-reduced-motion.
