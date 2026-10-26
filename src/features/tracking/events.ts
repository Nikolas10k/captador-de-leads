"use client";

// Eventos para Meta Pixel e Google Analytics 4.
// Se os IDs não estiverem configurados, os scripts não carregam e estas
// funções viram no-op.

type Fbq = (action: "track" | "trackCustom", event: string, params?: Record<string, unknown>) => void;
type Gtag = (command: "event", event: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    fbq?: Fbq;
    gtag?: Gtag;
  }
}

type TrackEvent =
  | { name: "diagnostic_start" }
  | { name: "diagnostic_step"; step: number }
  | { name: "lead_submitted"; segment?: string; budget?: string }
  | { name: "whatsapp_click"; placement: string };

export function track(event: TrackEvent) {
  if (typeof window === "undefined") return;
  const { fbq, gtag } = window;

  switch (event.name) {
    case "diagnostic_start":
      fbq?.("track", "ViewContent", { content_name: "diagnostico" });
      gtag?.("event", "begin_checkout", { item_category: "diagnostico" });
      break;
    case "diagnostic_step":
      gtag?.("event", "diagnostic_step", { step: event.step });
      break;
    case "lead_submitted":
      fbq?.("track", "Lead", { content_category: event.segment, value_range: event.budget });
      gtag?.("event", "generate_lead", { segment: event.segment, budget: event.budget });
      break;
    case "whatsapp_click":
      fbq?.("track", "Contact", { placement: event.placement });
      gtag?.("event", "contact", { method: "whatsapp", placement: event.placement });
      break;
  }
}
