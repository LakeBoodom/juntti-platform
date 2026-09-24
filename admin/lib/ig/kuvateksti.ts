// Instagram-kuvatekstit (oletus; toimitus voi muokata adminissa).
//
// Kierros 4: kuvassa ei ole metatietoja, joten tausta kulkee kuvatekstissä —
// päivän tapahtuma (event_context), visan nimi ja reittiohje. Linkit eivät ole
// klikattavia, joten ohjataan bioon (tietoniekka.fi/ig). Ei emojeja eikä
// hashtag-tulvaa: muutama tunniste, jotta testin ainoa muuttuja on kortti.

import type { SynttariData, VisaData } from "./data";
import { ilmanTavutusta, KOMMENTTIPOHJAT, onHenkilopohja, type Kentat, type Pohja } from "./pohjat";

const KOKOELMA_TAGI: Record<string, string> = {
  Urheilu: "#urheilu",
  Jääkiekko: "#jääkiekko",
  Luonto: "#luonto",
  "Tiede & teknologia": "#tiede",
  Maantieto: "#maantieto",
  "TV & suoratoisto": "#tvsarjat",
  Musiikki: "#musiikki",
  Elokuvat: "#elokuvat",
  "Tunnetut henkilöt": "#julkkikset",
  Historia: "#historia",
  Kulttuuri: "#kulttuuri",
  "Suomen kaupungit": "#suomi",
};

const PERUSTAGIT = "#tietoniekka #tietovisa";

const piste = (s: string) => (/[.!?…]$/.test(s) ? s : `${s}.`);
// Hakasulkeet merkitsevät kortin aihelaatikon (kierros 5) — kuvatekstissä ne jäävät pois.
const t = (s?: string | null) => ilmanTavutusta((s ?? "").replace(/[[\]]/g, "").replace(/\s+/g, " ").trim());

/** Kortit, joissa visan kansikuva näkyy — Wikimedia-kuvan tekijä kuvatekstiin. */
const KANSIKUVAPOHJAT: Pohja[] = ["4a", "4g", "4d", "5a", "5b", "5d"];

const KOMMENTTIKEHOTE: Partial<Record<Pohja, string>> = {
  "4f": "Vastaa kommenttiin! Koko visa löytyy biosta.",
  "4o": "Kumpi on oikeassa, Laura vai Mikko? Kerro kommentissa.",
  "4q": "Tiedätkö vastauksen? Kerro kommentissa. Koko visa löytyy biosta.",
  "4i": "Kerro muistosi kommentissa.",
  "5n": "Kumpi on oikeassa, Laura vai Mikko? Kerro kommentissa.",
  "5p": "Tiedätkö vastauksen? Kerro kommentissa. Koko visa löytyy biosta.",
};

export function visaKuvateksti(v: VisaData, pohja: Pohja, k: Kentat): string {
  const rivit: string[] = [];
  const koukku = t(k.koukku);
  if (koukku) rivit.push(koukku);
  const palkinto = t(k.palkinto);
  if (palkinto) rivit.push(palkinto);
  const tapahtuma = t(k.tapahtuma) || t(v.introOtsikko);
  if (tapahtuma) rivit.push(piste(tapahtuma));
  if (!rivit.length) rivit.push(piste(v.nimi));
  rivit.push("");
  const kommentti = KOMMENTTIPOHJAT.includes(pohja) && k.reitti !== true;
  if (kommentti) rivit.push(KOMMENTTIKEHOTE[pohja] ?? "Vastaa kommenttiin!");
  else rivit.push(`${v.nimi}: ${v.kysymyksia} kysymystä, ei kirjautumista. Pelaa — linkki biossa.`);
  // CC BY-SA vaatii tekijän ja lisenssin. Toimituksen kirjoittama kuvaaja voittaa haetun.
  const henkilo = onHenkilopohja(pohja) && v.henkilo;
  const kuvaaja = t(k.kuvaaja) || (henkilo ? (k.kuva?.url ? v.kuvaaja : v.henkilo?.kuvaaja) : KANSIKUVAPOHJAT.includes(pohja) ? v.kuvaaja : null);
  if (kuvaaja) {
    rivit.push("");
    rivit.push(`Kuva: ${kuvaaja}`);
  }
  rivit.push("");
  rivit.push([PERUSTAGIT, v.oma ? null : "#päivänvisa", KOKOELMA_TAGI[v.kokoelma]].filter(Boolean).join(" "));
  return rivit.join("\n");
}

export function synttariKuvateksti(s: SynttariData, pohja: Pohja, k: Kentat): string {
  const rivit: string[] = [];
  if (s.muisto) {
    const vuodet = s.syntymavuosi && s.kuolinvuosi ? ` (${s.syntymavuosi}–${s.kuolinvuosi})` : "";
    rivit.push(`${s.nimi}${vuodet} olisi täyttänyt tänään ${s.ika} vuotta.`);
  } else {
    rivit.push(`${s.nimi} täyttää tänään ${s.ika} vuotta. Onnea!`);
  }
  const koukku = t(k.koukku);
  if (koukku) rivit.push(koukku);
  const palkinto = t(k.palkinto);
  if (palkinto) rivit.push(palkinto);
  rivit.push("");
  if (pohja === "4i" || !s.quizId) rivit.push(KOMMENTTIKEHOTE["4i"]!);
  else if (pohja === "5p" && k.reitti !== true) rivit.push(`Tiedätkö vastauksen? Kerro kommentissa. ${s.visaNimi ? `${s.visaNimi}: koko visa` : "Koko visa"} löytyy biosta.`);
  else rivit.push(`${s.visaNimi ? `${s.visaNimi}: ` : ""}testaa tietosi — linkki biossa.`);
  // CC BY-SA -kuvat vaativat kuvaajan ja lisenssin: vain kun kuvassa on henkilökuva.
  const kuvaaja = t(k.kuvaaja) || s.kuvaaja;
  if ((pohja === "4i" || onHenkilopohja(pohja)) && kuvaaja) {
    rivit.push("");
    rivit.push(`Kuva: ${kuvaaja}`);
  }
  rivit.push("");
  rivit.push(`${PERUSTAGIT} #päivänsynttärit`);
  return rivit.join("\n");
}
