import "server-only";
import { Resend } from "resend";
import { formatPhone } from "@/lib/format";
import { leadWaLink } from "@/lib/whatsapp";
import {
  BUDGET_LABEL,
  NEED_LABEL,
  SEGMENT_SHORT,
  SOURCE_LABEL,
  TEMPERATURE_LABEL,
  TIMELINE_LABEL,
  type BudgetId,
  type NeedId,
  type SegmentId,
  type SourceId,
  type Temperature,
  type TimelineId,
} from "@/features/leads/options";
import type { NewLeadNotification, NotificationChannel } from "../types";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function render(lead: NewLeadNotification) {
  const rows: Array<[string, string]> = [
    ["Negócio", lead.businessName ?? "—"],
    ["WhatsApp", lead.whatsapp ? formatPhone(lead.whatsapp) : "—"],
    ["Região", lead.cityRegion ?? "—"],
    ["Segmento", lead.segment ? SEGMENT_SHORT[lead.segment as SegmentId] ?? lead.segment : "—"],
    ["Precisa de", lead.needs.map((n) => NEED_LABEL[n as NeedId] ?? n).join(", ") || "—"],
    ["Investimento", lead.budget ? BUDGET_LABEL[lead.budget as BudgetId] : "—"],
    ["Prazo", lead.timeline ? TIMELINE_LABEL[lead.timeline as TimelineId] : "—"],
    ["Origem", SOURCE_LABEL[lead.source as SourceId] ?? lead.source],
    ["Campanha", lead.campaign ?? "—"],
  ];
  const temp = TEMPERATURE_LABEL[(lead.temperature ?? "frio") as Temperature];
  const wa = lead.whatsapp ? leadWaLink(lead.whatsapp) : null;

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1b1a18;background:#faf9f7;padding:24px">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e3e0da;border-radius:12px;padding:24px">
<p style="margin:0 0 8px;color:#5c5851;font-size:14px">Novo lead · ${esc(temp)} (${lead.score}/100)</p>
<h1 style="margin:0 0 16px;font-size:20px">${esc(lead.name)}</h1>
<table style="width:100%;border-collapse:collapse;font-size:14px">
${rows.map(([k, v]) => `<tr><td style="padding:6px 0;color:#5c5851;width:120px">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`).join("")}
</table>
<p style="margin:24px 0 0">
<a href="${esc(lead.panelUrl)}" style="display:inline-block;background:#b9410f;color:#fff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:600">Abrir ficha do lead</a>
${wa ? `&nbsp; <a href="${esc(wa)}" style="color:#128c4a;font-weight:600">Chamar no WhatsApp</a>` : ""}
</p></div></body></html>`;

  const text = [`Novo lead: ${lead.name} (${temp}, ${lead.score}/100)`, ...rows.map(([k, v]) => `${k}: ${v}`), "", lead.panelUrl].join("\n");
  return { html, text, subject: `Novo lead ${temp.toLowerCase()}: ${lead.businessName ?? lead.name}` };
}

export const emailChannel: NotificationChannel = {
  name: "email",
  isEnabled: () => Boolean(process.env.RESEND_API_KEY && process.env.LEAD_NOTIFY_EMAIL_TO),
  async send(lead) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { html, text, subject } = render(lead);
    const { error } = await resend.emails.send({
      from: process.env.LEAD_NOTIFY_EMAIL_FROM || "Givance Leads <onboarding@resend.dev>",
      to: process.env.LEAD_NOTIFY_EMAIL_TO!.split(",").map((s) => s.trim()),
      subject,
      html,
      text,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
  },
};
