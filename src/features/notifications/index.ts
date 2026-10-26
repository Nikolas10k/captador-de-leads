import "server-only";
import { emailChannel } from "./channels/email";
import { telegramChannel } from "./channels/telegram";
import { webhookChannel } from "./channels/webhook";
import type { NewLeadNotification, NotificationChannel } from "./types";

// Registre novos canais aqui (ex.: WhatsApp Cloud API).
const channels: NotificationChannel[] = [emailChannel, telegramChannel, webhookChannel];

/** Dispara todos os canais ativos. Falha em um canal não derruba os outros. */
export async function notifyNewLead(lead: NewLeadNotification) {
  const active = channels.filter((c) => c.isEnabled());
  const results = await Promise.allSettled(active.map((c) => c.send(lead)));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[notify:${active[i].name}]`, r.reason);
  });
}

export type { NewLeadNotification } from "./types";
