-- Instagram-julkaisujen luvut (27.9.2026): Instagramin postauskohtaiset insightsit
-- talteen julkaisuriville. Ajastin päivittää viimeisen 30 päivän postaukset
-- enintään kolmen tunnin välein; adminissa "Päivitä luvut" hakee heti.
-- Avaimet kuten Instagram API ne nimeää: reach, views, likes, comments, saved,
-- shares, total_interactions, follows, profile_visits.

alter table public.ig_julkaisut
  add column if not exists ig_tilastot  jsonb,
  add column if not exists tilastot_at  timestamptz;
