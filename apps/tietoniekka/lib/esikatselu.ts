// ESIKATSELUKORTIT (Jakotekstit ja esikatselut v4 §4, Heikki 6.–7.11.2026, vaihe 2): kortti esittelee pelin,
// viesti ei. og:title = "{korttinimi} – {pelityyppi}" (≤ 55 merkkiä), og:description = "{koukku} {tehtävälause}".
// Koukku on vain tietovisoissa ja megavisoissa (visan oma kysymys, lib/koukku.ts); muut pelit saavat koukun vaiheessa 4.
// Ei "Pystytkö parempaan?" -kehotusta, tasonimiä eikä tulosta: tulos on viestissä.
//
// Dokumentista poikkeavat luvut tulevat datasta (Heikki hyväksyi 7.11.): visoissa on 5–10 kysymystä, äänivisoissa
// kymmenen ääntä, megavisoissa 20–50 kysymystä, Vaalipiiriketjussa kuusi arvattavaa ja Järjestä-pakan lause pakasta.

export const OTSIKKO_MAX = 55;

const LUVUT = ["nolla", "yksi", "kaksi", "kolme", "neljä", "viisi", "kuusi", "seitsemän", "kahdeksan", "yhdeksän", "kymmenen",
  "yksitoista", "kaksitoista", "kolmetoista", "neljätoista", "viisitoista", "kuusitoista", "seitsemäntoista", "kahdeksantoista", "yhdeksäntoista", "kaksikymmentä"];

/** 10 → "kymmenen"; yli 20 numerona. */
export const lukusana = (n: number) => (Number.isInteger(n) && n >= 0 && n < LUVUT.length ? LUVUT[n] : String(n));
const iso = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export type Pelimuoto =
  | "tietovisa" | "kuvavisa" | "aanivisa" | "megavisa" | "tupla" | "rajanaapurit" | "osavaltiot" | "kuntaliitos"
  | "vaalipiiriketju" | "jarjesta" | "ikajarjestys" | "visapaketti";

/** og:titlen pelityyppi (§4), pienellä. Megavisassa kysymysmäärä visasta. */
export function pelityyppi(m: Pelimuoto, n?: number): string {
  switch (m) {
    case "tietovisa": return "tietovisa";
    case "kuvavisa": return "kuvavisa";
    case "aanivisa": return "äänivisa";
    case "megavisa": return n ? `${n} kysymyksen visa` : "megavisa";
    case "tupla": return "kaikki tai ei mitään";
    case "rajanaapurit": case "osavaltiot": case "kuntaliitos": return "karttapeli";
    case "vaalipiiriketju": return "kansanedustajapeli";
    case "jarjesta": case "ikajarjestys": return "järjestyspeli";
    case "visapaketti": return "valmis visailta";
  }
}

/** og:descriptionin tehtävälause (§4). n = kysymysten, kuvien tai äänten määrä. */
export function tehtavalause(m: Pelimuoto, n?: number): string {
  switch (m) {
    case "tietovisa": return `${iso(lukusana(n ?? 10))} kysymystä.`;
    case "kuvavisa": return `Tunnista ${lukusana(n ?? 10)} kuvaa.`;
    case "aanivisa": return `Kuuntele ja tunnista ${lukusana(n ?? 10)} ääntä.`;
    /* Koukun jälkeen "Ja 49 muuta kysymystä."; ilman koukkua kysymysmäärä. */
    case "megavisa": return n ? `${n} kysymystä yhdellä istumalla.` : "Pitkä visa yhdellä istumalla.";
    /* Turvatasot 4 ja 6 ja kuittaus: väärä vastaus ei aina vie kaikkea (Heikki 7.11.). */
    case "tupla": return "Montako saat oikein peräkkäin? Lopeta ajoissa, ettet menetä pottia.";
    case "rajanaapurit": return "Etsi reitti maasta naapurimaahan.";
    case "osavaltiot": return "Etsi reitti osavaltiosta naapuriosavaltioon.";
    case "kuntaliitos": return "Kulje naapurikunnasta toiseen.";
    case "vaalipiiriketju": return "Arvaa kuuden kansanedustajan vaalipiiri.";
    case "jarjesta": return "Laita kahdeksan oikeaan järjestykseen.";
    case "ikajarjestys": return "Laita kahdeksan tunnettua ikäjärjestykseen.";
    case "visapaketti": return "Valmiit kysymykset ja vastaukset.";
  }
}

/** Megavisan koukun jälkeinen lause: "Ja 49 muuta kysymystä." */
export const megaJatko = (n: number) => `Ja ${n - 1} muuta kysymystä.`;

/** Kuvan alarivi: tehtävälauseen lyhyt muoto ilman pistettä (Tuplassa vain kysymys). */
export function kuvalause(m: Pelimuoto, n?: number): string {
  if (m === "tupla") return "Montako saat oikein peräkkäin?";
  if (m === "megavisa") return n ? `${n} kysymystä` : "Pitkä visa";
  if (m === "jarjesta") return "Laita kahdeksan järjestykseen";
  if (m === "ikajarjestys") return "Laita kahdeksan ikäjärjestykseen";
  if (m === "vaalipiiriketju") return "Kuusi kansanedustajaa";
  return tehtavalause(m, n).replace(/\.$/, "");
}

/** "{korttinimi} – {pelityyppi}", enintään 55 merkkiä: liian pitkä nimi lyhennetään sanan rajalta. */
export function korttiOtsikko(nimi: string, tyyppi: string): string {
  const hanta = ` – ${tyyppi}`;
  const t = nimi.trim();
  if (t.length + hanta.length <= OTSIKKO_MAX) return t + hanta;
  const tila = OTSIKKO_MAX - hanta.length - 1;
  const lyhyt = t.slice(0, tila).replace(/\s+\S*$/, "") || t.slice(0, tila);
  return `${lyhyt}…${hanta}`;
}

/** "{koukku} {tehtävälause}" — ilman koukkua pelkkä tehtävälause. */
export const korttiKuvaus = (koukku: string | null | undefined, lause: string) => (koukku?.trim() ? `${koukku.trim()} ${lause}` : lause);

/** Esikatselun og-kentät yhdellä kutsulla (jakoMeta-muoto). */
export function esikatselu(o: { nimi: string; muoto: Pelimuoto; n?: number; koukku?: string | null; lause?: string }) {
  return {
    title: korttiOtsikko(o.nimi, pelityyppi(o.muoto, o.n)),
    description: korttiKuvaus(o.koukku, o.lause ?? (o.muoto === "megavisa" && o.koukku && o.n ? megaJatko(o.n) : tehtavalause(o.muoto, o.n))),
  };
}
