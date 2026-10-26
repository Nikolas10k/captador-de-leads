-- Dados de exemplo para ver o painel funcionando.
-- Todos marcados com is_sample = true. Para remover:
--   delete from givance.leads where is_sample;
--   delete from givance.campaigns where label like '[exemplo]%';

insert into givance.campaigns (utm_source, utm_medium, utm_campaign, utm_content, label) values
  ('instagram', 'paid_social', 'lancamento_out', 'carrossel_whatsapp', '[exemplo] Instagram · lançamento'),
  ('google', 'cpc', 'sites_df', null, '[exemplo] Google · sites DF')
on conflict do nothing;

with c as (
  select
    (select id from givance.campaigns where utm_campaign = 'lancamento_out') as ig,
    (select id from givance.campaigns where utm_campaign = 'sites_df') as gg
)
insert into givance.leads (
  is_sample, created_at, name, business_name, whatsapp, instagram, city_region, segment,
  needs, has_website, sells_on_instagram, orders_via_whatsapp, budget_range, timeline,
  source, campaign_id, utm_source, utm_medium, utm_campaign, device,
  stage_id, furthest_position, estimated_value, next_action, next_action_at,
  first_contact_at, won_at, lost_reason, preview_url, website_url, consent_at, consent_version
)
select true, v.created_at, v.name, v.business, v.whatsapp, v.instagram, v.region, v.segment,
       v.needs, v.has_site, v.sells_ig, v.orders_wpp, v.budget, v.timeline,
       v.source, case v.camp when 'ig' then c.ig when 'gg' then c.gg end,
       case v.camp when 'ig' then 'instagram' when 'gg' then 'google' end,
       case v.camp when 'ig' then 'paid_social' when 'gg' then 'cpc' end,
       case v.camp when 'ig' then 'lancamento_out' when 'gg' then 'sites_df' end,
       v.device, v.stage, v.furthest, v.value, v.next_action, v.next_at,
       v.first_contact, v.won_at, v.lost_reason, v.preview, v.site,
       case when v.source in ('formulario', 'trafego_pago') then v.created_at end,
       case when v.source in ('formulario', 'trafego_pago') then '2026-10' end
from c, (values
  (now() - interval '3 hours', 'Mariana Lopes', 'Ateliê Mari Doces', '61991234501', '@ateliemari', 'Águas Claras', 'alimentacao',
   array['site', 'automacao_whatsapp'], false, true, true, '1500_3000', 'urgente',
   'formulario', 'ig', 'mobile', 'novo', 1, null::numeric, null, null::timestamptz, null::timestamptz, null::timestamptz, null, null, null),
  (now() - interval '30 hours', 'Carlos Henrique', 'Barbearia Navalha 61', '61991234502', '@navalha61', 'Taguatinga', 'beleza',
   array['landing_page'], false, true, true, 'ate_1500', '30_dias',
   'formulario', 'ig', 'mobile', 'novo', 1, null, null, null, null, null, null, null, null),
  (now() - interval '2 days', 'Dra. Fernanda Reis', 'Clínica Sorriso Sul', '61991234503', '@sorrisosul', 'Asa Sul', 'saude',
   array['site', 'sistema'], true, false, true, '3000_6000', '30_dias',
   'formulario', 'gg', 'desktop', 'contato_feito', 2, 4800, 'Enviar prévia do site', now() - interval '4 hours', now() - interval '1 day', null, null, null, 'https://sorrisosul.com.br'),
  (now() - interval '5 days', 'Roberto Alves', 'Auto Peças Ceilândia', '61991234504', '@autopecascei', 'Ceilândia', 'comercio',
   array['site', 'instagram_marketing'], false, true, true, '1500_3000', '60_dias',
   'prospeccao_ativa', null, null, 'previa_enviada', 3, 2400, 'Ligar para ouvir feedback da prévia', now() + interval '3 hours', now() - interval '4 days', null, null, 'https://previa.givance.tech/autopecas', null),
  (now() - interval '9 days', 'Juliana Prado', 'Studio Pilates Prado', '61991234505', '@pilatesprado', 'Sudoeste', 'saude',
   array['landing_page', 'automacao_whatsapp'], true, true, true, '1500_3000', 'urgente',
   'instagram', null, 'mobile', 'proposta_enviada', 4, 3200, 'Follow-up da proposta', now() - interval '1 day', now() - interval '8 days', null, null, 'https://previa.givance.tech/pilates', null),
  (now() - interval '14 days', 'André Souza', 'Souza Instalações Elétricas', '61991234506', null, 'Gama', 'servicos',
   array['site'], false, false, true, '1500_3000', '30_dias',
   'indicacao', null, null, 'negociacao', 5, 2900, 'Fechar forma de pagamento', now() + interval '1 day', now() - interval '13 days', null, null, 'https://previa.givance.tech/souza', null),
  (now() - interval '20 days', 'Patrícia Gomes', 'Pet Shop Amigo Fiel', '61991234507', '@amigofielpet', 'Sobradinho', 'pet',
   array['site', 'automacao_whatsapp', 'sistema'], false, true, true, 'acima_6000', '30_dias',
   'trafego_pago', 'ig', 'mobile', 'ganho', 6, 7800, null, null, now() - interval '19 days', now() - interval '6 days', null, 'https://previa.givance.tech/amigofiel', null),
  (now() - interval '25 days', 'Lucas Martins', 'Martins Imóveis', '61991234508', '@martinsimoveisdf', 'Guará', 'servicos',
   array['site'], true, false, false, 'nao_sei', 'sem_pressa',
   'formulario', 'gg', 'desktop', 'perdido', 3, 3500, null, null, now() - interval '24 days', null, 'Preferiu esperar o próximo semestre', null, 'https://martinsimoveis.com'),
  (now() - interval '12 days', 'Camila Rocha', 'Boutique Camila Rocha', '61991234509', '@boutiquecr', 'Lago Sul', 'moda',
   array['landing_page', 'instagram_marketing'], false, true, true, '3000_6000', 'urgente',
   'whatsapp', null, 'mobile', 'ganho', 6, 4200, null, null, now() - interval '11 days', now() - interval '2 days', null, 'https://previa.givance.tech/boutique', null),
  (now() - interval '40 hours', 'Rafael Teixeira', 'Academia Força Total', '61991234510', '@forcatotal', 'Samambaia', 'saude',
   array['nao_sei'], false, true, false, 'nao_sei', 'sem_pressa',
   'formulario', null, 'mobile', 'novo', 1, null, null, null, null, null, null, null, null),
  (now() - interval '7 days', 'Beatriz Nunes', 'Doceria Nunes', '61991234511', '@docerianunes', 'Vicente Pires', 'alimentacao',
   array['automacao_whatsapp'], false, true, true, '1500_3000', '30_dias',
   'instagram', null, 'mobile', 'contato_feito', 2, 1900, 'Mandar exemplos de cardápio digital', now(), now() - interval '6 days', null, null, null, null),
  (now() - interval '33 days', 'Eduardo Lima', 'Lima Contabilidade', '61991234512', null, 'Asa Norte', 'servicos',
   array['site', 'sistema'], true, false, false, 'acima_6000', '60_dias',
   'prospeccao_ativa', null, null, 'perdido', 4, 9000, null, null, now() - interval '30 days', null, 'Fechou com outro fornecedor', null, 'https://limacontabil.com.br')
) as v(created_at, name, business, whatsapp, instagram, region, segment,
       needs, has_site, sells_ig, orders_wpp, budget, timeline,
       source, camp, device, stage, furthest, value, next_action, next_at,
       first_contact, won_at, lost_reason, preview, site);

insert into givance.interactions (lead_id, type, content, occurred_at)
select l.id, i.type, i.content, l.created_at + i.after
from givance.leads l
join (values
  ('Clínica Sorriso Sul', 'whatsapp', 'Primeiro contato. Quer agendamento online e site novo.', interval '20 hours'),
  ('Auto Peças Ceilândia', 'nota', 'Encontrado no Instagram, 3 mil seguidores, sem site.', interval '0 hours'),
  ('Auto Peças Ceilândia', 'whatsapp', 'Enviada prévia do site.', interval '2 days'),
  ('Studio Pilates Prado', 'reuniao', 'Reunião de 20 min por vídeo. Gostou da prévia.', interval '3 days'),
  ('Studio Pilates Prado', 'whatsapp', 'Proposta enviada: R$ 3.200.', interval '5 days'),
  ('Souza Instalações Elétricas', 'ligacao', 'Ligação: pediu parcelamento em 3x.', interval '10 days'),
  ('Pet Shop Amigo Fiel', 'reuniao', 'Contrato assinado.', interval '14 days'),
  ('Doceria Nunes', 'whatsapp', 'Respondeu animada, pediu exemplos.', interval '1 day')
) as i(business, type, content, after) on l.business_name = i.business
where l.is_sample;
