import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import { startOfTodayBR } from "@/lib/format";
import { requireMember } from "@/features/auth/session";
import {
  OPEN_STAGES,
  SEGMENT_IDS,
  SOURCE_IDS,
  STAGE_IDS,
  TEMPERATURE_IDS,
  type SegmentId,
  type SourceId,
  type StageId,
  type Temperature,
} from "./options";

export type Lead = Tables<"leads">;
export type Interaction = Tables<"interactions">;
export type MessageTemplate = Tables<"message_templates">;

/** Colunas usadas em cartões e listas */
export const LEAD_CARD_COLUMNS =
  "id, name, business_name, whatsapp, segment, source, stage_id, score, temperature, estimated_value, next_action, next_action_at, created_at, first_contact_at, stage_changed_at, city_region" as const;
export type LeadCard = Pick<
  Lead,
  | "id"
  | "name"
  | "business_name"
  | "whatsapp"
  | "segment"
  | "source"
  | "stage_id"
  | "score"
  | "temperature"
  | "estimated_value"
  | "next_action"
  | "next_action_at"
  | "created_at"
  | "first_contact_at"
  | "stage_changed_at"
  | "city_region"
>;

export type LeadFilters = {
  q?: string;
  etapa?: StageId;
  origem?: SourceId;
  segmento?: SegmentId;
  temperatura?: Temperature;
};

type RawParams = Record<string, string | string[] | undefined>;

const pick = <T extends string>(value: unknown, allowed: readonly T[]) =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;

export function parseLeadFilters(params: RawParams): LeadFilters {
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : undefined;
  return {
    q: q || undefined,
    etapa: pick(params.etapa, STAGE_IDS),
    origem: pick(params.origem, SOURCE_IDS),
    segmento: pick(params.segmento, SEGMENT_IDS),
    temperatura: pick(params.temperatura, TEMPERATURE_IDS),
  };
}

/** Escapa caracteres especiais do filtro .or() do PostgREST */
function orSafe(term: string) {
  return term.replace(/[,()*%\\]/g, " ").trim();
}

export async function listLeads(filters: LeadFilters, { limit = 500 }: { limit?: number } = {}) {
  await requireMember();
  const supabase = await createClient();
  let query = supabase.from("leads").select(LEAD_CARD_COLUMNS).order("created_at", { ascending: false }).limit(limit);

  if (filters.etapa) query = query.eq("stage_id", filters.etapa);
  if (filters.origem) query = query.eq("source", filters.origem);
  if (filters.segmento) query = query.eq("segment", filters.segmento);
  if (filters.temperatura) query = query.eq("temperature", filters.temperatura);
  if (filters.q) {
    const term = orSafe(filters.q);
    const digits = term.replace(/\D/g, "");
    const ors = [`name.ilike.*${term}*`, `business_name.ilike.*${term}*`, `instagram.ilike.*${term}*`];
    if (digits.length >= 4) ors.push(`whatsapp.ilike.*${digits}*`);
    if (term) query = query.or(ors.join(","));
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as LeadCard[];
}

/** Todos os campos, para exportação */
export async function listLeadsFull(filters: LeadFilters) {
  await requireMember();
  const supabase = await createClient();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5000);
  if (filters.etapa) query = query.eq("stage_id", filters.etapa);
  if (filters.origem) query = query.eq("source", filters.origem);
  if (filters.segmento) query = query.eq("segment", filters.segmento);
  if (filters.temperatura) query = query.eq("temperature", filters.temperatura);
  if (filters.q) {
    const term = orSafe(filters.q);
    if (term) query = query.or(`name.ilike.*${term}*,business_name.ilike.*${term}*,instagram.ilike.*${term}*`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPipelineLeads() {
  await requireMember();
  const supabase = await createClient();
  // Abertos: todos. Ganhos/perdidos: só os últimos 60 dias, para o quadro não crescer sem fim.
  const since = new Date(Date.now() - 60 * 86400000).toISOString();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_CARD_COLUMNS)
    .or(`stage_id.in.(${OPEN_STAGES.join(",")}),stage_changed_at.gte.${since}`)
    .order("score", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data as LeadCard[];
}

export async function getLead(id: string) {
  await requireMember();
  const supabase = await createClient();
  const [lead, interactions, templates] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    supabase.from("interactions").select("*").eq("lead_id", id).order("occurred_at", { ascending: false }).limit(200),
    supabase.from("message_templates").select("*").order("position"),
  ]);
  if (lead.error) throw lead.error;
  return {
    lead: lead.data,
    interactions: interactions.data ?? [],
    templates: templates.data ?? [],
  };
}

export async function getTemplates() {
  await requireMember();
  const supabase = await createClient();
  const { data, error } = await supabase.from("message_templates").select("*").order("position");
  if (error) throw error;
  return data;
}

export async function getToday() {
  await requireMember();
  const supabase = await createClient();
  const start = startOfTodayBR();
  const end = new Date(start.getTime() + 86400000);
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const open = `(${OPEN_STAGES.join(",")})`;

  const [overdue, today, uncontacted] = await Promise.all([
    supabase
      .from("leads")
      .select(LEAD_CARD_COLUMNS)
      .filter("stage_id", "in", open)
      .lt("next_action_at", start.toISOString())
      .order("created_at", { ascending: false }),
    // Mais recentes primeiro: quem acabou de ser importado aparece no topo
    supabase
      .from("leads")
      .select(LEAD_CARD_COLUMNS)
      .filter("stage_id", "in", open)
      .gte("next_action_at", start.toISOString())
      .lt("next_action_at", end.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select(LEAD_CARD_COLUMNS)
      .eq("stage_id", "novo")
      .is("first_contact_at", null)
      .lt("created_at", dayAgo)
      .order("created_at", { ascending: false }),
  ]);

  for (const r of [overdue, today, uncontacted]) if (r.error) throw r.error;
  return {
    now: Date.now(),
    overdue: (overdue.data ?? []) as LeadCard[],
    today: (today.data ?? []) as LeadCard[],
    uncontacted: (uncontacted.data ?? []) as LeadCard[],
  };
}

export type DashboardMetrics = {
  total_leads: number;
  by_source: { key: string; count: number }[];
  by_campaign: { key: string; count: number }[];
  funnel: { stage: StageId; name: string; reached: number }[];
  lost: number;
  avg_days_to_close: number | null;
  value_in_negotiation: number;
  value_won_month: number;
  won_month: number;
};

export async function getDashboard(from: Date, to: Date) {
  await requireMember();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("dashboard_metrics", {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });
  if (error) throw error;
  return data as unknown as DashboardMetrics;
}
