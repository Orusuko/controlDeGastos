import { useEffect, useRef, useState } from "react";
import type { ListLayout } from "../types";

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

export function ViewToolbar<T extends string>({
  layout,
  onLayout,
  sort,
  sortOptions,
  onSort,
}: {
  layout: ListLayout;
  onLayout: (layout: ListLayout) => void;
  sort: T;
  sortOptions: SortOption<T>[];
  onSort: (sort: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = sortOptions.find((o) => o.value === sort)?.label ?? "Orden";

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="view-toolbar">
      <div className="seg" role="group" aria-label="Vista">
        <button
          type="button"
          aria-pressed={layout === "list"}
          aria-label="Vista de lista"
          onClick={() => onLayout("list")}
        >
          ≡ Lista
        </button>
        <button
          type="button"
          aria-pressed={layout === "grid"}
          aria-label="Vista de cuadrícula"
          onClick={() => onLayout("grid")}
        >
          ▦ Grid
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
          ↕ <span>{current}</span>
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
  );
}
