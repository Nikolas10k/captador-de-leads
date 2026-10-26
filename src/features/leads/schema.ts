import { z } from "zod";
import { fromLocalInputValue, normalizeInstagram, normalizePhoneBR, normalizeUrl } from "@/lib/format";
import {
  BUDGET_IDS,
  INTERACTION_TYPE_IDS,
  NEED_IDS,
  SEGMENT_IDS,
  SOURCE_IDS,
  TIMELINE_IDS,
} from "./options";

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Use no máximo ${max} caracteres.` })
    .transform((v) => (v ? v : null))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .union([z.enum(values), z.literal("")])
    .optional()
    .transform((v) => (v ? v : null));

const triState = z
  .enum(["", "sim", "nao"])
  .optional()
  .transform((v) => (v === "sim" ? true : v === "nao" ? false : null));

/** "3.200" / "3200,50" / "R$ 3.200" -> 3200 / 3200.5 */
export const moneySchema = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v || !v.trim()) return null;
    const cleaned = v.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
    const n = Number(cleaned);
    if (!Number.isFinite(n) || n < 0) {
      ctx.addIssue({ code: "custom", message: "Use só números, ex.: 2500 ou 2.500,00." });
      return z.NEVER;
    }
    return Math.round(n * 100) / 100;
  });

const whatsapp = z
  .string()
  .optional()
  .transform((v, ctx) => {
    const d = normalizePhoneBR(v ?? "");
    if (!d) return null;
    if (!/^[1-9]{2}9?\d{8}$/.test(d)) {
      ctx.addIssue({ code: "custom", message: "Confira o número: DDD + número, ex.: (61) 99999-9999." });
      return z.NEVER;
    }
    return d;
  });

const dateTime = z
  .string()
  .optional()
  .transform((v) => fromLocalInputValue(v));

export const leadFormSchema = z
  .object({
    name: z.string().trim().min(2, { error: "Digite o nome do contato." }).max(120),
    business_name: text(160),
    whatsapp,
    instagram: text(120).transform(normalizeInstagram),
    city_region: text(80),
    website_url: text(300).transform(normalizeUrl),
    preview_url: text(300).transform(normalizeUrl),
    segment: optionalEnum(SEGMENT_IDS),
    segment_other: text(80),
    needs: z.array(z.enum(NEED_IDS)).default([]),
    has_website: triState,
    sells_on_instagram: triState,
    orders_via_whatsapp: triState,
    budget_range: optionalEnum(BUDGET_IDS),
    timeline: optionalEnum(TIMELINE_IDS),
    source: z.enum(SOURCE_IDS, { error: "Escolha a origem do lead." }),
  })
  .transform((d) => ({ ...d, segment_other: d.segment === "outro" ? d.segment_other : null }));

export const newLeadExtrasSchema = z.object({
  estimated_value: moneySchema,
  next_action: text(200),
  next_action_at: dateTime,
  note: text(4000),
});

export const followUpSchema = z.object({
  next_action: text(200),
  next_action_at: dateTime,
  estimated_value: moneySchema,
});

export const interactionSchema = z.object({
  type: z.enum(INTERACTION_TYPE_IDS, { error: "Escolha o tipo." }),
  content: z.string().trim().min(1, { error: "Escreva o que aconteceu." }).max(4000),
  occurred_at: dateTime,
});

export const templateSchema = z.object({
  name: z.string().trim().min(2, { error: "Dê um nome ao modelo." }).max(60),
  body: z.string().trim().min(1, { error: "Escreva a mensagem." }).max(2000),
});

/** FormData -> objeto, juntando campos repetidos (checkbox) em array */
export function formToObject(formData: FormData, arrays: string[] = []) {
  const out: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$")) continue;
    out[key] = arrays.includes(key) ? formData.getAll(key) : formData.get(key);
  }
  for (const key of arrays) if (!(key in out)) out[key] = [];
  return out;
}

export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export function issuesToErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
