# controlDeGastos

Aplicación web para el control de gastos personales. Permite registrar gastos por
categoría, verlos en un listado, consultar un resumen por categoría y eliminarlos.

Es un monorepo con dos paquetes (workspaces de npm):

- `server`: API REST con **Express 5** y persistencia en **SQLite** (`better-sqlite3`).
- `web`: interfaz de usuario con **React 19** + **Vite** + **TypeScript**.

## Requisitos

- Node.js 22+
- npm 10+

## Puesta en marcha

```bash
npm install          # instala las dependencias de todos los workspaces
npm run dev:server   # arranca el API en http://localhost:3001
npm run dev:web      # arranca el frontend en http://localhost:5173
```

El servidor de desarrollo de Vite hace proxy de `/api` hacia el API en el puerto 3001,
así que solo necesitas abrir http://localhost:5173.

## Otros comandos

```bash
npm run build        # type-check (tsc) + build de producción del frontend
npm start            # arranca el API en modo producción
```

## API

| Método | Ruta                  | Descripción                          |
| ------ | --------------------- | ------------------------------------ |
| GET    | `/api/health`         | Estado del servicio                  |
| GET    | `/api/categories`     | Lista de categorías disponibles      |
| GET    | `/api/expenses`       | Lista de gastos                      |
| POST   | `/api/expenses`       | Crea un gasto                        |
| DELETE | `/api/expenses/:id`   | Elimina un gasto                     |
| GET    | `/api/summary`        | Total y desglose por categoría       |

La base de datos SQLite se crea automáticamente en `server/data/gastos.db`.

## Entorno de Cloud Agent

El fichero `.cursor/environment.json` define el entorno:

- `install`: `npm install`
- `terminals`: arranca el API (`dev:server`) y el frontend (`dev:web`)
- `ports`: expone `3001` (API) y `5173` (web)
