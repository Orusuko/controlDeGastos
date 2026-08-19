# Control Financiero

App web *local-first* para el **control de finanzas personales**, pensada
principalmente para el navegador de Android. Permite:

- Registrar **tarjetas** de crédito (solo el nombre, sin datos bancarios) para
  distinguir los gastos de cada una.
- Registrar **gastos fijos / suscripciones** (streaming, servicios, software…)
  por tarjeta y categoría.
- Registrar **compras a meses (mensualidades)**: importe total y número de meses;
  ir marcando el pago de cada mes para ver el saldo pendiente y los meses que
  faltan.
- Un **dashboard** con el total a pagar del mes, uso del sueldo, gráficas
  (distribución por categoría y gasto por tarjeta) y **consejos financieros**
  según tu sueldo mensual.

Los datos se guardan **localmente en el dispositivo** (almacenamiento del
navegador vía Zustand `persist`). La capa de datos está aislada en
`src/store/useFinanceStore.ts` para poder migrarla a una base de datos en la
nube (por ejemplo Supabase) más adelante.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** (estado + persistencia en `localStorage`)
- **Recharts** (gráficas)

## Requisitos

- Node.js 22+
- npm 10+

## Puesta en marcha

```bash
npm install
npm run dev       # app en http://localhost:5173
```

## Otros comandos

```bash
npm run build     # type-check (tsc) + build de producción
npm run preview   # sirve el build de producción
```

## Estructura

```
src/
  types.ts                 # modelos de datos
  store/useFinanceStore.ts # estado + persistencia local (Supabase-ready)
  lib/
    finance.ts             # cálculos (totales, mensualidades, por tarjeta)
    advice.ts              # consejos financieros según el sueldo
    format.ts              # formato de moneda y fechas
  components/              # Modal, navegación inferior
  pages/                   # Dashboard, Tarjetas, Gastos fijos, Mensualidades, Ajustes
```

## Entorno de Cloud Agent

`.cursor/environment.json` define `install: npm install` y un terminal `web`
(`npm run dev`) que expone el puerto `5173`.
