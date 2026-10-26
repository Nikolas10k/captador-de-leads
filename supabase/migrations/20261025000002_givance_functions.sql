-- Funções e triggers do schema givance

-- ---------------------------------------------------------------------------
-- Acesso: só quem está em givance.team_members
-- ---------------------------------------------------------------------------
create or replace function givance.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from givance.team_members where user_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------------
-- Lead scoring (0–100)
--   necessidade clara  até 30
--   faixa de investimento até 30
--   prazo              até 25
--   já vende online    até 15
-- ---------------------------------------------------------------------------
create or replace function givance.compute_score(
  p_needs text[],
  p_budget text,
  p_timeline text,
  p_sells_on_instagram boolean,
  p_orders_via_whatsapp boolean
)
returns int
language sql
immutable
set search_path = ''
as $$
  select least(100,
    (case
       when coalesce(cardinality(array_remove(p_needs, 'nao_sei')), 0) >= 2 then 30
       when coalesce(cardinality(array_remove(p_needs, 'nao_sei')), 0) = 1 then 25
       when 'nao_sei' = any (coalesce(p_needs, '{}')) then 8
       else 0
     end)
  + (case p_budget
       when 'acima_6000' then 30
       when '3000_6000'  then 25
       when '1500_3000'  then 15
       when 'ate_1500'   then 8
       when 'nao_sei'    then 5
       else 0
     end)
  + (case p_timeline
       when 'urgente'    then 25
       when '30_dias'    then 20
       when '60_dias'    then 10
       when 'sem_pressa' then 4
       else 0
     end)
  + (case when coalesce(p_sells_on_instagram, false) then 8 else 0 end)
  + (case when coalesce(p_orders_via_whatsapp, false) then 7 else 0 end)
  );
$$;

-- ---------------------------------------------------------------------------
-- Trigger: antes de gravar o lead
-- ---------------------------------------------------------------------------
create or replace function givance.leads_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_kind text;
  v_pos  int;
begin
  new.updated_at := now();
  new.score := givance.compute_score(new.needs, new.budget_range, new.timeline,
                                     new.sells_on_instagram, new.orders_via_whatsapp);

  if tg_op = 'INSERT' or new.stage_id is distinct from old.stage_id then
    select kind, position into v_kind, v_pos from givance.pipeline_stages where id = new.stage_id;

    if tg_op = 'UPDATE' then
      new.stage_changed_at := now();
    end if;

    if v_kind <> 'lost' then
      new.furthest_position := greatest(coalesce(new.furthest_position, 1), v_pos);
      new.lost_at := null;
      new.lost_reason := null;
    else
      new.lost_at := case when tg_op = 'INSERT' then coalesce(new.lost_at, now()) else now() end;
    end if;

    if v_kind = 'won' then
      new.won_at := coalesce(new.won_at, now());
    else
      new.won_at := null;
    end if;

    if new.stage_id <> 'novo' and new.first_contact_at is null then
      new.first_contact_at := now();
    end if;
  end if;

  return new;
end;
$$;

create trigger leads_before_write
  before insert or update on givance.leads
  for each row execute function givance.leads_before_write();

-- ---------------------------------------------------------------------------
-- Trigger: depois de gravar o lead → histórico de etapas
-- ---------------------------------------------------------------------------
create or replace function givance.leads_after_write()
returns trigger
language plpgsql
security definer -- grava em stage_history, que é somente leitura para o painel
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into givance.stage_history (lead_id, from_stage, to_stage, changed_at, changed_by)
    values (new.id, null, new.stage_id, new.created_at, (select auth.uid()));
  elsif new.stage_id is distinct from old.stage_id then
    insert into givance.stage_history (lead_id, from_stage, to_stage, changed_by)
    values (new.id, old.stage_id, new.stage_id, (select auth.uid()));

    insert into givance.interactions (lead_id, type, content, created_by)
    select new.id, 'sistema',
           'Etapa alterada: ' || f.name || ' → ' || t.name
           || coalesce(' (motivo: ' || new.lost_reason || ')', ''),
           (select auth.uid())
    from givance.pipeline_stages f, givance.pipeline_stages t
    where f.id = old.stage_id and t.id = new.stage_id;
  end if;
  return null;
end;
$$;

create trigger leads_after_write
  after insert or update on givance.leads
  for each row execute function givance.leads_after_write();

-- ---------------------------------------------------------------------------
-- Trigger: interação humana marca o primeiro contato
-- ---------------------------------------------------------------------------
create or replace function givance.interactions_after_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.type <> 'sistema' then
    update givance.leads
       set first_contact_at = coalesce(first_contact_at, new.occurred_at)
     where id = new.lead_id and first_contact_at is null;
  end if;
  return null;
end;
$$;

create trigger interactions_after_insert
  after insert on givance.interactions
  for each row execute function givance.interactions_after_insert();

create or replace function givance.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger message_templates_touch
  before update on givance.message_templates
  for each row execute function givance.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Rate limit (janela fixa). Só o service role chama.
-- Retorna true quando o limite foi ultrapassado.
-- ---------------------------------------------------------------------------
create or replace function givance.rate_limit_hit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  insert into givance.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
     set count = case when r.window_start < now() - make_interval(secs => p_window_seconds)
                      then 1 else r.count + 1 end,
         window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds)
                             then now() else r.window_start end
  returning count into v_count;

  -- limpeza oportunista de janelas antigas
  if random() < 0.02 then
    delete from givance.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_count > p_max;
end;
$$;

-- ---------------------------------------------------------------------------
-- Métricas do dashboard (security invoker → respeita RLS)
-- ---------------------------------------------------------------------------
create or replace function givance.dashboard_metrics(p_from timestamptz, p_to timestamptz)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with period as (
    select * from givance.leads where created_at >= p_from and created_at < p_to
  ),
  month_bounds as (
    select date_trunc('month', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo' as m_start
  )
  select jsonb_build_object(
    'total_leads', (select count(*) from period),
    'by_source', coalesce((
      select jsonb_agg(jsonb_build_object('key', source, 'count', c) order by c desc)
      from (select source, count(*) c from period group by source) s
    ), '[]'::jsonb),
    'by_campaign', coalesce((
      select jsonb_agg(jsonb_build_object('key', k, 'count', c) order by c desc)
      from (
        select coalesce(nullif(concat_ws(' / ', utm_source, utm_campaign), ''), 'Sem campanha') k, count(*) c
        from period group by 1
      ) s
    ), '[]'::jsonb),
    'funnel', coalesce((
      select jsonb_agg(jsonb_build_object('stage', st.id, 'name', st.name, 'reached',
               (select count(*) from period p where p.furthest_position >= st.position)) order by st.position)
      from givance.pipeline_stages st where st.kind <> 'lost'
    ), '[]'::jsonb),
    'lost', (select count(*) from period where stage_id = 'perdido'),
    'avg_days_to_close', (
      select round(avg(extract(epoch from (won_at - created_at)) / 86400)::numeric, 1)
      from givance.leads where won_at is not null and won_at >= p_from and won_at < p_to
    ),
    'value_in_negotiation', (
      select coalesce(sum(estimated_value), 0) from givance.leads
      where stage_id in ('proposta_enviada', 'negociacao')
    ),
    'value_won_month', (
      select coalesce(sum(estimated_value), 0) from givance.leads, month_bounds
      where won_at >= month_bounds.m_start
    ),
    'won_month', (
      select count(*) from givance.leads, month_bounds where won_at >= month_bounds.m_start
    )
  );
$$;
