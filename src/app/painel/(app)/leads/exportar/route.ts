import type { NextRequest } from "next/server";
import { getMember } from "@/features/auth/session";
import { listLeadsFull, parseLeadFilters } from "@/features/leads/queries";
import {
  BUDGET_LABEL,
  NEED_LABEL,
  SEGMENT_SHORT,
  SOURCE_LABEL,
  STAGE_LABEL,
  TEMPERATURE_LABEL,
  TIMELINE_LABEL,
} from "@/features/leads/options";

const label = <T extends string>(map: Record<T, string>, v: string | null) => (v ? (map[v as T] ?? v) : "");
const yn = (v: boolean | null) => (v == null ? "" : v ? "sim" : "não");

/** CSV com ";" e BOM: abre direto no Excel em português */
function csvCell(value: unknown) {
  if (value == null) return "";
  let s = String(value);
  // evita injeção de fórmula ao abrir no Excel/Sheets
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const member = await getMember();
  if (!member) return new Response("Sessão expirada. Entre de novo no painel.", { status: 401 });

  const filters = parseLeadFilters(Object.fromEntries(req.nextUrl.searchParams));
  const leads = await listLeadsFull(filters);

  const columns: Array<[string, (l: (typeof leads)[number]) => unknown]> = [
    ["Criado em", (l) => l.created_at],
    ["Nome", (l) => l.name],
    ["Negócio", (l) => l.business_name],
    ["WhatsApp", (l) => l.whatsapp],
    ["Instagram", (l) => l.instagram],
    ["Região", (l) => l.city_region],
    ["Segmento", (l) => (l.segment === "outro" ? l.segment_other || "Outro" : label(SEGMENT_SHORT, l.segment))],
    ["Precisa de", (l) => l.needs.map((n) => label(NEED_LABEL, n)).join(", ")],
    ["Tem site", (l) => yn(l.has_website)],
    ["Vende no Instagram", (l) => yn(l.sells_on_instagram)],
    ["Pedidos no WhatsApp", (l) => yn(l.orders_via_whatsapp)],
    ["Investimento", (l) => label(BUDGET_LABEL, l.budget_range)],
    ["Prazo", (l) => label(TIMELINE_LABEL, l.timeline)],
    ["Score", (l) => l.score],
    ["Temperatura", (l) => label(TEMPERATURE_LABEL, l.temperature)],
    ["Etapa", (l) => label(STAGE_LABEL, l.stage_id)],
    ["Motivo da perda", (l) => l.lost_reason],
    ["Valor estimado", (l) => (l.estimated_value != null ? String(l.estimated_value).replace(".", ",") : "")],
    ["Próxima ação", (l) => l.next_action],
    ["Data da próxima ação", (l) => l.next_action_at],
    ["Origem", (l) => label(SOURCE_LABEL, l.source)],
    ["utm_source", (l) => l.utm_source],
    ["utm_medium", (l) => l.utm_medium],
    ["utm_campaign", (l) => l.utm_campaign],
    ["utm_content", (l) => l.utm_content],
    ["Página de entrada", (l) => l.landing_page],
    ["Referrer", (l) => l.referrer],
    ["Dispositivo", (l) => l.device],
    ["Site atual", (l) => l.website_url],
    ["Prévia", (l) => l.preview_url],
    ["Fechado em", (l) => l.won_at],
  ];

  const lines = [
    columns.map(([h]) => csvCell(h)).join(";"),
    ...leads.map((l) => columns.map(([, get]) => csvCell(get(l))).join(";")),
  ];
  const date = new Date().toISOString().slice(0, 10);

  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-givance-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
