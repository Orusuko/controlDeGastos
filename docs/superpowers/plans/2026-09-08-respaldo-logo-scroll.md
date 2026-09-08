# Respaldo automático, logo y scroll táctil Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fecha/hora de abono automática; JSON de respaldo en una carpeta que sobrevive a desinstalar; logo reconocible; scroll vertical táctil fiable.

**Architecture:** El abono sigue rellenando `currentDate()`/`currentTime()` al abrir el modal. Un adaptador `autoBackup` escribe `ControlFinanciero/control-financiero.json` en Documentos (nativo) o carpeta elegida (web File System Access). Un wizard al hidratar pide la ruta y, si hay JSON y el store está vacío, ofrece restaurar. El scroll usa `touch-action: pan-y` y el swipe cede si hay movimiento vertical.

**Tech Stack:** React 19, Zustand persist, Capacitor Filesystem, Vitest, SVG/iconos.

## Global Constraints

- No cambiar `PERSIST_NAME` (`control-financiero:v1`).
- Copy en español.
- El JSON de respaldo sigue el envelope `control-financiero-backup`.
- Android: `Directory.Documents` + permisos de almacenamiento en API ≤ 28.
- Fecha/hora del abono: automática al abrir; el usuario puede ajustar si la transferencia fue antes.

---

### Task 1: Fecha y hora automáticas (claras)

**Files:**
- Modify: `src/components/LoanPaymentModal.tsx`
- Modify: `src/components/LoanPaymentModal.test.tsx`

- [x] Tests: el modal abre con fecha y hora de ahora; un chip «Ahora» las restaura.
- [x] Copy: «Se rellena sola con la hora de ahora».
- [x] Commit.

### Task 2: Dominio de respaldo automático

**Files:**
- Create: `src/lib/autoBackup.ts`, `src/lib/autoBackup.test.ts`
- Modify: `src/types.ts`, `src/store/persist.ts`

- [x] `AUTO_BACKUP_RELATIVE`, `shouldPromptBackupSetup`, `hasLocalFinanceData`, `shouldOfferRestore`.
- [x] Settings: `autoBackupSetupDone`, `autoBackupEnabled`, `autoBackupLabel`.
- [x] Commit.

### Task 3: IO nativo/web y wizard

**Files:**
- Create: `src/lib/autoBackupIO.ts`, `src/components/BackupSetupModal.tsx`, `src/components/useAutoBackup.ts`
- Modify: `src/App.tsx`, `src/pages/SettingsPage.tsx`, `android/app/src/main/AndroidManifest.xml`

- [x] Elegir ruta / Documentos, escribir JSON al persistir, leer al inicio.
- [x] Commit.

### Task 4: Scroll táctil

**Files:**
- Modify: `src/lib/swipeNav.ts`, `src/lib/swipeNav.test.ts`, `src/components/SwipePager.tsx`, `src/index.css`, `src/index.scroll.test.ts`

- [x] Si hay pan vertical, no cambiar de pestaña.
- [x] `overflow-y: scroll` + `touch-action: pan-y` en `.app__content`.
- [x] Commit.

### Task 5: Logo

**Files:**
- Modify: `public/favicon.svg`, `public/icon.svg`, `src/components/icons.tsx`, `src/index.css`
- Optional: `resources/` para Capacitor

- [x] Marca circular (sello/talonario + peso), no el cuadrado genérico.
- [x] Commit.
