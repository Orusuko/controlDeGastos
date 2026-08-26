# Control Financiero

App *local-first* para el **control de finanzas personales**, disponible como
web (PWA) y como **app nativa de Android** (vía [Capacitor](https://capacitorjs.com/)).
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

Los datos se guardan **localmente en el dispositivo** (almacenamiento del
navegador vía Zustand `persist`). La capa de datos está aislada en
`src/store/useFinanceStore.ts` para poder migrarla a una base de datos en la
nube (por ejemplo Supabase) más adelante.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** (estado + persistencia en `localStorage`)
- **Recharts** (gráficas)
- **Capacitor** (empaquetado como app nativa de Android; reutiliza el 100%
  del código web, sin reescribir la UI)

## Requisitos

- Node.js 22+
- npm 10+
- Para compilar/ejecutar la app Android: **Android Studio** (o el Android
  SDK + JDK 17+ por línea de comandos) — ver la sección
  [App de Android](#app-de-android)

## Puesta en marcha

```bash
npm install
npm run dev       # app en http://localhost:5173
```

## Otros comandos

```bash
npm run build     # type-check (tsc) + build de producción
npm run preview   # sirve el build de producción en http://localhost:4173/controlDeGastos/
```

> En desarrollo (`npm run dev`) la app se sirve en la raíz `/`. En el build de
> producción se usa el `base` `/controlDeGastos/` para GitHub Pages, por lo que
> `npm run preview` la sirve bajo ese subpath.

## Despliegue en GitHub Pages

La app es 100% estática (sin backend), así que se publica directamente en
GitHub Pages. El despliegue está automatizado con GitHub Actions
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
configura automáticamente en producción (ver `vite.config.ts`). Si renombras el
repositorio, actualiza ese `base` para que coincida con el nuevo nombre.

## App de Android

La app se empaqueta como app **nativa de Android** con
[Capacitor](https://capacitorjs.com/): el mismo código React se compila a
estáticos y se embebe en un proyecto Android (carpeta `android/`) que renderiza
la UI en un `WebView`, sin necesidad de reescribir nada. Toda la
persistencia (Zustand + `localStorage`) sigue funcionando igual dentro del
`WebView`.

### Requisitos

- [Android Studio](https://developer.android.com/studio) (recomendado), o
  bien el Android SDK command-line tools + JDK 17+ instalados manualmente.
- Un dispositivo Android conectado por USB (con depuración USB activada) o un
  emulador (AVD) ya creado.

### Compilar y ejecutar

```bash
npm install

# 1) Compila la web (modo "capacitor", rutas relativas) y la copia al proyecto Android
npm run build:android

# 2) Sincroniza el proyecto nativo (copia assets + plugins de Capacitor)
npx cap sync android

#(los dos pasos anteriores también se pueden hacer juntos con)
npm run android:sync

# 3) Abre el proyecto en Android Studio para compilar/firmar/ejecutar desde ahí
npm run android:open

# — o, por línea de comandos, con un dispositivo/emulador ya conectado —
npm run android:run
```

También puedes generar un APK de depuración directamente con Gradle:

```bash
cd android
./gradlew assembleDebug
# APK resultante en android/app/build/outputs/apk/debug/app-debug.apk
```

### Notas

- El `appId` de la app es `com.controlfinanciero.app` (ver
  `capacitor.config.json`).
- El ícono de Android se genera a partir de `resources/logo.png` con
  `npx capacitor-assets generate --android`. La imagen usa un gráfico de
  billetera y crecimiento para representar las finanzas personales.
- El build web para Android usa el modo `capacitor` de Vite (rutas relativas,
  carpeta de salida `dist-android/`), distinto del build para GitHub Pages
  (`dist/`, rutas bajo `/controlDeGastos/`). Ver `vite.config.ts`.
- Cada vez que cambies código en `src/`, vuelve a ejecutar
  `npm run android:sync` antes de recompilar/ejecutar la app Android para que
  los cambios se reflejen.

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
android/                   # Proyecto nativo de Android generado por Capacitor
resources/                 # SVG fuente para generar íconos/splash de Android
```

## Entorno de Cloud Agent

`.cursor/environment.json` define `install: npm install` y un terminal `web`
(`npm run dev`) que expone el puerto `5173`.
