// Instagram-julkaisujen suunnitelma ja pohjakierto — Claude Design kierros 4.
//
// Kiertosäännöt:
//  - Sama pohja ei toistu kahtena päivänä peräkkäin, eikä saman perheen kortti
//    (kuva / teksti / kysymys / juontaja), jos muitakin on tarjolla — testissä
//    eroa tekee motiivi, ei se, että sama kortti toistuu.
//  - Vähiten käytetty kelpaava pohja ensin, sitten saman aiheluokan (urheilu/muu)
//    käyttömäärän mukaan — jokainen pohja saa sekä urheilu- että muita aiheita.
//  - Käsin valittavat pohjat (4d nostalgia, 4i muisto, 4j tuotanto) eivät ole kierrossa.
//
// Rivi luodaan kahdessa vaiheessa: (1) pohjat päätetään päivä kerrallaan ilman
// tekoälyä, jotta kierto näkee edellisen päivän valinnan; (2) tekstit luonnostellaan
// rinnakkain. Jos tekoäly ei vastaa pohjalle, joka tarvitsee koukun, pohja vaihtuu
// kiinteän koukun korttiin.

import { getSupabaseAdmin } from "@juntti/db";
import { lataaFontit } from "./fontit";
import {
  haePaivanSynttarit,
  haePaivanVisa,
  haeVisa,
  kelpaaKaistaleeksi,
  kelpaaKokoPinnaksi,
  lataaKuva,
  type SynttariData,
  type VisaData,
} from "./data";
import { kokoelmaNimi } from "@/lib/kokoelmat";
import {
  AUTO_VISA,
  LUPAA_TASON,
  PERHE,
  TEKOALY_KOUKKU,
  TEKOALY_PALKINTO,
  kortinKysymykset,
  henkilovisanPohja,
  kysymyksiaPohjalle,
  onHenkilopohja,
  synttareidenPohja,
  tarkistaSynttarit,
  tarkistaVisa,
  type Kentat,
  type Pohja,
} from "./pohjat";
import { luoFanitasot, luonnosteleTekstit } from "./tekstit";
import type { Tilastot } from "./instagram";

export type Slotti = "paivan_visa" | "synttarit" | "oma";
export type Tila = "luonnos" | "hyvaksytty" | "julkaistaan" | "julkaistu" | "epaonnistui" | "ohitettu";

export type Julkaisu = {
  id: string;
  paiva: string;
  slotti: Slotti;
  /** Kierroksen 4 pohja; julkaistuissa voi olla myös kierroksen 2 tunnus (V-A …) */
  pohja: Pohja;
  pohja_valittu_kasin: boolean;
  muoto: "kuva" | "karuselli";
  quiz_id: string | null;
  celebrity_id: string | null;
  kokoelma: string | null;
  on_kuva: boolean;
  kentat: Kentat;
  kuvateksti: string | null;
  tila: Tila;
  julkaistu_at: string | null;
  kampanja: string | null;
  virhe: string | null;
  ig_permalink: string | null;
  ig_tilastot: Tilastot | null;
  tilastot_at: string | null;
  /** Julkaistut kuvat (julkaistun kortin esikatselu, myös kierroksen 2 pohjille) */
  kuva_urls: string[] | null;
};

const SARAKKEET =
  "id, paiva, slotti, pohja, pohja_valittu_kasin, muoto, quiz_id, celebrity_id, kokoelma, on_kuva, kentat, kuvateksti, tila, julkaistu_at, kampanja, virhe, ig_permalink, ig_tilastot, tilastot_at, kuva_urls";

/* ── Asetukset ───────────────────────────────────────────────────────── */

export type Asetukset = {
  visa_paalla: boolean;
  synttarit_paalla: boolean;
  /** Ajastin julkaisee hyväksytyt julkaisut automaattisesti (oletus pois) */
  automaattinen: boolean;
  /** Julkaisuajat Helsingin aikaa, "07:30:00" */
  visa_klo: string;
  synttarit_klo: string;
  omat_klo: string;
};

export const OLETUSASETUKSET: Asetukset = {
  visa_paalla: true,
  synttarit_paalla: true,
  automaattinen: false,
  visa_klo: "07:30:00",
  synttarit_klo: "11:00:00",
  omat_klo: "17:00:00",
};

export async function haeAsetukset(siteId: string): Promise<Asetukset> {
  const { data } = await getSupabaseAdmin()
    .from("ig_asetukset" as never)
    .select("visa_paalla, synttarit_paalla, automaattinen, visa_klo, synttarit_klo, omat_klo")
    .eq("site_id", siteId)
    .maybeSingle();
  return (data as unknown as Asetukset | null) ?? OLETUSASETUKSET;
}

/* ── Päivämäärät (Helsingin aika) ────────────────────────────────────── */

export function tanaanHelsinki(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Helsinki" }).format(new Date());
}

export function lisaaPaivia(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

/* ── Kierto ──────────────────────────────────────────────────────────── */

type Historia = Array<{ paiva: string; slotti: Slotti; pohja: string; urheilu: boolean }>;

/** Tarkistukseen: koukkua vaativat pohjat arvioidaan paikkamerkkikoukulla, koska
    tekstit luonnostellaan vasta pohjan valinnan jälkeen. */
const KOEKENTAT: Kentat = { koukku: "Oletko oikea fani?", palkinto: "" };

function valitse(ehdokkaat: Pohja[], paiva: string, slotti: Slotti, urheilu: boolean, historia: Historia, jarjestys: Pohja[]): Pohja | null {
  const oma = historia.filter((h) => h.slotti === slotti && h.paiva !== paiva);
  const eilen = oma.filter((h) => h.paiva === lisaaPaivia(paiva, -1)).map((h) => h.pohja);
  const eilenPerheet = new Set(eilen.map((p) => PERHE[p as Pohja]).filter(Boolean));
  let kelpaavat = ehdokkaat.filter((p) => !eilen.includes(p));
  const perheittain = kelpaavat.filter((p) => !eilenPerheet.has(PERHE[p]));
  if (perheittain.length) kelpaavat = perheittain;
  if (kelpaavat.length === 0) return null;
  const kaikki = (p: Pohja) => oma.filter((h) => h.pohja === p).length;
  const luokassa = (p: Pohja) => oma.filter((h) => h.pohja === p && h.urheilu === urheilu).length;
  return [...kelpaavat].sort((a, b) => kaikki(a) - kaikki(b) || luokassa(a) - luokassa(b) || jarjestys.indexOf(a) - jarjestys.indexOf(b))[0];
}

function urheiluKokoelma(k: string | null) {
  return k === "Urheilu" || k === "Jääkiekko";
}

type Mitat = Awaited<ReturnType<typeof lataaFontit>>["mitat"];

/** Kierrossa kelpaavat visapohjat tälle visalle (ei esteitä paikkamerkkikoukulla). */
async function kelpaavatVisapohjat(m: Mitat, v: VisaData, siemen: string, vainKiinteat = false): Promise<Pohja[]> {
  const tulos: Pohja[] = [];
  for (const p of AUTO_VISA) {
    if (vainKiinteat && TEKOALY_KOUKKU.includes(p)) continue;
    const t = await tarkistaVisa({ m, siemen }, p, v, KOEKENTAT);
    if (t.esteet.length === 0) tulos.push(p);
  }
  // Kehyskortti 5b on pienen kuvan pohja: iso kuva kuuluu koko pinnalle (5a).
  return tulos.includes("5a") ? tulos.filter((p) => p !== "5b") : tulos;
}

/** Kysymyspohjille valitut kysymykset talteen, jotta toimitus näkee ja voi vaihtaa ne. */
function kysymysKentat(v: { kysymykset: VisaData["kysymykset"] }, pohja: Pohja, siemen: string): Kentat {
  if (!kysymyksiaPohjalle(pohja)) return {};
  return { kysymykset: kortinKysymykset(v, {}, pohja, siemen).map((q) => q.id) };
}

/* ── Suunnitelman ylläpito ───────────────────────────────────────────── */

export type PaivanSisalto = {
  paiva: string;
  visa: VisaData | null;
  synttarit: SynttariData | null;
  visaRivi: Julkaisu | null;
  synttariRivi: Julkaisu | null;
  /** Omat julkaisut ja kampanjat tälle päivälle */
  omat: Julkaisu[];
};

/**
 * Varmistaa, että jokaiselle päivälle tänään…tänään+paivia−1 on suunnitelma,
 * ja palauttaa päivien sisällön riveineen. Idempotentti: ajetaan adminin sivun latauksessa.
 */
export async function varmistaSuunnitelma(siteId: string, paivia = 14): Promise<PaivanSisalto[]> {
  const sb = getSupabaseAdmin();
  const alku = tanaanHelsinki();
  const { mitat } = await lataaFontit();
  const asetukset = await haeAsetukset(siteId);

  const [{ data: rivit }, sisallot] = await Promise.all([
    sb.from("ig_julkaisut" as never).select(SARAKKEET).eq("site_id", siteId).order("paiva"),
    Promise.all(
      Array.from({ length: paivia }, (_, i) => lisaaPaivia(alku, i)).map(async (paiva) => ({
        paiva,
        visa: asetukset.visa_paalla ? await haePaivanVisa(siteId, paiva) : null,
        synttarit: asetukset.synttarit_paalla ? await haePaivanSynttarit(siteId, paiva) : null,
      })),
    ),
  ]);
  const kaikki = (rivit ?? []) as unknown as Julkaisu[];

  // Historia pohjien laskentaan: kaikki muut kuin ohitetut, myös tulevat suunnitellut.
  const historia: Historia = kaikki
    .filter((r) => r.tila !== "ohitettu")
    .map((r) => ({ paiva: r.paiva, slotti: r.slotti, pohja: r.pohja, urheilu: urheiluKokoelma(r.kokoelma) }));
  const paivitaHistoria = (r: Julkaisu | null) => {
    if (!r) return;
    const i = historia.findIndex((h) => h.paiva === r.paiva && h.slotti === r.slotti);
    const h = { paiva: r.paiva, slotti: r.slotti, pohja: r.pohja, urheilu: urheiluKokoelma(r.kokoelma) };
    if (i >= 0) historia[i] = h; else historia.push(h);
  };

  // Vaihe 1: pohjat päivä kerrallaan.
  const tulos: PaivanSisalto[] = [];
  const luonnosteltavat: Array<{ rivi: Julkaisu; visa?: VisaData; synttarit?: SynttariData }> = [];
  for (const { paiva, visa, synttarit } of sisallot) {
    let visaRivi = kaikki.find((r) => r.paiva === paiva && r.slotti === "paivan_visa") ?? null;
    let synttariRivi = kaikki.find((r) => r.paiva === paiva && r.slotti === "synttarit") ?? null;

    if (visa) {
      visaRivi = await suunnitteleVisa(siteId, visa, visaRivi, historia, mitat);
      if (visaRivi && tarvitseeLuonnoksen(visaRivi)) luonnosteltavat.push({ rivi: visaRivi, visa });
    }
    if (synttarit) {
      synttariRivi = await suunnitteleSynttarit(siteId, synttarit, synttariRivi, historia, mitat);
      if (synttariRivi && tarvitseeLuonnoksen(synttariRivi)) luonnosteltavat.push({ rivi: synttariRivi, synttarit });
    }
    paivitaHistoria(visaRivi);
    paivitaHistoria(synttariRivi);
    const omat = kaikki.filter((r) => r.paiva === paiva && r.slotti === "oma");
    tulos.push({ paiva, visa, synttarit, visaRivi: visa ? visaRivi : null, synttariRivi: synttarit ? synttariRivi : null, omat });
  }

  // Vaihe 2: tekstit rinnakkain.
  const valmiit = await luonnosteleRivit(luonnosteltavat, mitat, historia);
  for (const p of tulos) {
    if (p.visaRivi && valmiit.has(p.visaRivi.id)) p.visaRivi = valmiit.get(p.visaRivi.id)!;
    if (p.synttariRivi && valmiit.has(p.synttariRivi.id)) p.synttariRivi = valmiit.get(p.synttariRivi.id)!;
  }

  // Omat julkaisut suunnitelman jälkeisille päiville (kampanja voi alkaa myöhemmin).
  const viimeinen = lisaaPaivia(alku, paivia - 1);
  const myohemmat = [...new Set(kaikki.filter((r) => r.slotti === "oma" && r.paiva > viimeinen).map((r) => r.paiva))].sort();
  for (const paiva of myohemmat) {
    tulos.push({ paiva, visa: null, synttarit: null, visaRivi: null, synttariRivi: null, omat: kaikki.filter((r) => r.paiva === paiva && r.slotti === "oma") });
  }
  return tulos;
}

/** Luonnos puuttuu: tekstit tehty toiselle pohjalle (tai ei lainkaan) eikä toimitus ole koskenut. */
function tarvitseeLuonnoksen(r: Julkaisu) {
  return r.tila === "luonnos" && !r.pohja_valittu_kasin && r.kentat?.luonnosPohjalle !== r.pohja;
}

async function suunnitteleVisa(siteId: string, v: VisaData, rivi: Julkaisu | null, historia: Historia, m: Mitat): Promise<Julkaisu | null> {
  const vaihtui = rivi && rivi.quiz_id !== v.quizId;
  if (rivi && !vaihtui) return rivi;
  if (rivi && rivi.tila === "julkaistu") return rivi;
  if (rivi && vaihtui && rivi.pohja_valittu_kasin) {
    // Visa vaihtui käsin valitun pohjan jälkeen: pohja pysyy, tekstit ja kysymykset
    // luonnostellaan uudelleen ja julkaisu palaa luonnokseksi tarkistettavaksi.
    return paivita(rivi.id, { quiz_id: v.quizId, kokoelma: v.kokoelma, on_kuva: !!v.kuva, kentat: kysymysKentat(v, rivi.pohja, v.paiva), tila: "luonnos", pohja_valittu_kasin: false });
  }
  const ehdokkaat = await kelpaavatVisapohjat(m, v, v.paiva);
  const pohja = valitse(ehdokkaat, v.paiva, "paivan_visa", v.urheilu, historia, AUTO_VISA) ?? "4b";
  const arvot = {
    pohja,
    muoto: "kuva",
    quiz_id: v.quizId,
    celebrity_id: null,
    kokoelma: v.kokoelma,
    on_kuva: !!v.kuva,
    kentat: kysymysKentat(v, pohja, v.paiva),
    tila: "luonnos",
    pohja_valittu_kasin: false,
  };
  return rivi ? paivita(rivi.id, arvot) : lisaa(siteId, v.paiva, "paivan_visa", arvot);
}

/** Synttäreiden pohja: henkilön kuva ratkaisee kasvokortin (kierros 5) — iso kuva 5f
    (muistopäivänä 5h), heikko kuva 5i (5m), ei kuvaa juontajat 4r (4h). Kuvallisilla
    henkilöillä kasvokortti kiertää henkilö + kysymys -korttien (5p, 5q) kanssa, jos
    visassa on sopivat kysymykset — testissä nähdään, haastaako kysymys paremmin. */
async function suunnitteleSynttarit(siteId: string, s: SynttariData, rivi: Julkaisu | null, historia: Historia, m: Mitat): Promise<Julkaisu | null> {
  const vaihtui = rivi && rivi.celebrity_id !== s.celebrityId;
  if (rivi && !vaihtui) return rivi;
  if (rivi && rivi.tila === "julkaistu") return rivi;
  const perus = synttareidenPohja(s);
  let pohja = perus;
  if (onHenkilopohja(perus)) {
    const ehdokkaat: Pohja[] = [perus];
    for (const p of ["5p", "5q"] as Pohja[]) {
      const t = await tarkistaSynttarit({ m, siemen: s.paiva }, p, s, KOEKENTAT);
      if (t.esteet.length === 0) ehdokkaat.push(p);
    }
    pohja = valitse(ehdokkaat, s.paiva, "synttarit", false, historia, ehdokkaat) ?? perus;
  }
  const arvot = {
    pohja,
    muoto: "kuva",
    quiz_id: s.quizId,
    celebrity_id: s.celebrityId,
    kokoelma: "Tunnetut henkilöt",
    on_kuva: !!s.kuva,
    kentat: kysymysKentat(s, pohja, s.paiva),
    tila: "luonnos",
    pohja_valittu_kasin: false,
  };
  return rivi ? paivita(rivi.id, arvot) : lisaa(siteId, s.paiva, "synttarit", arvot);
}

/** Tekstit pohjalle: tekoälyltä ne kentät, jotka pohja siltä ottaa; kiinteät oletukset
    jäävät pohjaan. Identiteettikortille varmistetaan fanitasot. */
async function luonnostele(rivi: Julkaisu, pohja: Pohja, o: { visa?: VisaData; synttarit?: SynttariData }): Promise<Kentat | null> {
  const eiVisaa = !!o.synttarit && !o.synttarit.quizId;
  const tarvitsee = TEKOALY_KOUKKU.includes(pohja) && !eiVisaa;
  const [l] = await Promise.all([
    luonnosteleTekstit(pohja, o),
    o.visa && LUPAA_TASON.includes(pohja) && !o.visa.fanitasot ? luoFanitasot(o.visa.quizId) : null,
  ]);
  if (!l) return tarvitsee ? null : { ...rivi.kentat, luonnosPohjalle: pohja };
  const k: Kentat = { ...rivi.kentat, luonnosPohjalle: pohja };
  if (l.aihe) k.aihe = l.aihe;
  if (TEKOALY_KOUKKU.includes(pohja) && !eiVisaa) k.koukku = l.koukku;
  if (TEKOALY_PALKINTO.includes(pohja) && l.palkinto) k.palkinto = l.palkinto;
  return k;
}

/** Vaihe 2: luonnokset rinnakkain (kuusi kerrallaan). Epäonnistunut koukkupohja
    vaihtuu kiinteän koukun korttiin, jotta suunnitelmassa ei ole tyhjiä kortteja. */
async function luonnosteleRivit(
  jono: Array<{ rivi: Julkaisu; visa?: VisaData; synttarit?: SynttariData }>,
  m: Mitat,
  historia: Historia,
): Promise<Map<string, Julkaisu>> {
  const valmiit = new Map<string, Julkaisu>();
  let i = 0;
  const tyontekija = async () => {
    while (i < jono.length) {
      const tyo = jono[i++];
      let pohja = tyo.rivi.pohja;
      let k = await luonnostele(tyo.rivi, pohja, tyo);
      if (!k && tyo.visa) {
        const kiinteat = await kelpaavatVisapohjat(m, tyo.visa, tyo.rivi.paiva, true);
        pohja = valitse(kiinteat, tyo.rivi.paiva, tyo.rivi.slotti, tyo.visa.urheilu, historia, AUTO_VISA) ?? "4f";
        k = { ...kysymysKentat(tyo.visa, pohja, tyo.rivi.paiva), luonnosPohjalle: pohja };
      }
      if (!k) continue; // synttäri ilman luonnosta: oletuskoukku riittää, yritetään seuraavalla latauksella
      const uusi = await paivita(tyo.rivi.id, { pohja, kentat: k });
      if (uusi) valmiit.set(uusi.id, uusi);
    }
  };
  await Promise.all(Array.from({ length: Math.min(6, jono.length) }, tyontekija));
  return valmiit;
}

async function lisaa(siteId: string, paiva: string, slotti: Slotti, arvot: Record<string, unknown>): Promise<Julkaisu | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("ig_julkaisut" as never)
    .insert({ site_id: siteId, paiva, slotti, ...arvot } as never)
    .select(SARAKKEET)
    .single();
  if (!error) return (data as unknown as Julkaisu) ?? null;
  // Rinnakkainen sivunlataus ehti luoda rivin (päivä + slotti on ainutlaatuinen
  // Päivän visalle ja synttäreille) — käytetään sitä.
  if (slotti === "oma") return null;
  const { data: olemassa } = await sb
    .from("ig_julkaisut" as never)
    .select(SARAKKEET)
    .eq("site_id", siteId)
    .eq("paiva", paiva)
    .eq("slotti", slotti)
    .maybeSingle();
  return (olemassa as unknown as Julkaisu) ?? null;
}

async function paivita(id: string, arvot: Record<string, unknown>): Promise<Julkaisu | null> {
  const { data } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .update({ ...arvot, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select(SARAKKEET)
    .single();
  return (data as unknown as Julkaisu) ?? null;
}

/* ── Omat julkaisut ja kampanjat ─────────────────────────────────────── */

async function omaHistoria(siteId: string): Promise<Historia> {
  const { data } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .select("paiva, slotti, pohja, kokoelma")
    .eq("site_id", siteId)
    .eq("slotti", "oma")
    .neq("tila", "ohitettu");
  return ((data ?? []) as unknown as Array<{ paiva: string; slotti: Slotti; pohja: string; kokoelma: string | null }>).map((r) => ({
    ...r,
    urheilu: urheiluKokoelma(r.kokoelma),
  }));
}

/** Luo oman julkaisun pohjan (ilman tekstejä). Kampanja ja yksittäinen julkaisu
    luonnostelevat tekstit tämän jälkeen rinnakkain. */
async function luoOmaPohja(
  siteId: string,
  o: { paiva: string; quizId: string; otsake: string | null; kampanja: string | null },
  historia: Historia,
  m: Mitat,
): Promise<{ rivi: Julkaisu; visa: VisaData } | null> {
  const v = await haeVisa(o.quizId, o.paiva, { oma: true, otsake: o.otsake });
  if (!v) return null;
  // Henkilövisa minä päivänä tahansa (design D): henkilökortti, jos henkilöllä on kuva.
  const henkilolle = henkilovisanPohja(v);
  const pohja = henkilolle ?? valitse(await kelpaavatVisapohjat(m, v, o.paiva), o.paiva, "oma", v.urheilu, historia, AUTO_VISA) ?? "4b";
  const rivi = await lisaa(siteId, o.paiva, "oma", {
    pohja,
    muoto: "kuva",
    quiz_id: v.quizId,
    kokoelma: v.kokoelma,
    on_kuva: !!v.kuva,
    kentat: { ...kysymysKentat(v, pohja, o.paiva), ...(o.otsake ? { aihe: o.otsake.toLocaleUpperCase("fi-FI") } : {}) },
    kampanja: o.kampanja,
  });
  if (!rivi) return null;
  historia.push({ paiva: rivi.paiva, slotti: "oma", pohja: rivi.pohja, urheilu: v.urheilu });
  return { rivi, visa: v };
}

/** Yksittäinen oma julkaisu. Otsake (jos annettu) on kortin aihe-etiketti. */
export async function luoOmaJulkaisu(
  siteId: string,
  o: { paiva: string; quizId: string; otsake: string | null; kampanja: string | null },
): Promise<Julkaisu | null> {
  const { mitat } = await lataaFontit();
  const historia = await omaHistoria(siteId);
  const tulos = await luoOmaPohja(siteId, o, historia, mitat);
  if (!tulos) return null;
  const valmiit = await luonnosteleRivit([tulos], mitat, historia);
  return valmiit.get(tulos.rivi.id) ?? tulos.rivi;
}

type VisaEhdokas = {
  id: string; title: string; display_title: string | null; collection: string | null; category: string | null;
  hero_image: string | null; image_url: string | null; hero_focal_x: number | null; hero_focal_y: number | null;
};

/** Kampanjan visat: kokoelman julkaistut visat, joita ei ole jo käytetty Instagramissa
    eikä ajastettu Päivän visaksi kampanjan lähelle. Kuvalliset ensin — koko pinnalle
    kelpaavat kuvat, sitten kaistaleeksi kelpaavat, sitten muut. */
export async function valitseKampanjanVisat(siteId: string, kokoelma: string, alku: string, paivia: number): Promise<string[]> {
  const sb = getSupabaseAdmin();
  const [{ data: visat }, { data: kaytetyt }, { data: ajastetut }] = await Promise.all([
    sb
      .from("quizzes")
      .select("id, title, display_title, collection, category, hero_image, image_url, hero_focal_x, hero_focal_y")
      .eq("site_id", siteId)
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    sb.from("ig_julkaisut" as never).select("quiz_id").eq("site_id", siteId).not("quiz_id", "is", null),
    sb
      .from("schedule_rules")
      .select("content_id")
      .eq("site_id", siteId)
      .eq("content_type", "quiz")
      .gte("scheduled_date", lisaaPaivia(alku, -14))
      .lte("scheduled_date", lisaaPaivia(alku, paivia + 14)),
  ]);
  const pois = new Set<string>([
    ...((kaytetyt ?? []) as unknown as Array<{ quiz_id: string }>).map((r) => r.quiz_id),
    ...((ajastetut ?? []) as unknown as Array<{ content_id: string }>).map((r) => r.content_id),
  ]);
  const ehdokkaat = ((visat ?? []) as unknown as VisaEhdokas[]).filter((q) => kokoelmaNimi(q) === kokoelma && !pois.has(q.id));

  const kuvalliset = ehdokkaat.filter((q) => q.hero_image ?? q.image_url).slice(0, paivia * 3);
  const mitatut = await Promise.all(
    kuvalliset.map(async (q) => {
      const k = await lataaKuva(q.hero_image ?? q.image_url, (q.hero_focal_x ?? 0.5) * (Number(q.hero_focal_x ?? 0.5) <= 1 ? 100 : 1), (q.hero_focal_y ?? 0.4) * (Number(q.hero_focal_y ?? 0.4) <= 1 ? 100 : 1));
      return { id: q.id, taso: kelpaaKokoPinnaksi(k) ? 0 : kelpaaKaistaleeksi(k) ? 1 : 2 };
    }),
  );
  const jarjestys = [
    ...mitatut.sort((a, b) => a.taso - b.taso).map((x) => x.id),
    ...ehdokkaat.filter((q) => !(q.hero_image ?? q.image_url)).map((q) => q.id),
  ];
  return jarjestys.slice(0, paivia);
}

export async function luoKampanja(
  siteId: string,
  o: { nimi: string; alku: string; paivia: number; kokoelma: string },
): Promise<{ luotu: number; visoja: number }> {
  const { mitat } = await lataaFontit();
  const visat = await valitseKampanjanVisat(siteId, o.kokoelma, o.alku, o.paivia);
  const historia = await omaHistoria(siteId);
  const luodut: Array<{ rivi: Julkaisu; visa: VisaData }> = [];
  for (let i = 0; i < visat.length; i++) {
    const r = await luoOmaPohja(siteId, { paiva: lisaaPaivia(o.alku, i), quizId: visat[i], otsake: null, kampanja: o.nimi }, historia, mitat);
    if (r) luodut.push(r);
  }
  await luonnosteleRivit(luodut, mitat, historia);
  return { luotu: luodut.length, visoja: visat.length };
}
