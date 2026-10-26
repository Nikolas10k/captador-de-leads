export const siteConfig = {
  name: "Givance Tech",
  city: "Brasília/DF",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /** Número com DDI, só dígitos. (61) 99674-7738 */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5561996747738",
  whatsappDisplay: "(61) 99674-7738",
  whatsappDefaultMessage:
    "Olá! Vim pelo site da Givance Tech e quero entender como ter mais clientes chegando pelo WhatsApp.",
  /** Versão do texto de consentimento gravada junto do lead */
  consentVersion: "2026-10",
} as const;
