/** Colores de tarjeta persistidos; no cambiar los hex o los swatches dejan de coincidir. */
export const CARD_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
] as const;

/** Categorías del dashboard y de gastos fijos: misma tinta en claro y oscuro. */
export const CATEGORY_COLORS: Record<string, string> = {
  Streaming: "#C63B93",
  Servicios: "#0B8FB8",
  Software: "#5B4FE0",
  Membresías: "#C96A12",
  Telefonía: "#0E8A82",
  Otros: "#6A6480",
  Mensualidades: "#5348E8",
};

export const CATEGORY_FALLBACK = "#6A6480";
