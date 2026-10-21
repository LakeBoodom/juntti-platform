# Tietoniekka — design system (komponentit ja säännöt)

> Luotu 18.10.2026 (UI-laatu, kokoelmasivut kierros 1, T9). Ilme on lukittu (Neon Night: `#131109`,
> lime `#B6FF3C`, kulta `#E8A320`). Tämä tiedosto kirjaa jaetut komponenttiluokat ja käyttösäännöt.
> UI-laadun yleissäännöt: `CLAUDE.md` → UI-LAATUSÄÄNNÖT ja skilli `tietoniekka-ui-laatu`.
> Tyylit: `app/(tn20)/tn20.css`, ellei toisin mainita. Puhdas CSS, ei Tailwindia.

## Toimintakehotteet

| Luokka | Mihin | Muoto |
|---|---|---|
| `.tn-cta-lime` | Sivun **yksi** ensisijainen toiminto (hero, poimintakortti, pelin "Aloita visa" / "Seuraava") | Lime-pilleri, tumma teksti, versaali. Koko ja fontti tulevat kortin omasta luokasta; tämä omistaa värin, muodon ja hoverin. |
| `.tn-card-cta` | Kokoelmasivujen **korttikehote** listakorteissa | Teksti aina **"Pelaa →"**. 13 px, paino 700, versaali, `letter-spacing: .06em`. Väri `var(--teema-aksentti, var(--tn-lime))`. Ei taustaa, ei pilleriä. `<span>` kortin sisällä — kortti itse on linkki, ei sisäkkäistä `<a>`:ta. |

**Sääntö:** kokoelmasivujen korttikehote on aina `.tn-card-cta` ("Pelaa →"). Lime-pilleri vain sivun
yhdelle ensisijaiselle toiminnolle. Teemaväri asetetaan kortin omassa säännössä muuttujalla
`--teema-aksentti` (esim. `.tnu-start { --teema-aksentti: color-mix(in srgb, currentColor 75%, #fff); }`),
ei `color`-ominaisuudella. Kuvan päälle tulevaan tekstikorttiin ei lisätä kehotetta, jos siinä ei sitä jo ole.
Tila "Tulossa" (ei pelattavissa) on metarivi, ei kehote.

## Metarivi

| Luokka | Mihin | Muoto |
|---|---|---|
| `.tn-card-meta` | Vuosi, maa, aihe, stadion, rooli. **Kysymysmäärä vain, kun se poikkeaa kymmenestä** (Megavisat 20–50, viikkovisa 15, "Kuka sanoi?" 15 — Heikki 19.10.2026). Vaikeustasoa ei näytetä koskaan. | 12 px, paino 600, `var(--tn-text-muted)`, ei versaalia. |

Kortin oma metaluokka (esim. `.tnk-cardmeta`, `.tnh-quiz-meta`) saa määrittää vain asettelun
(flex, gap); typografia tulee `.tn-card-meta`:sta.

## Tekstikoot (mobiili)

- Badget, chipit ja versaalimerkinnät ≥ 11 px. Kaikki muu teksti ≥ 12 px. Kontrollit (suodattimet) ≥ 12 px.
- Poikkeus: `aria-hidden`-koristeteksti.

## Henkilökuvat

- Ei kuvia suoraan Wikimediasta. `henkiloKuva(url)` (`lib/henkilokuvat.ts`) palauttaa oman kopion
  (`public/20/henkilot/k/`, 320 px leveä, alkuperäinen kuvasuhde) tai `null` → nimikirjaimet/siluetti.
- Krediitit `lib/henkilokuvalahteet.ts` → `/kuvien-lahteet`. Sallitut lisenssit: CC0, PD, CC BY, CC BY-SA.

## Järjestämispelin saavutettavuusmalli

Reittipelien (Kuntaliitos, Rajanaapurit, Vaalipiiriketju — `components/tn20/reittipeli/ReittipeliClient.tsx`)
malli. Kaikki tulevat järjestämispelit (Laita järjestykseen, Ikäjärjestys, Järjestä) tehdään tämän mukaan.

1. **Lista:** järjestettävät kortit ovat `role="list"`-säiliössä (`aria-label` = mitä järjestetään),
   jokainen kortti `role="listitem"` + `tabIndex={0}`.
2. **Kuvaava `aria-label` kortille:** nimi, tarkenne ja paikka — esim. "Kiina, Aasia. Paikka 3 / 8.
   Siirrettävä." Lukitut päät: "…Reitin kiinnitetty lähtö, paikka 1 / 8."
3. **Valinta:** Enter/välilyönti valitsee kortin (`aria-pressed`), toinen napautus/Enter vaihtaa paikkaa.
4. **Nuolinäppäimet:** ↑/↓ siirtää fokusoitua korttia yhden paikan; lukittuja päitä ei voi ohittaa.
   Fokus pysyy siirretyssä kortissa (`requestAnimationFrame(() => kortti.focus())`).
5. **`aria-live="polite"`-ilmoitus jokaisesta siirrosta:** "Kiina siirtyi paikalle 3." (näkymätön
   `.kl-sr`-kappale). Tarkistuksen tulos samassa tai `role="status"`-alueessa.
6. **Raahaus on lisä, ei ainoa tapa:** hiiri liikkeestä, kosketus pitkästä painalluksesta. Kaikki onnistuu
   ilman raahausta.
7. Oikein/väärin ei ole pelkkä väri: rinnalla ✓/✗ tai teksti.

## Kokoelmarunko (19.10.2026)

Kokoelmasivut siirtyvät yhteiselle rungolle (`components/tn20/runko/KokoelmaRunko.tsx`, tyylit
`app/(tn20)/runko.css`). Kokoelma on asetus `lib/kokoelmat/<slug>.ts` (tyyppi `lib/kokoelmat/tyypit.ts`),
visat tulevat osioihin `quizzes.section_tags`-tagista. Ei sivukohtaista komponenttia.

- **V1 hero** · eyebrow → h1 (koko pisimmästä sanasta, riviväli .98, jotta ääkkösten pisteet eivät osu ylempään riviin) → ingressi (≤ 2 riviä) → tilastorivi → yksi
  `.tn-cta-lime` "Pelaa: <visan lyhyt nimi>" (ajatusviivaa edeltävä osa, enintään 2 riviä 390 px:ssä) ja sen selite napin oikealla puolella pystykeskitettynä.
  **Matala** (Heikki 21.10.2026): desktop ~340 px (h1 enintään 64 px), mobiilin kuva 150 px — ensimmäinen korttirivi kuvineen näkyy 1440 × 900:ssa
  ilman vieritystä. Herokuva `<picture>`: mobiili (< 900 px) `<nimi>-800.webp`, desktop 1600 px, esilataus mediaehdolla.
- **V2 oma edistyminen** · vain `METAPELI_ENABLED`-lipun takana (esikatselussa `?metapeli=1`), samoin
  mestaruusmerkit, tasot ja korttien ✓-tulosmerkki. **Oma eteneminen näkyy aina** (Heikki 20.10.2026):
  osiochipit "Pääkaupunkiseutu 2/3", osion otsikko "12 visaa · 4 pelattu" ja aikajanan "x/n pelattu"
  anonyymista pelihistoriasta (`tn_played_quizzes`). Ensikävijällä pelkkä visamäärä.
- **V3 osiochipit** · vain kun osioita ≥ 3; jokaisen osion lopussa "↑ <osioiden nimi>".
- **V4 tunnusosa** · valinnainen, **enintään yksi**. Kolme sallittua tyyppiä:
  1. navigaatio, joka korvaa V3:n (Historian aikajana, Juhlien juhlakello),
  2. yhdellä silmäyksellä luettava tieto, jota sivulla ei muuten ole (Euroviisujen sijoitusnauha, synttärit),
  3. **kokoelman ydinpelin kuvabanneri** (Heikki 20.10.2026), kun banneri kertoo pelimuodosta paremmin kuin
     tavallinen pelikortti (Vaalit: Laita järjestykseen -kasvoketju, Luonto: äänivisa). Peli pysyy myös
     pelihyllyssä (V6). Paikka: `components/tn20/runko/PeliBanneri.tsx`. Jos kokoelmalla on lisäksi laskuri,
     se siirtyy heroon (`heroLisa`, Vaalit).
- **V5 kortit** · A (kuva 16:10 + teksti) ja C (listarivi). **Ei leveää B-korttia** (Heikki 21.10.2026: leveä ~2:1-kortti rajasi pysty-, neliö- ja 4:3-kuvat kaistaksi, eikä "kuva oikealla" -muunnelma ollut tyylikäs) — osion ensimmäinen tai nostettu visa on vain ensimmäisenä samassa A-koossa. S1: jokainen kuvallinen visa on A-kortti (myös 9. visasta alkaen ja vaikka kuvallisia olisi vain kaksi), C-rivi vain kuvattomalle. S2: täydet rivit — mobiili 6 (2 × 3), tabletti 6 (3 × 2), desktop 8 (4 × 2), sitten "Näytä kaikki N visaa", joka avaa loput kokonaisina kortteina paikallaan. Grafiikka (`kuvaSovitus: "contain"`) kokonaisena vaalealla levyllä.
- **V6 pelit** · `lib/pelimuodot.ts` (pelimuotorekisteri, `serves`).
- **V7 lisää kokoelmia** · `related` tai automaattisesti (sama pääteema, sitten suosituimmat; `lib/kokoelmat/rekisteri.ts`).
- **Teemaväri** · `accent` = mestaruuden väri rekisteristä. Isot tekstit (h1-korostus, eyebrow) käyttävät sitä
  sellaisenaan; korttikehote `.tn-card-cta` saa vaalennetun version (`color-mix(… 85 %, #fff)`, runko.css),
  koska tummimmat teemavärit (Musiikin violetti) jäivät korttipinnalla alle 4,5:1:n.
- **Siirto rungolle** (vaihe 3) · osiotagit migraatiolla nykyisistä käsilistoista, visamäärä tarkistetaan
  ennen/jälkeen; entiset "Tietoniekka suosittelee" -nostot osioiden `featured`-B-korteiksi; vanhat
  `?suodata=`-linkit ohjataan middlewaressa `#osio-<slug>`-ankkuriin.
