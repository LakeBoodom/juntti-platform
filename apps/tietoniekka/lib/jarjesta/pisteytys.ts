// Laita järjestykseen -pisteytys (CD "TN Laita jarjestykseen.html"): oikea paikka 10 p, yhden sijan
// päässä 5 p. Tasatulokset: kumpi tahansa järjestys on oikein, ja paljastus kertoo "tasan".
// Yhteinen pakkapeleille (/peli/jarjesta/<pakka>) ja henkilösivun laadullisille pakoille (/oma).
import type { ChainScoreResult } from "@/components/tn20/ChainResultSummary";

export type Arvio = { lahin: number; oikein: boolean; tasan: boolean };

/** Jokaiselle sijoitetulle: lähin oikea sija (tasatuloksissa lähin samanarvoinen paikka). */
export function arvioi<T extends { value: number }>(order: T[], oikea: T[]): Arvio[] {
  return order.map((k, i) => {
    const paikat = oikea.map((o, j) => (o.value === k.value ? j : -1)).filter((j) => j >= 0);
    const lahin = paikat.reduce((best, j) => (Math.abs(j - i) < Math.abs(best - i) ? j : best), paikat[0] ?? i);
    return { lahin, oikein: lahin === i, tasan: paikat.length > 1 };
  });
}

export function pisteet(arviot: Arvio[]): ChainScoreResult {
  let score = 0;
  let pisin = 0;
  let jakso = 0;
  arviot.forEach((a, i) => {
    if (a.oikein) score += 10;
    else if (Math.abs(a.lahin - i) === 1) score += 5;
    jakso = a.oikein ? jakso + 1 : 0;
    pisin = Math.max(pisin, jakso);
  });
  return { score, correctCount: arviot.filter((a) => a.oikein).length, totalCount: arviot.length, longestCorrectChain: pisin };
}

/** Paljastusrivin lisäteksti: "tasan" ja/tai "oikea sija N.". */
export function arvoLisat(a: Arvio): string {
  return [a.tasan ? "tasan" : null, a.oikein ? null : `oikea sija ${a.lahin + 1}.`].filter(Boolean).join(" · ");
}

export const PISTEOHJE = "Oikea paikka 10 p · yhden sijan päässä 5 p";
