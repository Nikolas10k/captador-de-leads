import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

export const controlClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-muted/70 " +
  "hover:border-ink/40 aria-[invalid=true]:border-danger disabled:bg-subtle sm:text-sm";

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label sempre visível + dica + erro ligados ao campo via aria-describedby */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-muted"> (opcional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      <FieldError id={id} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="text-sm text-danger" role="alert">
      {error}
    </p>
  );
}

export function describedBy(id: string, error?: string, hint?: boolean) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlClass, "h-11", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(controlClass, "h-11 pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlClass, "min-h-24 py-2", className)} {...props} />;
}

type ChoiceProps = Omit<ComponentProps<"input">, "type"> & {
  type: "checkbox" | "radio";
  label: ReactNode;
  description?: ReactNode;
};

/** Opção em formato de cartão: área de toque grande, ótimo no celular */
export function Choice({ label, description, className, ...props }: ChoiceProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-line-strong bg-surface p-4",
        "hover:border-ink/40 has-[:checked]:border-accent has-[:checked]:bg-accent-soft",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-offset-2",
        className,
      )}
    >
      <input className="mt-0.5 size-4 shrink-0 accent-accent focus-visible:outline-none" {...props} />
      <span className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {description && <span className="text-sm text-muted">{description}</span>}
      </span>
    </label>
  );
}
