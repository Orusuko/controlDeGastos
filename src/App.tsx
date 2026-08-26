import { useEffect, useState } from "react";
import { BottomNav, type View } from "./components/BottomNav";
import { Dashboard } from "./pages/Dashboard";
import { CardsPage } from "./pages/CardsPage";
import { FixedExpensesPage } from "./pages/FixedExpensesPage";
import { InstallmentsPage } from "./pages/InstallmentsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { formatMonth, currentMonth } from "./lib/format";
import { applyResolvedTheme, resolveTheme } from "./lib/theme";
import { useFinanceStore } from "./store/useFinanceStore";

const SUBTITLES: Record<View, string> = {
  dashboard: "Tu mes en un vistazo",
  cards: "Tus tarjetas",
  fixed: "Gastos fijos y suscripciones",
  installments: "Compras a meses",
  settings: "Ajustes",
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
  useApplyTheme();

  return (
    <div className="app">
      <header className="app__header">
        <h1>
          <span aria-hidden>💰</span> Control Financiero
        </h1>
        <p>
          {SUBTITLES[view]} · {formatMonth(currentMonth())}
        </p>
      </header>

      <main className="app__content">
        {view === "dashboard" && <Dashboard onNavigate={setView} />}
        {view === "cards" && <CardsPage />}
        {view === "fixed" && <FixedExpensesPage />}
        {view === "installments" && <InstallmentsPage />}
        {view === "settings" && <SettingsPage />}
      </main>

      <BottomNav view={view} onChange={setView} />
    </div>
  );
}
