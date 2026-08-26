import { useEffect, useState } from "react";
import { BottomNav, type View } from "./components/BottomNav";
import { Dashboard } from "./pages/Dashboard";
import { CardsPage } from "./pages/CardsPage";
import { FixedExpensesPage } from "./pages/FixedExpensesPage";
import { InstallmentsPage } from "./pages/InstallmentsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { formatMonth, currentMonth } from "./lib/format";
import { syncNativeView } from "./lib/native";

const SUBTITLES: Record<View, string> = {
  dashboard: "Tu mes en un vistazo",
  cards: "Tus tarjetas",
  fixed: "Gastos fijos y suscripciones",
  installments: "Compras a meses",
  settings: "Ajustes",
};

export default function App() {
  const [view, setView] = useState<View>("dashboard");

  useEffect(() => {
    syncNativeView(view, setView);
  }, [view]);

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
