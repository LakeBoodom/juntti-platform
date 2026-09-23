// Instagram-julkaisujen suunnitelma ja pohjakierto (Claude Design, kierros 2 — kohdat 2h–2j).
//
// Kiertosäännöt designista:
//  - Sama pohja ei toistu kahtena päivänä peräkkäin.
//  - V-D (kirkas typografia) enintään kaksi kertaa viikossa, ei peräkkäin.
//  - V-E (karuselli) enintään kaksi kertaa viikossa — valitaan vain käsin,
//    koska se vaatii toimitetut sisältökentät.
//  - V-C vain kuvalle, joka kestää koko pinnan; V-A vain terävälle tapahtumalle.
//  - Tasapaino: jokainen pohja saa sekä urheilu- että muita aiheita. Valitaan
//    vähiten käytetty kelpaava pohja, ensin kokonaismäärän, sitten saman
//    aiheluokan (urheilu / muu) käyttömäärän mukaan.
//  - S-C (ikä edellä) aina kun vuodet ovat pyöreät, koska tilaisuuksia on vähän.
//  - S-A vaatii kuvaajatiedon, joten sekin valitaan vain käsin.
//
// Rivi ig_julkaisut-taulussa luodaan kerran. Jos päivän visa tai sankari vaihtuu,
// rivi päivitetään, ja pohja valitaan uudelleen, ellei sitä ole valittu käsin
// tai julkaisua jo hyväksytty.

import { getSupabaseAdmin } from "@juntti/db";
import { lataaFontit } from "./fontit";
import {
  haePaivanSynttarit,
  haePaivanVisa,
  haeVisa,
  kelpaaKaistaleeksi,
  kelpaaKokoPinnaksi,
  lataaKuva,
  onPyorea,
  type SynttariData,
  type VisaData,
} from "./data";
import { kokoelmaNimi } from "@/lib/kokoelmat";
import {
  tarkistaSynttarit,
  tarkistaVisa,
  type Kentat,
  type Pohja,
  type VdVari,
} from "./pohjat";
import { luonnosteleHaaste } from "./kuvateksti";
import type { Tilastot } from "./instagram";

export type Slotti = "paivan_visa" | "synttarit" | "oma";
export type Tila = "luonnos" | "hyvaksytty" | "julkaistaan" | "julkaistu" | "epaonnistui" | "ohitettu";

export type Julkaisu = {
  id: string;
  paiva: string;
  slotti: Slotti;
  pohja: Pohja;
  pohja_vari: VdVari | null;
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
};

const SARAKKEET =
  "id, paiva, slotti, pohja, pohja_vari, pohja_valittu_kasin, muoto, quiz_id, celebrity_id, kokoelma, on_kuva, kentat, kuvateksti, tila, julkaistu_at, kampanja, virhe, ig_permalink, ig_tilastot, tilastot_at";

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

/** ISO-viikon maanantai */
function viikonAlku(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  const vp = (t.getUTCDay() + 6) % 7;
  return lisaaPaivia(iso, -vp);
}

/* ── Kierto ──────────────────────────────────────────────────────────── */

type Historia = Array<{ paiva: string; slotti: Slotti; pohja: Pohja; pohja_vari: VdVari | null; urheilu: boolean }>;

const VISA_JARJESTYS: Pohja[] = ["V-A", "V-C", "V-B", "V-D"];
const OMA_JARJESTYS: Pohja[] = ["V-C", "V-A", "V-D", "V-B"];
const SYNT_JARJESTYS: Pohja[] = ["S-B", "S-D", "S-C"];
const VD_VARIT: VdVari[] = ["lime", "valkoinen", "mintti"];

function valitse(
  ehdokkaat: Pohja[],
  paiva: string,
  slotti: Slotti,
  urheilu: boolean,
  historia: Historia,
): Pohja | null {
  const oma = historia.filter((h) => h.slotti === slotti && h.paiva !== paiva);
  const edellinen = oma.find((h) => h.paiva === lisaaPaivia(paiva, -1))?.pohja;
  const vk = viikonAlku(paiva);
  const viikolla = (p: Pohja) => oma.filter((h) => h.pohja === p && viikonAlku(h.paiva) === vk).length;

  const kelpaavat = ehdokkaat.filter((p) => {
    if (p === edellinen) return false;
    if ((p === "V-D" || p === "V-E") && viikolla(p) >= 2) return false;
    return true;
  });
  if (kelpaavat.length === 0) return null;

  const jarjestys = slotti === "paivan_visa" ? VISA_JARJESTYS : slotti === "oma" ? OMA_JARJESTYS : SYNT_JARJESTYS;
  const kaikki = (p: Pohja) => oma.filter((h) => h.pohja === p).length;
  const luokassa = (p: Pohja) => oma.filter((h) => h.pohja === p && h.urheilu === urheilu).length;
  return [...kelpaavat].sort(
    (a, b) => kaikki(a) - kaikki(b) || luokassa(a) - luokassa(b) || jarjestys.indexOf(a) - jarjestys.indexOf(b),
  )[0];
}

function valitseVdVari(paiva: string, historia: Historia): VdVari {
  const edellinen = [...historia]
    .filter((h) => h.pohja === "V-D" && h.paiva < paiva && h.pohja_vari)
    .sort((a, b) => b.paiva.localeCompare(a.paiva))[0]?.pohja_vari;
  const i = edellinen ? VD_VARIT.indexOf(edellinen) : -1;
  return VD_VARIT[(i + 1) % VD_VARIT.length];
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
    .map((r) => ({ paiva: r.paiva, slotti: r.slotti, pohja: r.pohja, pohja_vari: r.pohja_vari, urheilu: urheiluKokoelma(r.kokoelma) }));

  const tulos: PaivanSisalto[] = [];
  // Päivät järjestyksessä, jotta "edellinen päivä" -sääntö näkee juuri tehdyn valinnan.
  for (const { paiva, visa, synttarit } of sisallot) {
    let visaRivi = kaikki.find((r) => r.paiva === paiva && r.slotti === "paivan_visa") ?? null;
    let synttariRivi = kaikki.find((r) => r.paiva === paiva && r.slotti === "synttarit") ?? null;

    if (visa) visaRivi = await suunnitteleVisa(siteId, visa, visaRivi, historia, mitat);
    if (synttarit) synttariRivi = await suunnitteleSynttarit(siteId, synttarit, synttariRivi, historia, mitat);

    for (const r of [visaRivi, synttariRivi]) {
      if (!r) continue;
      const i = historia.findIndex((h) => h.paiva === r.paiva && h.slotti === r.slotti);
      const h = { paiva: r.paiva, slotti: r.slotti, pohja: r.pohja, pohja_vari: r.pohja_vari, urheilu: urheiluKokoelma(r.kokoelma) };
      if (i >= 0) historia[i] = h; else historia.push(h);
    }
    const omat = kaikki.filter((r) => r.paiva === paiva && r.slotti === "oma");
    tulos.push({ paiva, visa, synttarit, visaRivi: visa ? visaRivi : null, synttariRivi: synttarit ? synttariRivi : null, omat });
  }

  // Omat julkaisut suunnitelman jälkeisille päiville (kampanja voi alkaa myöhemmin).
  const viimeinen = lisaaPaivia(alku, paivia - 1);
  const myohemmat = [...new Set(kaikki.filter((r) => r.slotti === "oma" && r.paiva > viimeinen).map((r) => r.paiva))].sort();
  for (const paiva of myohemmat) {
    tulos.push({ paiva, visa: null, synttarit: null, visaRivi: null, synttariRivi: null, omat: kaikki.filter((r) => r.paiva === paiva && r.slotti === "oma") });
  }
  return tulos;
}

function urheiluKokoelma(k: string | null) {
  return k === "Urheilu" || k === "Jääkiekko";
}

type Mitat = Awaited<ReturnType<typeof lataaFontit>>["mitat"];

async function suunnitteleVisa(siteId: string, v: VisaData, rivi: Julkaisu | null, historia: Historia, mitat: Mitat): Promise<Julkaisu | null> {
  const lukittu = rivi && (rivi.pohja_valittu_kasin || rivi.tila !== "luonnos");
  const vaihtui = rivi && rivi.quiz_id !== v.quizId;
  if (rivi && !vaihtui) return rivi;
  if (rivi && lukittu && vaihtui) {
    // Visa vaihtui hyväksytyn/käsin valitun jälkeen: päivitetään lähde, pohja pysyy.
    return paivita(rivi.id, { quiz_id: v.quizId, kokoelma: v.kokoelma, on_kuva: !!v.kuva });
  }

  // Ehdokkaat: pohjat, joilla ei ole esteitä. V-B:n haaste luonnostellaan vasta valinnan jälkeen.
  const ehdokkaat: Pohja[] = [];
  for (const p of ["V-A", "V-C", "V-D"] as Pohja[]) {
    const t = await tarkistaVisa(mitat, p, v, {});
    if (t.esteet.length === 0) ehdokkaat.push(p);
  }
  ehdokkaat.push("V-B");
  let pohja = valitse(ehdokkaat, v.paiva, "paivan_visa", v.urheilu, historia) ?? "V-D";

  const kentat: Kentat = { ...(rivi?.kentat ?? {}) };
  if (pohja === "V-B" && !kentat.haaste) {
    const haaste = await luonnosteleHaaste(v);
    if (haaste) kentat.haaste = haaste;
    else pohja = valitse(ehdokkaat.filter((p) => p !== "V-B"), v.paiva, "paivan_visa", v.urheilu, historia) ?? "V-D";
  }
  const vari = pohja === "V-D" ? valitseVdVari(v.paiva, historia) : null;

  const arvot = {
    pohja,
    pohja_vari: vari,
    muoto: "kuva",
    quiz_id: v.quizId,
    celebrity_id: null,
    kokoelma: v.kokoelma,
    on_kuva: pohja === "V-D" ? false : !!v.kuva,
    kentat,
  };
  return rivi ? paivita(rivi.id, arvot) : lisaa(siteId, v.paiva, "paivan_visa", arvot);
}

async function suunnitteleSynttarit(siteId: string, s: SynttariData, rivi: Julkaisu | null, historia: Historia, mitat: Mitat): Promise<Julkaisu | null> {
  const lukittu = rivi && (rivi.pohja_valittu_kasin || rivi.tila !== "luonnos");
  const vaihtui = rivi && rivi.celebrity_id !== s.celebrityId;
  if (rivi && !vaihtui) return rivi;
  if (rivi && lukittu && vaihtui) {
    return paivita(rivi.id, { celebrity_id: s.celebrityId, quiz_id: s.quizId });
  }

  const ehdokkaat: Pohja[] = [];
  for (const p of ["S-B", "S-C", "S-D"] as Pohja[]) {
    const t = await tarkistaSynttarit(mitat, p, s, {});
    if (t.esteet.length === 0) ehdokkaat.push(p);
  }
  // Pyöreät vuodet ovat harvinaisia — S-C aina kun mahdollista (paitsi jos eilen oli S-C).
  let pohja: Pohja | null = null;
  if (ehdokkaat.includes("S-C") && onPyorea(s.ika)) {
    const eilen = historia.find((h) => h.slotti === "synttarit" && h.paiva === lisaaPaivia(s.paiva, -1));
    if (eilen?.pohja !== "S-C") pohja = "S-C";
  }
  pohja ??= valitse(ehdokkaat.filter((p) => p !== "S-C"), s.paiva, "synttarit", false, historia) ?? "S-B";

  const arvot = {
    pohja,
    pohja_vari: null,
    muoto: "kuva",
    quiz_id: s.quizId,
    celebrity_id: s.celebrityId,
    kokoelma: "Tunnetut henkilöt",
    on_kuva: false,
    kentat: rivi?.kentat ?? {},
  };
  return rivi ? paivita(rivi.id, arvot) : lisaa(siteId, s.paiva, "synttarit", arvot);
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

/* ── Omat julkaisut ja kampanjat ─────────────────────────────────────── */

async function omaHistoria(siteId: string): Promise<Historia> {
  const { data } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .select("paiva, slotti, pohja, pohja_vari, kokoelma")
    .eq("site_id", siteId)
    .eq("slotti", "oma")
    .neq("tila", "ohitettu");
  return ((data ?? []) as unknown as Array<{ paiva: string; slotti: Slotti; pohja: Pohja; pohja_vari: VdVari | null; kokoelma: string | null }>).map(
    (r) => ({ ...r, urheilu: urheiluKokoelma(r.kokoelma) }),
  );
}

/** Luo yhden oman julkaisun. Pohja valitaan omien julkaisujen kierrosta niistä,
    joilla ei ole esteitä (V-A vaatii tapahtuman ja V-B haasteen, joten
    tyypillisesti V-C kuvalle kelpaavalla visalla, muuten V-D). */
export async function luoOmaJulkaisu(
  siteId: string,
  o: { paiva: string; quizId: string; otsake: string | null; kampanja: string | null },
  historia?: Historia,
): Promise<Julkaisu | null> {
  const { mitat } = await lataaFontit();
  const kentat: Kentat = o.otsake ? { otsake: o.otsake } : {};
  const v = await haeVisa(o.quizId, o.paiva, { oma: true, otsake: o.otsake });
  if (!v) return null;
  const h = historia ?? (await omaHistoria(siteId));
  const ehdokkaat: Pohja[] = [];
  for (const p of ["V-C", "V-A", "V-D"] as Pohja[]) {
    const t = await tarkistaVisa(mitat, p, v, kentat);
    if (t.esteet.length === 0) ehdokkaat.push(p);
  }
  const pohja = valitse(ehdokkaat, o.paiva, "oma", v.urheilu, h) ?? "V-D";
  const vari = pohja === "V-D" ? valitseVdVari(o.paiva, h) : null;
  const rivi = await lisaa(siteId, o.paiva, "oma", {
    pohja,
    pohja_vari: vari,
    muoto: "kuva",
    quiz_id: v.quizId,
    kokoelma: v.kokoelma,
    on_kuva: pohja === "V-D" ? false : !!v.kuva,
    kentat,
    kampanja: o.kampanja,
  });
  if (rivi) h.push({ paiva: rivi.paiva, slotti: "oma", pohja: rivi.pohja, pohja_vari: rivi.pohja_vari, urheilu: v.urheilu });
  return rivi;
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
      const k = await lataaKuva(q.hero_image ?? q.image_url, q.hero_focal_x ?? 50, q.hero_focal_y ?? 40);
      return { id: q.id, taso: kelpaaKokoPinnaksi(k) ? 0 : kelpaaKaistaleeksi(k) ? 1 : 2 };
    }),
  );
  const jarjestys = [
    ...mitatut.sort((a, b) => a.taso - b.taso).map((m) => m.id),
    ...ehdokkaat.filter((q) => !(q.hero_image ?? q.image_url)).map((q) => q.id),
  ];
  return jarjestys.slice(0, paivia);
}

export async function luoKampanja(
  siteId: string,
  o: { nimi: string; alku: string; paivia: number; kokoelma: string },
): Promise<{ luotu: number; visoja: number }> {
  const visat = await valitseKampanjanVisat(siteId, o.kokoelma, o.alku, o.paivia);
  const historia = await omaHistoria(siteId);
  let luotu = 0;
  for (let i = 0; i < visat.length; i++) {
    const r = await luoOmaJulkaisu(siteId, { paiva: lisaaPaivia(o.alku, i), quizId: visat[i], otsake: o.nimi, kampanja: o.nimi }, historia);
    if (r) luotu++;
  }
  return { luotu, visoja: visat.length };
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
