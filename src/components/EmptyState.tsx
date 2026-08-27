import type { ReactNode } from "react";

export function EmptyState({
  icon,
  children,
  action,
}: {
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card empty">
      {icon ? (
        <span className="empty__mark" aria-hidden>
          {icon}
        </span>
      ) : null}
      <p className="empty__text">{children}</p>
      {action}
    </div>
  );
}
