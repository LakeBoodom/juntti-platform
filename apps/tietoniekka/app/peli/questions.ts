/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — Peli-kysymysdata
   v1: hardcoded placeholderit jokaiselle quiz-tyypille.
   Korvataan myöhemmin Supabase-hakulla admin-toolista.
   ───────────────────────────────────────────────────────────────── */

export type Question = {
  question: string;
  options: [string, string, string, string];
  correct: string;            // tulee olla yksi options-listan jäsen
  fact: string;
  image?: string;             // kuvavisalle URL
};

export type QuizConfig = {
  id: string;                 // route-tunniste (esim. "kat:urheilu")
  title: string;              // näkyy intro-screenissä isolla
  intro: string;              // intro-tekstinä
  questions: Question[];
  isImageQuiz?: boolean;      // näytetään flag-stage / kuvalaatikko
};

/* ─── PÄIVÄN VISA ─────────────────────────────────────────────── */
const paivanVisa: QuizConfig = {
  id: "paivan_visa",
  title: "PÄIVÄN VISA",
  intro: "Viisi kysymystä Suomesta — pärjäätkö sinä?",
  questions: [
    {
      question: "Mikä on Suomen pisin joki?",
      options: ["Tornionjoki", "Kemijoki", "Oulujoki", "Vantaanjoki"],
      correct: "Kemijoki",
      fact: "Kemijoki on 550 km pitkä — pisin Suomessa virtaava joki.",
    },
    {
      question: "Mikä on Suomen korkein tunturi?",
      options: ["Ylläs", "Pallastunturi", "Halti", "Saana"],
      correct: "Halti",
      fact: "Haltin korkein huippu on 1324 m mpy. Korkein piste sijaitsee tosin Norjan puolella.",
    },
    {
      question: "Mikä on Suomen kansalliseläin?",
      options: ["Karhu", "Hirvi", "Joutsen", "Saimaannorppa"],
      correct: "Karhu",
      fact: "Karhu valittiin Suomen kansalliseläimeksi vuonna 2002 yleisöäänestyksellä.",
    },
    {
      question: "Minä vuonna Suomi liittyi EU:hun?",
      options: ["1992", "1995", "1999", "2002"],
      correct: "1995",
      fact: "Suomi liittyi EU:hun 1.1.1995 — samana päivänä kuin Ruotsi ja Itävalta.",
    },
    {
      question: "Mikä on Suomen pisin järvi?",
      options: ["Päijänne", "Saimaa", "Inari", "Oulujärvi"],
      correct: "Päijänne",
      fact: "Päijänne on noin 120 km pitkä — Suomen pisin järvi mitattuna pohjoisesta etelään.",
    },
  ],
};

/* ─── PINNALLA NYT — event-quizit ─────────────────────────────── */
const eventVappu: QuizConfig = {
  id: "event:vappu",
  title: "VAPPU",
  intro: "Sima maistuu, simulaattori auki — mitä tiedät vapusta?",
  questions: [
    {
      question: "Mistä kaupungista suomalainen vappuperinne — haalarit ja lakki — sai alkunsa?",
      options: ["Helsinki", "Turku", "Tampere", "Jyväskylä"],
      correct: "Helsinki",
      fact: "Vappuna lakitettiin ensimmäisen kerran Helsingin Havis Amandan patsas vuonna 1932.",
    },
    {
      question: "Minä päivänä vapun aattoa Suomessa juhlitaan?",
      options: ["29.4.", "30.4.", "1.5.", "2.5."],
      correct: "30.4.",
      fact: "Vapun aatto on 30.4. — alunperin Walpurgis-päivä, joka sai nimensä pyhän Walburgan mukaan.",
    },
    {
      question: "Mistä raaka-aineista perinteinen sima valmistetaan?",
      options: ["Vesi, sokeri, sitruuna, hiiva", "Mehu, pussi, ja sokeri", "Mallasuute, vesi, hiiva", "Olut, sokeri, sitruuna"],
      correct: "Vesi, sokeri, sitruuna, hiiva",
      fact: "Sima käy hiivan avulla parissa päivässä. Rusinat astian pohjalle kertovat kun sima on valmis — ne nousevat pintaan.",
    },
    {
      question: "Mikä juhla-ruoka kuuluu vappuun ennen muuta?",
      options: ["Mämmi", "Tippaleipä", "Pulla", "Munkki"],
      correct: "Tippaleipä",
      fact: "Tippaleipä ja munkki ovat klassisia vappuherkkuja. Tippaleipää on tehty Suomessa 1800-luvulta lähtien.",
    },
    {
      question: "Kuinka monta kertaa vuosittain Helsingissä lakitetaan Havis Amanda?",
      options: ["Kerran (vapunaattona)", "Kahdesti (1.5. ja 30.4.)", "Joka pyhä", "Vain itsenäisyyspäivänä"],
      correct: "Kerran (vapunaattona)",
      fact: "Havis Amanda lakitetaan kerran vuodessa — vapunaattona klo 18, teekkareiden toimesta.",
    },
  ],
};

const eventJaakiekkoMM: QuizConfig = {
  id: "event:jaakiekko_mm",
  title: "JÄÄKIEKON MM",
  intro: "Lopulta kentällä taas — mitä tiedät MM-kisoista?",
  questions: [
    {
      question: "Kuinka monta kertaa Suomi on voittanut jääkiekon MM-kultaa?",
      options: ["2", "3", "4", "5"],
      correct: "4",
      fact: "Suomi on voittanut MM-kultaa neljästi: 1995, 2011, 2019 ja 2022. Lisäksi olympia-kultaa 2022.",
    },
    {
      question: "Kuka oli Suomen päävalmentaja MM-kultaan 2022?",
      options: ["Erkka Westerlund", "Jukka Jalonen", "Kari Jalonen", "Lauri Marjamäki"],
      correct: "Jukka Jalonen",
      fact: "Jukka Jalonen on voittanut päävalmentajana 3 MM-kultaa Suomelle — 2011, 2019 ja 2022.",
    },
    {
      question: "Kuka maalasi voittomaalin MM-finaalissa 1995?",
      options: ["Saku Koivu", "Ville Peltonen", "Esa Keskinen", "Jere Lehtinen"],
      correct: "Ville Peltonen",
      fact: "Ville Peltonen teki hat-trickin Tukholman MM-finaalissa Ruotsia vastaan — ja toi Suomelle ensimmäisen MM-kullan.",
    },
    {
      question: "Missä kaupungissa pelataan vuoden 2026 MM-kisat?",
      options: ["Tukholma", "Riika", "Praha", "Zürich"],
      correct: "Zürich",
      fact: "MM-2026 kisataan Sveitsissä, Zürichissä ja Friburgissa toukokuussa.",
    },
    {
      question: "Kuka on Suomen kaikkien aikojen MM-pistepörssin kärjessä?",
      options: ["Saku Koivu", "Teemu Selänne", "Jari Kurri", "Ville Peltonen"],
      correct: "Saku Koivu",
      fact: "Saku Koivu on Suomen MM-historian piste-ennätyksen haltija (huom: päivittyy aina kausittain).",
    },
  ],
};

const eventEuroviisut: QuizConfig = {
  id: "event:euroviisut",
  title: "EUROVIISUT",
  intro: "Twelve points to Finland! Mitä tiedät euroviisuista?",
  questions: [
    {
      question: "Kuka voitti Eurovision Suomelle vuonna 2006?",
      options: ["Lordi", "Krista Siegfrids", "Saara Aalto", "Pertti Kurikan Nimipäivät"],
      correct: "Lordi",
      fact: "Lordi voitti 'Hard Rock Hallelujah' -kappaleellaan ennätyspisteillä — Suomen ainoa Eurovision-voitto.",
    },
    {
      question: "Mistä maasta tulee Eurovision Song Contest alkujaan?",
      options: ["Iso-Britannia", "Sveitsi", "Saksa", "Ruotsi"],
      correct: "Sveitsi",
      fact: "Ensimmäiset Euroviisut järjestettiin Luganossa, Sveitsissä, vuonna 1956.",
    },
    {
      question: "Kuka edusti Suomea Eurovisioissa vuonna 2024?",
      options: ["Käärijä", "Erika Vikman", "Windows95Man", "Blind Channel"],
      correct: "Windows95Man",
      fact: "Windows95Man esitti 'No Rules!' -kappaleen ja kohautti yleisöä esitystyylillään.",
    },
    {
      question: "Kuinka monta finaalipistettä Käärijä sai Eurovisioissa 2023?",
      options: ["376", "440", "526", "583"],
      correct: "526",
      fact: "Käärijän 'Cha Cha Cha' sai 526 pistettä ja yleisöäänestyksen voitto — mutta tuomarit kallistivat voiton Loreenelle.",
    },
    {
      question: "Mikä on Eurovision-tunnusmusiikin nimi?",
      options: ["Te Deum", "Aida", "Carmen", "Boléro"],
      correct: "Te Deum",
      fact: "Marc-Antoine Charpentier'n 'Te Deum' (1690) on toiminut Eurovisionin tunnusmusiikkina alusta asti.",
    },
  ],
};

/* ─── PÄIVÄN SANKARI — Iina Kuustonen -placeholderit ────────── */
const paivanSankari: QuizConfig = {
  id: "paivan_sankari",
  title: "TUNNE PÄIVÄN SANKARI",
  intro: "Iina Kuustonen täyttää tänään 42 vuotta. Tunnetko sinä hänet?",
  questions: [
    {
      question: "Kuinka vanha Iina Kuustonen täyttää tänään?",
      options: ["40", "42", "44", "46"],
      correct: "42",
      fact: "Iina Kuustonen syntyi 19.4.1984 — täyttää siis 42 vuotta.",
    },
    {
      question: "Missä TV-sarjassa Iina Kuustonen näytteli pääosaa 2010-luvulla?",
      options: ["Putous", "Pasila", "Karjalan kunnailla", "Nyrkki"],
      correct: "Nyrkki",
      fact: "Iina Kuustonen näytteli pääosaa C More -sarjassa Nyrkki (2017–2019).",
    },
    {
      question: "Mistä elokuvasta Iina Kuustonen sai Jussi-ehdokkuuden?",
      options: ["Napapiirin sankarit", "Tuntematon sotilas", "Kaikella rakkaudella", "Toiset tytöt"],
      correct: "Toiset tytöt",
      fact: "Iina sai Jussi-ehdokkuuden Toiset tytöt -elokuvassa (2015) parhaasta sivuosasta.",
    },
    {
      question: "Missä kaupungissa Iina Kuustonen syntyi?",
      options: ["Helsinki", "Tampere", "Turku", "Lahti"],
      correct: "Tampere",
      fact: "Iina Kuustonen syntyi Tampereella — perheessä, jossa molemmat vanhemmat olivat näyttelijöitä.",
    },
    {
      question: "Kenen tunnetun näyttelijän tytär Iina Kuustonen on?",
      options: ["Vesa-Matti Loiri", "Kari Heiskanen", "Esko Salminen", "Heikki Kinnunen"],
      correct: "Kari Heiskanen",
      fact: "Iina on näyttelijä Kari Heiskasen tytär. Suvun näyttelijäperinne jatkuu kolmannessa polvessa.",
    },
  ],
};

/* ─── KATEGORIAT (8 kpl) — placeholderit per kategoria ────────── */
const katUrheilu: QuizConfig = {
  id: "kat:urheilu",
  title: "URHEILU",
  intro: "Jääkiekko, jalkapallo, yleisurheilu — Suomen urheilun huippuhetket.",
  questions: [
    {
      question: "Kuinka monta kertaa Suomi on voittanut jääkiekon MM-kultaa?",
      options: ["4", "3", "5", "2"],
      correct: "4",
      fact: "Suomi: 1995, 2011, 2019 ja 2022 — neljä MM-kultaa.",
    },
    {
      question: "Kuka on Suomen kaikkien aikojen olympiamitalisti määrällisesti?",
      options: ["Paavo Nurmi", "Lasse Virén", "Hannes Kolehmainen", "Ville Ritola"],
      correct: "Paavo Nurmi",
      fact: "Paavo Nurmi voitti 9 olympiakultaa ja 3 hopeaa — yhteensä 12 mitalia.",
    },
    {
      question: "Mikä on Suomen jalkapallomaajoukkueen historian suurin saavutus?",
      options: ["EM-kisat 2020", "MM-välierä 1962", "Olympiakulta 1912", "EM-pronssi 1988"],
      correct: "EM-kisat 2020",
      fact: "Huuhkajat selvisivät EM-kisoihin 2020 — ensimmäinen arvokisapaikka koskaan.",
    },
    {
      question: "Mikä urheilulaji on Suomen kansallisurheilu?",
      options: ["Hiihto", "Pesäpallo", "Jääkiekko", "Yleisurheilu"],
      correct: "Pesäpallo",
      fact: "Pesäpallo on Suomen kansallispeli — kehittäjänsä Lauri Pihkalan luomus 1920-luvulta.",
    },
    {
      question: "Kuinka monta olympiakultaa Lasse Virén voitti uransa aikana?",
      options: ["2", "3", "4", "5"],
      correct: "4",
      fact: "Lasse Virén voitti 4 olympiakultaa: 5000m ja 10000m sekä Münchenissä 1972 että Montrealissa 1976.",
    },
  ],
};

const katMaantieto: QuizConfig = {
  id: "kat:maantieto",
  title: "MAANTIETO",
  intro: "Suomi, Eurooppa, maailma — kuinka hyvin tunnet maailman?",
  questions: [
    {
      question: "Mikä on Suomen suurin järvi pinta-alaltaan?",
      options: ["Päijänne", "Saimaa", "Inarijärvi", "Oulujärvi"],
      correct: "Saimaa",
      fact: "Saimaa on noin 4400 km² — Suomen ja Euroopan neljänneksi suurin järvi.",
    },
    {
      question: "Mikä on Australian pääkaupunki?",
      options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
      correct: "Canberra",
      fact: "Canberra valittiin pääkaupungiksi 1908 kompromissina Sydneyn ja Melbournen välillä.",
    },
    {
      question: "Mikä joki virtaa Lontoon halki?",
      options: ["Seine", "Themse", "Reini", "Tonava"],
      correct: "Themse",
      fact: "Themse on Englannin pisin joki ja Lontoo on rakennettu sen rannoille.",
    },
    {
      question: "Mikä on maailman korkein vuori?",
      options: ["K2", "Mount Everest", "Kanchenjunga", "Lhotse"],
      correct: "Mount Everest",
      fact: "Mount Everest on 8848,86 m korkea — maapallon korkein huippu Himalajassa.",
    },
    {
      question: "Mikä on Etelä-Amerikan suurin maa pinta-alaltaan?",
      options: ["Argentiina", "Brasilia", "Peru", "Kolumbia"],
      correct: "Brasilia",
      fact: "Brasilia kattaa noin 47 % Etelä-Amerikan pinta-alasta — yli 8,5 miljoonaa km².",
    },
  ],
};

const katLuonto: QuizConfig = {
  id: "kat:luonto",
  title: "LUONTO",
  intro: "Suomen luonnon ihmeet ja eläimet — testaa eräjormasi.",
  questions: [
    {
      question: "Mikä on Suomen kansalliseläin?",
      options: ["Karhu", "Ahma", "Hirvi", "Joutsen"],
      correct: "Karhu",
      fact: "Karhu valittiin kansalliseläimeksi vuonna 2002.",
    },
    {
      question: "Mikä on Suomen kansalliskukka?",
      options: ["Ruusu", "Kanerva", "Kielo", "Voikukka"],
      correct: "Kielo",
      fact: "Kielo valittiin Suomen kansalliskukaksi vuonna 1967.",
    },
    {
      question: "Kuinka monta saarta Saimaalla on?",
      options: ["~3 000", "~7 000", "~13 000", "~25 000"],
      correct: "~13 000",
      fact: "Saimaalla on noin 13 700 saarta — Euroopan suurin sisäjärvialue.",
    },
    {
      question: "Mikä on Suomen yleisin metsäpuu?",
      options: ["Mänty", "Kuusi", "Koivu", "Haapa"],
      correct: "Mänty",
      fact: "Männyt muodostavat noin 50 % Suomen metsien runkotilavuudesta.",
    },
    {
      question: "Mikä Suomen kansallispuisto on suurin?",
      options: ["Urho Kekkosen kansallispuisto", "Lemmenjoen kansallispuisto", "Pallas–Yllästunturi", "Oulanka"],
      correct: "Lemmenjoen kansallispuisto",
      fact: "Lemmenjoen kansallispuisto on 2860 km² — Suomen suurin ja Euroopan toiseksi suurin.",
    },
  ],
};

const katHistoria: QuizConfig = {
  id: "kat:historia",
  title: "HISTORIA",
  intro: "Tapahtumat jotka muokkasivat aikaansa — ja meidän tämän päivän.",
  questions: [
    {
      question: "Minä vuonna Suomi itsenäistyi?",
      options: ["1906", "1917", "1918", "1944"],
      correct: "1917",
      fact: "Eduskunta hyväksyi itsenäisyysjulistuksen 6.12.1917.",
    },
    {
      question: "Kuka oli Suomen ensimmäinen presidentti?",
      options: ["P. E. Svinhufvud", "K. J. Ståhlberg", "Risto Ryti", "Lauri Kr. Relander"],
      correct: "K. J. Ståhlberg",
      fact: "K. J. Ståhlberg toimi Suomen ensimmäisenä presidenttinä 1919–1925.",
    },
    {
      question: "Milloin talvisota alkoi?",
      options: ["1.9.1939", "30.11.1939", "13.3.1940", "25.6.1941"],
      correct: "30.11.1939",
      fact: "Neuvostoliitto hyökkäsi Suomeen 30.11.1939 — talvisota kesti 105 päivää.",
    },
    {
      question: "Kuka keksi sähkölampun?",
      options: ["Nikola Tesla", "Thomas Edison", "Alessandro Volta", "Michael Faraday"],
      correct: "Thomas Edison",
      fact: "Edison patentoi käyttökelpoisen hehkulampun 1879 — käytännön valaistuksen kulmakivi.",
    },
    {
      question: "Minä vuonna Berliinin muuri kaatui?",
      options: ["1985", "1989", "1991", "1993"],
      correct: "1989",
      fact: "Berliinin muuri murtui 9.11.1989 — kylmän sodan loppumisen symboli.",
    },
  ],
};

const katTvSarjat: QuizConfig = {
  id: "kat:tv-sarjat",
  title: "TV-SARJAT",
  intro: "Klassikot, uutuudet, kulttisarjat — kuinka tarkasti katsot?",
  questions: [
    {
      question: "Mikä on Suomen pitkäikäisin kotimainen TV-sarja?",
      options: ["Salatut elämät", "Kotikatu", "Hovimäki", "Reinikainen"],
      correct: "Salatut elämät",
      fact: "Salatut elämät alkoi MTV3:lla 25.1.1999 — pyörinyt yli 25 vuotta.",
    },
    {
      question: "Missä kaupungissa Reinikainen-sarja sijoittuu?",
      options: ["Helsinki", "Tampere", "Lahti", "Turku"],
      correct: "Helsinki",
      fact: "Reinikainen (1982–1989) sijoittui Helsingin Käpylään ja kuvasi keskituloista perhe-elämää.",
    },
    {
      question: "Kuka näytteli Tuomas Hentun roolin Salatuissa elämissä?",
      options: ["Jasper Pääkkönen", "Pekka Strang", "Mikko Leppilampi", "Antti Reini"],
      correct: "Jasper Pääkkönen",
      fact: "Jasper Pääkkönen näytteli Tuomas Henttua 1999-2003 ja teki sarjasta läpimurtoroolinsa.",
    },
    {
      question: "Mikä TV-sarja sai Emmy-palkinnon kuvauksesta vuonna 2019?",
      options: ["Game of Thrones", "Stranger Things", "Bodyguard", "Pose"],
      correct: "Game of Thrones",
      fact: "GoT voitti Outstanding Drama Series Emmyn 4 kertaa, viimeksi 2019.",
    },
    {
      question: "Mikä on Twin Peaksin tekijän nimi?",
      options: ["David Lynch", "David Fincher", "Quentin Tarantino", "Christopher Nolan"],
      correct: "David Lynch",
      fact: "David Lynch ja Mark Frost loivat Twin Peaksin 1990 — surrealismin merkkipaalu TV:ssä.",
    },
  ],
};

const katElokuvat: QuizConfig = {
  id: "kat:elokuvat",
  title: "ELOKUVAT",
  intro: "Kotimainen, Hollywood, Eurooppa — kuka teki ja milloin?",
  questions: [
    {
      question: "Kuka ohjasi Tuntemattoman sotilaan vuoden 2017 versiossa?",
      options: ["Aki Kaurismäki", "Aku Louhimies", "Klaus Härö", "Jalmari Helander"],
      correct: "Aku Louhimies",
      fact: "Aku Louhimies ohjasi 2017-version, joka rikkoi suomalaisen elokuvan katsojaennätyksiä.",
    },
    {
      question: "Mikä elokuva voitti Oscar-palkinnon parhaana elokuvana 1994?",
      options: ["Forrest Gump", "Pulp Fiction", "Schindler's List", "Lion King"],
      correct: "Forrest Gump",
      fact: "Forrest Gump voitti 6 Oscaria — paras elokuva, ohjaaja, miespääosa, käsikirjoitus, leikkaus, efektit.",
    },
    {
      question: "Mikä on Aki Kaurismäen ohjaama elokuva?",
      options: ["Tulitikkutehtaan tyttö", "Kuolleet lehdet", "Mies vailla menneisyyttä", "Kaikki edellä mainitut"],
      correct: "Kaikki edellä mainitut",
      fact: "Kaurismäki on ohjannut yli 20 elokuvaa — kaikki kolme mainittua kuuluvat hänen tuotantoonsa.",
    },
    {
      question: "Mikä on kaikkien aikojen tuottoisin elokuva (lipunmyynti)?",
      options: ["Avatar (2009)", "Avengers: Endgame", "Titanic", "Avatar: The Way of Water"],
      correct: "Avatar (2009)",
      fact: "Avatar (2009) ohitti Avengers: Endgamein uudelleenjulkaisun jälkeen — yli 2,9 mrd USD.",
    },
    {
      question: "Kuka näytteli pääosaa Mies vailla menneisyyttä -elokuvassa?",
      options: ["Markku Peltola", "Kati Outinen", "Matti Pellonpää", "Sakari Kuosmanen"],
      correct: "Markku Peltola",
      fact: "Markku Peltola sai Cannesin parhaan miespääosan kunniamaininnan 2002.",
    },
  ],
};

const katMusiikki: QuizConfig = {
  id: "kat:musiikki",
  title: "MUSIIKKI",
  intro: "Hitit, klassikot, artistit — kuka lauloi minkä ja milloin?",
  questions: [
    {
      question: "Kuka voitti Eurovision Suomelle 2006?",
      options: ["Lordi", "Krista Siegfrids", "Saara Aalto", "Pertti Kurikka"],
      correct: "Lordi",
      fact: "Lordi voitti 'Hard Rock Hallelujah' -kappaleellaan ennätyspisteillä.",
    },
    {
      question: "Mikä yhtye lauloi 'Bohemian Rhapsody'?",
      options: ["Led Zeppelin", "Queen", "Pink Floyd", "The Who"],
      correct: "Queen",
      fact: "Bohemian Rhapsody julkaistiin 1975 — yli 6 minuuttia kestävä rock-oopperasta klassikko.",
    },
    {
      question: "Kuka on suomalaisen iskelmän 'Rentun ruusu' -hitin esittäjä?",
      options: ["Olavi Virta", "Irwin Goodman", "Juha Vainio", "Topi Sorsakoski"],
      correct: "Irwin Goodman",
      fact: "Irwin Goodman teki 'Rentun ruusu' -kappaleesta klassikon 1972.",
    },
    {
      question: "Mistä maasta yhtye ABBA on?",
      options: ["Norja", "Tanska", "Ruotsi", "Suomi"],
      correct: "Ruotsi",
      fact: "ABBA voitti Eurovision 1974 'Waterloo'-kappaleellaan — Brightonista ympäri maailman.",
    },
    {
      question: "Mikä on Suomen kansallislaulu?",
      options: ["Maamme", "Finlandia-hymni", "Kullervo", "Suomis sång"],
      correct: "Maamme",
      fact: "Maamme — Vårt land — sävellettiin 1848. Sanat Runeberg, sävel Pacius.",
    },
  ],
};

const katRuokaJuoma: QuizConfig = {
  id: "kat:ruoka-juoma",
  title: "RUOKA & JUOMA",
  intro: "Mitä syömme ja miksi — perinteistä ja uudesta keittiöstä.",
  questions: [
    {
      question: "Mikä on klassinen pääsiäisruoka Suomessa?",
      options: ["Mämmi", "Karjalanpiirakka", "Mustamakkara", "Lanttulaatikko"],
      correct: "Mämmi",
      fact: "Mämmi on ruisjauho-mallasleivos joka kuuluu pääsiäispöytään. Tarjoillaan kerman ja sokerin kanssa.",
    },
    {
      question: "Mikä juoma on perinteinen vapunjuoma Suomessa?",
      options: ["Sahti", "Sima", "Mehu", "Kalja"],
      correct: "Sima",
      fact: "Sima käy hiivan avulla — sokeri, sitruuna ja vesi muutamassa päivässä.",
    },
    {
      question: "Mistä raaka-aineesta karjalanpiirakka tehdään perinteisesti?",
      options: ["Pelkkä ruisjauho", "Ohrajauho", "Vehnäjauho", "Tattarijauho"],
      correct: "Pelkkä ruisjauho",
      fact: "Karjalanpiirakan pohja on perinteisesti pelkkää ruisjauhoa ja vettä — sisus täytetään riisipuurolla.",
    },
    {
      question: "Mikä on Tampereen perinneruoka?",
      options: ["Mustamakkara", "Kalakukko", "Räkä-mäti", "Lapskoussi"],
      correct: "Mustamakkara",
      fact: "Mustamakkara on Tampereen ikoninen erikoisuus — verimakkara joka tarjoillaan puolukkahillon kanssa.",
    },
    {
      question: "Mikä viljakasvi on Suomen viljelyhistorian vanhin?",
      options: ["Kaura", "Vehnä", "Ruis", "Ohra"],
      correct: "Ohra",
      fact: "Ohraa on viljelty Suomessa noin 4000 vuoden ajan — vanhin viljelykasvi.",
    },
  ],
};

/* ─── KUVAVISA ────────────────────────────────────────────────── */
const lippuvisa: QuizConfig = {
  id: "kuvavisa:liput",
  title: "LIPPUVISA",
  intro: "Seitsemän kysymystä, 20 sekuntia per lippu. Nopea vastaus = bonuspisteet.",
  isImageQuiz: true,
  questions: [
    {
      question: "Minkä maan lippu?",
      image: "https://flagcdn.com/jm.svg",
      options: ["Senegal", "Jordania", "Jamaika", "Montenegro"],
      correct: "Jamaika",
      fact: "Jamaikan lippu hyväksyttiin 1962 — yksi harvoja, jossa ei ole punaista, valkoista eikä sinistä.",
    },
    {
      question: "Minkä maan lippu?",
      image: "https://flagcdn.com/np.svg",
      options: ["Intia", "Bangladesh", "Bhutan", "Nepal"],
      correct: "Nepal",
      fact: "Nepalin lippu on maailman ainoa kansallislippu, joka ei ole suorakaiteen muotoinen.",
    },
    {
      question: "Minkä maan lippu?",
      image: "https://flagcdn.com/za.svg",
      options: ["Mosambik", "Kenia", "Etelä-Afrikka", "Nigeria"],
      correct: "Etelä-Afrikka",
      fact: "Etelä-Afrikan lipussa on kuusi väriä — eniten maailman kansallislipuista. Käyttöön 1994.",
    },
    {
      question: "Minkä maan lippu?",
      image: "https://flagcdn.com/bt.svg",
      options: ["Bhutan", "Sri Lanka", "Vietnam", "Kiina"],
      correct: "Bhutan",
      fact: "Bhutanin lipun lohikäärme kantaa kynsissään jalokiviä — Bhutan = lohikäärmeen maa.",
    },
    {
      question: "Minkä maan lippu?",
      image: "https://flagcdn.com/br.svg",
      options: ["Kolumbia", "Brasilia", "Peru", "Ecuador"],
      correct: "Brasilia",
      fact: "Brasilian lipun sinisessä pallossa on 27 tähteä — yksi jokaista osavaltiota kohden.",
    },
    {
      question: "Minkä maan lippu?",
      image: "https://flagcdn.com/ca.svg",
      options: ["Tanska", "Peru", "Kanada", "Sveitsi"],
      correct: "Kanada",
      fact: "Kanadan vaahteranlehtilippu otettiin käyttöön vasta 1965.",
    },
    {
      question: "Minkä maan lippu?",
      image: "https://flagcdn.com/et.svg",
      options: ["Ghana", "Senegal", "Kamerun", "Etiopia"],
      correct: "Etiopia",
      fact: "Etiopian vihreä-keltainen-punainen on pan-afrikkalaisten lippujen alkuperä.",
    },
  ],
};

const kuvavisaPaikkakunta: QuizConfig = {
  id: "kuvavisa:paikkakunta",
  title: "PAIKKAKUNTAVISA",
  intro: "Tunnista suomalainen paikkakunta kuvasta. Placeholder-kuvat — oikeat kuvat tulevat admin-toolista.",
  isImageQuiz: true,
  questions: [
    {
      question: "Mikä paikkakunta?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Paikkakunta+1",
      options: ["Helsinki", "Tampere", "Turku", "Oulu"],
      correct: "Tampere",
      fact: "Placeholder — oikeat kuvat lisätään myöhemmin admin-toolista.",
    },
    {
      question: "Mikä paikkakunta?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Paikkakunta+2",
      options: ["Rovaniemi", "Kuopio", "Joensuu", "Mikkeli"],
      correct: "Rovaniemi",
      fact: "Placeholder — oikeat kuvat lisätään myöhemmin.",
    },
    {
      question: "Mikä paikkakunta?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Paikkakunta+3",
      options: ["Pori", "Vaasa", "Kokkola", "Lahti"],
      correct: "Vaasa",
      fact: "Placeholder.",
    },
    {
      question: "Mikä paikkakunta?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Paikkakunta+4",
      options: ["Hanko", "Mariehamn", "Naantali", "Porvoo"],
      correct: "Porvoo",
      fact: "Placeholder.",
    },
    {
      question: "Mikä paikkakunta?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Paikkakunta+5",
      options: ["Imatra", "Lappeenranta", "Savonlinna", "Varkaus"],
      correct: "Savonlinna",
      fact: "Placeholder.",
    },
  ],
};

const kuvavisaLogot: QuizConfig = {
  id: "kuvavisa:logot",
  title: "LOGOVISA",
  intro: "Tunnista traktorin malli logosta. Placeholder-kuvat tässä versiossa.",
  isImageQuiz: true,
  questions: [
    {
      question: "Minkä traktorin logo?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Logo+1",
      options: ["Valtra", "John Deere", "Massey Ferguson", "Fendt"],
      correct: "Valtra",
      fact: "Placeholder — oikeat logot lisätään myöhemmin.",
    },
    {
      question: "Minkä traktorin logo?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Logo+2",
      options: ["Case IH", "New Holland", "Claas", "Deutz-Fahr"],
      correct: "New Holland",
      fact: "Placeholder.",
    },
    {
      question: "Minkä traktorin logo?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Logo+3",
      options: ["John Deere", "Kubota", "Same", "Belarus"],
      correct: "John Deere",
      fact: "Placeholder.",
    },
    {
      question: "Minkä traktorin logo?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Logo+4",
      options: ["Fendt", "Massey Ferguson", "Valtra", "Steyr"],
      correct: "Fendt",
      fact: "Placeholder.",
    },
    {
      question: "Minkä traktorin logo?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Logo+5",
      options: ["Case IH", "Claas", "Lamborghini Trattori", "JCB"],
      correct: "Claas",
      fact: "Placeholder.",
    },
  ],
};

const kuvavisaVaakuna: QuizConfig = {
  id: "kuvavisa:vaakuna",
  title: "VAAKUNAVISA",
  intro: "Tunnista suomalainen kunnanvaakuna. Placeholder-kuvat.",
  isImageQuiz: true,
  questions: [
    {
      question: "Minkä kunnan vaakuna?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Vaakuna+1",
      options: ["Helsinki", "Espoo", "Vantaa", "Kauniainen"],
      correct: "Helsinki",
      fact: "Placeholder.",
    },
    {
      question: "Minkä kunnan vaakuna?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Vaakuna+2",
      options: ["Tampere", "Pirkkala", "Nokia", "Ylöjärvi"],
      correct: "Tampere",
      fact: "Placeholder.",
    },
    {
      question: "Minkä kunnan vaakuna?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Vaakuna+3",
      options: ["Turku", "Naantali", "Raisio", "Kaarina"],
      correct: "Turku",
      fact: "Placeholder.",
    },
    {
      question: "Minkä kunnan vaakuna?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Vaakuna+4",
      options: ["Lahti", "Heinola", "Hollola", "Asikkala"],
      correct: "Lahti",
      fact: "Placeholder.",
    },
    {
      question: "Minkä kunnan vaakuna?",
      image: "https://placehold.co/600x400/1a3a45/e8a320?text=Vaakuna+5",
      options: ["Oulu", "Kempele", "Liminka", "Muhos"],
      correct: "Oulu",
      fact: "Placeholder.",
    },
  ],
};

/* ─── REKISTERI + RESOLVER ────────────────────────────────────── */
const ALL_QUIZZES: QuizConfig[] = [
  paivanVisa,
  eventVappu, eventJaakiekkoMM, eventEuroviisut,
  paivanSankari,
  katUrheilu, katMaantieto, katLuonto, katHistoria,
  katTvSarjat, katElokuvat, katMusiikki, katRuokaJuoma,
  lippuvisa, kuvavisaPaikkakunta, kuvavisaLogot, kuvavisaVaakuna,
];

const QUIZ_BY_ID: Record<string, QuizConfig> = Object.fromEntries(
  ALL_QUIZZES.map(q => [q.id, q])
);

/** URL-parametreista quiz-config — palauttaa fallback (random) jos ei matchi */
export function resolveQuiz(searchParams: URLSearchParams): QuizConfig {
  if (searchParams.get("paivan_visa") === "1") return paivanVisa;
  if (searchParams.get("paivan_sankari") === "1") return paivanSankari;

  const event = searchParams.get("event");
  if (event) {
    const id = `event:${event}`;
    if (QUIZ_BY_ID[id]) return QUIZ_BY_ID[id];
  }

  const kat = searchParams.get("kat");
  if (kat) {
    const id = `kat:${kat}`;
    if (QUIZ_BY_ID[id]) return QUIZ_BY_ID[id];
  }

  const kuvavisa = searchParams.get("kuvavisa");
  if (kuvavisa) {
    const id = `kuvavisa:${kuvavisa}`;
    if (QUIZ_BY_ID[id]) return QUIZ_BY_ID[id];
  }

  if (searchParams.get("random") === "1") {
    // Pick a random non-image quiz for now
    const textQuizzes = ALL_QUIZZES.filter(q => !q.isImageQuiz);
    return textQuizzes[Math.floor(Math.random() * textQuizzes.length)];
  }

  // Fallback
  return paivanVisa;
}
