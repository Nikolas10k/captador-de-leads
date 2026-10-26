import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge, TemperatureBadge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency, formatDateTime, formatPhone, instagramUrl } from "@/lib/format";
import { SectionSkeleton } from "@/features/panel/page-header";
import { getLead, type Interaction, type Lead } from "@/features/leads/queries";
import { addInteraction, updateFollowUp, updateLead } from "@/features/leads/actions";
import {
  BUDGET_LABEL,
  INTERACTION_LABEL,
  NEED_LABEL,
  SEGMENT_SHORT,
  SOURCE_LABEL,
  TIMELINE_LABEL,
  type BudgetId,
  type InteractionType,
  type NeedId,
  type SegmentId,
  type SourceId,
  type StageId,
  type TimelineId,
} from "@/features/leads/options";
import { StageSelect } from "@/features/pipeline/stage-select";
import { FollowUpForm } from "@/features/leads/components/follow-up-form";
import { InteractionForm } from "@/features/leads/components/interaction-form";
import { WhatsAppComposer } from "@/features/leads/components/whatsapp-composer";
import { LeadForm } from "@/features/leads/components/lead-form";
import { DeleteLead } from "@/features/leads/components/delete-lead";

export const metadata = { title: "Ficha do lead" };

export default function LeadPage({ params }: PageProps<"/painel/leads/[id]">) {
  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/painel/leads" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft aria-hidden className="size-4" />
        Leads
      </Link>
      <Suspense fallback={<SectionSkeleton rows={5} />}>
        <LeadContent params={params} />
      </Suspense>
    </div>
  );
}

async function LeadContent({ params }: { params: PageProps<"/painel/leads/[id]">["params"] }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { lead, interactions, templates } = await getLead(id);
  if (!lead) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TemperatureBadge temperature={lead.temperature} score={lead.score} />
            <Badge>{SOURCE_LABEL[lead.source as SourceId]}</Badge>
            {lead.is_sample && <Badge tone="warn">Exemplo</Badge>}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <p className="text-muted">
            {[lead.business_name !== lead.name && lead.business_name, lead.google_category, lead.city_region].filter(Boolean).join(" · ")}
            {lead.whatsapp && ` · ${formatPhone(lead.whatsapp)}`}
          </p>
          <QuickLinks lead={lead} />
        </div>
        <StageSelect leadId={lead.id} leadName={lead.name} stage={lead.stage_id as StageId} />
      </header>

      {lead.stage_id === "perdido" && lead.lost_reason && (
        <p className="rounded-lg bg-danger-soft p-4 text-sm text-danger">
          <span className="font-semibold">Motivo da perda:</span> {lead.lost_reason}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardTitle>Próxima ação</CardTitle>
            <FollowUpForm
              key={`${lead.next_action}-${lead.next_action_at}-${lead.estimated_value}`}
              action={updateFollowUp.bind(null, lead.id)}
              nextAction={lead.next_action}
              nextActionAt={lead.next_action_at}
              estimatedValue={lead.estimated_value}
            />
          </Card>

          <Card>
            <CardTitle>Linha do tempo</CardTitle>
            <InteractionForm action={addInteraction.bind(null, lead.id)} />
            <Timeline interactions={interactions} createdAt={lead.created_at} />
          </Card>

          <Card>
            <CardTitle>Dados do lead</CardTitle>
            <LeadForm key={lead.updated_at} action={updateLead.bind(null, lead.id)} lead={lead} mode="edit" />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardTitle>WhatsApp</CardTitle>
            <WhatsAppComposer lead={lead} templates={templates} />
          </Card>
          <Card>
            <CardTitle>Diagnóstico</CardTitle>
            <Diagnosis lead={lead} />
          </Card>
          <Card>
            <CardTitle>Origem</CardTitle>
            <Origin lead={lead} />
          </Card>
          <div>
            <DeleteLead leadId={lead.id} leadName={lead.name} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLinks({ lead }: { lead: Lead }) {
  const links = [
    lead.instagram && { href: instagramUrl(lead.instagram)!, label: lead.instagram },
    lead.website_url && { href: lead.website_url, label: "Site atual" },
    lead.preview_url && { href: lead.preview_url, label: "Prévia" },
    lead.google_maps_url && { href: lead.google_maps_url, label: "Google Maps" },
  ].filter(Boolean) as { href: string; label: string }[];
  if (links.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {links.map((l) => (
        <li key={l.href}>
          <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">
            {l.label}
            <ExternalLink aria-hidden className="size-3" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2 text-sm last:border-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{children || "—"}</dd>
    </div>
  );
}

const yn = (v: boolean | null) => (v == null ? "—" : v ? "Sim" : "Não");

function Diagnosis({ lead }: { lead: Lead }) {
  return (
    <dl>
      <Row label="Segmento">
        {lead.segment === "outro" ? lead.segment_other : lead.segment && SEGMENT_SHORT[lead.segment as SegmentId]}
      </Row>
      <Row label="Precisa de">{lead.needs.map((n) => NEED_LABEL[n as NeedId] ?? n).join(", ")}</Row>
      <Row label="Investimento">{lead.budget_range && BUDGET_LABEL[lead.budget_range as BudgetId]}</Row>
      <Row label="Prazo">{lead.timeline && TIMELINE_LABEL[lead.timeline as TimelineId]}</Row>
      <Row label="Tem site">{yn(lead.has_website)}</Row>
      <Row label="Vende no Instagram">{yn(lead.sells_on_instagram)}</Row>
      <Row label="Pedidos no WhatsApp">{yn(lead.orders_via_whatsapp)}</Row>
      <Row label="Valor estimado">{lead.estimated_value != null && formatCurrency(lead.estimated_value)}</Row>
    </dl>
  );
}

function Origin({ lead }: { lead: Lead }) {
  return (
    <dl>
      <Row label="Chegou em">{formatDateTime(lead.created_at)}</Row>
      <Row label="Origem">{SOURCE_LABEL[lead.source as SourceId]}{lead.google_place_id && " (Google Maps)"}</Row>
      {lead.address && <Row label="Endereço">{lead.address}</Row>}
      {lead.google_rating != null && (
        <Row label="Google">
          Nota {String(lead.google_rating).replace(".", ",")} · {lead.google_reviews} avaliações
        </Row>
      )}
      <Row label="Campanha">{[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ")}</Row>
      <Row label="Conteúdo">{lead.utm_content}</Row>
      <Row label="Página de entrada">{lead.landing_page}</Row>
      <Row label="Referrer">{lead.referrer && <span className="break-all">{lead.referrer}</span>}</Row>
      <Row label="Dispositivo">{lead.device}</Row>
      <Row label="Consentimento">{lead.consent_at && `${formatDateTime(lead.consent_at)} (v${lead.consent_version})`}</Row>
    </dl>
  );
}

function Timeline({ interactions, createdAt }: { interactions: Interaction[]; createdAt: string }) {
  return (
    <ol className="mt-6 flex flex-col">
      {interactions.map((i) => (
        <li key={i.id} className="relative flex gap-4 pb-6 last:pb-0">
          <span aria-hidden className="absolute top-3 bottom-0 left-[5px] w-px bg-line" />
          <span
            aria-hidden
            className={cn("relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 bg-surface", i.type === "sistema" ? "border-line-strong" : "border-accent")}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs text-muted">
              <span className="font-semibold text-ink">{INTERACTION_LABEL[i.type as InteractionType]}</span> · {formatDateTime(i.occurred_at)}
            </p>
            <p className={cn("text-sm whitespace-pre-line", i.type === "sistema" && "text-muted")}>{i.content}</p>
          </div>
        </li>
      ))}
      <li className="flex gap-4">
        <span aria-hidden className="mt-1.5 size-[11px] shrink-0 rounded-full bg-line-strong" />
        <p className="text-xs text-muted">Lead criado · {formatDateTime(createdAt)}</p>
      </li>
    </ol>
  );
}
