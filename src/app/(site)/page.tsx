import Link from "next/link";
import { ArrowRight, Bot, LayoutTemplate, MessageCircle, MonitorSmartphone, PanelsTopLeft } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { PhoneChatMock, SitePreviewMock } from "@/features/landing/mockups";
import { WhatsAppLink } from "@/features/landing/whatsapp-float";

const problems = [
  {
    title: "Só o Instagram não basta",
    text: "Quem pesquisa “clínica em Águas Claras” no Google encontra o concorrente que tem site, com endereço e horário à vista.",
  },
  {
    title: "Mensagem sem resposta é cliente perdido",
    text: "O pedido chega às 21h, ninguém responde, e a pessoa fecha com quem respondeu primeiro.",
  },
  {
    title: "Divulgação sem destino",
    text: "Você impulsiona posts, mas não sabe quantos clientes vieram dali nem quanto custou cada um.",
  },
];

const services = [
  {
    icon: MonitorSmartphone,
    title: "Site",
    text: "Seu negócio aparece no Google com endereço, horários, serviços e um botão direto para o seu WhatsApp.",
  },
  {
    icon: LayoutTemplate,
    title: "Landing page",
    text: "Uma página focada em uma oferta, feita para receber visitas do Instagram e do Google e virar conversa.",
  },
  {
    icon: PanelsTopLeft,
    title: "Sistema sob medida",
    text: "Agenda, pedidos, cadastro de clientes ou painel de vendas, do jeito que a sua rotina já funciona.",
  },
  {
    icon: Bot,
    title: "Automação de WhatsApp",
    text: "Resposta na hora, catálogo, agendamento e lembretes, mesmo quando você está ocupado atendendo.",
  },
];

const steps = [
  {
    title: "Diagnóstico de 2 minutos",
    text: "Você conta como o negócio funciona hoje e o que quer melhorar. Sem reunião longa.",
  },
  {
    title: "Prévia sem compromisso",
    text: "Montamos uma prévia do seu site e mandamos pelo WhatsApp. Você decide depois de ver.",
  },
  {
    title: "No ar e conectado",
    text: "Publicamos, ligamos ao seu WhatsApp e ao Google e acompanhamos os primeiros resultados com você.",
  },
];

const previews = [
  {
    segment: "Clínicas e consultórios",
    title: "Clínica Exemplo",
    tagline: "Agende sua consulta em 1 minuto",
    tone: "#1f4e5f",
    items: ["Especialidades", "Equipe", "Convênios"],
    cta: "Agendar pelo WhatsApp",
  },
  {
    segment: "Lojas e comércio",
    title: "Loja Exemplo",
    tagline: "Peça pelo WhatsApp e retire hoje",
    tone: "#7a3b12",
    items: ["Novidades", "Mais vendidos", "Promoções"],
    cta: "Ver catálogo",
  },
  {
    segment: "Prestadores de serviço",
    title: "Serviço Exemplo",
    tagline: "Orçamento sem custo no mesmo dia",
    tone: "#2f3a2a",
    items: ["Serviços", "Antes e depois", "Regiões"],
    cta: "Pedir orçamento",
  },
];

const faqs = [
  {
    q: "Quanto custa?",
    a: "Depende do que o seu negócio precisa. Uma landing page custa bem menos que um sistema sob medida. Depois do diagnóstico você recebe uma proposta com valor fechado, sem surpresa no meio do caminho.",
  },
  {
    q: "A prévia tem custo?",
    a: "Não. A prévia é gratuita e sem compromisso. Ela serve para você ver como o seu site pode ficar antes de decidir.",
  },
  {
    q: "Em quanto tempo fica pronto?",
    a: "Landing pages e sites simples costumam ficar prontos em poucas semanas. Sistemas dependem do escopo. O prazo exato vem escrito na proposta.",
  },
  {
    q: "Preciso entender de tecnologia?",
    a: "Não. A gente cuida da parte técnica e explica tudo pelo WhatsApp, em português claro. Você só precisa conhecer bem o seu negócio.",
  },
  {
    q: "Vocês atendem fora de Brasília?",
    a: "Sim. O trabalho é todo online. O foco é o DF e o entorno, mas atendemos negócios de qualquer cidade.",
  },
  {
    q: "Consigo mudar o site depois?",
    a: "Sim. Ajustes de texto, fotos e preços fazem parte do dia a dia, e você pode pedir pelo WhatsApp.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pt-20 md:pb-24">
        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold text-accent">Sites e automação para negócios do DF</p>
          <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl">
            Mais clientes chegando pelo WhatsApp do seu negócio.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            A Givance Tech cria o site, a página de vendas e o atendimento automático para quem vende em Brasília e região.
            Você vê uma prévia do seu site antes de decidir qualquer coisa.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/diagnostico" className={buttonClass("primary", "lg")}>
              Fazer diagnóstico gratuito
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <WhatsAppLink placement="hero" className={buttonClass("secondary", "lg")}>
              <MessageCircle aria-hidden className="size-5" />
              Chamar no WhatsApp
            </WhatsAppLink>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:gap-6">
            <li>Prévia antes de fechar</li>
            <li>Resposta em até 1 dia útil</li>
            <li>Equipe em Brasília</li>
          </ul>
        </div>
        <PhoneChatMock />
      </section>

      {/* Problema */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 md:py-24">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance">
            O cliente procura antes de chamar. E muitas vezes não encontra você.
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {problems.map((p, i) => (
              <div key={p.title} className="flex flex-col gap-2 border-t-2 border-ink pt-4">
                <span className="text-sm text-muted">0{i + 1}</span>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="text-muted">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="mx-auto flex max-w-6xl scroll-mt-16 flex-col gap-10 px-4 py-16 sm:px-6 md:py-24">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">O que a Givance entrega</h2>
          <p className="text-lg text-muted">
            Tudo pensado para um objetivo: transformar quem procura o seu negócio em conversa no WhatsApp.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-6">
              <Icon aria-hidden className="size-6 text-accent" />
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="scroll-mt-16 bg-ink text-canvas">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight">Como funciona</h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-canvas/30 font-semibold">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-canvas/75">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/diagnostico" className={buttonClass("primary", "lg", "self-start")}>
            Começar pelo diagnóstico
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>

      {/* Prévias */}
      <section id="previas" className="mx-auto flex max-w-6xl scroll-mt-16 flex-col gap-10 px-4 py-16 sm:px-6 md:py-24">
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">Como é uma prévia</h2>
          <p className="text-lg text-muted">
            Modelos de estrutura por tipo de negócio. A sua prévia é montada com o nome, os serviços e as fotos do seu
            negócio.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {previews.map((p) => (
            <figure key={p.segment} className="flex flex-col gap-3">
              <SitePreviewMock {...p} />
              <figcaption className="text-sm font-semibold">{p.segment}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="perguntas" className="scroll-mt-16 border-t border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_2fr] md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <div className="flex flex-col divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {f.q}
                  <span aria-hidden className="text-xl text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-prose text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-line bg-accent-soft p-8 md:p-12">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance">
            Descubra o que falta para o seu negócio receber mais pedidos pelo WhatsApp.
          </h2>
          <p className="max-w-xl text-lg text-muted">
            Responda o diagnóstico e receba uma recomendação feita para o seu negócio, com prévia gratuita.
          </p>
          <Link href="/diagnostico" className={buttonClass("primary", "lg")}>
            Fazer diagnóstico gratuito
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
