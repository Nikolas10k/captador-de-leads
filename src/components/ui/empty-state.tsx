import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface p-6">
      <p className="font-semibold text-ink">{title}</p>
      <p className="max-w-prose text-sm text-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
