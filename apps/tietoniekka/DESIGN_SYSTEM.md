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

- **V1 hero** · eyebrow → h1 (koko pisimmästä sanasta) → ingressi (≤ 2 riviä) → tilastorivi → yksi `.tn-cta-lime` "Pelaa: <visa>".
- **V2 oma edistyminen** · vain `METAPELI_ENABLED`-lipun takana (esikatselussa `?metapeli=1`).
- **V3 osiochipit** · vain kun osioita ≥ 3; jokaisen osion lopussa "↑ <osioiden nimi>".
- **V4 tunnusosa** · valinnainen: vain navigaatio, joka korvaa V3:n, tai yhdellä silmäyksellä luettava tieto, jota sivulla ei muuten ole.
- **V5 kortit** · A (kuva + teksti), B (osion pääkortti), C (listarivi). S1: ensimmäinen tai nostettu kuvallinen = B, muut kuvalliset A, kuvattomat C, 9. visasta alkaen C; jos B:n jälkeen alle 2 kuvallista, kaikki muut C. S2: mobiili B + 6, desktop B + 8, sitten "Näytä kaikki N visaa" (laajenee paikallaan).
- **V6 pelit** · `lib/pelimuodot.ts` (pelimuotorekisteri, `serves`).
- **V7 lisää kokoelmia** · `related` tai automaattisesti (sama pääteema, sitten suosituimmat; `lib/kokoelmat/rekisteri.ts`).
- **Teemaväri** · `accent` = mestaruuden väri rekisteristä. Isot tekstit (h1-korostus, eyebrow) käyttävät sitä
  sellaisenaan; korttikehote `.tn-card-cta` saa vaalennetun version (`color-mix(… 85 %, #fff)`, runko.css),
  koska tummimmat teemavärit (Musiikin violetti) jäivät korttipinnalla alle 4,5:1:n.
- **Siirto rungolle** (vaihe 3) · osiotagit migraatiolla nykyisistä käsilistoista, visamäärä tarkistetaan
  ennen/jälkeen; entiset "Tietoniekka suosittelee" -nostot osioiden `featured`-B-korteiksi; vanhat
  `?suodata=`-linkit ohjataan middlewaressa `#osio-<slug>`-ankkuriin.
