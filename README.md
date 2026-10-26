# Captador de leads · Givance Tech

Painel de prospecção e vendas da Givance Tech (Brasília/DF): o vendedor cadastra os negócios que encontra, acompanha o pipeline, faz follow-up pelo WhatsApp e mede os resultados. A raiz do site (`/`) abre direto o painel.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Supabase (Postgres, Auth, RLS) · Resend · Vercel.

---

## O que tem aqui

**Integração opcional**
- `POST /api/leads`: endpoint para receber leads de um formulário externo (ex.: o site da Givance). Valida com zod (schema em `features/diagnostico/schema.ts`), tem honeypot, tempo mínimo de preenchimento e rate limit por IP, grava UTMs e dispara as notificações. Só funciona com `SUPABASE_SERVICE_ROLE_KEY` configurada; sem ela, fica inativo.

**Painel (`/painel`)**, só para quem está em `givance.team_members`:
- **Hoje**: follow-ups atrasados, os de hoje e leads novos sem contato há mais de 24h.
- **Pipeline**: kanban com arrastar e soltar (mouse, toque e teclado) e visão em lista para o celular. Mover para "Perdido" exige motivo.
- **Leads**: busca, filtros (etapa, origem, segmento, temperatura) na URL e exportação CSV (abre direto no Excel).
- **Ficha do lead**: dados, links (Instagram, site, prévia), próxima ação com data, valor da proposta, linha do tempo, WhatsApp com modelos editáveis e exclusão (pedido LGPD).
- **Dashboard**: leads por origem e por campanha, conversão por etapa, tempo médio até fechar, valor em negociação e valor fechado no mês.
- **Modelos**: textos de primeiro contato, envio de prévia, follow-up e proposta, com `{nome}`, `{negocio}`, `{link_previa}` e `{valor}`.

**Lead scoring (0–100)**: é calculado no banco por trigger, então funciona igual para leads do formulário e do cadastro manual.

| Critério | Pontos |
|---|---|
| Necessidade clara (1 item: 25, 2 ou mais: 30, só "não sei": 8) | até 30 |
| Investimento (acima de 6 mil: 30 · 3–6 mil: 25 · 1,5–3 mil: 15 · até 1,5 mil: 8 · não sei: 5) | até 30 |
| Prazo (até 15 dias: 25 · 30 dias: 20 · 60 dias: 10 · sem pressa: 4) | até 25 |
| Já vende online (Instagram: 8 · pedidos no WhatsApp: 7) | até 15 |

Temperatura: **quente** a partir de 75 pontos, **morno** de 45 a 74, **frio** abaixo de 45.

---

## Estrutura

```
supabase/
  migrations/            schema givance, funções/triggers, RLS, ajustes
  seed.sql               12 leads de exemplo (is_sample = true)
scripts/gen-types.mjs    regenera os tipos do Supabase
src/
  proxy.ts               renova a sessão e protege /painel
  app/
    api/leads/           integração opcional com formulário externo
    painel/login/
    painel/(app)/        hoje, pipeline, leads, ficha, dashboard, modelos, exportar CSV
  features/
    auth/                sessão, login, checagem de membro
    diagnostico/         schema zod da integração /api/leads
    leads/               opções do domínio, queries, server actions, componentes
    pipeline/            kanban, seletor de etapa, diálogo de motivo de perda
    today/ dashboard/ templates/ panel/
    notifications/       e-mail (Resend), Telegram, webhook (ponto de extensão)
  components/ui/         botão, campos com label/erro, badge, card, estado vazio
  lib/                   formatação BR, WhatsApp, clientes Supabase, tipos gerados
```

## Banco de dados

Tudo fica no schema **`givance`**: nada é criado em `public`. Assim o sistema pode morar dentro de outro projeto Supabase sem conflito e sair de lá depois com um `pg_dump -n givance`.

| Tabela | Para quê |
|---|---|
| `leads` | contato, diagnóstico, origem/UTMs, consentimento, etapa, follow-up, score e temperatura |
| `interactions` | linha do tempo (ligação, WhatsApp, reunião, nota, sistema) |
| `pipeline_stages` | as 7 etapas e a ordem delas |
| `stage_history` | cada mudança de etapa (base da conversão e do tempo até fechar) |
| `campaigns` | combinação única de utm_source/medium/campaign/content |
| `message_templates` | modelos de WhatsApp |
| `team_members` | quem pode usar o painel |
| `rate_limits` | contador anti-spam do formulário |

**RLS** está ativa em todas as tabelas:
- `anon` não tem nem `USAGE` no schema: o formulário grava só pela rota `/api/leads` com a service role.
- `authenticated` lê e edita só se estiver em `team_members` (o Auth pode ter usuários de outros sistemas).
- `rate_limits` só é acessada pelo servidor.

---

## Como rodar do zero

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (ou use um existente: o schema `givance` não mexe em nada dele).
2. Rode as migrations **em ordem**, no SQL Editor ou com a CLI:
   ```bash
   npx supabase link --project-ref SEU_REF
   npx supabase db push
   ```
3. (Opcional) rode `supabase/seed.sql` para ter dados de exemplo.
4. **Exponha o schema na API:** Project Settings → Data API → *Exposed schemas* → adicione `givance` e salve.
5. Crie seu usuário em Authentication → Users (e-mail e senha) ou use um que já existe, e libere o acesso:
   ```sql
   insert into givance.team_members (user_id)
   select id from auth.users where email = 'voce@exemplo.com';
   ```
6. Recomendado: Authentication → Providers → Email → desligue *Allow new users to sign up* (ninguém se cadastra sozinho) e ligue *Leaked password protection*.

### 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha. As chaves ficam em Project Settings → API Keys.

| Variável | Obrigatória | Onde usa |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sim | cliente e servidor |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | sim | login e painel (respeita RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | só para `/api/leads` | **só servidor**, integração com formulário externo |
| `NEXT_PUBLIC_SITE_URL` | sim em produção | links do e-mail |
| `IP_HASH_SALT` | recomendada | hash do IP no rate limit |
| `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL_FROM`, `LEAD_NOTIFY_EMAIL_TO` | não | e-mail de lead novo |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | não | aviso no Telegram |
| `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_SECRET` | não | n8n, Make, Z-API, WhatsApp Cloud API… |

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
```

### 3. Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) (o framework Next.js é detectado sozinho).
2. Cadastre as variáveis da tabela acima em Settings → Environment Variables, com `NEXT_PUBLIC_SITE_URL` apontando para o domínio final.
3. Faça o deploy. Em Supabase → Authentication → URL Configuration, coloque o domínio da Vercel em *Site URL*.
4. No Resend, verifique o domínio do remetente para os e-mails não caírem no spam.

### Tipos do banco

`src/lib/supabase/database.types.ts` tem os tipos do schema `givance`. Depois de mudar o banco:

```bash
npx supabase login   # uma vez
npm run gen:types
```

---

## Integrar um formulário externo

Envie `POST /api/leads` com JSON nos campos do schema de `features/diagnostico/schema.ts` (`name`, `business_name`, `whatsapp`, `city_region`, `segment`, `needs`, `budget_range`, `timeline`, `consent: true`…) e, opcionalmente, `attribution: { utm_source, utm_medium, utm_campaign, utm_content, landing_page, referrer }`. Um `utm_medium` igual a `cpc`, `paid_social`, `ads` etc. marca o lead como **tráfego pago**.

## Notificações

`src/features/notifications` tem uma interface `NotificationChannel`. Já vêm prontos os canais de e-mail (Resend), Telegram e webhook genérico. Para notificar no WhatsApp, aponte `LEAD_WEBHOOK_URL` para o seu provedor ou automação, ou crie um canal novo em `channels/` e registre em `index.ts`.

## Levar o banco para outro projeto Supabase

Tudo está isolado no schema `givance`:

```bash
pg_dump "$URL_ANTIGA" --schema=givance --no-owner --no-privileges > givance.sql
# no projeto novo: rode as migrations OU restaure o dump, exponha o schema
# e cadastre de novo os usuários em givance.team_members
```

Os usuários do Auth não vão junto, porque `auth.users` é do projeto: recrie-os no projeto novo e insira em `team_members`. Depois troque as três chaves do Supabase na Vercel.

## Dados de exemplo

```sql
delete from givance.leads where is_sample;
delete from givance.campaigns where label like '[exemplo]%';
```
