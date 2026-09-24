-- Instagram-maininnat (tägäys, vaihtoehto 1: @-maininta kuvatekstissä). Tili tallennetaan
-- visalle tai henkilölle ehdotukseksi; julkaisukohtaisesti toimitus voi muuttaa sen.
alter table quizzes add column if not exists ig_tilit text[] not null default '{}';
alter table celebrities add column if not exists ig_tilit text[] not null default '{}';
comment on column quizzes.ig_tilit is 'Instagram-tilit (ilman @) mainittaviksi visan julkaisuissa';
comment on column celebrities.ig_tilit is 'Henkilön Instagram-tilit (ilman @) mainittaviksi synttäri- ja henkilövisajulkaisuissa';
