-- Givance Tech · Captação e gestão de leads
-- Tudo vive no schema "givance" para ficar isolado de qualquer outro sistema
-- que compartilhe o mesmo projeto Supabase. Nenhuma tabela é criada em "public".

create schema if not exists givance;

-- ---------------------------------------------------------------------------
-- Equipe autorizada (o Auth do projeto pode ter usuários de outros sistemas)
-- ---------------------------------------------------------------------------
create table givance.team_members (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null default 'admin' check (role in ('admin', 'vendas')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Etapas do pipeline
-- ---------------------------------------------------------------------------
create table givance.pipeline_stages (
  id       text primary key,
  name     text not null,
  position int  not null unique,
  kind     text not null default 'open' check (kind in ('open', 'won', 'lost'))
);

insert into givance.pipeline_stages (id, name, position, kind) values
  ('novo',             'Novo',             1, 'open'),
  ('contato_feito',    'Contato feito',    2, 'open'),
  ('previa_enviada',   'Prévia enviada',   3, 'open'),
  ('proposta_enviada', 'Proposta enviada', 4, 'open'),
  ('negociacao',       'Negociação',       5, 'open'),
  ('ganho',            'Fechado (ganho)',  6, 'won'),
  ('perdido',          'Perdido',          7, 'lost');

-- ---------------------------------------------------------------------------
-- Campanhas (combinação única de UTMs)
-- ---------------------------------------------------------------------------
create table givance.campaigns (
  id            uuid primary key default gen_random_uuid(),
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  label         text,
  created_at    timestamptz not null default now(),
  constraint campaigns_utm_unique unique nulls not distinct (utm_source, utm_medium, utm_campaign, utm_content)
);

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------
create table givance.leads (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- contato
  name                text not null check (char_length(name) between 2 and 120),
  business_name       text check (char_length(business_name) <= 160),
  whatsapp            text check (whatsapp ~ '^[0-9]{10,13}$'),
  instagram           text check (char_length(instagram) <= 120),
  city_region         text check (char_length(city_region) <= 80),
  website_url         text check (char_length(website_url) <= 300),
  preview_url         text check (char_length(preview_url) <= 300),

  -- diagnóstico
  segment             text check (char_length(segment) <= 60),
  segment_other       text check (char_length(segment_other) <= 80),
  needs               text[] not null default '{}',
  has_website         boolean,
  sells_on_instagram  boolean,
  orders_via_whatsapp boolean,
  budget_range        text check (budget_range in ('ate_1500', '1500_3000', '3000_6000', 'acima_6000', 'nao_sei')),
  timeline            text check (timeline in ('urgente', '30_dias', '60_dias', 'sem_pressa')),

  -- origem e rastreamento
  source              text not null default 'formulario'
                      check (source in ('formulario', 'instagram', 'indicacao', 'whatsapp', 'prospeccao_ativa', 'trafego_pago')),
  campaign_id         uuid references givance.campaigns (id) on delete set null,
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  utm_content         text,
  landing_page        text,
  referrer            text,
  device              text check (device in ('mobile', 'tablet', 'desktop')),
  ip_hash             text,

  -- consentimento LGPD
  consent_at          timestamptz,
  consent_version     text,

  -- pipeline
  stage_id            text not null default 'novo' references givance.pipeline_stages (id),
  stage_changed_at    timestamptz not null default now(),
  furthest_position   int not null default 1,
  lost_reason         text check (char_length(lost_reason) <= 500),
  first_contact_at    timestamptz,
  won_at              timestamptz,
  lost_at             timestamptz,
  estimated_value     numeric(12, 2) check (estimated_value >= 0),
  next_action         text check (char_length(next_action) <= 200),
  next_action_at      timestamptz,

  -- scoring (calculado por trigger)
  score               int not null default 0 check (score between 0 and 100),
  temperature         text generated always as (
                        case when score >= 65 then 'quente' when score >= 40 then 'morno' else 'frio' end
                      ) stored,

  owner_id            uuid references auth.users (id) on delete set null,
  is_sample           boolean not null default false,

  constraint lost_requires_reason check (stage_id <> 'perdido' or nullif(trim(lost_reason), '') is not null)
);

create index leads_stage_idx        on givance.leads (stage_id);
create index leads_source_idx       on givance.leads (source);
create index leads_segment_idx      on givance.leads (segment);
create index leads_temperature_idx  on givance.leads (temperature);
create index leads_campaign_idx     on givance.leads (campaign_id);
create index leads_created_idx      on givance.leads (created_at desc);
create index leads_next_action_idx  on givance.leads (next_action_at) where next_action_at is not null;
create index leads_won_at_idx       on givance.leads (won_at) where won_at is not null;
create index leads_whatsapp_idx     on givance.leads (whatsapp);

-- ---------------------------------------------------------------------------
-- Interações (linha do tempo)
-- ---------------------------------------------------------------------------
create table givance.interactions (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references givance.leads (id) on delete cascade,
  type        text not null check (type in ('ligacao', 'whatsapp', 'reuniao', 'nota', 'sistema')),
  content     text not null check (char_length(content) between 1 and 4000),
  occurred_at timestamptz not null default now(),
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index interactions_lead_idx on givance.interactions (lead_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Histórico de etapas (base da conversão por etapa e do tempo até fechar)
-- ---------------------------------------------------------------------------
create table givance.stage_history (
  id         bigint generated always as identity primary key,
  lead_id    uuid not null references givance.leads (id) on delete cascade,
  from_stage text references givance.pipeline_stages (id),
  to_stage   text not null references givance.pipeline_stages (id),
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users (id) on delete set null
);

create index stage_history_lead_idx on givance.stage_history (lead_id, changed_at);

-- ---------------------------------------------------------------------------
-- Modelos de mensagem de WhatsApp
-- ---------------------------------------------------------------------------
create table givance.message_templates (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null check (char_length(name) between 2 and 60),
  body       text not null check (char_length(body) between 1 and 2000),
  position   int  not null default 0,
  updated_at timestamptz not null default now()
);

insert into givance.message_templates (slug, name, position, body) values
  ('primeiro_contato', 'Primeiro contato', 1,
   'Oi, {nome}! Aqui é da Givance Tech. Vi o seu diagnóstico do {negocio} e separei algumas ideias para trazer mais clientes pelo WhatsApp. Posso te mandar por aqui?'),
  ('envio_previa', 'Envio de prévia', 2,
   'Oi, {nome}! Montei uma prévia de como o site do {negocio} pode ficar: {link_previa}. Dá uma olhada com calma e me diz o que achou.'),
  ('follow_up', 'Follow-up', 3,
   'Oi, {nome}, tudo certo? Passando para saber se conseguiu ver o que te enviei sobre o {negocio}. Se quiser, a gente conversa 10 minutos hoje.'),
  ('proposta', 'Proposta', 4,
   'Oi, {nome}! Segue a proposta para o {negocio}: investimento de {valor}, com entrega e suporte inclusos. Qualquer dúvida, estou por aqui.');

-- ---------------------------------------------------------------------------
-- Rate limit do formulário público (chave = hash do IP)
-- ---------------------------------------------------------------------------
create table givance.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        int not null default 0
);
