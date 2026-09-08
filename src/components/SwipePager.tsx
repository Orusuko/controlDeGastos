import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
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

function ignoreTarget(target: EventTarget | null): boolean {
  if (document.documentElement.dataset.modalOpen) return true;
  const el = target instanceof HTMLElement ? target : null;
  return Boolean(
    el?.closest(".modal, .modal-backdrop, .nav, input, select, textarea")
  );
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
  const viewRef = useRef(view);
  const onChangeRef = useRef(onChange);
  viewRef.current = view;
  onChangeRef.current = onChange;

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (ignoreTarget(e.target)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }

  useEffect(() => {
    function finish(e: globalThis.PointerEvent) {
      const origin = start.current;
      start.current = null;
      if (!origin || origin.id !== e.pointerId) return;
      if (document.documentElement.dataset.modalOpen) return;
      const decision = classifySwipe({
        dx: e.clientX - origin.x,
        dy: e.clientY - origin.y,
      });
      if (decision.kind !== "horizontal") return;
      const current = toSwipeView(viewRef.current);
      const next = adjacentView(current, decision.direction);
      if (next !== current) onChangeRef.current(next);
    }
    function cancel() {
      start.current = null;
    }
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
    };
  }, []);

  return (
    <div className="swipe-pager" onPointerDown={onPointerDown}>
      {children}
    </div>
  );
}
