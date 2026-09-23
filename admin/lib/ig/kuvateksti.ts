// Instagram-kuvatekstit (oletus; toimitus voi muokata adminissa).
//
// Kierros 4: kuvassa ei ole metatietoja, joten tausta kulkee kuvatekstissä —
// päivän tapahtuma (event_context), visan nimi ja reittiohje. Linkit eivät ole
// klikattavia, joten ohjataan bioon (tietoniekka.fi/ig). Ei emojeja eikä
// hashtag-tulvaa: muutama tunniste, jotta testin ainoa muuttuja on kortti.

import type { SynttariData, VisaData } from "./data";
import { ilmanTavutusta, KOMMENTTIPOHJAT, type Kentat, type Pohja } from "./pohjat";

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
const t = (s?: string | null) => ilmanTavutusta((s ?? "").replace(/\s+/g, " ").trim());

const KOMMENTTIKEHOTE: Partial<Record<Pohja, string>> = {
  "4f": "Vastaa kommenttiin! Koko visa löytyy biosta.",
  "4o": "Kumpi on oikeassa, Laura vai Mikko? Kerro kommentissa.",
  "4q": "Tiedätkö vastauksen? Kerro kommentissa. Koko visa löytyy biosta.",
  "4i": "Kerro muistosi kommentissa.",
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
  else rivit.push(`${s.visaNimi ? `${s.visaNimi}: ` : ""}testaa tietosi — linkki biossa.`);
  // CC BY-SA -kuvat vaativat kuvaajan ja lisenssin: vain kun kuvassa on henkilökuva.
  if (pohja === "4i" && t(k.kuvaaja)) {
    rivit.push("");
    rivit.push(`Kuva: ${t(k.kuvaaja)}`);
  }
  rivit.push("");
  rivit.push(`${PERUSTAGIT} #päivänsynttärit`);
  return rivit.join("\n");
}
