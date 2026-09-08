# Shared UI primitives

Framework: React 19 + custom CSS (no Tailwind, no shadcn).

## `src/components/Modal.tsx`

```tsx
import { useEffect, useId, useRef, type ReactNode } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  role?: "dialog" | "alertdialog";
}

export function Modal({
  title,
  onClose,
  children,
  role = "dialog",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const html = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    const previousModal = html.dataset.modalOpen;

    document.body.style.overflow = "hidden";
    html.dataset.modalOpen = "true";

    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1
      );

    const first = focusables()[0];
    (first ?? panel)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const nodes = focusables();
      if (nodes.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    }

    function syncViewport() {
      const vv = window.visualViewport;
      if (!vv) return;
      html.style.setProperty("--vvh", `${vv.height}px`);
    }
    syncViewport();
    window.visualViewport?.addEventListener("resize", syncViewport);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.visualViewport?.removeEventListener("resize", syncViewport);
      document.body.style.overflow = previousOverflow;
      if (previousModal === undefined) delete html.dataset.modalOpen;
      else html.dataset.modalOpen = previousModal;
      html.style.removeProperty("--vvh");
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="modal"
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal__handle" aria-hidden />
        <h3 id={titleId}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
```

## `src/components/EmptyState.tsx`

```tsx
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  children,
  action,
}: {
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card empty">
      {icon ? (
        <span className="empty__mark" aria-hidden>
          {icon}
        </span>
      ) : null}
      <p className="empty__text">{children}</p>
      {action}
    </div>
  );
}
```

## `src/components/ConfirmDialog.tsx`

```tsx
import { Modal } from "./Modal";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel} role="alertdialog">
      <p className="confirm-msg">{message}</p>
      <div className="modal__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
```

## `src/components/ItemActions.tsx`

```tsx
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { IconEdit, IconTrash } from "./icons";

export function ItemActions({
  name,
  onEdit,
  onDelete,
  deleteMessage,
}: {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
  deleteMessage?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="row-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="icon-btn icon-btn--edit"
        aria-label={`Editar ${name}`}
        onClick={onEdit}
      >
        <IconEdit />
      </button>
      <button
        type="button"
        className="icon-btn icon-btn--danger"
        aria-label={`Eliminar ${name}`}
        onClick={() => setConfirming(true)}
      >
        <IconTrash />
      </button>
      {confirming && (
        <ConfirmDialog
          title={`Eliminar ${name}`}
          message={
            deleteMessage ??
            `¿Eliminar “${name}”? Esta acción no se puede deshacer.`
          }
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete();
          }}
        />
      )}
    </div>
  );
}
```

## `src/components/ViewToolbar.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import type { ListLayout, SortDir } from "../types";
import { IconGrid, IconList, IconSort } from "./icons";

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

export interface SortDirLabels {
  asc: string;
  desc: string;
}

export function ViewToolbar<T extends string>({
  layout,
  onLayout,
  sort,
  sortOptions,
  onSort,
  sortDir,
  onSortDir,
  dirLabels,
}: {
  layout: ListLayout;
  onLayout: (layout: ListLayout) => void;
  sort: T;
  sortOptions: SortOption<T>[];
  onSort: (sort: T) => void;
  sortDir: SortDir;
  onSortDir: (dir: SortDir) => void;
  dirLabels: SortDirLabels;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = sortOptions.find((o) => o.value === sort)?.label ?? "Orden";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="view-toolbar">
      <div className="view-toolbar__row">
        <div className="seg" role="group" aria-label="Vista">
          <button
            type="button"
            aria-pressed={layout === "list"}
            aria-label="Vista de lista"
            onClick={() => onLayout("list")}
          >
            <IconList /> Lista
          </button>
          <button
            type="button"
            aria-pressed={layout === "grid"}
            aria-label="Vista de cuadrícula"
            onClick={() => onLayout("grid")}
          >
            <IconGrid /> Cuad.
          </button>
        </div>
        <div className="sort-menu" ref={menuRef}>
          <button
            type="button"
            className="sort-btn"
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((v) => !v)}
          >
            <IconSort /> <span>Criterio: {current}</span>
          </button>
          {open && (
            <div className="sort-menu__list" role="listbox" aria-label="Ordenar por">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-checked={sort === opt.value}
                  onClick={() => {
                    onSort(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        className="seg seg--grow"
        role="group"
        aria-label="Dirección del orden"
      >
        <button
          type="button"
          aria-pressed={sortDir === "asc"}
          aria-label={`Ascendente: ${dirLabels.asc}`}
          onClick={() => onSortDir("asc")}
        >
          ↑ {dirLabels.asc}
        </button>
        <button
          type="button"
          aria-pressed={sortDir === "desc"}
          aria-label={`Descendente: ${dirLabels.desc}`}
          onClick={() => onSortDir("desc")}
        >
          ↓ {dirLabels.desc}
        </button>
      </div>
    </div>
  );
}
```

## `src/components/BottomNav.tsx`

```tsx
import type { ComponentType, SVGProps } from "react";
import {
  IconCalendar,
  IconChart,
  IconLoan,
  IconMore,
  IconReceipt,
  IconRepeat,
} from "./icons";

export type View =
  | "dashboard"
  | "expenses"
  | "loans"
  | "installments"
  | "fixed"
  | "cards"
  | "strategies"
  | "settings"
  | "more";

const ITEMS: {
  view: View;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  match?: View[];
}[] = [
  { view: "dashboard", label: "Resumen", Icon: IconChart },
  { view: "expenses", label: "Gastos", Icon: IconReceipt },
  { view: "loans", label: "Préstamos", Icon: IconLoan },
  { view: "installments", label: "Meses", Icon: IconCalendar },
  { view: "fixed", label: "Fijos", Icon: IconRepeat },
  {
    view: "more",
    label: "Más",
    Icon: IconMore,
    match: ["more", "cards", "strategies", "settings"],
  },
];

interface BottomNavProps {
  view: View;
  onChange: (view: View) => void;
}

export function BottomNav({ view, onChange }: BottomNavProps) {
  return (
    <nav className="nav" aria-label="Secciones de la app">
      {ITEMS.map((item) => {
        const active = item.match
          ? item.match.includes(view)
          : view === item.view;
        return (
          <button
            key={item.view}
            type="button"
            className={active ? "active" : undefined}
            onClick={() => onChange(item.view)}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
          >
            <span className="nav__icon">
              <item.Icon />
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
```

## `src/components/SwipePager.tsx`

```tsx
import { useRef, type PointerEvent, type ReactNode } from "react";
import {
  adjacentView,
  classifySwipe,
  isSwipeView,
  type SwipeView,
} from "../lib/swipeNav";

function toSwipeView(view: string): SwipeView {
  if (view === "more") return "cards";
  if (isSwipeView(view)) return view;
  return "dashboard";
}

export function SwipePager({
  view,
  onChange,
  children,
}: {
  view: string;
  onChange: (view: SwipeView) => void;
  children: ReactNode;
}) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (document.documentElement.dataset.modalOpen) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }

  function finish(e: PointerEvent<HTMLDivElement>) {
    const origin = start.current;
    start.current = null;
    if (!origin || origin.id !== e.pointerId) return;
    if (document.documentElement.dataset.modalOpen) return;
    const decision = classifySwipe({
      dx: e.clientX - origin.x,
      dy: e.clientY - origin.y,
    });
    if (decision.kind !== "horizontal") return;
    const next = adjacentView(toSwipeView(view), decision.direction);
    if (next !== toSwipeView(view)) onChange(next);
  }

  return (
    <div
      className="swipe-pager"
      onPointerDown={onPointerDown}
      onPointerUp={finish}
      onPointerCancel={() => {
        start.current = null;
      }}
    >
      {children}
    </div>
  );
}
```
