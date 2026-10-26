"use client";

// Atribuição first-touch: guarda as UTMs e a página de entrada da primeira
// visita (30 dias). Visitas seguintes com novas UTMs sobrescrevem (last non-direct).

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  landing_page?: string;
  referrer?: string;
};

const KEY = "gv_attribution";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

function read(): (Attribution & { savedAt: number }) | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.savedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clip(value: string | null | undefined, max = 300) {
  return value ? value.slice(0, max) : undefined;
}

/** Chamar em toda página pública */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const hasUtm = UTM_KEYS.some((k) => params.get(k));
  const existing = read();

  if (existing && !hasUtm) return;

  const externalReferrer =
    document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined;

  const next: Attribution & { savedAt: number } = {
    savedAt: Date.now(),
    landing_page: clip(window.location.pathname + window.location.search),
    referrer: clip(externalReferrer ?? existing?.referrer),
  };
  for (const k of UTM_KEYS) next[k] = clip(params.get(k), 120);

  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // modo privado: segue sem atribuição persistida
  }
}

export function getAttribution(): Attribution {
  const stored = read();
  if (stored) {
    return {
      utm_source: stored.utm_source,
      utm_medium: stored.utm_medium,
      utm_campaign: stored.utm_campaign,
      utm_content: stored.utm_content,
      landing_page: stored.landing_page,
      referrer: stored.referrer,
    };
  }
  if (typeof window === "undefined") return {};
  return {
    landing_page: clip(window.location.pathname),
    referrer: clip(document.referrer || undefined),
  };
}
