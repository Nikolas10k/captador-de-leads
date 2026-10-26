"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getMember } from "@/features/auth/session";
import { STAGE_IDS, type StageId } from "./options";
import {
  followUpSchema,
  formToObject,
  interactionSchema,
  issuesToErrors,
  leadFormSchema,
  newLeadExtrasSchema,
  templateSchema,
  type ActionState,
} from "./schema";

const NOT_ALLOWED: ActionState = { ok: false, message: "Sua sessão expirou. Entre de novo para continuar." };
const SAVE_FAILED = "Não conseguimos salvar agora. Suas alterações continuam na tela: tente de novo em instantes.";
const uuid = z.uuid();

async function authed() {
  const member = await getMember();
  if (!member) return null;
  return { member, supabase: await createClient() };
}

export async function createLead(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await authed();
  if (!ctx) return NOT_ALLOWED;

  const raw = formToObject(formData, ["needs"]);
  const lead = leadFormSchema.safeParse(raw);
  const extras = newLeadExtrasSchema.safeParse(raw);
  if (!lead.success || !extras.success) {
    return {
      ok: false,
      message: "Alguns campos precisam de ajuste.",
      errors: { ...(lead.success ? {} : issuesToErrors(lead.error)), ...(extras.success ? {} : issuesToErrors(extras.error)) },
    };
  }

  const { note, ...followUp } = extras.data;
  const { data, error } = await ctx.supabase
    .from("leads")
    .insert({ ...lead.data, ...followUp, owner_id: ctx.member.id })
    .select("id")
    .single();
  if (error || !data) {
    console.error("[createLead]", error);
    return { ok: false, message: SAVE_FAILED };
  }

  if (note) {
    await ctx.supabase.from("interactions").insert({ lead_id: data.id, type: "nota", content: note, created_by: ctx.member.id });
  }

  redirect(`/painel/leads/${data.id}`);
}

export async function updateLead(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await authed();
  if (!ctx || !uuid.safeParse(id).success) return NOT_ALLOWED;

  const parsed = leadFormSchema.safeParse(formToObject(formData, ["needs"]));
  if (!parsed.success) return { ok: false, message: "Alguns campos precisam de ajuste.", errors: issuesToErrors(parsed.error) };

  const { error } = await ctx.supabase.from("leads").update(parsed.data).eq("id", id);
  if (error) {
    console.error("[updateLead]", error);
    return { ok: false, message: SAVE_FAILED };
  }
  refresh();
  return { ok: true, message: "Dados salvos." };
}

export async function updateFollowUp(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await authed();
  if (!ctx || !uuid.safeParse(id).success) return NOT_ALLOWED;

  const parsed = followUpSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, message: "Confira os campos destacados.", errors: issuesToErrors(parsed.error) };
  if (parsed.data.next_action_at && !parsed.data.next_action) {
    return { ok: false, errors: { next_action: "Diga qual é a próxima ação para essa data." } };
  }

  const { error } = await ctx.supabase.from("leads").update(parsed.data).eq("id", id);
  if (error) {
    console.error("[updateFollowUp]", error);
    return { ok: false, message: SAVE_FAILED };
  }
  refresh();
  return { ok: true, message: "Próxima ação salva." };
}

export async function moveStage(id: string, stage: StageId, lostReason?: string): Promise<ActionState> {
  const ctx = await authed();
  if (!ctx || !uuid.safeParse(id).success) return NOT_ALLOWED;
  if (!STAGE_IDS.includes(stage)) return { ok: false, message: "Etapa desconhecida." };

  const reason = lostReason?.trim();
  if (stage === "perdido" && !reason) {
    return { ok: false, errors: { lost_reason: "Conte o motivo da perda. Isso ajuda a melhorar as próximas propostas." } };
  }

  const { error } = await ctx.supabase
    .from("leads")
    .update({ stage_id: stage, ...(stage === "perdido" ? { lost_reason: reason!.slice(0, 500) } : {}) })
    .eq("id", id);
  if (error) {
    console.error("[moveStage]", error);
    return { ok: false, message: "Não conseguimos mover o lead agora. Tente de novo." };
  }
  refresh();
  return { ok: true };
}

export async function addInteraction(leadId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await authed();
  if (!ctx || !uuid.safeParse(leadId).success) return NOT_ALLOWED;

  const parsed = interactionSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: issuesToErrors(parsed.error) };

  const { error } = await ctx.supabase.from("interactions").insert({
    lead_id: leadId,
    type: parsed.data.type,
    content: parsed.data.content,
    occurred_at: parsed.data.occurred_at ?? new Date().toISOString(),
    created_by: ctx.member.id,
  });
  if (error) {
    console.error("[addInteraction]", error);
    return { ok: false, message: SAVE_FAILED };
  }
  refresh();
  return { ok: true, message: "Registrado na linha do tempo." };
}

/** Marca a próxima ação como feita: registra na linha do tempo e limpa o follow-up */
export async function completeNextAction(id: string): Promise<ActionState> {
  const ctx = await authed();
  if (!ctx || !uuid.safeParse(id).success) return NOT_ALLOWED;

  const { data: lead } = await ctx.supabase.from("leads").select("next_action").eq("id", id).maybeSingle();
  if (!lead) return { ok: false, message: "Lead não encontrado." };

  await ctx.supabase.from("interactions").insert({
    lead_id: id,
    type: "nota",
    content: `Concluído: ${lead.next_action ?? "próxima ação"}`,
    created_by: ctx.member.id,
  });
  const { error } = await ctx.supabase.from("leads").update({ next_action: null, next_action_at: null }).eq("id", id);
  if (error) return { ok: false, message: SAVE_FAILED };
  refresh();
  return { ok: true };
}

/** Registra o envio de um modelo pelo WhatsApp */
export async function logWhatsAppSent(leadId: string, templateName: string, message: string): Promise<ActionState> {
  const ctx = await authed();
  if (!ctx || !uuid.safeParse(leadId).success) return NOT_ALLOWED;

  await ctx.supabase.from("interactions").insert({
    lead_id: leadId,
    type: "whatsapp",
    content: `Mensagem “${templateName.slice(0, 60)}” aberta no WhatsApp:\n${message.slice(0, 3800)}`,
    created_by: ctx.member.id,
  });
  refresh();
  return { ok: true };
}

export async function deleteLead(id: string): Promise<ActionState> {
  const ctx = await authed();
  if (!ctx || !uuid.safeParse(id).success) return NOT_ALLOWED;
  const { error } = await ctx.supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, message: "Não conseguimos excluir agora. Tente de novo." };
  redirect("/painel/leads");
}

export async function updateTemplate(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const ctx = await authed();
  if (!ctx || !uuid.safeParse(id).success) return NOT_ALLOWED;

  const parsed = templateSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { ok: false, errors: issuesToErrors(parsed.error) };

  const { error } = await ctx.supabase.from("message_templates").update(parsed.data).eq("id", id);
  if (error) return { ok: false, message: SAVE_FAILED };
  refresh();
  return { ok: true, message: "Modelo salvo." };
}
