-- TIETOMEDIA-PILOTTI: Suomen majakat -visan oppimissisältö (1.8.2026)
-- Faktat tarkistettu 1.8.2026: Turun Yliopistosäätiö (Bengtskär 120 v),
-- Yle Elävä arkisto (Utö), Rantapallo (majakkasaaret), Retkipaikka
-- (Söderskär), Meriharakka.net (majakkalista). key_facts.qi = kysymyksen
-- sort_order personointia varten.
update quizzes set learn = '{
  "intro": "Suomen rannikkoa vartioi 39 majakkaluokan majakan ketju, jonka tornit ovat nähneet sotia, myrskyjä ja kokonaisen katoavan ammattikunnan. Tämä visa vie sinut Saaristomeren uloimmilta luodoilta Pohjanmaan majakkasaarille.",
  "heading": "Nyt tiedät nämä Suomen majakoista",
  "key_facts": [
    {"k": "Mikä Suomen majakoista on korkein?", "v": "Bengtskär — torni kohoaa 52 metriä merenpinnasta ja on Pohjoismaiden korkein majakkarakennus (valm. 1906).", "qi": 0},
    {"k": "Mikä on Suomen vanhin yhä toimiva majakka?", "v": "Utö (1814). Alkuperäinen, vuoden 1753 majakka räjäytettiin Suomen sodassa.", "qi": 1},
    {"k": "Missä Bengtskär sijaitsee?", "v": "Saaristomeren uloimmalla luodolla noin 25 km Hangosta lounaaseen — Suomen eteläisin asuttu paikka.", "qi": 2},
    {"k": "Mikä on Muumipapan majakka?", "v": "Söderskär (1862) Porvoon ulkosaaristossa — sitä pidetään yhtenä Tove Janssonin Muumipappa ja meri -kirjan innoittajista.", "qi": 3},
    {"k": "Mitä Bengtskärissä tapahtui 1941?", "v": "Neuvostojoukot yrittivät räjäyttää majakan 26.7.1941. Suomalaiset voittivat 19 tuntia kestäneen taistelun.", "qi": 7},
    {"k": "Milloin majakanvartijoita lakattiin tarvitsemasta?", "v": "Jussarön uusi majakka (1922) suunniteltiin ensimmäisenä miehittämättömäksi; viimeinen majakkamestari jäi eläkkeelle Utössä 1996.", "qi": 6}
  ],
  "title": "Suomen majakat pähkinänkuoressa",
  "sections": [
    {"h": "Suomen majakoiden historia", "p": [
      "Suomen ensimmäinen majakka syttyi Utön saarelle jo vuonna 1753 opastamaan laivoja Saaristomeren eteläreunalla. Alkuperäinen torni räjäytettiin Suomen sodassa, mutta se rakennettiin uudelleen vuonna 1814 — ja sama nelikulmainen kivitorni valaisee merta yhä, Suomen vanhimpana toimivana majakkana. Sen rungossa toimii jopa kirkko.",
      "1800-luku oli majakoiden vuosisata: höyrylaivaliikenteen kasvaessa rannikolle nousi torni toisensa jälkeen, muun muassa punavalkoraitainen Isokari (1833), Söderskär (1862) ja Russarö (1863). Suurten kivimajakoiden aikakausi huipentui vuonna 1906, kun Bengtskärin graniittitorni valmistui Saaristomeren uloimmalle luodolle."
    ]},
    {"h": "Bengtskär — Pohjoismaiden korkein", "p": [
      "Arkkitehti Florentin Granholmin suunnittelema Bengtskär kohoaa 52 metriä merenpinnasta ja on Pohjoismaiden korkein majakkarakennus. Kansallisromanttinen torni rakennettiin graniitista ja tiilestä noin 25 kilometrin päähän Hangosta — luoto on samalla Suomen eteläisin asuttu paikka.",
      "Jatkosodan aikana 26. heinäkuuta 1941 neuvostoliittolainen maihinnousuosasto nousi sumun suojassa luodolle tarkoituksenaan räjäyttää majakka. Yhdeksäntoista tuntia kestänyt Bengtskärin taistelu päättyi suomalaisten voittoon, ja torni jäi pystyyn. Nykyään majakan omistaa Turun Yliopistosäätiö, ja saarella vierailee vuosittain 13 000–15 000 kävijää."
    ]},
    {"h": "Majakanvartijoista automaattisiin majakoihin", "p": [
      "Majakanvartija oli pitkään kokonaisen saariyhteisön ammatti: vartijaperheet asuivat luodoilla ympäri vuoden ja pitivät valon palamassa öljyllä ja kaasulla. Käänne alkoi jo 1922, kun Jussarön uusi majakka suunniteltiin ensimmäisenä Suomessa alusta asti miehittämättömäksi — sen itsetoiminen asetyleenivalo vaati käynnin vain kerran kuussa.",
      "Automatisointi eteni majakka kerrallaan: Söderskär automatisoitiin 1957 ja Bengtskär 1968. Ammattikunnan tarina päättyi Utöhön, jossa Suomen viimeinen majakkamestari jäi eläkkeelle vuonna 1996. Nykyään kaikki Suomen majakat toimivat automaattisesti, ja osassa valotehoa on laskettu, koska merenkulku luottaa satelliittipaikannukseen."
    ]},
    {"h": "Vanhimmat, korkeimmat ja nuorimmat", "p": [
      "Suomessa on 39 majakkaluokan majakkaa: 32 mannerrannikolla ja 7 Ahvenanmaalla. Vanhin toimiva on Utö (1814) ja korkein Bengtskär (52 m merenpinnasta); toiseksi korkein on Isokari (49,4 m). Nuorimpia on Rauman edustan Kylmäpihlaja (1952), jonka tornissa toimii nykyään hotelli ja ravintola."
    ]},
    {"h": "Missä majakoissa voi vierailla?", "p": [
      "Useimmille tunnetuille majakkasaarille pääsee kesäisin vesibussilla tai risteilyllä: Bengtskäriin Hangosta ja Kasnäsistä (saarella museo, kahvila ja kesähotelli), Söderskäriin Helsingin Kauppatorilta ja Vuosaaresta, Isokariin Uudestakaupungista ja Kylmäpihlajaan Raumalta. Utöhön kulkee yhteysalus Paraisten Pärnäisistä ympäri vuoden. Söderskärin pääsaarilla liikkumista rajoittaa lintujen pesimärauhoitus alkukesästä, ja Kokkolan edustan Tankarin majakkasaarella odottavat myös vanha kalastajakylä ja puukirkko."
    ]}
  ],
  "faq": [
    {"q": "Mikä on Suomen korkein majakka?", "a": "Bengtskär: torni kohoaa 52 metriä merenpinnasta. Se on samalla Pohjoismaiden korkein majakkarakennus. Toiseksi korkein on Isokari (49,4 m)."},
    {"q": "Kuinka monta majakkaa Suomessa on?", "a": "Majakkaluokan majakoita on 39: 32 mannerrannikolla ja 7 Ahvenanmaalla. Pienempiä loistoja ja pookeja on satoja."},
    {"q": "Ovatko Suomen majakat yhä käytössä?", "a": "Kyllä — kaikki toimivat nykyään automaattisesti ilman vartijoita. Viimeinen majakkamestari jäi eläkkeelle Utössä 1996."},
    {"q": "Voiko majakassa yöpyä?", "a": "Voi: ainakin Bengtskärissä on kesähotelli ja Kylmäpihlajalla hotelli ja ravintola. Söderskärissä voi yöpyä sviitissä pesimärauhoituksen ulkopuolella."}
  ],
  "sources": [
    {"name": "Turun Yliopistosäätiö: Bengtskär 120 vuotta", "url": "https://www.yliopistosaatio.fi/bengtskar-120-vuotta/"},
    {"name": "Yle Elävä arkisto: Utön majakka", "url": "https://yle.fi/aihe/artikkeli/2011/05/23/uton-majakka"},
    {"name": "Rantapallo: Majakkasaaret Suomessa", "url": "https://www.rantapallo.fi/suomen-matkailu/kotimaan-kiehtovat-majakkasaaret/"},
    {"name": "Retkipaikka: Muumipapan majakka — Söderskär", "url": "https://retkipaikka.fi/muumipapan-majakka-soderskar-pellingin-saaristo-porvoo/"},
    {"name": "Meriharakka: Suomen majakat", "url": "https://meriharakka.net/2021/07/26/suomen-majakat-2021/"}
  ],
  "last_reviewed": "2026-08-01"
}'::jsonb
where slug = 'suomen-majakat';
