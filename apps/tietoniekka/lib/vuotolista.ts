// Vuotosääntö (brief B2, Cowork 3.10.2026): henkilösivu ei saa paljastaa henkilön oman visan
// vastauksia. Yksi yhteinen lista kahteen käyttöön:
//   1. scripts/henkilot-vuototarkistus.ts — intro_text, facts, nickname, bio_short vs. visa
//   2. henkilösivun Ikäjärjestys-nosto — vastustajaksi ei valita henkilöä, joka on visan vastaus
// Vertailu on karkea: pienet kirjaimet, diakriitit pois, sanan alkuosa (taivutusmuodot "Ferrarilla").

export type VisanKysymys = { question_text: string; answers: Array<{ text: string; is_correct?: boolean }> | null };

export type Vuotolista = {
  /** Oikeat vastaukset sellaisinaan ("Ferrari", "Abu Dhabin GP"). */
  vastaukset: string[];
  /** Vuosiluvut oikeissa vastauksissa — kielletty kaikissa kentissä, myös facts-riveillä. */
  vuodetVastauksissa: string[];
  /** Vuosiluvut kysymyksissä — kielletty esittelyssä ja lempinimessä, sallittu facts-riveillä. */
  vuodetKysymyksissa: string[];
  /** Erisnimet kysymyksissä (iso alkukirjain muualla kuin virkkeen alussa), ilman henkilön omaa nimeä. */
  nimet: string[];
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ");

const sanat = (s: string) => norm(s).split(/[\s-]+/).filter((w) => w.length >= 3);

/** Sanan vertailtava alkuosa: taivutuspääte pois karkeasti (vähintään 4 merkkiä jää). */
const kanta = (w: string) => (w.length <= 5 ? w : w.slice(0, Math.max(4, w.length - 3)));

const YLEISET = new Set(["kuka", "mika", "missa", "mista", "milla", "minka", "kenen", "kuinka", "milloin", "monta", "mita", "mihin", "minne"]);

function erisnimet(teksti: string): string[] {
  const out: string[] = [];
  // Virkkeen ensimmäinen sana ohitetaan (se on isolla joka tapauksessa).
  for (const virke of teksti.split(/(?<=[.!?:])\s+|["”“]/)) {
    const ws = virke.trim().split(/\s+/);
    ws.slice(1).forEach((w) => {
      const puhdas = w.replace(/^[^A-Za-zÅÄÖåäöÉé]+|[^A-Za-zÅÄÖåäöÉé0-9-]+$/g, "");
      if (/^[A-ZÅÄÖÉ]/.test(puhdas) && puhdas.length >= 3) out.push(puhdas);
    });
  }
  return out;
}

export function rakennaVuotolista(kysymykset: VisanKysymys[], omaNimi: string): Vuotolista {
  const oma = new Set(sanat(omaNimi).map(kanta));
  const vastaukset: string[] = [];
  const vuodetV = new Set<string>();
  const vuodetK = new Set<string>();
  const nimet = new Set<string>();
  for (const k of kysymykset) {
    for (const a of k.answers ?? []) {
      if (!a.is_correct) continue;
      vastaukset.push(a.text);
      for (const y of a.text.match(/\b(1[5-9]\d\d|20\d\d)\b/g) ?? []) vuodetV.add(y);
    }
    for (const y of k.question_text.match(/\b(1[5-9]\d\d|20\d\d)\b/g) ?? []) vuodetK.add(y);
    for (const n of erisnimet(k.question_text)) {
      const ws = sanat(n);
      if (ws.length && ws.every((w) => !oma.has(kanta(w)) && !YLEISET.has(w))) nimet.add(n);
    }
  }
  return { vastaukset, vuodetVastauksissa: [...vuodetV], vuodetKysymyksissa: [...vuodetK], nimet: [...nimet] };
}

/** Löytyykö fraasi tekstistä (jokainen fraasin sana kantamuodossa tekstin sanojen alusta). */
export function sisaltaa(teksti: string, fraasi: string): boolean {
  const t = sanat(teksti);
  const f = sanat(fraasi);
  if (!f.length) return false;
  return f.every((w) => t.some((tw) => tw.startsWith(kanta(w))));
}

export type VuotoOsuma = { tyyppi: "vastaus" | "vuosi" | "nimi"; arvo: string };

/** Osumat tekstistä. `faktarivi` = facts-arvo: kysymysten vuosiluvut sallittuja, vastausten eivät. */
export function vuodot(teksti: string, lista: Vuotolista, faktarivi = false): VuotoOsuma[] {
  const out: VuotoOsuma[] = [];
  for (const v of lista.vastaukset) if (sisaltaa(teksti, v)) out.push({ tyyppi: "vastaus", arvo: v });
  const vuodet = faktarivi ? lista.vuodetVastauksissa : [...lista.vuodetVastauksissa, ...lista.vuodetKysymyksissa];
  for (const y of new Set(vuodet)) if (new RegExp(`\\b${y}\\b`).test(teksti)) out.push({ tyyppi: "vuosi", arvo: y });
  for (const n of lista.nimet) if (sisaltaa(teksti, n)) out.push({ tyyppi: "nimi", arvo: n });
  return out;
}

/** Ikäjärjestyksen vastustaja: kelpaa, jos hänen sukunimensä/nimensä ei ole visan vastaus eikä kysymyksen erisnimi. */
export function nimiVuotaa(nimi: string, lista: Vuotolista): boolean {
  const osat = sanat(nimi);
  const suku = osat[osat.length - 1];
  const osuu = (lahde: string) => sisaltaa(lahde, nimi) || (!!suku && suku.length >= 4 && sanat(lahde).some((w) => w.startsWith(kanta(suku))));
  return lista.vastaukset.some(osuu) || lista.nimet.some(osuu);
}
