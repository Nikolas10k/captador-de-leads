// Ilustrações feitas em HTML/CSS (sem imagens genéricas): o celular com a
// conversa chegando e as prévias de site por segmento.

export function PhoneChatMock() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-[300px] rounded-[36px] border border-line-strong bg-ink p-2 shadow-[var(--shadow-soft)]">
      <div className="overflow-hidden rounded-[28px] bg-[#efeae2]">
        <div className="flex items-center gap-2 bg-[#0b5c37] px-4 py-3 text-white">
          <div className="size-8 rounded-full bg-white/25" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Clínica Sorriso Sul</span>
            <span className="text-xs opacity-80">online</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3 text-[13px] leading-snug">
          <Bubble side="in" time="19:42">
            Oi! Achei vocês no Google. Vocês atendem sábado?
          </Bubble>
          <Bubble side="out" time="19:42">
            Olá! Atendemos sim, das 8h às 13h. Quer ver os horários livres deste sábado?
          </Bubble>
          <Bubble side="in" time="19:43">
            Quero, para limpeza.
          </Bubble>
          <Bubble side="out" time="19:43">
            Temos 9h30 ou 11h. Qual fica melhor?
          </Bubble>
          <Bubble side="in" time="19:44">
            9h30
          </Bubble>
          <div className="mx-auto mt-1 rounded-md bg-[#fff5c4] px-3 py-1 text-[11px] text-[#5c4a00]">
            Agendamento confirmado automaticamente
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, time, children }: { side: "in" | "out"; time: string; children: React.ReactNode }) {
  return (
    <div
      className={
        side === "in"
          ? "max-w-[85%] self-start rounded-lg rounded-tl-none bg-white px-3 py-2 text-ink"
          : "max-w-[85%] self-end rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-ink"
      }
    >
      {children}
      <span className="ml-2 align-bottom text-[10px] text-muted">{time}</span>
    </div>
  );
}

type PreviewProps = { title: string; tagline: string; tone: string; items: string[]; cta: string };

export function SitePreviewMock({ title, tagline, tone, items, cta }: PreviewProps) {
  return (
    <div aria-hidden className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line bg-subtle px-3 py-2">
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="ml-2 h-4 flex-1 rounded bg-surface" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">{title}</span>
          <span className="h-2 w-16 rounded bg-subtle" />
        </div>
        <div className="flex flex-col gap-2 rounded-lg p-4" style={{ background: tone }}>
          <span className="text-sm font-semibold text-white">{tagline}</span>
          <span className="h-2 w-3/4 rounded bg-white/40" />
          <span className="mt-1 inline-flex w-fit rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-ink">{cta}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {items.map((i) => (
            <div key={i} className="flex flex-col gap-1 rounded-md border border-line p-2">
              <span className="h-8 rounded bg-subtle" />
              <span className="text-[10px] text-muted">{i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
