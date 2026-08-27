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
