import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge, TemperatureBadge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { leadWaLink } from "@/lib/whatsapp";
import { SEGMENT_SHORT, SOURCE_LABEL, STAGE_LABEL, type SegmentId, type SourceId, type StageId } from "../options";
import type { LeadCard } from "../queries";

type Props = {
  lead: LeadCard;
  /** linha extra de contexto (ex.: "atrasado há 2 dias") */
  context?: React.ReactNode;
  actions?: React.ReactNode;
};

export function LeadListItem({ lead, context, actions }: Props) {
  return (
    <li className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/painel/leads/${lead.id}`} className="font-semibold text-ink hover:underline hover:underline-offset-4">
            {lead.name}
          </Link>
          <TemperatureBadge temperature={lead.temperature} score={lead.score} />
          <Badge>{STAGE_LABEL[lead.stage_id as StageId]}</Badge>
        </div>
        <p className="truncate text-sm text-muted">
          {[lead.business_name !== lead.name && lead.business_name, lead.segment && SEGMENT_SHORT[lead.segment as SegmentId], SOURCE_LABEL[lead.source as SourceId]]
            .filter(Boolean)
            .join(" · ")}
          {lead.estimated_value != null && ` · ${formatCurrency(lead.estimated_value)}`}
        </p>
        {context ??
          (lead.next_action && (
            <p className="text-sm">
              <span className="text-muted">Próxima ação:</span> {lead.next_action}
              {lead.next_action_at && <span className="text-muted"> · {formatDateTime(lead.next_action_at)}</span>}
            </p>
          ))}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        {lead.whatsapp && (
          <a
            href={leadWaLink(lead.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-line-strong text-whatsapp hover:bg-subtle"
            aria-label={`Abrir WhatsApp de ${lead.name}`}
            title="Abrir WhatsApp"
          >
            <MessageCircle aria-hidden className="size-5" />
          </a>
        )}
      </div>
    </li>
  );
}
