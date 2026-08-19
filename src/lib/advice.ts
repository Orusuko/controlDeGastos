import type { FixedExpense, Settings } from "../types";
import type { Totals } from "./finance";

export type AdviceLevel = "good" | "info" | "warn" | "danger";

export interface Advice {
  level: AdviceLevel;
  title: string;
  text: string;
}

const pct = (value: number) => `${Math.round(value * 100)}%`;

/**
 * Genera consejos financieros comparando los gastos mensuales con el sueldo.
 * Umbrales basados en reglas comunes: suscripciones < ~15%, deuda (mensualidades)
 * < ~30% (relación deuda/ingreso) y regla 50/30/20 para el ahorro.
 */
export function generateAdvice(
  settings: Settings,
  totals: Totals,
  fixed: FixedExpense[]
): Advice[] {
  const salary = settings.monthlySalary;
  const advice: Advice[] = [];

  if (!salary || salary <= 0) {
    advice.push({
      level: "info",
      title: "Configura tu sueldo mensual",
      text: "Añade tu sueldo promedio en Ajustes para recibir consejos personalizados sobre tus gastos.",
    });
    return advice;
  }

  const fixedRatio = totals.fixed / salary;
  const debtRatio = totals.installments / salary;
  const totalRatio = totals.total / salary;
  const available = salary - totals.total;

  // Gastos totales frente al sueldo.
  if (totalRatio >= 1) {
    advice.push({
      level: "danger",
      title: "Tus pagos superan tu sueldo",
      text: `Tus compromisos mensuales (${pct(
        totalRatio
      )} del sueldo) igualan o superan tus ingresos. Considera pausar suscripciones o renegociar mensualidades.`,
    });
  } else if (totalRatio > 0.7) {
    advice.push({
      level: "warn",
      title: "Poco margen de ahorro",
      text: `Destinas ${pct(
        totalRatio
      )} de tu sueldo a pagos fijos y mensualidades. Intenta mantenerlo por debajo del 70% para poder ahorrar.`,
    });
  } else {
    advice.push({
      level: "good",
      title: "Buen equilibrio",
      text: `Usas ${pct(
        totalRatio
      )} de tu sueldo en compromisos. Con la regla 50/30/20 podrías ahorrar parte de lo que te sobra.`,
    });
  }

  // Suscripciones / gastos fijos.
  if (fixedRatio > 0.25) {
    advice.push({
      level: "danger",
      title: "Suscripciones muy altas",
      text: `Tus gastos fijos son el ${pct(
        fixedRatio
      )} de tu sueldo. Revisa cuáles realmente usas y cancela las que no.`,
    });
  } else if (fixedRatio > 0.15) {
    advice.push({
      level: "warn",
      title: "Vigila tus suscripciones",
      text: `Tus gastos fijos representan el ${pct(
        fixedRatio
      )} del sueldo. Lo recomendable es mantenerlos por debajo del 15%.`,
    });
  }

  // Deuda / mensualidades (relación deuda-ingreso).
  if (debtRatio > 0.4) {
    advice.push({
      level: "danger",
      title: "Deuda de tarjeta elevada",
      text: `Tus mensualidades consumen el ${pct(
        debtRatio
      )} de tu sueldo. Por encima del 40% es una señal de alerta: evita nuevas compras a meses.`,
    });
  } else if (debtRatio > 0.3) {
    advice.push({
      level: "warn",
      title: "Cuidado con las mensualidades",
      text: `Tus pagos a meses son el ${pct(
        debtRatio
      )} del sueldo. Intenta no superar el 30% para no comprometer tu liquidez.`,
    });
  }

  // Gasto fijo más caro.
  if (fixedRatio > 0.15 && fixed.length > 0) {
    const top = [...fixed].sort((a, b) => b.amount - a.amount)[0];
    advice.push({
      level: "info",
      title: "Tu gasto fijo más caro",
      text: `"${top.name}" es tu suscripción más costosa. Evalúa si un plan más económico cubre tus necesidades.`,
    });
  }

  // Dinero disponible.
  if (available > 0) {
    advice.push({
      level: "info",
      title: "Dinero disponible",
      text: `Después de tus compromisos te quedan aproximadamente ${new Intl.NumberFormat(
        settings.locale,
        { style: "currency", currency: settings.currency }
      ).format(available)} al mes.`,
    });
  }

  return advice;
}
