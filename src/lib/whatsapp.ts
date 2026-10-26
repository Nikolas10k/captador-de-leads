import { siteConfig } from "@/config/site";
import { formatCurrency, toWhatsAppNumber } from "@/lib/format";

export function waLink(number: string, message?: string) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Link para o WhatsApp da Givance */
export function givanceWaLink(message: string = siteConfig.whatsappDefaultMessage) {
  return waLink(siteConfig.whatsappNumber, message);
}

/** Link para o WhatsApp de um lead (número salvo sem DDI) */
export function leadWaLink(storedPhone: string, message?: string) {
  return waLink(toWhatsAppNumber(storedPhone), message);
}

type TemplateLead = {
  name: string;
  business_name: string | null;
  preview_url: string | null;
  estimated_value: number | null;
};

/** Preenche {nome}, {negocio}, {link_previa}, {valor} */
export function fillTemplate(body: string, lead: TemplateLead) {
  const firstName = lead.name.trim().split(/\s+/)[0] ?? lead.name;
  const map: Record<string, string> = {
    nome: firstName,
    negocio: lead.business_name || "seu negócio",
    link_previa: lead.preview_url || "[link da prévia]",
    valor: lead.estimated_value != null ? formatCurrency(lead.estimated_value) : "[valor]",
  };
  return body.replace(/\{(nome|negocio|link_previa|valor)\}/g, (_, key: string) => map[key]);
}

export const TEMPLATE_PLACEHOLDERS = ["{nome}", "{negocio}", "{link_previa}", "{valor}"] as const;
