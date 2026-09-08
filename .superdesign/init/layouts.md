# Layouts

Single mobile shell: header + scrollable main + fixed bottom nav.

## `src/App.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { BottomNav, type View } from "./components/BottomNav";
import { SwipePager } from "./components/SwipePager";
import { Dashboard } from "./pages/Dashboard";
import { CardsPage } from "./pages/CardsPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { LoansPage } from "./pages/LoansPage";
import { FixedExpensesPage } from "./pages/FixedExpensesPage";
import { InstallmentsPage } from "./pages/InstallmentsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StrategiesPage } from "./pages/StrategiesPage";
import { MorePage } from "./pages/MorePage";
import { IconLedger } from "./components/icons";
import { formatMonth, currentMonth } from "./lib/format";
import { applyResolvedTheme, resolveTheme } from "./lib/theme";
import { useFinanceStore } from "./store/useFinanceStore";

const SUBTITLES: Record<View, string> = {
  dashboard: "Tu mes en un vistazo",
  expenses: "Gastos del día a día",
  loans: "A favor y en contra",
  cards: "Tus tarjetas",
  fixed: "Gastos fijos y suscripciones",
  installments: "Compras a meses",
  strategies: "Plan de ahorro",
  settings: "Ajustes",
  more: "Tarjetas, ahorro y ajustes",
};

function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    useFinanceStore.persist.hasHydrated()
  );
  useEffect(() => {
    if (hydrated) return;
    return useFinanceStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);
  return hydrated;
}

function useApplyTheme() {
  const hydrated = useHydrated();
  const theme = useFinanceStore((s) => s.settings.theme);

  useEffect(() => {
    if (!hydrated) return;
    const apply = () => {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      applyResolvedTheme(resolveTheme(theme, systemDark));
    };
    apply();
    if ((theme ?? "system") !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [hydrated, theme]);
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const contentRef = useRef<HTMLElement>(null);
  useApplyTheme();

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 });
  }, [view]);

  return (
    <div className="app">
      <header className="app__header">
        <h1>
          <span className="app__mark" aria-hidden>
            <IconLedger />
          </span>
          Control Financiero
        </h1>
        <p className="app__header-sub">
          {SUBTITLES[view]} · {formatMonth(currentMonth())}
        </p>
      </header>

      <main className="app__content" ref={contentRef}>
        <SwipePager view={view} onChange={setView}>
          {view === "dashboard" && <Dashboard onNavigate={setView} />}
          {view === "expenses" && <ExpensesPage />}
          {view === "loans" && <LoansPage />}
          {view === "cards" && <CardsPage />}
          {view === "fixed" && <FixedExpensesPage onNavigate={setView} />}
          {view === "installments" && <InstallmentsPage onNavigate={setView} />}
          {view === "strategies" && <StrategiesPage onNavigate={setView} />}
          {view === "settings" && <SettingsPage onNavigate={setView} />}
          {view === "more" && <MorePage onNavigate={setView} />}
        </SwipePager>
      </main>

      <BottomNav view={view} onChange={setView} />
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
