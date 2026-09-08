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
