import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-6", className)} {...props} />
  );
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-base font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}
