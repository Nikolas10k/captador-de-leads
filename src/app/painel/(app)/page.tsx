import { Suspense } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatTime, relativeFromNow } from "@/lib/format";
import { PageHeader, SectionSkeleton } from "@/features/panel/page-header";
import { LeadListItem } from "@/features/leads/components/lead-list-item";
import { getToday, type LeadCard } from "@/features/leads/queries";
import { CompleteButton } from "@/features/today/complete-button";

export const metadata = { title: "Hoje" };

export default function TodayPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Hoje" description="Follow-ups vencidos, os de hoje e quem ainda está esperando o primeiro contato." />
      <Suspense fallback={<SectionSkeleton rows={6} />}>
        <TodayContent />
      </Suspense>
    </div>
  );
}

async function TodayContent() {
  const { overdue, today, uncontacted, now } = await getToday();
  const nothing = overdue.length + today.length + uncontacted.length === 0;

  if (nothing) {
    return (
      <EmptyState
        title="Nada pendente para hoje"
        description="Nenhum follow-up vencido e nenhum lead novo esperando contato. Bom momento para prospectar: cadastre negócios que você encontrou no Instagram ou no Google."
        action={<ButtonLink href="/painel/leads/novo">Cadastrar lead de prospecção</ButtonLink>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Bucket
        id="atrasados"
        title="Atrasados"
        tone="danger"
        leads={overdue}
        empty="Nenhum follow-up atrasado."
        context={(l) => (
          <p className="text-sm">
            <span className="font-semibold text-danger">Venceu {relativeFromNow(l.next_action_at!, now)}</span>
            <span className="text-muted"> · {l.next_action}</span>
          </p>
        )}
        withComplete
      />
      <Bucket
        id="hoje"
        title="Para hoje"
        leads={today}
        empty="Nenhum follow-up marcado para hoje."
        context={(l) => (
          <p className="text-sm">
            <span className="font-semibold">{formatTime(l.next_action_at)}</span>
            <span className="text-muted"> · {l.next_action}</span>
          </p>
        )}
        withComplete
      />
      <Bucket
        id="sem-contato"
        title="Novos sem contato há mais de 24h"
        tone="danger"
        leads={uncontacted}
        empty="Todos os leads novos já receberam contato."
        context={(l) => <p className="text-sm text-muted">Chegou {relativeFromNow(l.created_at, now)}</p>}
      />
    </div>
  );
}

function Bucket({
  id,
  title,
  leads,
  empty,
  context,
  tone,
  withComplete,
}: {
  id: string;
  title: string;
  leads: LeadCard[];
  empty: string;
  context: (l: LeadCard) => React.ReactNode;
  tone?: "danger";
  withComplete?: boolean;
}) {
  return (
    <section aria-labelledby={`bucket-${id}`} className="flex flex-col gap-4">
      <h2 id={`bucket-${id}`} className="flex items-center gap-2 text-base font-semibold">
        {title}
        <span
          className={
            leads.length > 0 && tone === "danger"
              ? "rounded-md bg-danger-soft px-2 text-sm text-danger"
              : "rounded-md bg-subtle px-2 text-sm text-muted"
          }
        >
          {leads.length}
        </span>
      </h2>
      {leads.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {leads.map((l) => (
            <LeadListItem key={l.id} lead={l} context={context(l)} actions={withComplete ? <CompleteButton leadId={l.id} /> : undefined} />
          ))}
        </ul>
      )}
    </section>
  );
}
