// VAALIPIIRIKETJU — päivän peli (toteutusbrief 5.10.2026 §3, CD "TN Vaalipiiriketju - pelinäkymä",
// katselmus kierros 1). Tämä tiedosto kelpaa myös selaimeen: tyypit, numerointi ja tarkistus.
// Kierroksen arvonta ja data ovat palvelimella (lib/vaalipiiriketju/data.ts).
//
// Säännöt (lukittu CD-briefin §2:ssa):
//   - 8 istuvaa kansanedustajaa, yksi kustakin päivän reitin vaalipiiristä.
//   - Mikä tahansa kelvollinen järjestys hyväksytään: kortti on oikein, jos sen vaalipiiri
//     rajautuu edellisen kortin vaalipiiriin; ensimmäinen kortti, jos se rajautuu seuraavaan.
//   - Ahvenanmaa–Varsinais-Suomi on lauttayhteys ja kelpaa linkiksi.
//   - Yksi yritys päivässä; tulos jää selaimeen ("jo pelattu").

export const VPK_SIVU = "/peli/vaalipiiriketju";
export const VPK_NIMI = "Vaalipiiriketju";
export const VPK_KORTTEJA = 8;
/** #1 = julkaisupäivä (katselmus §6). Hubin kortti ja pelinäkymä käyttävät samaa laskuria. */
export const VPK_JULKAISU = "2026-10-06";

export type VpkLinkki = "maa" | "lautta";

/** Vaalipiiri pelissä: kannan tunnus (hel, uus …), lyhyt nimi ja kartan geometrian avain (01–13). */
export type VpkVaalipiiri = { id: string; nimi: string; k: string };

/** Kortti: nimi ja puolue näkyvät, vaalipiiri paljastuu vasta tarkistuksessa. */
export type VpkEdustaja = { id: string; nimi: string; puolue: string; vp: string; visa: string | null };

export type VpkKierros = {
  iso: string;
  numero: number;
  /** "Maanantai 5.10.2026" */
  paivays: string;
  /** Seuraavan päivän tunniste jo pelattu -ilmoitukseen: "#13 · Ti 6.10." */
  huomenna: string;
  /** Päivän generoitu reitti (näytetään "Oikea reitti" -valinnassa, kun pelaajan ketju ei kelpaa). */
  reitti: VpkEdustaja[];
  /** Korttien lähtöjärjestys (sekoitettu, ei paljasta reittiä). */
  pino: string[];
  vaalipiirit: VpkVaalipiiri[];
  /** "a-b" (a < b) → linkin tyyppi. */
  linkit: Record<string, VpkLinkki>;
};

export const pariAvain = (a: string, b: string) => (a < b ? `${a}-${b}` : `${b}-${a}`);

const PAIVA_MS = 86_400_000;
const isoUtc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));

/** Päivän numero: #1 = julkaisupäivä. Ennen julkaisua (preview) näytetään #1. */
export function vpkNumero(iso: string): number {
  return Math.max(1, Math.round((isoUtc(iso) - isoUtc(VPK_JULKAISU)) / PAIVA_MS) + 1);
}

export function lisaaPaivia(iso: string, n: number): string {
  return new Date(isoUtc(iso) + n * PAIVA_MS).toISOString().slice(0, 10);
}

const VIIKONPAIVAT = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];
const LYHYET = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

export function paivaysTeksti(iso: string, lyhyt = false): string {
  const d = new Date(isoUtc(iso));
  const vp = d.getUTCDay();
  const pvm = `${d.getUTCDate()}.${d.getUTCMonth() + 1}.`;
  return lyhyt ? `${LYHYET[vp]} ${pvm}` : `${VIIKONPAIVAT[vp]} ${pvm}${d.getUTCFullYear()}`;
}

/** Pelaajan järjestyksen tarkistus: linkit korttien välillä ja korttikohtainen tulos. */
export function tarkista(vpt: string[], linkit: Record<string, VpkLinkki>) {
  const valit = vpt.slice(0, -1).map((v, i) => linkit[pariAvain(v, vpt[i + 1])] ?? null);
  const kortit = vpt.map((_, i) => (i === 0 ? !!valit[0] : !!valit[i - 1]));
  return {
    valit,
    kortit,
    oikein: kortit.filter(Boolean).length,
    kelpaa: valit.every(Boolean),
    ensimmainenKatkos: valit.findIndex((l) => !l),
  };
}

/** Jaettava teksti (CD 2k): ei nimiä, ei vaalipiirejä, ei reittiä. */
export function jakoteksti(numero: number, kortit: boolean[]): string {
  const oikein = kortit.filter(Boolean).length;
  return `${VPK_NIMI} #${numero} · ${oikein}/${VPK_KORTTEJA}\n${kortit.map((k) => (k ? "🟩" : "🟥")).join("")}`;
}
