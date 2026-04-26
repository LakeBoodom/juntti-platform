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
      {
      question: "Mikä yhdistys järjestää Suomen jalkapallomaajoukkueen toimintaa?",
      options: ["SJL", "Palloliitto", "SM-liiga", "Suomi-Sport"],
      correct: "Palloliitto",
      fact: "Suomen Palloliitto perustettiin vuonna 1907 — yksi maailman vanhimmista jalkapalloliitoista.",
    },
    {
      question: "Kuka on Suomen menestynein olympialaisten mäkihyppääjä?",
      options: ["Janne Ahonen", "Matti Nykänen", "Jens Weißflog", "Toni Nieminen"],
      correct: "Matti Nykänen",
      fact: "Matti Nykänen voitti 4 olympiakultaa (1984 ja 1988) — Suomen mäkihypyn legenda.",
    },
    {
      question: "Mikä on Formula 1 -kuljettaja Mika Häkkisen syntymävuosi?",
      options: ["1966", "1968", "1970", "1972"],
      correct: "1968",
      fact: "Mika Häkkinen (s. 28.9.1968) voitti F1-maailmanmestaruuden 1998 ja 1999.",
    },
    {
      question: "Mikä on hiihdon suomalaislegendan Marja-Liisa Kirvesniemen syntyperänimi?",
      options: ["Hämäläinen", "Mäki", "Kallioniemi", "Lindgren"],
      correct: "Hämäläinen",
      fact: "Marja-Liisa Kirvesniemi (o.s. Hämäläinen) voitti 3 olympiakultaa Sarajevossa 1984.",
    },
    {
      question: "Kuinka monta MM-kultamitalia Tero Pitkämäki keihäänheitossa on voittanut?",
      options: ["1", "2", "3", "4"],
      correct: "1",
      fact: "Tero Pitkämäki voitti MM-kultaa Osakassa 2007 — yksi Suomen merkittävimmistä keihäänheittäjistä.",
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
      {
      question: "Mikä on Suomen pääkaupunki?",
      options: ["Helsinki", "Tampere", "Turku", "Oulu"],
      correct: "Helsinki",
      fact: "Helsinki on Suomen pääkaupunki vuodesta 1812.",
    },
    {
      question: "Mikä on Yhdysvaltain pääkaupunki?",
      options: ["New York", "Los Angeles", "Washington D.C.", "Chicago"],
      correct: "Washington D.C.",
      fact: "Washington D.C. on ollut Yhdysvaltain pääkaupunki vuodesta 1800.",
    },
    {
      question: "Mikä on Afrikan suurin maa pinta-alaltaan?",
      options: ["Egypti", "Algeria", "Kongo", "Sudan"],
      correct: "Algeria",
      fact: "Algeria on noin 2,38 miljoonaa km² — Afrikan suurin maa pinta-alaltaan.",
    },
    {
      question: "Mikä joki halkaisee Egyptin?",
      options: ["Niili", "Niger", "Kongo", "Sambesi"],
      correct: "Niili",
      fact: "Niili on noin 6650 km pitkä — maailman pisin joki.",
    },
    {
      question: "Mikä valtameri on suurin?",
      options: ["Atlantin valtameri", "Tyynimeri", "Intian valtameri", "Pohjoinen jäämeri"],
      correct: "Tyynimeri",
      fact: "Tyynimeri kattaa noin 165 miljoonaa km² — kolmasosan maapallon pinta-alasta.",
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
      {
      question: "Mikä eläin tunnetaan nimellä 'metsän kuningas'?",
      options: ["Karhu", "Susi", "Hirvi", "Ilves"],
      correct: "Karhu",
      fact: "Karhu on Suomen suurin maaeläin ja perinteisesti 'metsän kuningas'.",
    },
    {
      question: "Mikä on Suomen yleisin lintulaji?",
      options: ["Pajulintu", "Peippo", "Talitiainen", "Räkättirastas"],
      correct: "Peippo",
      fact: "Peippo on Suomen runsaslukuisin pesimälintu — yli 6 miljoonaa pesivää paria.",
    },
    {
      question: "Mikä on Suomen ainoa myrkyllinen käärme?",
      options: ["Kyy", "Rantakäärme", "Vaskitsa", "Sileäkäärme"],
      correct: "Kyy",
      fact: "Kyy on Suomen ainoa luonnonvarainen myrkyllinen käärme. Pureminen voi olla vaarallista mutta harvoin tappavaa.",
    },
    {
      question: "Mikä on saimaannorpan tieteellinen nimi?",
      options: ["Pusa hispida saimensis", "Phoca vitulina", "Halichoerus grypus", "Pagophilus groenlandicus"],
      correct: "Pusa hispida saimensis",
      fact: "Saimaannorppa on yksi maailman uhanalaisimmista hyljelajeista — vain Saimaalla.",
    },
    {
      question: "Mikä Suomen järvi on tilavuudeltaan suurin?",
      options: ["Saimaa", "Päijänne", "Inarijärvi", "Oulujärvi"],
      correct: "Päijänne",
      fact: "Päijänteen vesimäärä on noin 18,1 km³ — Suomen tilavuudeltaan suurin järvi.",
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
      {
      question: "Kuka oli Suomen ensimmäinen marsalkka?",
      options: ["C.G.E. Mannerheim", "K.J. Ståhlberg", "P.E. Svinhufvud", "J.K. Paasikivi"],
      correct: "C.G.E. Mannerheim",
      fact: "Mannerheim sai marsalkan arvon 75-vuotissyntymäpäivänään 1942.",
    },
    {
      question: "Milloin Suomi liittyi YK:hon?",
      options: ["1948", "1955", "1962", "1970"],
      correct: "1955",
      fact: "Suomi liittyi YK:hon 14.12.1955.",
    },
    {
      question: "Kuka oli Rooman ensimmäinen keisari?",
      options: ["Julius Caesar", "Augustus", "Tiberius", "Caligula"],
      correct: "Augustus",
      fact: "Augustus (Octavianus) oli Rooman ensimmäinen keisari 27 eKr.–14 jKr.",
    },
    {
      question: "Milloin ensimmäinen ihminen kävi Kuussa?",
      options: ["1965", "1969", "1972", "1975"],
      correct: "1969",
      fact: "Neil Armstrong ja Buzz Aldrin laskeutuivat Kuuhun Apollo 11 -lennolla 20.7.1969.",
    },
    {
      question: "Mikä keskiaikainen tauti tappoi noin kolmanneksen Euroopan väestöstä 1300-luvulla?",
      options: ["Isorokko", "Musta surma", "Lavantauti", "Kolera"],
      correct: "Musta surma",
      fact: "Musta surma (paiserutto) tappoi 25–60 % Euroopan väestöstä 1346–1353.",
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
      {
      question: "Mikä HBO:n sarja kertoo mafiapomo Tony Sopranosta?",
      options: ["The Wire", "The Sopranos", "Boardwalk Empire", "Ozark"],
      correct: "The Sopranos",
      fact: "The Sopranos (1999–2007) muutti TV-draaman aikakautta — usein nimetty kaikkien aikojen parhaaksi sarjaksi.",
    },
    {
      question: "Missä kaupungissa tapahtuu Friends-sarja?",
      options: ["Chicago", "Boston", "New York", "Los Angeles"],
      correct: "New York",
      fact: "Friends sijoittuu Manhattaniin, Greenwich Villageen — vaikka useimmat kohtaukset kuvattiin Los Angelesissa.",
    },
    {
      question: "Mikä on Game of Thrones -sarjan alkuperäisten kirjojen kirjoittaja?",
      options: ["George R. R. Martin", "J. R. R. Tolkien", "Brandon Sanderson", "Robert Jordan"],
      correct: "George R. R. Martin",
      fact: "George R. R. Martin julkaisi A Song of Ice and Fire -sarjan ensimmäisen osan 1996.",
    },
    {
      question: "Kuka näyttelee Walter White -hahmoa Breaking Bad -sarjassa?",
      options: ["Bryan Cranston", "Aaron Paul", "Bob Odenkirk", "Jonathan Banks"],
      correct: "Bryan Cranston",
      fact: "Bryan Cranston voitti 4 Emmy-palkintoa Walter Whiten roolista 2008–2014.",
    },
    {
      question: "Mistä maasta TV-sarja Borgen on kotoisin?",
      options: ["Ruotsi", "Norja", "Tanska", "Suomi"],
      correct: "Tanska",
      fact: "Borgen (2010–2013, 2022) on tanskalainen poliittinen draamasarja Tanskan ensimmäisestä naispääministeristä.",
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
      {
      question: "Mikä on Star Wars -elokuvan ensimmäisen osan (1977) alkuperäinen nimi?",
      options: ["Episode IV: A New Hope", "Star Wars", "Star Wars: Episode I", "The Phantom Menace"],
      correct: "Star Wars",
      fact: "Alkuperäinen 1977 elokuva nimettiin pelkäksi 'Star Wars' — 'A New Hope' -alaotsikko lisättiin uudelleenjulkaisussa 1981.",
    },
    {
      question: "Kuka ohjasi Schindlerin lista -elokuvan (1993)?",
      options: ["Steven Spielberg", "Martin Scorsese", "Stanley Kubrick", "Roman Polanski"],
      correct: "Steven Spielberg",
      fact: "Spielberg voitti elokuvasta parhaan ohjauksen Oscarin — yksi 7 Oscarista jotka elokuva sai.",
    },
    {
      question: "Mikä on Studio Ghiblin ensimmäinen pitkä animaatioelokuva?",
      options: ["Tuulen laakson Nausicaä", "Laputa", "Naapurini Totoro", "Kikis Express"],
      correct: "Laputa",
      fact: "Laputa: Linna taivaalla (1986) oli Ghiblin ensimmäinen pitkä animaatio — Nausicaä (1984) tehtiin ennen studion perustamista.",
    },
    {
      question: "Kuka näyttelee päärooleja Pulp Fiction (1994) -elokuvassa?",
      options: ["John Travolta ja Samuel L. Jackson", "Robert De Niro ja Al Pacino", "Tom Hanks ja Tim Robbins", "Kevin Costner ja Whitney Houston"],
      correct: "John Travolta ja Samuel L. Jackson",
      fact: "Tarantinon Pulp Fiction nosti John Travoltan uran takaisin pintaan ja teki Samuel L. Jacksonista A-listan tähden.",
    },
    {
      question: "Mikä elokuva voitti Cannes'n Kultaisen palmun 2019?",
      options: ["Parasite", "Joker", "Once Upon a Time in Hollywood", "1917"],
      correct: "Parasite",
      fact: "Parasite voitti Kultaisen palmun 2019 ja seuraavana vuonna 4 Oscaria — ensimmäinen ei-englanninkielinen Best Picture.",
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
      {
      question: "Mikä bändi tunnetaan kappaleesta 'Stairway to Heaven'?",
      options: ["The Beatles", "Led Zeppelin", "Pink Floyd", "Deep Purple"],
      correct: "Led Zeppelin",
      fact: "'Stairway to Heaven' (1971) on Led Zeppelinin Led Zeppelin IV -albumin tunnetuin kappale.",
    },
    {
      question: "Kuka sävelsi 'Finlandia'-hymnin?",
      options: ["Jean Sibelius", "Yrjö Kilpinen", "Toivo Kuula", "Erik Bergman"],
      correct: "Jean Sibelius",
      fact: "Jean Sibelius sävelsi 'Finlandian' 1899 osana Suomi-näyttämömusiikkia.",
    },
    {
      question: "Kuka on tunnetuin suomalainen 'humppa'-orkesterijohtaja?",
      options: ["Eino Grön", "Eero Aven", "Lasse Mårtenson", "Ossi Runne"],
      correct: "Eero Aven",
      fact: "Eero Aven johti Humppaveikot-yhtyettä useita vuosikymmeniä — humpan ikoni.",
    },
    {
      question: "Minkä yhtyeen tähti Kurt Cobain oli?",
      options: ["Pearl Jam", "Soundgarden", "Nirvana", "Alice in Chains"],
      correct: "Nirvana",
      fact: "Kurt Cobain (1967–1994) oli Nirvanan laulaja-kitaristi — grunge-ilmiön symboli.",
    },
    {
      question: "Mikä suomalaisbändi voitti Wackenin festivaalin 2003?",
      options: ["Apocalyptica", "HIM", "Lordi", "Children of Bodom"],
      correct: "Lordi",
      fact: "Lordi voitti Wacken Open Air -festivaalin 2003 — kolme vuotta ennen Eurovision-voittoaan.",
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
      {
      question: "Mikä on perinteinen suomalainen kalakukko?",
      options: ["Kalakukko on hauen sisuksiin täytetty makkara", "Kalakukko on ruisleivän sisään leivottu kala", "Kalakukko on suolattu silakka", "Kalakukko on graavattu kala"],
      correct: "Kalakukko on ruisleivän sisään leivottu kala",
      fact: "Kalakukko on Savon perinneruoka — muikkua tai ahventa leivotaan ruisleipätaikinan sisään uunissa.",
    },
    {
      question: "Mikä juoma on perinteisesti kuuluva 'glögin' ainesosa?",
      options: ["Punaviini", "Olut", "Sahti", "Vodka"],
      correct: "Punaviini",
      fact: "Glögi tehdään perinteisesti punaviinistä, kanelista, sokerista, mausteista — usein lisätään mantelia ja rusinoita.",
    },
    {
      question: "Mistä tehdään perinteinen suomalainen leipäjuusto ('narskuva juusto')?",
      options: ["Lehmänmaito", "Lammasmaito", "Vuohimaito", "Härkien maitoa"],
      correct: "Lehmänmaito",
      fact: "Leipäjuusto tehdään yleensä lehmän juustomaidosta. Pohjois-Suomessa ja Lapissa myös poromaidosta.",
    },
    {
      question: "Mikä on ruisleivän tärkein raaka-aine paitsi ruisjauho?",
      options: ["Ruishiiva", "Vesi", "Sokeri", "Voi"],
      correct: "Vesi",
      fact: "Perinteinen ruisleipä tehdään ruisjauhosta, vedestä, suolasta ja juuriviileestä. Hiivaa ei tarvita kun on juuri.",
    },
    {
      question: "Mikä viini on Italian Toscanan tunnetuin?",
      options: ["Chianti", "Barolo", "Prosecco", "Soave"],
      correct: "Chianti",
      fact: "Chianti on Toscanan kuuluisa punaviini — pääasiassa Sangiovese-rypäleestä.",
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

/** Etusivun ankkuri jonka kohdalle 'Toinen visa →' palaa */
export function getSectionAnchor(quiz: QuizConfig): string {
  if (quiz.id === "paivan_visa") return "/#paivan-visa";
  if (quiz.id === "paivan_sankari") return "/#paivan-sankari";
  if (quiz.id.startsWith("event:")) return "/#pinnalla-nyt";
  if (quiz.id.startsWith("kat:")) return "/#kategoriat";
  if (quiz.id.startsWith("kuvavisa:")) return "/#tunnista-tama";
  return "/";
}

/** Käyttäjäystävällinen kategorianimi quiz-id:stä, esim "kat:urheilu" → "URHEILU" */
export function getCategoryLabel(quiz: QuizConfig): string | null {
  if (quiz.id.startsWith("kat:")) {
    return quiz.title; // title on jo iso (esim "URHEILU")
  }
  return null;
}
