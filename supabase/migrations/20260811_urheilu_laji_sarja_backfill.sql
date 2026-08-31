-- URHEILUN LAJI + SARJA -BACKFILL (Heikki hyväksyi luokittelun 11.8.2026)
-- Malli: laji -> quizzes.genre, sarja/kilpailu -> quizzes.subcollection
-- (sama mekanismi kuin TV-genreissä ja Historian aikakausissa).
-- Periaate: "sarja ei korvaa lajia" — Arsenal löytyy sekä Jalkapallo-
-- suodattimella että Valioliiga-sarjasta. Slug-pohjaiset päivitykset:
-- Heikin poistama Bournemouth-duplikaatti ei haittaa (ei osumaa).
-- Hull City ja Coventry City kuuluvat Valioliigaan (Heikki vahvisti:
-- pelaavat Valioliigassa tällä kaudella).

-- Lajit genres-tauluun (suodatinlabelit datasta, kuten TV:llä)
INSERT INTO genres (collection, genre_key, label, sort_order) VALUES
  ('urheilu', 'jalkapallo',      'Jalkapallo',      1),
  ('urheilu', 'jaakiekko',       'Jääkiekko',       2),
  ('urheilu', 'moottoriurheilu', 'Moottoriurheilu', 3),
  ('urheilu', 'tennis',          'Tennis',          4),
  ('urheilu', 'golf',            'Golf',            5),
  ('urheilu', 'muut',            'Muut',            6)
ON CONFLICT DO NOTHING;

-- Jalkapallo / Valioliiga (25)
UPDATE quizzes SET genre = 'jalkapallo', subcollection = 'valioliiga' WHERE slug IN (
  'arsenal-fc-legendat',
  'aston-villa-legendat',
  'liverpool-fc-legendat',
  'manchester-united-seuravisa',
  'newcastle-united-legendat',
  'afc-bournemouth-etelarannikon-selviytyja',
  'afc-bournemouth-kirsikoiden-visa',
  'brentford-pieni-pesa-kova-surina',
  'brighton-hove-albion-lokkien-lento-visa',
  'chelsea-fc-sinisten-syvin-arkisto-vaikea-visa',
  'coventry-city-pusb-visa',
  'crystal-palace-etela-lontoon-ylpeys-visa',
  'everton-fc-nil-satis-nisi-optimum-visa',
  'fulham-fc-mokin-mestarit-visa',
  'hull-city-meripihkan-ja-mustan-raidat-visa',
  'ipswich-town-suffolkin-sinipaidat-visa',
  'leeds-united-valkoinen-sota-visa',
  'manchester-city-taivaansininen-imperiumi-visa',
  'nottingham-forest-garibaldin-punainen-visa',
  'sunderland-afc-wearin-punavalkoiset-raidat-visa',
  'tottenham-hotspur-uskaltaa-on-tehda-visa',
  'suomalaiset-valioliigassa-sisu-visa',
  'valioliigan-derbyvisa-verivihollisten-kartasto-vaikea',
  'valioliigan-ennatysvisa-numerot-eivat-valehtele',
  'valioliigan-valmentajavisa-sivurintaman-nerot-vaikea'
);

-- Jalkapallo / Maajoukkueet (9)
UPDATE quizzes SET genre = 'jalkapallo', subcollection = 'maajoukkueet' WHERE slug IN (
  'belgian-punaiset-paholaiset',
  'brasilian-maajoukkue-jalkapallo',
  'englannin-maajoukkue-jalkapallo',
  'espanja-la-roja-jalkapallomaajoukkue',
  'argentiina-jalkapallo',
  'norjan-maajoukkue-jalkapallo',
  'portugali-maajoukkue-jalkapallo',
  'les-bleus-ranskan-jalkapallomaajoukkue',
  'huuhkajat-historia'
);

-- Jalkapallo / Arvokisat (4)
UPDATE quizzes SET genre = 'jalkapallo', subcollection = 'arvokisat' WHERE slug IN (
  'italia-1990-mm-kisat',
  'jalkapallon-mm-kisat-2026',
  'mm-finaalit-jalkapallo',
  'mm-kisat-saksassa-2006'
);

-- Jalkapallo / Mestarien liiga (1)
UPDATE quizzes SET genre = 'jalkapallo', subcollection = 'mestarien-liiga'
WHERE slug = 'mestarien-liiga-tietovisa';

-- Jääkiekko / Liiga (2)
UPDATE quizzes SET genre = 'jaakiekko', subcollection = 'liiga' WHERE slug IN (
  'sm-liiga-tietovisa',
  'rauman-lukko-visa'
);

-- Jääkiekko / Arvokisat (1)
UPDATE quizzes SET genre = 'jaakiekko', subcollection = 'arvokisat'
WHERE slug = 'leijonat-kultaa-mm-kisojen-parhaat-hetket';

-- Jääkiekko / Maajoukkueet (2)
UPDATE quizzes SET genre = 'jaakiekko', subcollection = 'maajoukkueet' WHERE slug IN (
  'saksan-jaakiekkomaajoukkue',
  'curre-lindstrom-poppamies-puntarissa'
);

-- Moottoriurheilu (3)
UPDATE quizzes SET genre = 'moottoriurheilu', subcollection = 'formula-1'
WHERE slug = 'formula-1-tiedatko-f1n-perusteet';
UPDATE quizzes SET genre = 'moottoriurheilu', subcollection = 'ralli'
WHERE slug = 'suomen-mm-ralli-jyvaskyla';
UPDATE quizzes SET genre = 'moottoriurheilu', subcollection = 'suomalaiset-klassikot'
WHERE slug = 'elaintarhan-ajot';

-- Tennis (2): US Open sarjaan, Federer ilman sarjaa (henkilövisa)
UPDATE quizzes SET genre = 'tennis', subcollection = 'grand-slam'
WHERE slug = 'us-open-tennis-visa';
UPDATE quizzes SET genre = 'tennis', subcollection = NULL
WHERE slug = 'roger-federer-tennislegenda';

-- Golf (1)
UPDATE quizzes SET genre = 'golf', subcollection = 'major'
WHERE slug = 'the-open-golfin-vanhin-major';

-- Muut (1): Olympiastadion — paikka/historia, ei sarjaa
UPDATE quizzes SET genre = 'muut', subcollection = NULL
WHERE slug = 'helsingin-olympiastadion';
