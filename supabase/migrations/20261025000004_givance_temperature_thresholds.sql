-- Ajuste dos cortes de temperatura: quente >= 75, morno >= 45, frio < 45.
-- (Com os cortes originais quase todo lead de formulário virava "quente".)

alter table givance.leads alter column temperature set expression as (
  case when score >= 75 then 'quente' when score >= 45 then 'morno' else 'frio' end
);
