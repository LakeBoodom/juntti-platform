# Cowork-brief: Kumpi?-kysymykset ilman lajia (22.11.2026)

**Tausta.** Teemakierroksessa (esim. Suomikiekon legendat) pelaaja tietää lajin teemasta. Päivän Kumpi? ja Putki
sekoittavat kaikki teemat, joten kysymyksen on oltava ymmärrettävä yksinään. Heikki pelasi Päivän Kumpi?:a ja sai
kysymyksen "Kumman maan Suomi kaatoi 1995 puolivälierässä 5–0?" (Ranska / Italia). Lajia ei mainita, joten kysymykseen
on mahdoton vastata, vaikka tietäisi jääkiekosta.

Supabase `pkfsdzqwfxqczirjddue`, taulu `kumpi_visakysymykset` (sarakkeet `kysymys`, `oikea`, `vaara`, `teemat`).
Hakasulut kysymyksessä merkitsevät korostuksen, ne säilytetään.

## Sääntö

Jokaisesta kysymyksestä on käytävä ilmi laji tai sarja, ellei vaihtoehdoista tai kysymyksen nimistä selviä se
yksiselitteisesti (esim. "Kumpi valmensi Tapparan mestaruuteen 2003?" on selvä, "Kumman maan Suomi kaatoi 2022
MM-välierässä?" ei ole). Kysymyksen on mahduttava ruutuun ilman vieritystä: enintään 70 merkkiä hakasulkuja lukuun ottamatta (nyt pisin on 66).
Jos lajin lisääminen vie yli, lyhennä muualta (esim. "vuoden 2022" → "2022").

Ehdotettu korjaustapa: lisää laji MM-kisojen tai turnauksen yhteyteen.
- "Kumman maan Suomi kaatoi 1995 [puolivälierässä] 5–0?" → "Kumman maan Suomi kaatoi 1995 jääkiekon MM-[puolivälierässä] 5–0?"
- "Kummassa hallissa pelattiin [vuoden 1995 MM-finaali]?" → "Kummassa hallissa pelattiin [jääkiekon MM-finaali] 1995?"
- "nuorten MM" → "jääkiekon nuorten MM" tai "alle 20-vuotiaiden MM-jääkiekossa"

## 1. Suomikiekon legendat: 76 kysymystä, joissa ei mainita jääkiekkoa

Lista on haettu kannasta 22.11.2026 (kysymyksessä ei sanaa kiekko, NHL, Leijonat, Stanley tai jääkiekon palkinnon
nimeä). Käy jokainen läpi säännön mukaan: osassa pelaajanimet kertovat lajin riittävästi, ja ne voi jättää ennalleen.
Ensimmäisenä korjattavat ovat maa vastaan maa -kysymykset ja kaupunki- ja hallikysymykset, joissa vaihtoehdot eivät
paljasta lajia.

```sql
select id, kysymys, oikea, vaara from kumpi_visakysymykset
where status = 'published' and 'suomikiekon-legendat' = any(teemat)
and kysymys !~* '(kiekko|nhl|leijon|stanley|triple gold|calder|vezina|lady byng|conn smythe|montreal|carolina|la kings|gretzky|hurricanes)'
order by kysymys;
```

## 2. Muut urheiluteemat: tarkista nämä

| id | Kysymys | Laji |
|---|---|---|
| `b0fee456` | Kummalla pelipaikalla [Mikko Esko] pelasi maajoukkueessa? | lentopallo |
| `ae11dcaf` | Kummalla nimellä Honka voitti [mestaruuden 1974]? | koripallo |
| `d2e69646` | Kumman joukkueen Kataja kaatoi jatkoajalla [cupin finaalissa] 2023? | koripallo |
| `99cc454f` | Kumman suurvallan Suomi kaatoi [Maailmanliigassa] 2009? | lentopallo |
| `a42effe6` | Kumpi on palkittu parhaana vahtina [kolmessa seurassa]? (Liiga) | jääkiekko |
| `242c8e0f` | Kumpi lopetti 2023 kaikkien aikojen [pistepörssin] neljäntenä? (Liiga) | jääkiekko |
| `abe7ae2e` | Kumpi on pelaajien valitseman [parhaan tuomarin] palkinto? (Liiga) | jääkiekko |

Liiga-kysymyksissä seuran nimi (Tappara, Kärpät, HIFK ...) riittää kertomaan lajin.

## Ennen kuin viet muutokset

- Älä muuta `oikea`- ja `vaara`-kenttiä äläkä `status`-kenttää.
- Aja muutokset yhtenä `update`-lauseena ja kirjaa muutettujen rivien määrä. Claude Code tarkistaa sen jälkeen pituudet
  ja ajaa Kumpi?-pelin laatuportin (`scripts/kumpi-laatu.ts`).
