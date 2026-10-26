import { z } from "zod";
import { normalizePhoneBR } from "@/lib/format";
import { BUDGET_IDS, NEED_IDS, REGIONS, SEGMENT_IDS, TIMELINE_IDS } from "@/features/leads/options";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Use no máximo ${max} caracteres.` })
    .optional()
    .transform((v) => (v ? v : undefined));

const yesNo = z.enum(["sim", "nao"], { error: "Escolha sim ou não." });

// Cada etapa tem seu schema: o cliente valida por etapa, o servidor valida tudo.
export const stepSchemas = [
  z.object({
    name: z.string({ error: "Digite seu nome." }).trim().min(2, { error: "Digite seu nome." }).max(120),
    business_name: z.string({ error: "Digite o nome do seu negócio." }).trim().min(2, { error: "Digite o nome do seu negócio." }).max(160),
    whatsapp: z
      .string({ error: "Digite seu WhatsApp com DDD." })
      .transform(normalizePhoneBR)
      .refine((v) => /^[1-9]{2}9?\d{8}$/.test(v), { error: "Confira o número: DDD + número, ex.: (61) 99999-9999." }),
    instagram: optionalText(120),
    city_region: z.enum(REGIONS, { error: "Escolha a sua região." }),
  }),
  z
    .object({
      segment: z.enum(SEGMENT_IDS, { error: "Escolha o segmento mais próximo." }),
      segment_other: optionalText(80),
      has_website: yesNo,
      sells_on_instagram: yesNo,
      orders_via_whatsapp: yesNo,
    })
    .refine((d) => d.segment !== "outro" || !!d.segment_other, {
      error: "Conte em poucas palavras qual é o seu segmento.",
      path: ["segment_other"],
    }),
  z.object({
    needs: z.array(z.enum(NEED_IDS)).min(1, { error: "Marque pelo menos uma opção. Se tiver dúvida, marque “Ainda não sei”." }),
  }),
  z.object({
    budget_range: z.enum(BUDGET_IDS, { error: "Escolha uma faixa. “Ainda não sei” também vale." }),
    timeline: z.enum(TIMELINE_IDS, { error: "Escolha um prazo." }),
    consent: z.literal(true, { error: "Para continuar, precisamos do seu de acordo com a política de privacidade." }),
  }),
] as const;

export const STEP_TITLES = ["Sobre você", "Seu negócio hoje", "O que você precisa", "Investimento e prazo"] as const;

export const attributionSchema = z.object({
  utm_source: optionalText(120),
  utm_medium: optionalText(120),
  utm_campaign: optionalText(120),
  utm_content: optionalText(120),
  landing_page: optionalText(300),
  referrer: optionalText(300),
});

export const diagnosticSchema = stepSchemas[0]
  .and(stepSchemas[1])
  .and(stepSchemas[2])
  .and(stepSchemas[3])
  .and(
    z.object({
      attribution: attributionSchema.optional(),
      /** honeypot: humanos não veem este campo */
      company_website: z.string().optional(),
      /** ms desde que o formulário abriu */
      elapsed_ms: z.number().int().nonnegative().optional(),
    }),
  );

export type DiagnosticInput = z.input<typeof diagnosticSchema>;
export type DiagnosticData = z.output<typeof diagnosticSchema>;

/** Estado do formulário no cliente (tudo string/array) */
export type DiagnosticDraft = {
  name: string;
  business_name: string;
  whatsapp: string;
  instagram: string;
  city_region: string;
  segment: string;
  segment_other: string;
  has_website: string;
  sells_on_instagram: string;
  orders_via_whatsapp: string;
  needs: string[];
  budget_range: string;
  timeline: string;
  consent: boolean;
};

export const emptyDraft: DiagnosticDraft = {
  name: "",
  business_name: "",
  whatsapp: "",
  instagram: "",
  city_region: "",
  segment: "",
  segment_other: "",
  has_website: "",
  sells_on_instagram: "",
  orders_via_whatsapp: "",
  needs: [],
  budget_range: "",
  timeline: "",
  consent: false,
};

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
