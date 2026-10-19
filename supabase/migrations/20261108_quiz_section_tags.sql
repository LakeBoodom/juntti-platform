-- KOKOELMARUNKO vaihe 1 (TOTEUTUSBRIEF Kokoelmasivun runko ja pelikehys §1, 19.10.2026):
-- visa kuuluu kokoelmasivun osioon tagin perusteella (S3). Uusi visa ilmestyy osioon pelkällä tagilla.
-- Tagit ovat kokoelman sisäisiä osioslugeja (lib/kokoelmat/<slug>.ts sections[].slug).
-- quiz_cards-näkymään lisätään loppuun section_tags sekä visan oma kuva (hero_image + kohdepiste),
-- jota runko käyttää korttikuvana. Muut sarakkeet ennallaan.

alter table public.quizzes add column if not exists section_tags text[] not null default '{}';

create or replace view public.quiz_cards with (security_invoker = true) as
 select id,
    slug,
    custom_slug,
    title,
    display_title,
    teaser,
    description,
    collection,
    genre,
    subcollection,
    category,
    difficulty,
    game_mode,
    tags,
    play_count,
    published_at,
    site_id,
    ( select count(*)::integer as count
           from questions qu
          where qu.quiz_id = q.id) as question_count,
        case
            when published_at > (now() - '7 days'::interval) then 'uusi'::text
            when play_count >= 25 then 'suosittu'::text
            else null::text
        end as badge,
    target_age,
    section_tags,
    hero_image,
    hero_focal_x,
    hero_focal_y
   from quizzes q
  where status = 'published'::text;

-- TV & suoratoisto: nykyinen viiden genren jako (lib/tv.ts TV_SECTIONS) tageiksi, jako säilyy täsmälleen.
update public.quizzes q set section_tags = array[v.tag]
from (values
  ('pasila-aseman-sekopaat','komedia'),
  ('simpsonit-visa-tunnetko-springfieldin-perheen','komedia'),
  ('big-bang-theory-visa','komedia'),
  ('luottomies-visa','komedia'),
  ('how-i-met-your-mother-visa','komedia'),
  ('solsidan-visa-tunnetko-hittikomedian','komedia'),
  ('velipuolikuu-tietovisa','komedia'),
  ('putous-visa-tunnetko-sketsisuosikin','komedia'),
  ('ketonen-ja-myllyrinne-visa','komedia'),
  ('the-office-usa-visa-tunnetko-dunder-mifflinin-porukan','komedia'),
  ('kummeli-visa','komedia'),
  ('seinfeld-visa-tunnetko-komediaklassikon','komedia'),
  ('frendit-visa-tunnetko-jengin','komedia'),
  ('ted-lasso-tiedatko-sarjasta-kaiken','komedia'),
  ('tankki-tayteen-huoltamoklassikko-visa','komedia'),
  ('succession-visa-tunnetko-valtataistelun','draama'),
  ('syke-sairaalan-sankarit','draama'),
  ('the-crown-visa-tunnetko-kuninkaallisen-sarjan','draama'),
  ('salkkarit-salatut-elamat-tietovisa','draama'),
  ('tohtori-house-visa','draama'),
  ('greys-anatomy-leikkaussali-kutsuu','draama'),
  ('kotikatu-visa-muistatko-kotimaisen-klassikon','draama'),
  ('uusi-paiva-virtauksen-vaen-visa','draama'),
  ('metsolat-ysarin-sukusaaga','draama'),
  ('kauniit-ja-rohkeat-forresterien-maailma','draama'),
  ('sorjonen-visa-kotimainen-rikossarja','rikos'),
  ('squid-game-tietovisa','rikos'),
  ('the-sopranos-perheen-sisapiiri','rikos'),
  ('breaking-bad-visa-tunnetko-rikosdraaman','rikos'),
  ('money-heist-suuri-keikka','rikos'),
  ('game-of-thrones-visa-tunnetko-valtaistuinpelin','fantasia'),
  ('muumilaakson-tarinoita-visa','fantasia'),
  ('stranger-things-tosifanin-koetinkivi','fantasia'),
  ('vain-elamaa-tietovisa','reality'),
  ('petolliset-tietovisa','reality'),
  ('farmi-suomi-pehtoorin-pillin-tahdissa-visa','reality'),
  ('temptation-island-suomi-viettelysten-saarella-visa','reality'),
  ('selviytyjat-suomi-viidakon-lait-visa','reality'),
  ('diili-sa-saat-potkut-visa','reality'),
  ('erikoisjoukot-visa','reality'),
  ('maajussille-morsian-sydan-maaseudulla-visa','reality'),
  ('masked-singer-suomi-visa-naamion-takana','reality'),
  ('tanssii-tahtien-kanssa-visa-parketin-tahdet','reality'),
  ('koko-suomi-leipoo-visa-uunit-kuumina','reality')
) as v(slug, tag)
where q.slug = v.slug and q.collection = 'tv';
