// Vocabulário do domínio. Os valores batem com os CHECKs do banco (schema givance).

type Option<T extends string = string> = { value: T; label: string };

const labelsOf = <T extends string>(options: readonly Option<T>[]) =>
  Object.fromEntries(options.map((o) => [o.value, o.label])) as Record<T, string>;

const valuesOf = <T extends string>(options: readonly Option<T>[]) =>
  options.map((o) => o.value) as [T, ...T[]];

export const STAGES = [
  { value: "novo", label: "Novo" },
  { value: "contato_feito", label: "Contato feito" },
  { value: "previa_enviada", label: "Prévia enviada" },
  { value: "proposta_enviada", label: "Proposta enviada" },
  { value: "negociacao", label: "Negociação" },
  { value: "ganho", label: "Fechado (ganho)" },
  { value: "perdido", label: "Perdido" },
] as const satisfies readonly Option[];
export type StageId = (typeof STAGES)[number]["value"];
export const STAGE_IDS = valuesOf(STAGES);
export const STAGE_LABEL = labelsOf(STAGES);
export const OPEN_STAGES: StageId[] = ["novo", "contato_feito", "previa_enviada", "proposta_enviada", "negociacao"];

export const SOURCES = [
  { value: "formulario", label: "Formulário" },
  { value: "instagram", label: "Instagram" },
  { value: "indicacao", label: "Indicação" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "prospeccao_ativa", label: "Prospecção ativa" },
  { value: "trafego_pago", label: "Tráfego pago" },
] as const satisfies readonly Option[];
export type SourceId = (typeof SOURCES)[number]["value"];
export const SOURCE_IDS = valuesOf(SOURCES);
export const SOURCE_LABEL = labelsOf(SOURCES);

export const SEGMENTS = [
  { value: "alimentacao", label: "Alimentação (restaurante, doceria, delivery)" },
  { value: "beleza", label: "Beleza e estética" },
  { value: "saude", label: "Saúde (clínica, consultório, academia)" },
  { value: "comercio", label: "Loja / comércio" },
  { value: "moda", label: "Moda e acessórios" },
  { value: "servicos", label: "Prestador de serviço" },
  { value: "pet", label: "Pet" },
  { value: "educacao", label: "Educação e cursos" },
  { value: "outro", label: "Outro" },
] as const satisfies readonly Option[];
export type SegmentId = (typeof SEGMENTS)[number]["value"];
export const SEGMENT_IDS = valuesOf(SEGMENTS);
export const SEGMENT_LABEL = labelsOf(SEGMENTS);
export const SEGMENT_SHORT: Record<SegmentId, string> = {
  alimentacao: "Alimentação",
  beleza: "Beleza",
  saude: "Saúde",
  comercio: "Comércio",
  moda: "Moda",
  servicos: "Serviços",
  pet: "Pet",
  educacao: "Educação",
  outro: "Outro",
};

export const NEEDS = [
  { value: "site", label: "Site" },
  { value: "landing_page", label: "Landing page (página de vendas)" },
  { value: "sistema", label: "Sistema ou painel sob medida" },
  { value: "automacao_whatsapp", label: "Automação de WhatsApp" },
  { value: "instagram_marketing", label: "Instagram / marketing" },
  { value: "nao_sei", label: "Ainda não sei" },
] as const satisfies readonly Option[];
export type NeedId = (typeof NEEDS)[number]["value"];
export const NEED_IDS = valuesOf(NEEDS);
export const NEED_LABEL = labelsOf(NEEDS);

export const BUDGETS = [
  { value: "ate_1500", label: "Até R$ 1.500" },
  { value: "1500_3000", label: "R$ 1.500 a R$ 3.000" },
  { value: "3000_6000", label: "R$ 3.000 a R$ 6.000" },
  { value: "acima_6000", label: "Acima de R$ 6.000" },
  { value: "nao_sei", label: "Ainda não sei" },
] as const satisfies readonly Option[];
export type BudgetId = (typeof BUDGETS)[number]["value"];
export const BUDGET_IDS = valuesOf(BUDGETS);
export const BUDGET_LABEL = labelsOf(BUDGETS);

export const TIMELINES = [
  { value: "urgente", label: "Para ontem (até 15 dias)" },
  { value: "30_dias", label: "Em até 30 dias" },
  { value: "60_dias", label: "Em até 60 dias" },
  { value: "sem_pressa", label: "Sem pressa, estou pesquisando" },
] as const satisfies readonly Option[];
export type TimelineId = (typeof TIMELINES)[number]["value"];
export const TIMELINE_IDS = valuesOf(TIMELINES);
export const TIMELINE_LABEL = labelsOf(TIMELINES);

export const TEMPERATURES = [
  { value: "quente", label: "Quente" },
  { value: "morno", label: "Morno" },
  { value: "frio", label: "Frio" },
] as const satisfies readonly Option[];
export type Temperature = (typeof TEMPERATURES)[number]["value"];
export const TEMPERATURE_IDS = valuesOf(TEMPERATURES);
export const TEMPERATURE_LABEL = labelsOf(TEMPERATURES);

export const INTERACTION_TYPES = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "ligacao", label: "Ligação" },
  { value: "reuniao", label: "Reunião" },
  { value: "nota", label: "Nota" },
] as const satisfies readonly Option[];
export type InteractionType = (typeof INTERACTION_TYPES)[number]["value"] | "sistema";
export const INTERACTION_TYPE_IDS = valuesOf(INTERACTION_TYPES);
export const INTERACTION_LABEL: Record<InteractionType, string> = {
  ...labelsOf(INTERACTION_TYPES),
  sistema: "Sistema",
};

/** Regiões administrativas do DF + entorno */
export const REGIONS = [
  "Plano Piloto (Asa Sul / Asa Norte)",
  "Águas Claras",
  "Arniqueira",
  "Brazlândia",
  "Candangolândia",
  "Ceilândia",
  "Cruzeiro",
  "Fercal",
  "Gama",
  "Guará",
  "Itapoã",
  "Jardim Botânico",
  "Lago Norte",
  "Lago Sul",
  "Núcleo Bandeirante",
  "Paranoá",
  "Park Way",
  "Planaltina",
  "Recanto das Emas",
  "Riacho Fundo",
  "Riacho Fundo II",
  "Samambaia",
  "Santa Maria",
  "São Sebastião",
  "SCIA / Estrutural",
  "SIA",
  "Sobradinho",
  "Sobradinho II",
  "Sol Nascente / Pôr do Sol",
  "Sudoeste / Octogonal",
  "Taguatinga",
  "Varjão",
  "Vicente Pires",
  "Entorno do DF (GO)",
  "Outra cidade",
] as const;
