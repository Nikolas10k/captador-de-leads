import Link from "next/link";
import { siteConfig } from "@/config/site";
import { buttonClass } from "@/components/ui/button";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-ink">
      <span aria-hidden className="flex size-8 items-center justify-center rounded-md bg-ink text-sm text-canvas">
        G
      </span>
      Givance Tech
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#servicos" className="hover:text-ink">
            O que fazemos
          </a>
          <a href="#como-funciona" className="hover:text-ink">
            Como funciona
          </a>
          <a href="#previas" className="hover:text-ink">
            Prévias
          </a>
          <a href="#perguntas" className="hover:text-ink">
            Dúvidas
          </a>
        </nav>
        <Link href="/diagnostico" className={buttonClass("primary", "md")}>
          Diagnóstico gratuito
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <Logo />
          <p>Sites, landing pages, sistemas e automação de WhatsApp · {siteConfig.city}</p>
        </div>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-6 gap-y-2">
          <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="hover:text-ink" target="_blank" rel="noopener noreferrer">
            WhatsApp {siteConfig.whatsappDisplay}
          </a>
          <Link href="/privacidade" className="hover:text-ink">
            Política de privacidade
          </Link>
          <Link href="/painel" className="hover:text-ink">
            Área da equipe
          </Link>
        </nav>
      </div>
    </footer>
  );
}
