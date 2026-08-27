export type View =
  | "dashboard"
  | "cards"
  | "fixed"
  | "installments"
  | "settings";

const ITEMS: { view: View; label: string; icon: string }[] = [
  { view: "dashboard", label: "Resumen", icon: "📊" },
  { view: "cards", label: "Tarjetas", icon: "💳" },
  { view: "fixed", label: "Fijos", icon: "🔁" },
  { view: "installments", label: "Meses", icon: "🗓️" },
  { view: "settings", label: "Ajustes", icon: "⚙️" },
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
            <span className="nav__icon" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
