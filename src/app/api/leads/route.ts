import { createHash } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { normalizeInstagram } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { diagnosticSchema, fieldErrors } from "@/features/diagnostico/schema";
import { notifyNewLead } from "@/features/notifications";
import type { SourceId } from "@/features/leads/options";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;
const MIN_FILL_TIME_MS = 4000;

const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paid_social", "paidsocial", "ads", "cpm"]);

function clientIp(req: NextRequest) {
  return req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function hashIp(ip: string) {
  return createHash("sha256")
    .update(`${process.env.IP_HASH_SALT ?? "givance"}:${ip}`)
    .digest("hex");
}

function deviceFrom(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

const ok = () => Response.json({ ok: true }, { status: 201 });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, message: "Não conseguimos ler os dados enviados. Tente de novo." }, { status: 400 });
  }

  const parsed = diagnosticSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, message: "Alguns campos precisam de ajuste.", errors: fieldErrors(parsed.error) },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // Anti-spam 1: honeypot e tempo mínimo de preenchimento.
  // Respondemos como sucesso para não ensinar o robô.
  if (data.company_website || (data.elapsed_ms != null && data.elapsed_ms < MIN_FILL_TIME_MS)) {
    return ok();
  }

  const supabase = createAdminClient();
  const ipHash = hashIp(clientIp(req));

  // Anti-spam 2: rate limit por IP (hash) no banco, funciona em serverless.
  const { data: limited, error: rlError } = await supabase.rpc("rate_limit_hit", {
    p_key: `lead:${ipHash}`,
    p_max: RATE_LIMIT_MAX,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });
  if (rlError) console.error("[leads] rate limit", rlError);
  if (limited) {
    return Response.json(
      { ok: false, message: "Recebemos vários envios seguidos daqui. Aguarde alguns minutos ou fale com a gente pelo WhatsApp." },
      { status: 429 },
    );
  }

  const utm: Partial<NonNullable<typeof data.attribution>> = data.attribution ?? {};
  const hasUtm = Boolean(utm.utm_source || utm.utm_medium || utm.utm_campaign || utm.utm_content);

  let campaignId: string | null = null;
  if (hasUtm) {
    const { data: campaign, error } = await supabase
      .from("campaigns")
      .upsert(
        {
          utm_source: utm.utm_source ?? null,
          utm_medium: utm.utm_medium ?? null,
          utm_campaign: utm.utm_campaign ?? null,
          utm_content: utm.utm_content ?? null,
        },
        { onConflict: "utm_source,utm_medium,utm_campaign,utm_content" },
      )
      .select("id")
      .single();
    if (error) console.error("[leads] campaign upsert", error);
    campaignId = campaign?.id ?? null;
  }

  const source: SourceId = utm.utm_medium && PAID_MEDIUMS.has(utm.utm_medium.toLowerCase()) ? "trafego_pago" : "formulario";

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name: data.name,
      business_name: data.business_name,
      whatsapp: data.whatsapp,
      instagram: normalizeInstagram(data.instagram),
      city_region: data.city_region,
      segment: data.segment,
      segment_other: data.segment === "outro" ? (data.segment_other ?? null) : null,
      needs: data.needs,
      has_website: data.has_website === "sim",
      sells_on_instagram: data.sells_on_instagram === "sim",
      orders_via_whatsapp: data.orders_via_whatsapp === "sim",
      budget_range: data.budget_range,
      timeline: data.timeline,
      source,
      campaign_id: campaignId,
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      utm_content: utm.utm_content ?? null,
      landing_page: utm.landing_page ?? null,
      referrer: utm.referrer ?? req.headers.get("referer")?.slice(0, 300) ?? null,
      device: deviceFrom(req.headers.get("user-agent") ?? ""),
      ip_hash: ipHash,
      consent_at: new Date().toISOString(),
      consent_version: siteConfig.consentVersion,
    })
    .select("id, score, temperature")
    .single();

  if (error || !lead) {
    console.error("[leads] insert", error);
    return Response.json(
      { ok: false, message: "Não conseguimos salvar agora. Seus dados continuam aqui: tente enviar de novo ou chame no WhatsApp." },
      { status: 500 },
    );
  }

  // Notificações depois da resposta: o visitante não espera o e-mail sair.
  after(() =>
    notifyNewLead({
      id: lead.id,
      name: data.name,
      businessName: data.business_name,
      whatsapp: data.whatsapp,
      cityRegion: data.city_region,
      segment: data.segment === "outro" ? (data.segment_other ?? "outro") : data.segment,
      needs: data.needs,
      budget: data.budget_range,
      timeline: data.timeline,
      score: lead.score,
      temperature: lead.temperature,
      source,
      campaign: [utm.utm_source, utm.utm_campaign].filter(Boolean).join(" / ") || null,
      panelUrl: `${siteConfig.url}/painel/leads/${lead.id}`,
    }),
  );

  return ok();
}
