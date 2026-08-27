import type { ComponentType, SVGProps } from "react";
import {
  IconCalendar,
  IconCard,
  IconChart,
  IconRepeat,
  IconSettings,
} from "./icons";

export type View =
  | "dashboard"
  | "cards"
  | "fixed"
  | "installments"
  | "settings";

const ITEMS: {
  view: View;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { view: "dashboard", label: "Resumen", Icon: IconChart },
  { view: "cards", label: "Tarjetas", Icon: IconCard },
  { view: "fixed", label: "Fijos", Icon: IconRepeat },
  { view: "installments", label: "Meses", Icon: IconCalendar },
  { view: "settings", label: "Ajustes", Icon: IconSettings },
];

interface BottomNavProps {
  view: View;
  onChange: (view: View) => void;
}

export function BottomNav({ view, onChange }: BottomNavProps) {
  return (
    <nav className="nav" aria-label="Secciones de la app">
      {ITEMS.map((item) => {
        const active = view === item.view;
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
