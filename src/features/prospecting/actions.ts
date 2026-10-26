"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMember } from "@/features/auth/session";
import { REGIONS } from "@/features/leads/options";
import { hasOwnWebsite, PlacesError, searchPlaces, type Place } from "./google-places";

export type ProspectResult = Place & { ownSite: boolean; leadId: string | null };

export type SearchState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  query?: { term: string; region: string; onlyNoSite: boolean };
  results?: ProspectResult[];
  hiddenWithSite?: number;
  nextPageToken?: string | null;
};

const searchSchema = z.object({
  term: z.string().trim().min(2, { error: "Diga que tipo de negócio procurar, ex.: barbearia." }).max(80),
  region: z.enum(REGIONS, { error: "Escolha a região." }),
  onlyNoSite: z.boolean(),
  pageToken: z.string().max(2000).optional(),
});

function buildQuery(term: string, region: string) {
  if (region === "Entorno do DF (GO)") return `${term} no entorno do Distrito Federal`;
  if (region === "Outra cidade") return `${term} em Brasília DF`;
  return `${term} em ${region}, Brasília - DF`;
}

/** Marca o que já está no pipeline (por place_id ou telefone) */
async function withLeadIds(places: Place[]) {
  const supabase = await createClient();
  const ids = places.map((p) => p.placeId);
  const phones = places.map((p) => p.phone).filter(Boolean) as string[];
  const [byPlace, byPhone] = await Promise.all([
    supabase.from("leads").select("id, google_place_id").in("google_place_id", ids),
    phones.length ? supabase.from("leads").select("id, whatsapp").in("whatsapp", phones) : Promise.resolve({ data: [] as { id: string; whatsapp: string | null }[] }),
  ]);
  const placeMap = new Map((byPlace.data ?? []).map((l) => [l.google_place_id, l.id]));
  const phoneMap = new Map((byPhone.data ?? []).map((l) => [l.whatsapp, l.id]));
  return places.map<ProspectResult>((p) => ({
    ...p,
    ownSite: hasOwnWebsite(p),
    leadId: placeMap.get(p.placeId) ?? (p.phone ? phoneMap.get(p.phone) : undefined) ?? null,
  }));
}

export async function searchProspects(prev: SearchState, formData: FormData): Promise<SearchState> {
  if (!(await getMember())) return { ok: false, message: "Sua sessão expirou. Entre de novo para continuar." };

  const loadMore = formData.get("mode") === "more";
  const parsed = searchSchema.safeParse(
    loadMore && prev.query
      ? { ...prev.query, pageToken: prev.nextPageToken ?? undefined }
      : { term: formData.get("term"), region: formData.get("region"), onlyNoSite: formData.get("onlyNoSite") === "on" },
  );
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ...prev, ok: false, errors, message: undefined };
  }
  const { term, region, onlyNoSite, pageToken } = parsed.data;

  try {
    const { places, nextPageToken } = await searchPlaces(buildQuery(term, region), pageToken);
    const enriched = await withLeadIds(places);
    const visible = onlyNoSite ? enriched.filter((p) => !p.ownSite) : enriched;
    // Prioridade: sem site, com celular (WhatsApp), mais avaliações (negócio movimentado)
    visible.sort((a, b) => Number(a.ownSite) - Number(b.ownSite) || Number(b.isMobile) - Number(a.isMobile) || b.reviews - a.reviews);

    const previous = loadMore ? (prev.results ?? []) : [];
    const seen = new Set(previous.map((p) => p.placeId));
    return {
      ok: true,
      query: { term, region, onlyNoSite },
      results: [...previous, ...visible.filter((p) => !seen.has(p.placeId))],
      hiddenWithSite: (loadMore ? (prev.hiddenWithSite ?? 0) : 0) + (enriched.length - visible.length),
      nextPageToken,
    };
  } catch (e) {
    return { ...prev, ok: false, message: e instanceof PlacesError ? e.message : "A busca falhou agora. Tente de novo em instantes." };
  }
}

const importSchema = z.array(
  z.object({
    placeId: z.string().min(1).max(300),
    name: z.string().trim().min(1).max(120),
    address: z.string().max(300).nullable(),
    phone: z.string().regex(/^\d{10,11}$/).nullable(),
    isMobile: z.boolean(),
    website: z.string().max(300).nullable(),
    ownSite: z.boolean(),
    rating: z.number().min(0).max(5).nullable(),
    reviews: z.number().int().min(0),
    mapsUrl: z.string().max(500).nullable(),
    category: z.string().max(120).nullable(),
  }),
).min(1).max(60);

export type ImportResult = { ok: boolean; message?: string; created?: Record<string, string> };

export async function importProspects(places: unknown, region: string): Promise<ImportResult> {
  const member = await getMember();
  if (!member) return { ok: false, message: "Sua sessão expirou. Entre de novo para continuar." };

  const parsed = importSchema.safeParse(places);
  if (!parsed.success) return { ok: false, message: "Não conseguimos ler esses resultados. Faça a busca de novo." };

  const supabase = await createClient();
  const list = parsed.data;
  const { data: existing } = await supabase
    .from("leads")
    .select("google_place_id")
    .in("google_place_id", list.map((p) => p.placeId));
  const already = new Set((existing ?? []).map((e) => e.google_place_id));
  const toInsert = list.filter((p) => !already.has(p.placeId));
  if (toInsert.length === 0) return { ok: true, message: "Esses negócios já estão no pipeline.", created: {} };

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("leads")
    .insert(
      toInsert.map((p) => ({
        name: p.name,
        business_name: p.name,
        whatsapp: p.phone,
        city_region: (REGIONS as readonly string[]).includes(region) ? region : null,
        address: p.address,
        website_url: p.website,
        has_website: p.ownSite,
        google_place_id: p.placeId,
        google_maps_url: p.mapsUrl,
        google_rating: p.rating,
        google_reviews: p.reviews,
        google_category: p.category,
        source: "prospeccao_ativa" as const,
        owner_id: member.id,
        next_action: p.isMobile ? "Primeiro contato pelo WhatsApp" : "Ligar para apresentar a Givance",
        next_action_at: now,
      })),
    )
    .select("id, google_place_id, google_reviews, google_rating, google_category");

  if (error || !data) {
    console.error("[importProspects]", error);
    return { ok: false, message: "Não conseguimos adicionar agora. Tente de novo em instantes." };
  }

  await supabase.from("interactions").insert(
    data.map((l) => ({
      lead_id: l.id,
      type: "nota" as const,
      content: `Encontrado no Google Maps${l.google_category ? ` (${l.google_category})` : ""}: sem site próprio${
        l.google_rating != null ? `, nota ${String(l.google_rating).replace(".", ",")} com ${l.google_reviews} avaliações` : ""
      }.`,
      created_by: member.id,
    })),
  );

  return {
    ok: true,
    message: `${data.length} ${data.length === 1 ? "negócio adicionado" : "negócios adicionados"} ao pipeline, com primeiro contato para hoje.`,
    created: Object.fromEntries(data.map((l) => [l.google_place_id!, l.id])),
  };
}
