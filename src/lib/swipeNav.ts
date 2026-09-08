export const SWIPE_VIEWS = [
  "dashboard",
  "expenses",
  "loans",
  "installments",
  "fixed",
  "cards",
  "strategies",
  "settings",
] as const;

export type SwipeView = (typeof SWIPE_VIEWS)[number];

export type SwipeDecision =
  | { kind: "none" }
  | { kind: "vertical" }
  | { kind: "horizontal"; direction: "next" | "prev" };

export function classifySwipe(input: { dx: number; dy: number }): SwipeDecision {
  const absX = Math.abs(input.dx);
  const absY = Math.abs(input.dy);
  if (absX < 48 && absY < 48) return { kind: "none" };
  if (absX >= 56 && absX > absY * 1.15) {
    return { kind: "horizontal", direction: input.dx < 0 ? "next" : "prev" };
  }
  if (absY >= 24 && absY >= absX) return { kind: "vertical" };
  return { kind: "none" };
}

export function adjacentView(
  current: SwipeView,
  direction: "next" | "prev"
): SwipeView {
  const i = SWIPE_VIEWS.indexOf(current);
  const n = direction === "next" ? i + 1 : i - 1;
  if (n < 0 || n >= SWIPE_VIEWS.length) return current;
  return SWIPE_VIEWS[n];
}

export function isSwipeView(value: string): value is SwipeView {
  return (SWIPE_VIEWS as readonly string[]).includes(value);
}
