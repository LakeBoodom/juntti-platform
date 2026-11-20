-- KUMPI? 2.0 — vaihe C (Heikin lupa 20.11.2026): luonnospelaajat julkaistaan ja Kumpi?-teemojen käyttämät
-- jääkiekkomäärittelyt kytketään päälle. Vain lib/kumpi/teemat.ts:n teemojen attribuutit (PERUSTEEMAT + 17 seuraa);
-- eläimet (species), seurat (team) ja presidentit (pres_start) odottavat Coworkin tarkistusta eivätkä kuulu tähän.
update public.fact_entities set status = 'published' where kind = 'player' and status = 'draft';

update public.fact_attribute_defs set enabled = true
where attr_key in (
  'has_nhl', 'has_stanley_cup', 'has_wc_gold', 'oly_gold', 'wc_golds', 'stanley_cups',
  'liiga_assists', 'liiga_clubs', 'liiga_debut', 'liiga_games', 'liiga_gk_wins', 'liiga_seasons', 'liiga_shutouts',
  'nhl_assists', 'nhl_debut', 'nhl_draft_pick', 'nhl_games', 'nhl_gk_wins', 'nhl_shutouts', 'played_for_club'
) and enabled = false;
