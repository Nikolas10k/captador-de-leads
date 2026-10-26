import "server-only";
import type { NotificationChannel } from "../types";

/**
 * Webhook genérico: envia o lead em JSON para LEAD_WEBHOOK_URL.
 * Use com n8n, Make, Zapier ou um provedor de WhatsApp (Z-API, Evolution API,
 * WhatsApp Cloud API) para avisar no WhatsApp sem mexer no código.
 */
export const webhookChannel: NotificationChannel = {
  name: "webhook",
  isEnabled: () => Boolean(process.env.LEAD_WEBHOOK_URL),
  async send(lead) {
    const res = await fetch(process.env.LEAD_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.LEAD_WEBHOOK_SECRET ? { "x-webhook-secret": process.env.LEAD_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({ event: "lead.created", lead }),
    });
    if (!res.ok) throw new Error(`Webhook: HTTP ${res.status}`);
  },
};
