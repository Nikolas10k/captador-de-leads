import { SiteFooter, SiteHeader } from "@/features/landing/site-chrome";
import { WhatsAppFloat } from "@/features/landing/whatsapp-float";
import { AttributionCapture } from "@/features/tracking/attribution-capture";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppFloat />
      <AttributionCapture />
    </>
  );
}
