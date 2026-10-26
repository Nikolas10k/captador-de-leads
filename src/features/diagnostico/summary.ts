import {
  BUDGET_LABEL,
  NEED_LABEL,
  SEGMENT_SHORT,
  TIMELINE_LABEL,
  type BudgetId,
  type NeedId,
  type SegmentId,
  type TimelineId,
} from "@/features/leads/options";
import type { DiagnosticDraft } from "./schema";

const yesNo = (v: string) => (v === "sim" ? "sim" : "não");

/** Mensagem que o lead envia para a Givance depois do diagnóstico */
export function diagnosticWhatsAppMessage(d: DiagnosticDraft) {
  const segment =
    d.segment === "outro" ? d.segment_other || "Outro" : SEGMENT_SHORT[d.segment as SegmentId] ?? d.segment;
  const needs = d.needs.map((n) => NEED_LABEL[n as NeedId] ?? n).join(", ");

  return [
    `Olá! Acabei de fazer o diagnóstico no site da Givance Tech.`,
    ``,
    `Nome: ${d.name}`,
    `Negócio: ${d.business_name} (${segment}), ${d.city_region}`,
    `Preciso de: ${needs}`,
    `Já tenho site: ${yesNo(d.has_website)} · Vendo pelo Instagram: ${yesNo(d.sells_on_instagram)} · Recebo pedidos pelo WhatsApp: ${yesNo(d.orders_via_whatsapp)}`,
    `Investimento: ${BUDGET_LABEL[d.budget_range as BudgetId] ?? "-"}`,
    `Prazo: ${TIMELINE_LABEL[d.timeline as TimelineId] ?? "-"}`,
  ].join("\n");
}
