import "server-only";
import { formatPhone } from "@/lib/format";
import type { NotificationChannel } from "../types";

/**
 * Telegram: crie um bot com o @BotFather, mande uma mensagem para ele e pegue
 * o chat_id em https://api.telegram.org/bot<TOKEN>/getUpdates.
 * Fica desligado se TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID estiverem vazios.
 */
export const telegramChannel: NotificationChannel = {
  name: "telegram",
  isEnabled: () => Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  async send(lead) {
    const text = [
      `Novo lead (${lead.temperature}, ${lead.score}/100)`,
      `${lead.name} · ${lead.businessName ?? ""}`,
      lead.whatsapp ? formatPhone(lead.whatsapp) : "",
      lead.panelUrl,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    });
    if (!res.ok) throw new Error(`Telegram: HTTP ${res.status}`);
  },
};
