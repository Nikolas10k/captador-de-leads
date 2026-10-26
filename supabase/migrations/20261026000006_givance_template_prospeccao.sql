-- Modelo de mensagem para prospecção fria de negócios sem site (vira o primeiro da lista)
insert into givance.message_templates (slug, name, position, body) values
 ('prospeccao_sem_site', 'Prospecção (sem site)', 0,
  'Oi, {nome}, tudo bem? Aqui é da Givance Tech, de Brasília. Encontrei o {negocio} no Google Maps e vi que vocês ainda não têm site. Hoje muita gente procura no Google antes de chamar no WhatsApp. Posso montar uma prévia gratuita de como ficaria o site de vocês, com botão direto para o WhatsApp? Sem compromisso.')
on conflict (slug) do nothing;
