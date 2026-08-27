import type { FixedExpense, Installment, Settings } from "../types";
import type { Totals } from "./finance";
import {
  isActive,
  monthlyAmount,
  remainingAmount,
  remainingMonths,
} from "./finance";
import { formatCurrency } from "./format";

export type AdviceLevel = "good" | "info" | "warn" | "danger";

export interface Advice {
  level: AdviceLevel;
  title: string;
  text: string;
  kicker?: string;
  metric?: string;
}

const pct = (value: number) => `${Math.round(value * 100)}%`;

function money(value: number, settings: Settings): string {
  return formatCurrency(value, settings);
}

function monthsLabel(n: number): string {
  return n === 1 ? "1 mes" : `${n} meses`;
}

/**
 * Estrategias accionables a partir de sueldo, fijos y mensualidades reales.
 * Nunca devuelve una lista vacía: si faltan datos, indica el siguiente paso.
 */
export function generateAdvice(
  settings: Settings,
  totals: Totals,
  fixed: FixedExpense[],
  installments: Installment[] = []
): Advice[] {
  const salary = settings.monthlySalary;
  const advice: Advice[] = [];
  const active = installments.filter(isActive);
  const hasCommitments = fixed.length > 0 || active.length > 0;

  if (!hasCommitments && (!salary || salary <= 0)) {
    advice.push({
      level: "info",
      kicker: "Empezar",
      title: "Aún no hay números que optimizar",
      text: "Añade tu sueldo en Ajustes y registra fijos o compras a meses. El plan se arma solo con tus datos, no con frases genéricas.",
    });
    return advice;
  }

  if (!salary || salary <= 0) {
    advice.push({
      level: "info",
      kicker: "Sueldo",
      title: "Configura tu sueldo mensual",
      text: "Sin el sueldo no se puede saber qué porcentaje se va en pagos. Ponlo en Ajustes; no sale del teléfono.",
    });
  }

  const fixedRatio = salary > 0 ? totals.fixed / salary : 0;
  const debtRatio = salary > 0 ? totals.installments / salary : 0;
  const totalRatio = salary > 0 ? totals.total / salary : 0;
  const available = salary > 0 ? salary - totals.total : 0;

  if (salary > 0) {
    if (totalRatio >= 1) {
      advice.push({
        level: "danger",
        kicker: "Presupuesto",
        title: "Los pagos ya comen todo el sueldo",
        metric: pct(totalRatio),
        text: `Este mes destinas ${money(totals.total, settings)} (${pct(
          totalRatio
        )} del sueldo). No asumas otra compra a meses hasta recortar fijos o liquidar una mensualidad.`,
      });
    } else if (totalRatio > 0.7) {
      advice.push({
        level: "warn",
        kicker: "Presupuesto",
        title: "El mes ya se come más del 70%",
        metric: pct(totalRatio),
        text: `Usas ${pct(
          totalRatio
        )} del sueldo en fijos y mensualidades. Por encima de ese umbral casi no queda ahorro: evita nuevas mensualidades y recorta un fijo.`,
      });
    } else {
      advice.push({
        level: "good",
        kicker: "Presupuesto",
        title: "Hay margen si no lo gastas",
        metric: pct(totalRatio),
        text: `Los compromisos son el ${pct(
          totalRatio
        )} del sueldo. Con la regla 50/30/20 el objetivo de ahorro es ${money(
          salary * 0.2,
          settings
        )} al mes. Hoy te quedan ${money(available, settings)} después de pagos.`,
      });
    }
  }

  if (active.length > 0) {
    const rankedSnowball = [...active].sort((a, b) => {
      const months = remainingMonths(a) - remainingMonths(b);
      if (months !== 0) return months;
      return remainingAmount(a) - remainingAmount(b);
    });
    const rankedAvalanche = [...active].sort((a, b) => {
      const cost =
        remainingAmount(b) / Math.max(1, remainingMonths(b)) -
        remainingAmount(a) / Math.max(1, remainingMonths(a));
      if (cost !== 0) return cost;
      return remainingAmount(b) - remainingAmount(a);
    });
    const snowball = rankedSnowball[0];
    const avalanche = rankedAvalanche[0];
    const snowballLeft = remainingAmount(snowball);
    const snowballMonths = remainingMonths(snowball);
    const avalancheMonthly =
      remainingAmount(avalanche) / Math.max(1, remainingMonths(avalanche));

    advice.push({
      level: snowballMonths <= 2 ? "good" : "info",
      kicker: "Deuda · bola de nieve",
      title: `Liquida primero “${snowball.name}”`,
      metric: `${monthsLabel(snowballMonths)} · ${money(snowballLeft, settings)}`,
      text: `Es la que menos meses le quedan (${monthsLabel(
        snowballMonths
      )}, ${money(
        snowballLeft,
        settings
      )} pendientes). Al cerrarla dejas de pagar ${money(
        monthlyAmount(snowball),
        settings
      )} cada mes y liberas cupo.`,
    });

    if (avalanche.id !== snowball.id) {
      advice.push({
        level: "info",
        kicker: "Deuda · interés implícito",
        title: `“${avalanche.name}” es la más cara por mes`,
        metric: money(avalancheMonthly, settings),
        text: `No hay tasa en la app, así que el costo implícito es lo que sigue saliendo cada mes: ${money(
          avalancheMonthly,
          settings
        )} durante ${monthsLabel(
          remainingMonths(avalanche)
        )}. Si puedes abonar extra, mételo aquí después de cerrar la más corta.`,
      });
    }

    if (salary > 0 && debtRatio > 0.3) {
      advice.push({
        level: debtRatio > 0.4 ? "danger" : "warn",
        kicker: "Mensualidades",
        title: "No asumas más compras a meses",
        metric: pct(debtRatio),
        text: `Las mensualidades ya son el ${pct(
          debtRatio
        )} del sueldo (${money(
          totals.installments,
          settings
        )} al mes). El tope sano es 30%. Termina una deuda antes de abrir otra.`,
      });
    }

    const heavy = active.find(
      (i) => salary > 0 && monthlyAmount(i) / salary > 0.1
    );
    if (heavy) {
      advice.push({
        level: "warn",
        kicker: "Concentración",
        title: `“${heavy.name}” pesa demasiado sola`,
        metric: pct(monthlyAmount(heavy) / salary),
        text: `Esa compra se lleva ${money(
          monthlyAmount(heavy),
          settings
        )} al mes (${pct(
          monthlyAmount(heavy) / salary
        )} del sueldo). Evita alargar el plazo: más meses = más meses pagando ese hueco.`,
      });
    }
  } else if (installments.length > 0) {
    advice.push({
      level: "good",
      kicker: "Deuda",
      title: "No te queda ninguna mensualidad activa",
      text: "Todas las compras a meses están cubiertas. No abras otra si el mes ya se come una parte alta del sueldo.",
    });
  }

  if (fixed.length > 0) {
    const top = [...fixed].sort((a, b) => b.amount - a.amount)[0];
    if (salary > 0 && fixedRatio > 0.15) {
      advice.push({
        level: fixedRatio > 0.25 ? "danger" : "warn",
        kicker: "Fijos",
        title: "Recorta el fijo más caro",
        metric: money(top.amount, settings),
        text: `Los fijos son el ${pct(
          fixedRatio
        )} del sueldo. “${top.name}” (${money(
          top.amount,
          settings
        )} · ${top.category}) es el más alto: bájalo de plan o recórtalo un mes y mira si lo extrañas.`,
      });
    } else {
      advice.push({
        level: "info",
        kicker: "Fijos",
        title: `El fijo a vigilar es “${top.name}”`,
        metric: money(top.amount, settings),
        text: `Suma ${money(
          totals.fixed,
          settings
        )} en suscripciones y cargos recurrentes. Si necesitas hueco rápido, empieza por este (${top.category}).`,
      });
    }
  }

  if (salary > 0 && available > 0 && totals.remainingDebt > 0) {
    const extra = Math.max(0, available - salary * 0.2);
    const monthsIfAll =
      extra > 0 ? Math.ceil(totals.remainingDebt / extra) : null;
    advice.push({
      level: "info",
      kicker: "Plan",
      title: "Aparta 20% y el resto a deuda",
      metric: money(Math.min(available, salary * 0.2), settings),
      text:
        extra > 0 && monthsIfAll
          ? `Guarda ${money(
              salary * 0.2,
              settings
            )} (20% del sueldo) y manda ${money(
              extra,
              settings
            )} extra a la deuda de ${money(
              totals.remainingDebt,
              settings
            )}. A ese ritmo tardarías unos ${monthsLabel(
              monthsIfAll
            )} en dejar el saldo a meses en cero.`
          : `Te quedan ${money(
              available,
              settings
            )} tras los pagos. Prioriza el 20% de ahorro (${money(
              salary * 0.2,
              settings
            )}) antes que una compra nueva a meses.`,
    });
  } else if (salary > 0 && available > 0 && totals.remainingDebt === 0) {
    advice.push({
      level: "good",
      kicker: "Ahorro",
      title: "Sin deuda a meses: mueve el sobrante",
      metric: money(available, settings),
      text: `Después de fijos te quedan ${money(
        available,
        settings
      )}. Apártalos el mismo día del pago, no al final del mes.`,
    });
  }

  return advice;
}
