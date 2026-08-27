import type { ReactNode } from "react";

export function EmptyState({
  emoji,
  children,
  action,
}: {
  emoji?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card empty">
      {emoji ? (
        <span className="empty__emoji" aria-hidden>
          {emoji}
        </span>
      ) : null}
      <p className="empty__text">{children}</p>
      {action}
    </div>
  );
}
