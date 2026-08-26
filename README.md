# Control Financiero

App **Android** (y web) *local-first* para el **control de finanzas personales**.
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

- **React 19** + **TypeScript** + **Vite** (UI)
- **Capacitor 8** (capa nativa Android)
- **Zustand** (estado + persistencia local)
- **Recharts** (gráficas)

## App Android

El proyecto nativo está en `android/` (Android Studio / Gradle). El identificador
es `com.orusuko.controlfinanciero`.

### Requisitos

- Node.js 22+
- JDK 21
- Android SDK (API 36) — se instala con Android Studio

### Compilar e instalar

```bash
npm install
npm run build:android   # Vite (rutas relativas) + cap sync
npm run android:open    # abre Android Studio
```

Desde la línea de comandos (con el SDK configurado):

```bash
npm run android:apk     # genera android/app/build/outputs/apk/debug/app-debug.apk
```

El APK debug también se genera en CI (workflow **Build Android APK**) y queda
como artefacto descargable en GitHub Actions.

El botón **atrás** de Android cierra el modal abierto, vuelve al resumen si
estás en otra pestaña, o sale de la app.

## Desarrollo web

```bash
npm install
npm run dev       # app en http://localhost:5173
```

## Otros comandos

```bash
npm run build          # type-check (tsc) + build de producción (GitHub Pages)
npm run preview        # sirve el build de producción en http://localhost:4173/controlDeGastos/
npm run build:android  # build para el WebView nativo + sync del proyecto Android
```

> En desarrollo (`npm run dev`) la app se sirve en la raíz `/`. En el build de
> producción web se usa el `base` `/controlDeGastos/` para GitHub Pages. El
> build de Android (`CAPACITOR=1`) usa rutas relativas `./` para el WebView.

## Despliegue en GitHub Pages

La versión web es 100% estática (sin backend), así que se publica en GitHub
Pages. El despliegue está automatizado con GitHub Actions
(`.github/workflows/deploy.yml`): en cada push a `main` se compila y se publica.

Pasos (una sola vez):

1. En GitHub, ve a **Settings → Pages**.
2. En **Build and deployment → Source**, elige **GitHub Actions**.
3. Haz push a `main` (o ejecuta el workflow manualmente desde la pestaña Actions).

La app quedará disponible en:

```
https://<tu-usuario>.github.io/controlDeGastos/
```

Como el sitio se sirve bajo el subpath `/controlDeGastos/`, el `base` de Vite se
configura automáticamente en el build web (ver `vite.config.ts`). Si renombras el
repositorio, actualiza ese `base` para que coincida con el nuevo nombre.

## Estructura

```
src/
  types.ts                 # modelos de datos
  store/useFinanceStore.ts # estado + persistencia local (Supabase-ready)
  lib/
    finance.ts             # cálculos (totales, mensualidades, por tarjeta)
    advice.ts              # consejos financieros según el sueldo
    format.ts              # formato de moneda y fechas
    native.ts              # puente Capacitor (status bar, atrás, splash)
  components/              # Modal, navegación inferior
  pages/                   # Dashboard, Tarjetas, Gastos fijos, Mensualidades, Ajustes
android/                   # proyecto nativo (Android Studio)
capacitor.config.json      # id, splash, status bar
```

## Entorno de Cloud Agent

`.cursor/environment.json` define `install: npm install` y un terminal `web`
(`npm run dev`) que expone el puerto `5173`.
