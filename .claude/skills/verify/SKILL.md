---
name: verify
description: Tarkista oma muutos todisteilla ennen committia tai valmiiksi raportointia (Tietoniekka ja muut juntti-platformin sovellukset). Käytä aina ennen committia, ennen kuin sanot Heikille "valmis", ja kun Heikki pyytää testaamaan muutoksen.
---

# Verify: muutoksen tarkistus ennen committia

Heikki ei lue diffiä. Hän luottaa siihen, että muutos on ajettu ja todettu toimivaksi. Tämä skill on
savutesti: ajetaan aina, nopeimmat tarkistukset ensin, ja tulos kirjataan commit-viestiin.

## 1. Valitse tarkistukset muutettujen tiedostojen perusteella

Katso `git diff --name-only origin/main...HEAD` (ja työpuun muutokset) ja aja kaikki osuvat rivit.

| Muutos koskee | Tarkistus | Missä |
|---|---|---|
| mitä tahansa `apps/tietoniekka/**` | `npx tsc --noEmit` ja `npx next build` (~40 s) kansiossa `apps/tietoniekka` | kontti |
| `packages/db/**`, `packages/ai/**` | tsc + build jokaiselle sovellukselle, joka käyttää pakettia | kontti |
| `apps/juntti/**`, `apps/synttarit/**`, `admin/**` | `npm run typecheck` ja `npm run build` kyseisessä workspacessa | kontti |
| `lib/vihjepeli/**` | `node scripts/run-ts.cjs scripts/vihjepeli-tarkistus.ts` | kontti (ei verkkoa) |
| näkymät, komponentit, CSS (`app/**`, `components/**`, `*.css`) | esikatselutesti: KORTTISÄÄNTÖ-mittaus, vaakaylivuoto, kosketuskohteet ≥ 44 px, mahtuvuus 375 × 667 | Vercel-preview selainpaneelissa |
| pelikehys, aloitusnäkymät | `scripts/pelikehys-tarkistus.cjs` | Heikin kone, jos `device_bash` on käytössä |
| tulosnäkymä, jako | `scripts/tulos-tarkistus.cjs` | Heikin kone, jos käytössä |
| kokoelmasivujen otsikot | `scripts/korttisaanto-webkit.cjs` (Safari-moottori) | Heikin kone, jos käytössä |
| Supabase-data, visatekstit, page_content | `tietomalli-tarkistus.ts`, `kysymysmaara-tarkistus.ts`, `henkilot-vuototarkistus.ts` (tarvitsevat anon-avaimen ja verkon) | Heikin kone tai Supabase MCP -kyselyt |
| kantamuutos (migraatio) | `get_advisors` (security + performance) ja `generate_typescript_types` → `packages/db/types.ts` | Supabase MCP |

`npm run lint` ei ole käytössä (ESLintiä ei ole konfiguroitu). Älä konfiguroi sitä tämän skillin nimissä.

## 2. Ympäristön rajat (älä yritä uudelleen eri komennolla)

- Pilvikontista ei pääse Supabaseen, tietoniekka.fi:hin eikä `*.vercel.app`-osoitteisiin. Kontissa
  ajetaan vain verkottomat tarkistukset: tsc, build ja `vihjepeli-tarkistus`.
- Esikatselu testataan Clauden sisäänrakennetulla selainpaneelilla (`preview_start`). Älä käytä
  Claude in Chromea äänitesteihin. Tarkat ohjeet ovat skillissä `esikatselutesti`. Verifyssä riittää
  sen osa 1 (tekniikat) muuttuneille näkymille. Täysi persoonaläpikäynti ajetaan, kun Heikki pyytää
  tai kun muutos koskee pelin pääpolkua.
- Playwright-skriptit ajetaan Heikin koneella `device_bash`illa, jos se on saatavilla
  (playwright erilliseen kansioon, ks. skriptin otsake). Jos ei ole, korvaa mittaus selainpaneelin
  `javascript_tool`illa ja merkitse leimaan, mitä jäi ajamatta.
- Previewn tila: Vercel MCP `list_deployments` (teamId `team_d8ClUfyvgtYEzX9YmbQ4rXeF`, tietoniekka
  `prj_1fdefpr5qU2ACIabsYs2eIhhK9uw`, suodata `branch`). Valmistuu Hobby-jonossa ~5–10 minuutissa.
  Jos webhook ei laukea, tee tyhjä commit. `CANCELED` pelkässä dokumentaatiomuutoksessa on odotettu
  (Vercel ohittaa buildin, kun sovelluksen tiedostot eivät muutu), ei virhe.

## 3. Korjauskierrokset: enintään kolme

Jos tarkistus kaatuu, etsi juurisyy, korjaa ja aja sama tarkistus uudelleen. **Kolmannen
epäonnistuneen kierroksen jälkeen lopeta** ja kerro Heikille selkokielellä: mikä ei mene läpi, mitä
kokeilit ja mikä on oma arviosi syystä. Älä jatka arvailua neljännelle kierrokselle.

## 4. Tarkistuksia ei löysätä samassa muutoksessa

- Muutos ei saa muokata sääntöä, joka sitä arvioi. Älä muokkaa tätä skilliä, `scripts/*-tarkistus*`-
  skriptejä, KORTTISÄÄNTÖä tai CLAUDE.md:n raja-arvoja samassa haarassa, jotta oma muutos menisi läpi.
- Jos tarkistus on oikeasti väärässä, korjaa se omassa commitissaan ja kerro Heikille yhdellä lauseella miksi.

## 5. Epävakaat tarkistukset

Tarkistusta ei ajeta uudelleen "kunnes se menee läpi", siihen ei lisätä odotusviiveitä eikä sitä ohiteta.
Etsi syy (ajoitus, data, viewport). Jos syytä ei löydy, poista tarkistus ja kirjaa
`docs/PROGRESS.md`:hen, mikä poistettiin ja miksi.

## 6. Leima commit-viestiin

Jokaisen commit-viestin loppuun lisätään yksi rivi siitä, miten muutos tarkistettiin, myös silloin kun
mitään ei ajettu:

```
Verifioitu: tsc, build, esikatselu 320/375/390 (KORTTISÄÄNTÖ 0 ylivuotoa) | ajamatta: tulos-tarkistus (ei konetta)
Verifioitu: ei (vain dokumentaatio)
```

## 7. Siivous

Testipelit kirjautuvat `quiz_plays`-tauluun `session_id`:llä `testi-claude-*`. Poista ne Supabase
MCP:llä testin jälkeen.

## 8. Toistuva virhe muuttuu säännöksi

Jos sama virhe tulee vastaan toisen kerran (tai Heikki joutuu huomauttamaan samasta asiasta uudelleen),
kirjaa siitä lyhyt sääntö: rakenteelliset UI-asiat `tietoniekka-ui-laatu`-skilliin, repon pysyvät
säännöt CLAUDE.md:hen. Muotoile sääntö niin, että sen voi tarkistaa diffistä. Kerro Heikille, mitä
lisäsit. Karsi samalla vanhentuneet säännöt, jotta lista pysyy luettavana.

## Raportti Heikille

Tulos ensin (läpäisi / ei), sitten mitä ajettiin numeroina ja mitä jäi ajamatta. Ei kuvakaappausten auki
kirjoittamista eikä teknistä jargonia.
