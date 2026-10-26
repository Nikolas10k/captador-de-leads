import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { TEMPERATURE_LABEL, type Temperature } from "@/features/leads/options";

type Tone = "neutral" | "accent" | "success" | "danger" | "warn" | "cold";

const tones: Record<Tone, string> = {
  neutral: "bg-subtle text-muted",
  accent: "bg-accent-soft text-accent-strong",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warn: "bg-warn-soft text-warn",
  cold: "bg-cold-soft text-cold",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold", tones[tone], className)}
    >
      {children}
    </span>
  );
}

const temperatureTone: Record<Temperature, Tone> = { quente: "danger", morno: "warn", frio: "cold" };

export function TemperatureBadge({ temperature, score }: { temperature: string | null; score?: number }) {
  const t = (temperature ?? "frio") as Temperature;
  return (
    <Badge tone={temperatureTone[t]}>
      {TEMPERATURE_LABEL[t]}
      {score != null && <span className="font-normal opacity-80">· {score}</span>}
    </Badge>
  );
}
