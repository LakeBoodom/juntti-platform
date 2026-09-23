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
import { haePaivanSynttarit, haePaivanVisa, onPyorea, type SynttariData, type VisaData } from "./data";
import {
  tarkistaSynttarit,
  tarkistaVisa,
  type Kentat,
  type Pohja,
  type VdVari,
} from "./pohjat";
import { luonnosteleHaaste } from "./kuvateksti";

export type Slotti = "paivan_visa" | "synttarit";
export type Tila = "luonnos" | "hyvaksytty" | "julkaistu" | "epaonnistui" | "ohitettu";

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
};

const SARAKKEET =
  "id, paiva, slotti, pohja, pohja_vari, pohja_valittu_kasin, muoto, quiz_id, celebrity_id, kokoelma, on_kuva, kentat, kuvateksti, tila, julkaistu_at";

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

  const jarjestys = slotti === "paivan_visa" ? VISA_JARJESTYS : SYNT_JARJESTYS;
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
};

/**
 * Varmistaa, että jokaiselle päivälle tänään…tänään+paivia−1 on suunnitelma,
 * ja palauttaa päivien sisällön riveineen. Idempotentti: ajetaan adminin sivun latauksessa.
 */
export async function varmistaSuunnitelma(siteId: string, paivia = 14): Promise<PaivanSisalto[]> {
  const sb = getSupabaseAdmin();
  const alku = tanaanHelsinki();
  const loppu = lisaaPaivia(alku, paivia - 1);
  const { mitat } = await lataaFontit();

  const [{ data: rivit }, sisallot] = await Promise.all([
    sb.from("ig_julkaisut" as never).select(SARAKKEET).eq("site_id", siteId).order("paiva"),
    Promise.all(
      Array.from({ length: paivia }, (_, i) => lisaaPaivia(alku, i)).map(async (paiva) => ({
        paiva,
        visa: await haePaivanVisa(siteId, paiva),
        synttarit: await haePaivanSynttarit(siteId, paiva),
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
    tulos.push({ paiva, visa, synttarit, visaRivi, synttariRivi });
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
  const { data } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .upsert({ site_id: siteId, paiva, slotti, ...arvot } as never, { onConflict: "site_id,paiva,slotti", ignoreDuplicates: false })
    .select(SARAKKEET)
    .single();
  return (data as unknown as Julkaisu) ?? null;
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
