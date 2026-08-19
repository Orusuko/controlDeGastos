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
    <nav className="nav">
      {ITEMS.map((item) => (
        <button
          key={item.view}
          className={view === item.view ? "active" : ""}
          onClick={() => onChange(item.view)}
          aria-current={view === item.view}
        >
          <span className="nav__icon" aria-hidden>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
