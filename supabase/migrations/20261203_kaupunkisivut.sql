-- KAUPUNKISIVUT v1 (TOTEUTUSBRIEF Kaupunkisivut v1 – rakenne ulos, 7.11.2026; data KAUPUNGIT_DATA_2026_11_07.md).
--   1. quizzes.paikkakunnat text[]  — visan paikkakunnat (pienet slugit ilman ääkkösiä: helsinki, hameenlinna)
--   2. quizzes.kausi                — ympari_vuoden / talvi / kesa (kaupunkisivun kauden nosto; nostokaudet koodissa)
--   3. quiz_cards-näkymään molemmat
--   4. taulu kaupungit (35 riviä)   — kaupunkisivun data; julkaistu = aalto 1:n 26 kaupunkia
--   5. paikkakunnat-alkutäyttö: kaupunki- ja tunturivisat + linkitystaulukko (42 visaa) + Suomen kolme linnaa
-- Henkilöt yhdistetään koodissa: celebrities.birth_place (ennen pilkkua) = inessiivi tai jokin vanhat_kunnat.

alter table public.quizzes add column if not exists paikkakunnat text[];
alter table public.quizzes add column if not exists kausi text not null default 'ympari_vuoden';
alter table public.quizzes drop constraint if exists quizzes_kausi_check;
alter table public.quizzes add constraint quizzes_kausi_check check (kausi in ('ympari_vuoden', 'talvi', 'kesa'));
create index if not exists quizzes_paikkakunnat_gin on public.quizzes using gin (paikkakunnat);

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
    hero_focal_y,
    coalesce(( select s.selaimia_90pv
           from quiz_suosio s
          where s.quiz_id = q.id), 0) as suosio_90pv,
    paikkakunnat,
    kausi
   from quizzes q
  where status = 'published'::text;

create table if not exists public.kaupungit (
  slug text primary key check (slug ~ '^[a-z]+$'),
  nimi text not null,
  inessiivi text not null,
  elatiivi text not null,
  asukasnimitys text,
  korttinimi text,
  kaupunkivisa_quiz_id uuid references public.quizzes (id) on delete set null,
  tunnusrivi text,
  hook text check (hook is null or char_length(hook) <= 140),
  hook_og text check (hook_og is null or char_length(hook_og) <= 40),
  hero_kuva text,
  vaakuna_url text,
  -- vanhat kunnat inessiivissä ("Mikkelin maalaiskunnassa"): henkilöt näistä lasketaan kaupunkiin
  vanhat_kunnat text[] not null default '{}',
  julkaistu boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.kaupungit enable row level security;
revoke all on public.kaupungit from anon, authenticated;
grant select on public.kaupungit to anon, authenticated;
drop policy if exists "kaupungit luku" on public.kaupungit;
create policy "kaupungit luku" on public.kaupungit for select to anon, authenticated using (true);

with d(slug, nimi, inessiivi, elatiivi, asukasnimitys, tunnusrivi, vaakuna_id, visa, vanhat, julkaistu) as (values
  ('espoo','Espoo','Espoossa','Espoosta','espoolaiset','Viiden keskuksen kaupunki · kaupunki vuodesta 1972 · 326 000 asukasta','4000d4df-19f2-4793-acd5-df9331e40512','espoo-viiden-keskustan-kaupunki','{}'::text[],true),
  ('hameenlinna','Hämeenlinna','Hämeenlinnassa','Hämeenlinnasta','hämeenlinnalaiset','Suomen vanhin sisämaakaupunki · perustettu 1639 · 69 000 asukasta','1edf6dd4-50ad-48db-a473-d4614749d173','hameenlinna-harmaakivi-aulanko-visa','{}',true),
  ('hanko','Hanko','Hangossa','Hangosta','hankolaiset','Suomen Riviera · perustettu 1874 · 8 000 asukasta','64f1a5b6-eb3c-46ce-897a-bc38b2a764ab','hanko-kesakaupunki-hankoniemen-karjessa-visa','{}',false),
  ('helsinki','Helsinki','Helsingissä','Helsingistä','helsinkiläiset','Stadi · perustettu 1550 · 694 000 asukasta','7b44eb42-648d-4909-a987-a0582e8f2cf5','helsinki-stadin-kovat-pahkinat','{}',true),
  ('hyvinkaa','Hyvinkää','Hyvinkäällä','Hyvinkäältä','hyvinkääläiset','Rautatiekaupunki · kaupunki vuodesta 1960 · 47 000 asukasta','c9a5b89d-ee73-4833-ae24-191ff4a77544','hyvinkaa-monipuolinen-kaupunki-uudenmaan-pohjoisosassa-visa','{}',false),
  ('imatra','Imatra','Imatralla','Imatralta','imatralaiset','Vuoksen kaupunki · kaupunki vuodesta 1971 · 24 000 asukasta','002ed871-2a10-45f3-ab19-125ba1ea651f','imatra-vuoksen-varren-kaupunki-ja-sen-tarinat-visa','{}',true),
  ('jarvenpaa','Järvenpää','Järvenpäässä','Järvenpäästä','järvenpääläiset','Taiteilijakaupunki · kaupunki vuodesta 1967 · 47 000 asukasta','f7a4779b-5809-4b12-9d9b-b74530ee4f69','jarvenpaa-tuusulanjarven-taiteilijakaupunki-visa','{}',false),
  ('joensuu','Joensuu','Joensuussa','Joensuusta','joensuulaiset','Pohjois-Karjalan pääkaupunki · perustettu 1848 · 79 000 asukasta','b0e4892b-d3d0-4d2b-83a7-b30256d16530','jonssi-tentissa-joensuu-visa','{}',true),
  ('jyvaskyla','Jyväskylä','Jyväskylässä','Jyväskylästä','jyväskyläläiset','Suomen Ateena · perustettu 1837 · 150 000 asukasta','6503cfd8-9f68-470c-aa3c-1efb61df8c6f','suomen-ateena-jyvaskyla-tietovisa','{"Jyväskylän maalaiskunnassa"}',true),
  ('kajaani','Kajaani','Kajaanissa','Kajaanista','kajaanilaiset','Kainuun pääkaupunki · perustettu 1651 · 36 000 asukasta','45ecb6a1-e5a9-49c5-8485-460293853770','kajaani-linnanraunioiden-ja-koskien-kaupunki-visa','{}',false),
  ('kirkkonummi','Kirkkonummi','Kirkkonummella','Kirkkonummelta','kirkkonummelaiset','Meren ja metsän kunta · 42 000 asukasta','bdc3372a-af9e-4f89-84cc-f5aafddb8cb3','kirkkonummi-meren-ja-metsan-rajalla-visa','{}',false),
  ('kokkola','Kokkola','Kokkolassa','Kokkolasta','kokkolalaiset','Keski-Pohjanmaan satamakaupunki · perustettu 1620 · 48 000 asukasta','c7391c2d-f240-452a-8292-7c5e30d5d90b','kokkola-keski-pohjanmaan-satamakaupunki-visa','{}',true),
  ('kotka','Kotka','Kotkassa','Kotkasta','kotkalaiset','Merikaupunki · perustettu 1879 · 50 000 asukasta','5017a7ed-0798-4fac-87c4-19de564a303f','kotka-satamakaupunki-kymijoen-suulla-visa','{}',true),
  ('kouvola','Kouvola','Kouvolassa','Kouvolasta','kouvolalaiset','Rautateiden risteyskaupunki · kaupunki vuodesta 1960 · 78 000 asukasta','24649d3d-e657-4270-a5cf-ec7d6c69c7c9','kouvola-visa-raiteiden-risteyksessa','{"Valkealassa","Jaalassa"}',true),
  ('kuopio','Kuopio','Kuopiossa','Kuopiosta','kuopiolaiset','Savon pääkaupunki · perustettu 1775 · 127 000 asukasta','659d251b-9103-4f2b-90fa-8f5f58d52b99','kuopio-viantaen-syvalta-savosta','{}',true),
  ('lahti','Lahti','Lahdessa','Lahdesta','lahtelaiset','Suomen Chicago · kaupunki vuodesta 1905 · 122 000 asukasta','53953585-6666-43ca-8350-357414b8ccc0','lahti-suomen-chicagon-salaisuudet','{"Nastolassa"}',true),
  ('lappeenranta','Lappeenranta','Lappeenrannassa','Lappeenrannasta','lappeenrantalaiset','Etelä-Karjalan pääkaupunki · perustettu 1649 · 73 000 asukasta','7266d9ba-81ba-4e5a-9b49-74e7663df497','lappeenranta-rajakaupungin-salat','{}',true),
  ('lohja','Lohja','Lohjalla','Lohjalta','lohjalaiset','Järvikaupunki · kaupunki vuodesta 1969 · 45 000 asukasta','d4ca366c-0472-4a4e-9be9-19819b7ab5ee','lohja-jarven-ja-harjun-kaupunki-visa','{"Sammatissa"}',true),
  ('maarianhamina','Maarianhamina','Maarianhaminassa','Maarianhaminasta','maarianhaminalaiset','Tuhannen lehmuksen kaupunki · perustettu 1861 · 12 000 asukasta','c84b1196-fd01-4c6a-93d9-62434be364c2','maarianhamina-ja-ahvenanmaa-itameren-saaristo-visa','{}',false),
  ('mikkeli','Mikkeli','Mikkelissä','Mikkelistä','mikkeliläiset','Päämajakaupunki · kaupunki vuodesta 1838 · 52 000 asukasta','bacef8c6-24f8-46ae-923d-58126a525438','paamajakaupungin-arvoitukset-mikkeli','{"Mikkelin maalaiskunnassa"}',true),
  ('naantali','Naantali','Naantalissa','Naantalista','naantalilaiset','Aurinkokaupunki · perustettu 1443 · 20 000 asukasta','86cd8d23-de42-40ff-8b73-632e09b30b4a','naantali-saaristokaupunki-turun-kupeessa-visa','{}',true),
  ('nurmijarvi','Nurmijärvi','Nurmijärvellä','Nurmijärveltä','nurmijärveläiset','Aleksis Kiven kotikunta · 45 000 asukasta','4d5d7d12-2c4f-4e74-8b62-83f5bfb377a8','nurmijarvi-kirjallinen-kunta-visa','{}',false),
  ('oulu','Oulu','Oulussa','Oulusta','oululaiset','Tervakaupunki · perustettu 1605 · 217 000 asukasta','ec898740-e4c1-4c96-999b-903fe8d0f8f0','oulu-tervan-tuoksua-merikosken-kohinaa','{"Haukiputaalla"}',true),
  ('pori','Pori','Porissa','Porista','porilaiset','Karhukaupunki · perustettu 1558 · 83 000 asukasta','8e9c2b2b-d813-49d2-b150-57eb2fe08ff3','pori-jazzia-dyyneja-karhun-katse','{}',true),
  ('porvoo','Porvoo','Porvoossa','Porvoosta','porvoolaiset','Suomen toiseksi vanhin kaupunki · perustettu 1346 · 52 000 asukasta','6e21a058-e7bf-46b1-8d8e-b7d24bd57339','porvoo-punaiset-aitat-historia-visa','{}',true),
  ('rauma','Rauma','Raumalla','Raumalta','raumalaiset','Pitsikaupunki · perustettu 1442 · 39 000 asukasta','8d455f09-8eb8-4235-a824-ea32a591c41d','rauma-pitsikaupunki-meren-rannalla-visa','{"Rauman maalaiskunnassa"}',true),
  ('rovaniemi','Rovaniemi','Rovaniemellä','Rovaniemeltä','rovaniemeläiset','Lapin pääkaupunki · kaupunki vuodesta 1960 · 66 000 asukasta','f5b35476-a896-4857-9fc9-54a29fcc2ab6','napapiirin-pintaa-syvemmalta-tentti','{}',true),
  ('salo','Salo','Salossa','Salosta','salolaiset','Elektroniikkakaupunki · kaupunki vuodesta 1960 · 50 000 asukasta','60d52d6c-5d4a-477c-8c8a-97fd0dfa2736','kannykkakaupungin-arvoitukset-salo','{}',true),
  ('savonlinna','Savonlinna','Savonlinnassa','Savonlinnasta','savonlinnalaiset','Saimaan pääkaupunki · perustettu 1639 · 31 000 asukasta','83c5ef71-9172-4c3e-8839-a23b882d541b','savonlinna-saimaan-paakaupunki-ja-sen-tarinat-visa','{}',false),
  ('seinajoki','Seinäjoki','Seinäjoella','Seinäjoelta','seinäjokiset','Lakeuden pääkaupunki · kaupunki vuodesta 1960 · 67 000 asukasta','f87f0c91-1888-4e9a-955f-898ac757dca4','seinajoki-avaruuden-paakaupungin-arvoitukset','{"Nurmossa","Peräseinäjoella"}',true),
  ('tampere','Tampere','Tampereella','Tampereelta','tamperelaiset','Manse · perustettu 1779 · 263 000 asukasta','edeef667-7478-4c97-835b-3316e992b6fc','tampere-visa-savupiippujen-kaupunki','{}',true),
  ('turku','Turku','Turussa','Turusta','turkulaiset','Suomen vanhin kaupunki · perustettu 1229 · 210 000 asukasta','c502252d-41eb-4e0c-8952-ec22d2176069','aurajoen-arvoitukset-turku-visa','{}',true),
  ('tuusula','Tuusula','Tuusulassa','Tuusulasta','tuusulalaiset','Kolmen keskuksen kunta · 42 000 asukasta','f83c11b9-88d0-481c-b147-59b4d614ceca','tuusula-kolmen-keskuksen-kunta-visa','{}',false),
  ('vaasa','Vaasa','Vaasassa','Vaasasta','vaasalaiset','Pohjanmaan pääkaupunki · perustettu 1606 · 71 000 asukasta','ac904905-ce46-4e47-a0e8-9798aea9344a','vaasa-lyhteen-kaupunki-tietovisa','{}',true),
  ('vantaa','Vantaa','Vantaalla','Vantaalta','vantaalaiset','Lentokenttäkaupunki · kaupunki vuodesta 1974 · 253 000 asukasta','17a4c40c-2c2f-4c3c-a5e7-5ad7e3b43d86','vantaa-kehakolmosen-kuningaskunta','{"Helsingin maalaiskunnassa"}',true)
)
insert into public.kaupungit (slug, nimi, inessiivi, elatiivi, asukasnimitys, korttinimi, kaupunkivisa_quiz_id, tunnusrivi, hero_kuva, vaakuna_url, vanhat_kunnat, julkaistu)
select d.slug, d.nimi, d.inessiivi, d.elatiivi, d.asukasnimitys, d.nimi, q.id, d.tunnusrivi, q.hero_image, k.image_url, d.vanhat, d.julkaistu
from d
left join public.quizzes q on q.slug = d.visa
left join public.kuvavisas k on k.id = d.vaakuna_id::uuid
on conflict (slug) do nothing;

-- Paikkakunnat: (a) kaupunkivisat omalle kaupungilleen, (b) tunturikohteet kotikunnalleen.
update public.quizzes q set paikkakunnat = array[k.slug]
from public.kaupungit k where k.kaupunkivisa_quiz_id = q.id and q.paikkakunnat is null;

with t(slug, pk) as (values
  ('levi-tunturikeskus-visa', array['kittila']),
  ('ruka-tunturi-kosket-ja-tarinat', array['kuusamo']),
  ('saariselka-tunturit-ja-tarinat', array['inari']),
  ('yllas-tunturin-kylien-ja-rajajoen-tarinoita', array['kolari']),
  ('vuokatti-vaarat-jarvet-urheilu', array['sotkamo']),
  -- (c) linkitystaulukko (KAUPUNGIT_DATA_2026_11_07.md) + Suomen kolme legendaarista linnaa (Heikki 7.11.: linnat kyllä, yhtyeet ei)
  ('suomen-vanhat-kaupungit-visa', array['turku','porvoo','rauma','naantali']),
  ('suomen-kolme-legendaarista-linnaa', array['turku','hameenlinna','savonlinna']),
  ('suomenlinna-visa', array['helsinki']),
  ('hifk-helsinki-punavalkoiset-tietovisa', array['helsinki']),
  ('jokerit-helsinki-liigahistoria-tietovisa', array['helsinki']),
  ('hpk-rinkelinmaen-ritarit-tietovisa', array['hameenlinna']),
  ('imatran-kettera', array['imatra']),
  ('jyp-hippoksen-hurmaa-tietovisa', array['jyvaskyla']),
  ('kiekko-espoo-tuhkasta-liigaan-tietovisa', array['espoo']),
  ('kiekko-vantaa', array['vantaa']),
  ('kookoo-kiekko-kimpassa-tietovisa', array['kouvola']),
  ('kalpa-niiralan-montun-kovin-tietovisa', array['kuopio']),
  ('pelicans-kolme-kertaa-hopealla-tietovisa', array['lahti']),
  ('saipa-saimaan-syketta-tietovisa', array['lappeenranta']),
  ('jukurit-sisasavolaista-sisua-tietovisa', array['mikkeli']),
  ('karpat-tietovisa-legendat', array['oulu']),
  ('assat-isomaen-ukkoset-tietovisa', array['pori']),
  ('rauman-lukko-visa', array['rauma']),
  ('rovaniemen-kiekko-roki', array['rovaniemi']),
  ('sm-liiga-satakunnan-derby-assat-lukko', array['pori','rauma']),
  ('sm-liiga-stadin-derby-hifk-jokerit', array['helsinki']),
  ('ilves-tampere-keltamustat-tietovisa', array['tampere']),
  ('tappara-tampere-kirvesrinnat-tietovisa', array['tampere']),
  ('sm-liiga-tampereen-derby-ilves-tappara', array['tampere']),
  ('tps-turku-jaakiekko-tietovisa', array['turku']),
  ('turun-tuto-hockey', array['turku']),
  ('sport-punavalkoinen-tarina-tietovisa', array['vaasa']),
  ('lohjan-joulu-menneen-ajan-joulumarkkinat', array['lohja']),
  ('runebergin-paiva-ja-porvoo', array['porvoo']),
  ('popeda-visa-manserock', array['tampere']),
  ('elaintarhan-ajot', array['helsinki']),
  ('suomalaiset-euroopassa-hjk', array['helsinki']),
  ('helsingin-olympiastadion', array['helsinki']),
  ('joensuun-kataja', array['joensuu']),
  ('suomen-mm-ralli-jyvaskyla', array['jyvaskyla']),
  ('kokkolan-tiikerit', array['kokkola']),
  ('kotkan-ktp-basket', array['kotka']),
  ('kouvolan-kouvot', array['kouvola']),
  ('porvoon-akilles', array['porvoo']),
  ('salon-vilpas', array['salo']),
  ('seinajoen-peliveljet-spv', array['seinajoki']),
  ('tampereen-classic', array['tampere']),
  ('tapiolan-honka', array['espoo'])
)
update public.quizzes q set paikkakunnat = t.pk from t where q.slug = t.slug and q.paikkakunnat is null;
