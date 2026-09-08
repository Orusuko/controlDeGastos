import { useRef, type PointerEvent, type ReactNode } from "react";
import {
  adjacentView,
  classifySwipe,
  isSwipeView,
  type SwipeView,
} from "../lib/swipeNav";

function toSwipeView(view: string): SwipeView {
  if (view === "more") return "cards";
  if (isSwipeView(view)) return view;
  return "dashboard";
}

export function SwipePager({
  view,
  onChange,
  children,
}: {
  view: string;
  onChange: (view: SwipeView) => void;
  children: ReactNode;
}) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (document.documentElement.dataset.modalOpen) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }

  function finish(e: PointerEvent<HTMLDivElement>) {
    const origin = start.current;
    start.current = null;
    if (!origin || origin.id !== e.pointerId) return;
    if (document.documentElement.dataset.modalOpen) return;
    const decision = classifySwipe({
      dx: e.clientX - origin.x,
      dy: e.clientY - origin.y,
    });
    if (decision.kind !== "horizontal") return;
    const next = adjacentView(toSwipeView(view), decision.direction);
    if (next !== toSwipeView(view)) onChange(next);
  }

  return (
    <div
      className="swipe-pager"
      onPointerDown={onPointerDown}
      onPointerUp={finish}
      onPointerCancel={() => {
        start.current = null;
      }}
    >
      {children}
    </div>
  );
}
