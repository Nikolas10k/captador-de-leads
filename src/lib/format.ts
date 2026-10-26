export const TIME_ZONE = "America/Sao_Paulo";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

/** Máscara progressiva: (61) 99999-9999 / (61) 3333-4444 */
export function maskPhoneBR(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Guarda sem DDI no banco; aceita entrada com 55 na frente */
export function normalizePhoneBR(value: string) {
  let d = onlyDigits(value);
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  return d;
}

export function formatPhone(stored: string | null | undefined) {
  if (!stored) return "";
  return maskPhoneBR(stored);
}

export function toWhatsAppNumber(stored: string) {
  const d = onlyDigits(stored);
  return d.startsWith("55") && d.length >= 12 ? d : `55${d}`;
}

export function normalizeInstagram(value: string | null | undefined) {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  const m = v.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  const handle = (m ? m[1] : v).replace(/^@+/, "").replace(/\/+$/, "");
  return handle ? `@${handle}` : null;
}

export function instagramUrl(handle: string | null | undefined) {
  if (!handle) return null;
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export function normalizeUrl(value: string | null | undefined) {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return currency.format(value);
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TIME_ZONE, day: "2-digit", month: "short" });
const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" });

export function formatDate(iso: string | null | undefined) {
  return iso ? dateFmt.format(new Date(iso)) : "—";
}
export function formatDateTime(iso: string | null | undefined) {
  return iso ? dateTimeFmt.format(new Date(iso)) : "—";
}
export function formatTime(iso: string | null | undefined) {
  return iso ? timeFmt.format(new Date(iso)) : "";
}

export function relativeFromNow(iso: string, now = Date.now()) {
  const diffMs = new Date(iso).getTime() - now;
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  const minutes = Math.round(diffMs / 60000);
  if (abs < 3600000) return rtf.format(minutes, "minute");
  const hours = Math.round(diffMs / 3600000);
  if (abs < 86400000 * 2) return rtf.format(hours, "hour");
  return rtf.format(Math.round(diffMs / 86400000), "day");
}

/** "2026-10-25T14:30" no fuso de Brasília, para <input type="datetime-local"> */
export function toLocalInputValue(iso: string | null | undefined) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  return parts.replace(" ", "T");
}

/** Converte valor de datetime-local (horário de Brasília) para ISO */
export function fromLocalInputValue(value: string | null | undefined) {
  if (!value) return null;
  // Brasília não tem horário de verão desde 2019: UTC-3 fixo.
  const iso = new Date(`${value}:00-03:00`);
  return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
}

/** Início do dia corrente em Brasília, em ISO */
export function startOfTodayBR(now = new Date()) {
  const ymd = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE }).format(now);
  return new Date(`${ymd}T00:00:00-03:00`);
}
