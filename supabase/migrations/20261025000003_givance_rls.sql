-- Permissões e Row Level Security do schema givance
--
-- Regras:
--   * anon: nenhum acesso. O formulário público grava pela rota /api/leads,
--     que roda no servidor com a service role (que ignora RLS).
--   * authenticated: só lê/edita se estiver em givance.team_members.
--   * rate_limits: só service role.

revoke all on schema givance from public, anon;
grant usage on schema givance to authenticated, service_role;

revoke all on all tables    in schema givance from public, anon, authenticated;
revoke all on all sequences in schema givance from public, anon, authenticated;
revoke all on all functions in schema givance from public, anon, authenticated;

grant all on all tables    in schema givance to service_role;
grant all on all sequences in schema givance to service_role;
grant execute on all functions in schema givance to service_role;

grant select, insert, update, delete on givance.leads, givance.interactions, givance.message_templates, givance.campaigns
  to authenticated;
grant select on givance.pipeline_stages, givance.stage_history, givance.team_members to authenticated;
grant execute on function givance.is_member() to authenticated;
grant execute on function givance.dashboard_metrics(timestamptz, timestamptz) to authenticated;
grant execute on function givance.compute_score(text[], text, text, boolean, boolean) to authenticated;

alter default privileges in schema givance revoke all on tables from public, anon;
alter default privileges in schema givance revoke execute on functions from public, anon;

-- RLS em todas as tabelas
alter table givance.team_members      enable row level security;
alter table givance.pipeline_stages   enable row level security;
alter table givance.campaigns         enable row level security;
alter table givance.leads             enable row level security;
alter table givance.interactions      enable row level security;
alter table givance.stage_history     enable row level security;
alter table givance.message_templates enable row level security;
alter table givance.rate_limits       enable row level security;

create policy team_members_self on givance.team_members
  for select to authenticated using (user_id = (select auth.uid()));

create policy pipeline_stages_read on givance.pipeline_stages
  for select to authenticated using ((select givance.is_member()));

create policy campaigns_all on givance.campaigns
  for all to authenticated
  using ((select givance.is_member())) with check ((select givance.is_member()));

create policy leads_all on givance.leads
  for all to authenticated
  using ((select givance.is_member())) with check ((select givance.is_member()));

create policy interactions_all on givance.interactions
  for all to authenticated
  using ((select givance.is_member())) with check ((select givance.is_member()));

create policy stage_history_read on givance.stage_history
  for select to authenticated using ((select givance.is_member()));

create policy message_templates_all on givance.message_templates
  for all to authenticated
  using ((select givance.is_member())) with check ((select givance.is_member()));

-- rate_limits: sem policies → só service role.
