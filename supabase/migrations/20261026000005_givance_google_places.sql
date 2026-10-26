-- Prospecção pelo Google Maps (Places API): dados do estabelecimento no lead
-- e trava contra importar o mesmo negócio duas vezes.

alter table givance.leads
  add column address         text check (char_length(address) <= 300),
  add column google_place_id text check (char_length(google_place_id) <= 300),
  add column google_maps_url text check (char_length(google_maps_url) <= 500),
  add column google_rating   numeric(2, 1) check (google_rating between 0 and 5),
  add column google_reviews  int check (google_reviews >= 0),
  add column google_category text check (char_length(google_category) <= 120);

create unique index leads_google_place_id_key on givance.leads (google_place_id) where google_place_id is not null;
