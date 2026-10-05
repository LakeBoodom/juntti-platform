// VAALIPIIRIKETJU — päivän peli (toteutusbrief 5.10.2026 §3, CD "TN Vaalipiiriketju - pelinäkymä",
// katselmus kierros 1). Tämä tiedosto kelpaa myös selaimeen: tyypit, numerointi ja tarkistus.
// Kierroksen arvonta ja data ovat palvelimella (lib/vaalipiiriketju/data.ts).
//
// Säännöt (CD-briefin §2 + Heikki 5.10.2026, Kuntaliitoksen mekanismi):
//   - 8 istuvaa kansanedustajaa, yksi kustakin päivän reitin vaalipiiristä. Ensimmäinen ja
//     viimeinen ovat lukittuina paikoille 1 ja 8, ja heidän vaalipiirinsä näkyy heti.
//   - Pelaaja järjestää 6 keskimmäistä. Mikä tahansa ehjä ketju alusta loppuun hyväksytään.
//   - Pisteet kuudesta järjestettävästä kortista: kortti on oikein, jos sen vaalipiiri rajautuu
//     edelliseen; viimeisen järjestettävän pitää rajautua myös lukittuun loppuun. 6/6 = ehjä ketju.
//   - Ahvenanmaa–Varsinais-Suomi on lauttayhteys ja kelpaa linkiksi.
//   - Päivän ketju kerran päivässä (tulos selaimeen, "jo pelattu"); "Pelaa uusi ketju" arpoo
//     harjoitusketjun (?ketju=), joka ei vaikuta päivän tulokseen.

export const VPK_SIVU = "/peli/vaalipiiriketju";
export const VPK_NIMI = "Vaalipiiriketju";
export const VPK_KORTTEJA = 8;
/** Pelaajan järjestämät kortit (päät lukittuina). */
export const VPK_JARJESTETTAVIA = VPK_KORTTEJA - 2;
/** #1 = julkaisupäivä (katselmus §6). Hubin kortti ja pelinäkymä käyttävät samaa laskuria (vpkNumero).
 *  Asetetaan tuotantoonvientipäiväksi mergessä. */
export const VPK_JULKAISU = "2026-10-06";

export type VpkLinkki = "maa" | "lautta";

/** Vaalipiiri pelissä: kannan tunnus (hel, uus …), lyhyt nimi ja kartan geometrian avain (01–13). */
export type VpkVaalipiiri = { id: string; nimi: string; k: string };

/** Kortti: nimi ja puolue näkyvät, vaalipiiri paljastuu vasta tarkistuksessa. */
export type VpkEdustaja = { id: string; nimi: string; puolue: string; vp: string; visa: string | null };

export type VpkKierros = {
  iso: string;
  numero: number;
  /** Harjoitusketjun siemen (?ketju=); null = päivän ketju. */
  harjoitus: string | null;
  /** "Maanantai 5.10.2026" */
  paivays: string;
  /** Seuraavan päivän tunniste jo pelattu -ilmoitukseen: "#13 · Ti 6.10." */
  huomenna: string;
  /** Päivän generoitu reitti (näytetään "Oikea reitti" -valinnassa, kun pelaajan ketju ei kelpaa). */
  reitti: VpkEdustaja[];
  /** Kuuden järjestettävän kortin lähtöjärjestys (sekoitettu, ei paljasta reittiä). */
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

/** Täyden ketjun (8 vaalipiiriä, päät mukana) tarkistus: 7 linkkiä ja 6 järjestettävän kortin tulos. */
export function tarkista(vpt: string[], linkit: Record<string, VpkLinkki>) {
  const valit = vpt.slice(0, -1).map((v, i) => linkit[pariAvain(v, vpt[i + 1])] ?? null);
  const kortit = vpt.slice(1, -1).map((_, j) => !!valit[j] && (j < VPK_JARJESTETTAVIA - 1 || !!valit[j + 1]));
  return {
    valit,
    kortit,
    oikein: kortit.filter(Boolean).length,
    kelpaa: valit.every(Boolean),
    ensimmainenKatkos: valit.findIndex((l) => !l),
  };
}

/** Jaettava teksti (CD 2k): ei nimiä, ei vaalipiirejä, ei reittiä. Aina päivän ketjun tulos. */
export function jakoteksti(numero: number, kortit: boolean[]): string {
  const oikein = kortit.filter(Boolean).length;
  return `${VPK_NIMI} #${numero} · ${oikein}/${VPK_JARJESTETTAVIA}\n${kortit.map((k) => (k ? "🟩" : "🟥")).join("")}`;
}

/** Päivän ketjun tulos selaimessa (pelinäkymän "jo pelattu" ja hubin kortin Pelattu-tila). */
export type VpkTallenne = { numero: number; jarjestys: string[]; kortit: boolean[]; oikein: number };
export const tallenneAvain = (iso: string) => `tn-vpk-${iso}`;

export function lueTallenne(iso: string): VpkTallenne | null {
  try {
    const v = JSON.parse(localStorage.getItem(tallenneAvain(iso)) ?? "null");
    const ok =
      v && Array.isArray(v.jarjestys) && v.jarjestys.length === VPK_JARJESTETTAVIA && v.jarjestys.every((x: unknown) => typeof x === "string") &&
      Array.isArray(v.kortit) && v.kortit.length === VPK_JARJESTETTAVIA && typeof v.oikein === "number" && typeof v.numero === "number";
    return ok ? (v as VpkTallenne) : null;
  } catch {
    return null;
  }
}

/** Helsingin kalenteripäivä selaimessa (sama kuin palvelimen lib/aika.ts). */
export const helsinginIso = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

/** Selaimessa arvottava siemen harjoitusketjulle (ei renderissä → ei hydraatioeroa). */
export const uusiKetjuSiemen = () => Math.random().toString(36).slice(2, 8);
