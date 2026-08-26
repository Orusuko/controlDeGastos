# Control Financiero

App **Android** *local-first* para el control de finanzas personales.
También se publica como sitio estático en GitHub Pages.

Permite:

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

Los datos se guardan **localmente en el dispositivo**. La capa de datos está
aislada en `src/store/useFinanceStore.ts` para poder migrarla a una base de
datos en la nube (por ejemplo Supabase) más adelante.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** (estado + persistencia local)
- **Recharts** (gráficas)
- **Capacitor 8** (proyecto nativo Android, APK)

## Requisitos

- Node.js 22+
- npm 10+
- Para generar el APK: **JDK 21** y **Android SDK** (API 36) o Android Studio
  Ladybug / más reciente

## Puesta en marcha (web)

```bash
npm install
npm run dev       # app en http://localhost:5173
```

## App Android

La UI web se empaqueta en un proyecto nativo con Capacitor (`android/`).

```bash
npm install
npm run android:sync    # build web (modo android) + cap sync
npm run android:open    # abre Android Studio
npm run android:apk     # genera el APK de depuración
```

El APK queda en:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

Identidad de la app:

- **applicationId:** `com.orusuko.controlfinanciero`
- **Nombre:** Control Financiero
- **Orientación:** vertical
- **minSdk:** 24 (Android 7)

CI genera el mismo APK en cada push (workflow `.github/workflows/android.yml`)
y lo sube como artefacto `control-financiero-debug`.

> En desarrollo (`npm run dev`) la app se sirve en la raíz `/`. El build de
> GitHub Pages usa el `base` `/controlDeGastos/`. El build de Android
> (`npm run build:android`) usa `base` `/` para el WebView nativo.

## Otros comandos

```bash
npm run build           # type-check (tsc) + build de GitHub Pages
npm run build:android   # type-check + build para Capacitor
npm run preview         # sirve el build de Pages en http://localhost:4173/controlDeGastos/
```

## Despliegue en GitHub Pages

La versión web es 100% estática (sin backend) y se publica con GitHub Actions
(`.github/workflows/deploy.yml`) en cada push a `main`.

Pasos (una sola vez):

1. En GitHub, ve a **Settings → Pages**.
2. En **Build and deployment → Source**, elige **GitHub Actions**.
3. Haz push a `main` (o ejecuta el workflow manualmente desde la pestaña Actions).

La app quedará disponible en:

```
https://<tu-usuario>.github.io/controlDeGastos/
```

## Estructura

```
src/
  types.ts                 # modelos de datos
  store/useFinanceStore.ts # estado + persistencia local (Supabase-ready)
  native/                  # shell Capacitor: splash, status bar, botón Atrás
  lib/
    finance.ts             # cálculos (totales, mensualidades, por tarjeta)
    advice.ts              # consejos financieros según el sueldo
    format.ts              # formato de moneda y fechas
  components/              # Modal, navegación inferior
  pages/                   # Dashboard, Tarjetas, Gastos fijos, Mensualidades, Ajustes
android/                   # proyecto nativo Capacitor
resources/                 # icono y splash fuente (SVG)
```

## Entorno de Cloud Agent

`.cursor/environment.json` define `install: npm install` y un terminal `web`
(`npm run dev`) que expone el puerto `5173`.
