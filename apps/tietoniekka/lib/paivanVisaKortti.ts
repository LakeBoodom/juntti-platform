// PÄIVÄN VISA -KORTTI (etusivu, Päivän pelit — brief päivitys 29.10.2026, CD "Päivän visa oma ilme v2" 4a/4b).
// Adapteri kahdella datalähteellä; kortti ei muutu, vain kentät täyttyvät:
//   1. Nyt: ajastettu visa (schedule_rules → paivan_visa_tanaan) → nro null, ajankohtainen false, rytmi null.
//      Koukku = toimituksen ajankohtaisuusteksti (intro_headline + intro_text, Heikki 28.10.: "pitää olla mukana aina");
//      jos sitä ei ole kirjoitettu, visan 1. kysymys.
//   2. Uusi Päivän visa (paivan_visat + paivan_visa_kohdat): nro, koukku = koukku_kysymys_id, ajankohtainen true,
//      rytmi kaavasta. Pelattu-tila luetaan avaimesta tn_paivan_visa_{pvm} (pelattuAvain).
import type { SupabaseClient } from "@supabase/supabase-js";
import { rakennaPaivanVisa } from "@/lib/paivanVisaData";
import { paivanVisaAvain, paivanVisaTila } from "@/lib/paivanVisa";
export type { PaivanVisaTulos } from "@/lib/paivanVisa";

export type RytmiMerkki = "teksti" | "kuva" | "finaali";
/** Viikonpäivän tunnusväri: CSS-muuttuja --pv-<avain> (globals.css). */
export type PvAvain = "ma" | "ti" | "ke" | "to" | "pe" | "la" | "su";

export type PaivanVisaKortti = {
  quizId: string;
  /** "29.10." */
  pvm: string;
  /** "To" */
  viikonpaiva: string;
  tunnusvari: PvAvain;
  /** Editionumero; null kunnes uusi Päivän visa on olemassa (nauhassa ei "Nro"). */
  nro: number | null;
  koukku: string | null;
  /** Ajankohtaisuustekstin selittävä virke koukun alla (vain nykyisellä visalla). */
  koukkuTeksti: string | null;
  /** "Tänään"-chip vain ajankohtaiselle koukkukysymykselle (uusi Päivän visa). */
  ajankohtainen: boolean;
  /** 10 merkkiä; null = rivi jätetään pois (nykyinen visa ei noudata kaavaa). */
  rytmi: RytmiMerkki[] | null;
  href: string;
  /** Kortin taustakuva (etusivu v7): visan kansikuva, lisätään lib/etusivu5:ssä. null → tumma pohja tunnusvärillä. */
  kuva?: string | null;
  kuvaPos?: string;
  /** "Katso vastaukset" (GameClient palauttaa tallennetun tuloksen). */
  vastauksetHref: string;
  pelattuAvain: string;
  /** Nostomittaus (luku 9) */
  mitta: { kategoria: string | null; intro: "A" | "B" | "C" };
};

const AVAIMET: PvAvain[] = ["su", "ma", "ti", "ke", "to", "pe", "la"];
const LYHYT = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];


export async function getPaivanVisaKortti(
  sb: SupabaseClient,
  opts: {
    quizId: string;
    /** Helsingin päivä YYYY-MM-DD */
    iso: string;
    intro: { headline: string | null; text: string | null } | null;
    questionCount?: number | null;
    /** Esikatselu (?pv=uusi): uuden Päivän visan kentät mallidatalla mittausta varten. */
    uusiMalli?: boolean;
  },
): Promise<PaivanVisaKortti | null> {
  const [visa, eka] = await Promise.all([
    rakennaPaivanVisa(sb, { quizId: opts.quizId, paiva: opts.iso, intro: opts.intro, questionCount: opts.questionCount }),
    sb.from("questions").select("question_text").eq("quiz_id", opts.quizId).order("sort_order").limit(1).maybeSingle(),
  ]);
  if (!visa) return null;
  const [v, k, p] = opts.iso.split("-").map(Number);
  const vp = new Date(Date.UTC(v, k - 1, p)).getUTCDay();
  const ekaKysymys = (eka.data as { question_text: string } | null)?.question_text?.trim() || null;
  const vastauksetHref = `${visa.playHref}&vastaukset=1`;

  const kortti: PaivanVisaKortti = {
    quizId: visa.quizId,
    pvm: `${p}.${k}.`,
    viikonpaiva: LYHYT[vp],
    tunnusvari: AVAIMET[vp],
    nro: null,
    koukku: visa.intro?.headline ?? visa.intro?.text ?? ekaKysymys,
    koukkuTeksti: visa.intro?.headline ? visa.intro.text : null,
    ajankohtainen: false,
    rytmi: null,
    href: visa.playHref,
    vastauksetHref,
    pelattuAvain: paivanVisaAvain(opts.iso),
    mitta: { kategoria: visa.kategoria, intro: paivanVisaTila(visa) },
  };
  if (opts.uusiMalli) {
    const T: RytmiMerkki = "teksti", K: RytmiMerkki = "kuva";
    return {
      ...kortti, nro: 1000, ajankohtainen: true, koukkuTeksti: null,
      koukku: "Missä maassa presidentti Stubb vierailee tänään?",
      rytmi: [T, T, T, K, T, T, K, T, T, "finaali"],
    };
  }
  return kortti;
}
