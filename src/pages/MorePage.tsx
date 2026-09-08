import { IconCard, IconChevron, IconSettings, IconTarget } from "../components/icons";
import type { View } from "../components/BottomNav";

const LINKS: { view: View; title: string; sub: string; Icon: typeof IconCard }[] = [
  {
    view: "cards",
    title: "Tarjetas",
    sub: "Nombres y detalle por plástico",
    Icon: IconCard,
  },
  {
    view: "strategies",
    title: "Ahorro",
    sub: "Plan con tu sueldo y deudas",
    Icon: IconTarget,
  },
  {
    view: "settings",
    title: "Ajustes",
    sub: "Sueldo, tema y respaldo JSON",
    Icon: IconSettings,
  },
];

export function MorePage({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <>
      <div className="section-title">
        <h2>Más</h2>
      </div>
      <p className="muted strategy-lead">
        Tarjetas, el plan de ahorro y los ajustes viven aquí para dejar Gastos
        y Préstamos a un toque.
      </p>
      <div className="list">
        {LINKS.map((item) => (
          <div
            className="row row--tap"
            key={item.view}
            role="link"
            tabIndex={0}
            aria-label={item.title}
            onClick={() => onNavigate(item.view)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate(item.view);
              }
            }}
          >
            <div className="row__badge row__badge--soft" aria-hidden>
              <item.Icon />
            </div>
            <div className="row__body">
              <div className="row__title">{item.title}</div>
              <div className="row__sub">{item.sub}</div>
            </div>
            <span className="row__chevron" aria-hidden>
              <IconChevron />
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
