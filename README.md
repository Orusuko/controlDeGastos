# Control Financiero para Android

Aplicación Android *local-first* para el **control de finanzas personales**.
También conserva una versión web instalable. Permite:

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

Los datos se guardan **localmente en el espacio privado de la aplicación**
mediante Zustand `persist`; no requieren una cuenta ni salen del teléfono. La
capa de datos está aislada en
`src/store/useFinanceStore.ts` para poder migrarla a una base de datos en la
nube (por ejemplo Supabase) más adelante.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** (estado + persistencia en `localStorage`)
- **Recharts** (gráficas)
- **Capacitor 8** (aplicación nativa Android)

## Requisitos

- Node.js 22+
- npm 10+
- Para compilar el APK: Android Studio o Android SDK 36 y Java 21
- Android 7.0 (API 24) o posterior en el dispositivo

## Puesta en marcha

```bash
npm install
npm run dev       # app en http://localhost:5173
```

## Compilar la aplicación Android

```bash
npm install
npm run android:sync  # compila React y sincroniza el proyecto nativo
npm run android:open  # abre el proyecto en Android Studio
```

Para generar directamente un APK de desarrollo:

```bash
npm run android:apk
```

El APK queda en
`android/app/build/outputs/apk/debug/app-debug.apk`. Se puede instalar con
Android Studio o con:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

La aplicación usa el identificador `com.orusuko.controlfinanciero`. El botón
Atrás de Android cierra primero un formulario abierto, vuelve después al
resumen y, desde el resumen, envía la aplicación a segundo plano.

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
android/                   # Proyecto nativo Gradle para Android
assets/                    # Fuente del icono y splash nativos
capacitor.config.json      # Identidad y configuración de Capacitor
```

## Entorno de Cloud Agent

`.cursor/environment.json` define `install: npm install` y un terminal `web`
(`npm run dev`) que expone el puerto `5173`.
