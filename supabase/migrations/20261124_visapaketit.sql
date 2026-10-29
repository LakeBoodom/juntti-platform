-- Visapaketit (toteutusbrief 28.10.2026, vaihe V-A): valmiit tietovisat visan vetäjälle.
-- Paketti = kierroksia, kierros = viittauksia olemassa oleviin kysymyksiin (ei kopioita: kun kysymystä
-- korjataan visassa, korjaus näkyy paketissa). Kysymys näkyy julkisesti vain, jos sen visa on julkaistu.

create table public.quiz_packs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id),
  slug text not null,                                   -- 'joulu', 'lapset', 'pubivisa-2026-loka-joulu'
  sarja text,                                           -- null | 'pubivisa' (sarjan painokset)
  painos_nimi text,                                     -- 'Loka–joulukuu 2026' (vain sarjoissa)
  otsikko text not null,
  seo_title text,
  seo_description text,
  kohderyhma text not null default 'aikuiset' check (kohderyhma in ('aikuiset', 'lapset', 'molemmat')),
  kausi_alku text check (kausi_alku ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),  -- 'MM-DD'; null = ajaton
  kausi_loppu text check (kausi_loppu ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
  kesto_min int check (kesto_min > 0),
  hero_image text,
  hero_alt text,
  aksentti text check (aksentti ~ '^#[0-9A-Fa-f]{6}$'),  -- teemaväri korttiin ja nostoon, ei CTA:han
  jarjestys int not null default 100,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug),
  check ((kausi_alku is null) = (kausi_loppu is null)),
  check (sarja is null or painos_nimi is not null)
);

create table public.quiz_pack_rounds (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.quiz_packs(id) on delete cascade,
  nro int not null check (nro > 0),
  nimi text not null,
  kohderyhma text not null default 'aikuiset' check (kohderyhma in ('aikuiset', 'lapset')),
  unique (pack_id, nro)
);

create table public.quiz_pack_items (
  round_id uuid not null references public.quiz_pack_rounds(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  sort int not null,
  primary key (round_id, question_id)
);

-- Pilotin mittaus, ei henkilötietoja (session_id on selaimen satunnaistunniste kuten quiz_plays).
create table public.quiz_pack_events (
  id bigint generated always as identity primary key,
  pack_id uuid not null references public.quiz_packs(id) on delete cascade,
  tapahtuma text not null check (tapahtuma in ('nayta', 'ruutu_aloitus', 'ruutu_loppu', 'tulosta', 'vastaus_auki', 'pelaa')),
  session_id text check (char_length(session_id) <= 64),
  created_at timestamptz not null default now()
);

-- Luonnoksen esikatseluavain (admin näyttää linkin ?esikatselu=<avain>). Omassa taulussaan, jotta
-- julkaistun paketin rivin lukeminen ei paljasta avainta. Anonilla ei ole tähän mitään oikeuksia.
create table public.quiz_pack_esikatselu (
  pack_id uuid primary key references public.quiz_packs(id) on delete cascade,
  avain uuid not null default gen_random_uuid()
);

create index quiz_packs_site_status_idx on public.quiz_packs (site_id, status, jarjestys);
create index quiz_pack_items_round_idx on public.quiz_pack_items (round_id, sort);
create index quiz_pack_items_question_idx on public.quiz_pack_items (question_id);
create index quiz_pack_events_pack_idx on public.quiz_pack_events (pack_id, tapahtuma, created_at);

create trigger quiz_packs_set_updated_at before update on public.quiz_packs
  for each row execute function public.set_updated_at();

-- Uudelle paketille esikatseluavain automaattisesti.
create function public.quiz_packs_luo_esikatselu() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.quiz_pack_esikatselu (pack_id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger quiz_packs_luo_esikatselu after insert on public.quiz_packs
  for each row execute function public.quiz_packs_luo_esikatselu();
revoke execute on function public.quiz_packs_luo_esikatselu() from public, anon, authenticated;

-- RLS: anon lukee vain julkaistut paketit kierroksineen ja kysymysviittauksineen; tapahtumiin vain insert.
-- Kirjoitus muuten vain service rolella (admin), joka ohittaa RLS:n.
alter table public.quiz_packs enable row level security;
alter table public.quiz_pack_rounds enable row level security;
alter table public.quiz_pack_items enable row level security;
alter table public.quiz_pack_events enable row level security;
alter table public.quiz_pack_esikatselu enable row level security;

create policy "Julkaistut visapaketit luettavissa" on public.quiz_packs
  for select using (status = 'published');
create policy "Julkaistujen pakettien kierrokset luettavissa" on public.quiz_pack_rounds
  for select using (exists (select 1 from public.quiz_packs p where p.id = pack_id and p.status = 'published'));
create policy "Julkaistujen pakettien kysymysviittaukset luettavissa" on public.quiz_pack_items
  for select using (exists (
    select 1 from public.quiz_pack_rounds r join public.quiz_packs p on p.id = r.pack_id
    where r.id = round_id and p.status = 'published'));
create policy "Visapakettien tapahtumat: vain lisäys julkaistuun pakettiin" on public.quiz_pack_events
  for insert with check (exists (select 1 from public.quiz_packs p where p.id = pack_id and p.status = 'published'));

revoke all on public.quiz_pack_esikatselu from anon, authenticated;
revoke update, delete, truncate on public.quiz_pack_events from anon, authenticated;
revoke insert, update, delete, truncate on public.quiz_packs, public.quiz_pack_rounds, public.quiz_pack_items from anon, authenticated;

-- Koko paketti yhdellä kutsulla (pakettisivu, televisionäkymä, tuloste).
-- Ilman avainta: vain julkaistu paketti ja vain julkaistujen visojen kysymykset.
-- Oikealla esikatseluavaimella: myös luonnos, ja kysymykset joiden visa ei ole julkaistu, merkittyinä
-- (visa_julkaistu = false), jotta Heikki näkee esikatselussa, mitä julkaisussa putoaisi pois.
create function public.visapaketti(p_slug text, p_avain uuid default null)
returns jsonb
language sql stable security definer set search_path = public as $$
  with sivusto as (select id from sites where slug = 'tietoniekka'),
  ehdokas as (
    select p.*, (p_avain is not null and exists (
             select 1 from quiz_pack_esikatselu e where e.pack_id = p.id and e.avain = p_avain)) as avain_ok
    from quiz_packs p, sivusto s
    where p.site_id = s.id and p.slug = p_slug
  ),
  paketti as (select * from ehdokas where status = 'published' or avain_ok),
  esikatselu as (select coalesce((select avain_ok from paketti), false) as on_)
  select jsonb_build_object(
    'paketti', (select to_jsonb(paketti) - 'avain_ok' from paketti),
    'esikatselu', (select on_ from esikatselu),
    'kierrokset', coalesce((
      select jsonb_agg(jsonb_build_object(
        'nro', r.nro, 'nimi', r.nimi, 'kohderyhma', r.kohderyhma,
        'kysymykset', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', q.id, 'question_text', q.question_text, 'explanation', q.explanation, 'answers', q.answers,
            'question_type', q.question_type, 'image_url', q.image_url, 'image_credit', q.image_credit,
            'image_position', q.image_position, 'audio', q.audio, 'animal_sound', q.animal_sound,
            'visa_julkaistu', z.status = 'published',
            'visa', jsonb_build_object('id', z.id, 'slug', z.slug, 'custom_slug', z.custom_slug, 'title', z.title,
              'display_title', z.display_title, 'collection', z.collection, 'target_age', z.target_age,
              'game_mode', z.game_mode, 'hero_image', z.hero_image, 'image_url', z.image_url)
          ) order by i.sort)
          from quiz_pack_items i
          join questions q on q.id = i.question_id
          join quizzes z on z.id = q.quiz_id
          where i.round_id = r.id and (z.status = 'published' or (select on_ from esikatselu))
        ), '[]'::jsonb)
      ) order by r.nro)
      from quiz_pack_rounds r where r.pack_id = (select id from paketti)
    ), '[]'::jsonb)
  )
  where exists (select 1 from paketti);
$$;
revoke all on function public.visapaketti(text, uuid) from public;
grant execute on function public.visapaketti(text, uuid) to anon, authenticated, service_role;
