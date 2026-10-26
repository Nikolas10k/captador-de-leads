import Link from "next/link";
import { Suspense } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatCurrency, startOfTodayBR } from "@/lib/format";
import { PageHeader, SectionSkeleton } from "@/features/panel/page-header";
import { getDashboard } from "@/features/leads/queries";
import { SOURCE_LABEL, type SourceId } from "@/features/leads/options";
import { BarList } from "@/features/dashboard/bar-list";

export const metadata = { title: "Dashboard" };

const PERIODS = [
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "mes", label: "Este mês" },
] as const;
type Period = (typeof PERIODS)[number]["value"];

function rangeFor(period: Period) {
  const to = new Date(Date.now() + 60000);
  if (period === "mes") {
    const today = startOfTodayBR();
    const ymd = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(today);
    return { from: new Date(`${ymd.slice(0, 8)}01T00:00:00-03:00`), to };
  }
  const days = period === "90d" ? 90 : 30;
  return { from: new Date(startOfTodayBR().getTime() - (days - 1) * 86400000), to };
}

export default function DashboardPage({ searchParams }: PageProps<"/painel/dashboard">) {
  return (
    <div className="mx-auto max-w-6xl">
      <Suspense fallback={<SectionSkeleton rows={4} />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : "—");

async function DashboardContent({ searchParams }: { searchParams: PageProps<"/painel/dashboard">["searchParams"] }) {
  const { periodo } = await searchParams;
  const period: Period = PERIODS.some((p) => p.value === periodo) ? (periodo as Period) : "30d";
  const { from, to } = rangeFor(period);
  const m = await getDashboard(from, to);
  const won = m.funnel.find((f) => f.stage === "ganho")?.reached ?? 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Leads criados no período. Valores em negociação e fechados no mês não dependem do filtro."
        actions={
          <nav aria-label="Período" className="inline-flex rounded-lg border border-line-strong bg-surface p-1">
            {PERIODS.map((p) => (
              <Link
                key={p.value}
                href={`/painel/dashboard?periodo=${p.value}`}
                aria-current={period === p.value ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 items-center rounded-md px-3 text-sm",
                  period === p.value ? "bg-ink font-semibold text-canvas" : "text-muted hover:text-ink",
                )}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Leads no período" value={String(m.total_leads)} sub={`${pct(won, m.total_leads)} viraram cliente`} />
        <Stat label="Em negociação" value={formatCurrency(m.value_in_negotiation)} sub="Proposta enviada + negociação" />
        <Stat label="Fechado no mês" value={formatCurrency(m.value_won_month)} sub={`${m.won_month} ${m.won_month === 1 ? "cliente" : "clientes"}`} />
        <Stat
          label="Tempo médio até fechar"
          value={m.avg_days_to_close != null ? `${String(m.avg_days_to_close).replace(".", ",")} dias` : "—"}
          sub="Da chegada ao ganho"
        />
      </div>

      {m.total_leads === 0 ? (
        <EmptyState
          title="Nenhum lead neste período"
          description="Escolha um período maior ou divulgue o link do diagnóstico com UTMs para ver de onde os leads vêm."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardTitle>Conversão por etapa</CardTitle>
            <p className="-mt-2 mb-4 text-sm text-muted">
              Quantos leads do período chegaram até cada etapa, e a taxa em relação à etapa anterior. {m.lost} marcados como perdidos.
            </p>
            <BarList
              items={m.funnel.map((f) => ({ key: f.stage, label: f.name, value: f.reached }))}
              detail={({ key }) => {
                const i = m.funnel.findIndex((f) => f.stage === key);
                return i === 0 ? undefined : `${pct(m.funnel[i].reached, m.funnel[i - 1].reached)} da etapa anterior`;
              }}
            />
          </Card>
          <Card>
            <CardTitle>Leads por origem</CardTitle>
            <BarList items={m.by_source.map((s) => ({ key: s.key, label: SOURCE_LABEL[s.key as SourceId] ?? s.key, value: s.count }))} />
          </Card>
          <Card>
            <CardTitle>Leads por campanha</CardTitle>
            <BarList items={m.by_campaign.map((c) => ({ key: c.key, label: c.key, value: c.count }))} />
          </Card>
        </div>
      )}
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}
