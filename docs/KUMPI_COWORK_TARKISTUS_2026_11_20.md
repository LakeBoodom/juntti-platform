# Cowork-brief: Kumpi?-pelin lisädatan tarkistus (20.11.2026)

**Tausta.** Kumpi? 2.0 vertaa kahta kohdetta yhdellä luvulla ("Kumpi järvi on suurempi?"). Kokoelma on tiivistetty
seitsemään riviin, ja kierroksiin tarvitaan lisää vaihtelua. Kannassa on jo valmiina kolme aineistoa, joita peli ei vielä
käytä. Tarkista ne tällä ohjeella, niin Claude Code kytkee ne peliin.

Supabase `pkfsdzqwfxqczirjddue`. Taulut `fact_entities`, `fact_attributes` (scope = ''), `fact_attribute_defs`.
Älä muuta `enabled`-kenttää äläkä julkaise luonnoksia: Claude Code tekee sen Heikin luvalla.

## Kaikkia koskevat säännöt

1. **`num_value` on vertailun arvo.** Peli vertaa vain sitä. Sen on oltava yksi luku, joka kuvaa kohdetta reilusti
   (vaihteluvälissä keskiarvo tai tavallinen arvo, ei ääripää).
2. **`display_value` näkyy kortissa** arvorivinä 30 px:n fontilla. Enintään noin 14 merkkiä, esim. "1,2 m", "35 kg",
   "noin 20 vuotta". Ei lauseita, ei sulkuja, ei vaihteluvälejä ("10,5–12 cm" → "11 cm").
3. **Ei muuttuvia lukuja.** `volatility`: `stable` pysyville, `seasonal` + `next_review_at` vuosittain päivittyville.
   Peli ei käytä urheilijoiden ja poliitikkojen `seasonal`- tai `volatile`-arvoja ollenkaan.
4. **Lähde ja tarkistuspäivä** jokaiselle riville (`source`, `verified_at`), kuten nyt.

## 1. Eläimet → Luonto-teemaan

49 lajia (`kind = species`, kaikki `draft`). Määrittelyt: `length_cm` (49), `species_weight_kg` (46),
`lifespan_years` (37), `wingspan_cm` (30), `population_fi` (41). `speed_kmh` (4) jätetään pois.

- Nyt `display_value` on usein vaihteluväli tai lause ("tavallisesti noin 20 cm, harvoin yli 30 cm",
  "syksyisin noin 150 000 yksilöä"). Lyhennä säännön 2 mukaan.
- Tarkista, että `num_value` vastaa lyhennettyä näyttöarvoa.
- `population_fi`: sama yksikkö kaikille (yksilöä tai paria, ei sekaisin). Jos laji on ilmoitettu pareina, muunna
  yksilöiksi tai merkitse `metric`-kenttään yksikkö, jotta pari- ja yksilömääriä ei verrata keskenään.
- `wingspan_cm` vain linnuille ja lepakoille.
- Kerro raportissa lajit, joilta puuttuu kuva tai joiden nimi on epäselvä pelaajalle (esim. pelkkä tieteellinen nimi).

## 2. Liiga-seurat → Jääkiekko (Liiga-teema)

`kind = team`: 6 julkaistua, 23 luonnosta. Määrittelyt: `titles` (29), `home_capacity` (29),
`first_title_year` (19), `latest_title_year` (19). Muut (`founded_hockey`, `city_pop`, `liiga_since`, `has_title`,
`is_founding_member`) ovat vain kuudella seuralla: täydennä ne kaikille 17 nykyiselle Liiga-seuralle tai kerro, ettei
tietoa saa luotettavasti.

- `titles` ja `latest_title_year` muuttuvat keväisin: `seasonal`, `next_review_at` = seuraava toukokuu.
- `home_capacity`: nykyinen kotihalli, `display_value` muotoa "7 300 katsojaa" ja `as_of`.
- Erota nykyiset 17 Liiga-seuraa muista (lakanneet, alemmat sarjat). Ehdotus: `group_key = 'liiga'` nykyisille, kuten
  seurateemoissa jo on.

## 3. Presidentit → Ihmiset-teemaan

`pres_start` (13 presidenttiä, julkaistu). `num_value` on aloituspäivä sekunteina, ja `display_value` on päivämäärä
("1.3.1925").

- Tarkista kaikki 13 aloituspäivää (myös Mannerheim 4.8.1944 ja Kekkosen 1.3.1956).
- Kortissa riittää vuosi: vaihda `display_value` muotoon "1925" tai lisää erillinen vuosi, jos päivämäärä tarvitaan
  muualla.

## Samalla korjattavaa (havaittu Kumpi?-testeissä)

- **Maaottelut (`nt_games`, `nt_points`)** on merkitty `seasonal` (`as_of` 2025-05-25) myös uransa lopettaneille
  legendoille. Lopettaneille `stable`, jotta ne palaavat peliin.
- **Maiden asukasluvut** (`country_pop`): osa muodossa "5 600 000 as.", osa ilman. Yhtenäistä ilman "as."-päätettä.
- **Stanley Cupit** (`stanley_cups`): "0 kpl" → "0", kuten muissa määrissä.
- **Järvet ja joet** (`kind = lake / river`): ei maa- eikä sijaintitietoa. Peli erottaa suomalaiset nyt nimilistalla.
  Lisää jokaiselle maa (esim. `tags` = `{suomi}` tai uusi kenttä), niin uudet järvet menevät oikeaan teemaan itsestään.

## Raportti Heikille

Taulukko per aineisto: rivejä tarkistettu / korjattu / poistettu, epävarmat tapaukset lähteineen. Ei kantamuutoksia
`enabled`- eikä `status`-kenttiin.

## 4. Visakysymykset Kumpi?-muodossa (pilotti, lisätty 20.11.2026)

Taulussa `kumpi_visakysymykset` on 835 luonnosta (`status = draft`). Ne on muunnettu julkaistuista tietovisoista:
jääkiekko (seurojen omat visat, SM-liiga, Leijonat, NHL), urheilu sekä suomalaisten henkilöiden ja politiikan visat.
Kentät: `kysymys` (avainsana hakasulkeissa), `oikea`, `vaara` (uskottavin väärä vaihtoehto), `oikea_fakta` ja
`vaara_fakta` (kortin arvorivi, ≤ 26 merkkiä), `vaikeus`, `teemat`, `question_id` (lähdekysymys).

Tarkista ja korjaa suoraan riville (älä muuta `status`-kenttää):
- **Suomen kieli:** lause on luonteva ja yksiselitteinen. Esimerkki korjattavasta: "Kumman Akilles kohtasi
  [jääpallofinaaleissa] 2020 ja 2021?" → "Kumman joukkueen Akilles kohtasi …".
- **Faktat:** `oikea_fakta` kertoo jotain, mitä kysymyksessä ei jo lue (ei "Valmentajapalkinto" palkintokysymyksessä).
  `vaara_fakta` on muunnettu osin yleistiedosta: tarkista jokainen täytetty `vaara_fakta` lähteestä, ja tyhjennä se
  (null), jos lähdettä ei löydy.
- **Yksiselitteisyys:** väärä vaihtoehto on varmasti väärä (ei esim. myös oikein eri tulkinnalla).
- Huono kysymys: aseta `status = 'hidden'` ja kirjoita syy kenttään `huomio`.

**Tellervo Koivisto (586f68a0-e81c-46cd-a2cc-43137cc05193): ei virhettä.** Cowork vahvisti 20.11. (Wikidata,
fi.wikipedia, Yle): SDP:n kansanedustaja 1972–1975, Helsingin kaupunginvaltuustoon vasta 1976. Visa pysyy ennallaan, ja
kysymys on palautettu Kumpi?-kysymyksiin (luonnos).

**Tulos (Cowork 20.11.):** 835 tarkistettu, 207 korjattu (52 lausetta, 103 `oikea_fakta`, 51 `vaara_fakta` tyhjennetty),
0 piilotettu. Varmuuskopio `_kumpi_visakysymykset_backup_20261120`. Kohdat 1–3 ja "Samalla korjattavaa" tekemättä.
