"use client";
// "PELAA SEURAAVAKSI" -RIVI (pilotti, toteutusbrief 8.11.2026 §2; CD "Promojärjestelmä kierros 2": A1-visakortti,
// A2-pelikortti, osio-otsikko). Heikki 11.11.2026: mobiilissa (< 768) kolme tiivistä riviä allekkain (kuva 96 × 72
// vasemmalla, lajimerkki + nimi oikealla, koko rivi linkki, ≥ 72 px) — kaikki näkyvät ilman pyyhkäisyä. ≥ 768 px kolme
// samankokoista korttia: lajimerkki kuvan päällä, nimi ja kultainen "Pelaa →" (rivissä ei limeä; päänappi on lime).
// Kierros 3 (Heikki 11.11.): nimen alla yksi rivi vain pelikortissa (mitä pelissä tehdään) ja paikan 3 portaissa a–c
// (syy päivän datasta); poikkeus UI-sääntöön 9. Paikan 3 merkki "Tänään · 11.11." pienellä live-pisteellä (ei muistovisassa).
// Ehdokkaista valitaan selaimessa kustakin paikasta ensimmäinen pelaamaton; palvelimen HTML:ssä (ja ilman JS:ää) näkyy
// kunkin paikan ensimmäinen ehdokas.
import { useEffect, useRef, useState } from "react";
import { helsinginPaiva } from "@/lib/aika";
import type { Ehdokas } from "@/lib/seuraavaksi/tyypit";
import { useSeuraavaksiMittaus, type SkMeta } from "@/lib/seuraavaksi/mittaus";
import { RiviLinkki } from "@/components/tn20/korttirivi/KorttiRivi";
import "./seuraavaksi.css";

/** Paikka 1–3 (mittaus). */
export type SkPaikka = { paikka: number; ehdokkaat: Ehdokas[] };

type Pelitieto = { kaikki: Set<string>; tanaan: Record<string, string>; iso: string; ls: Storage | null };

function lueStorage(): Pelitieto {
  const iso = helsinginPaiva().iso;
  try {
    const ls = window.localStorage;
    return {
      kaikki: new Set(JSON.parse(ls.getItem("tn_played_quizzes") ?? "[]") as string[]),
      tanaan: JSON.parse(ls.getItem("tn_pelattu_pvm") ?? "{}") as Record<string, string>,
      iso,
      ls,
    };
  } catch {
    return { kaikki: new Set(), tanaan: {}, iso, ls: null };
  }
}

/** Visa: koskaan pelattu. Mikä maa: pelattu tänään. Päivän visa: pelattu tänään tai koskaan (avaimet: lib/vihjepeli/mikamaa,
 *  lib/paivanVisa, PelattuTanaan). */
function pelattu(e: Ehdokas, t: Pelitieto): boolean {
  try {
    switch (e.pelattu?.tapa) {
      case "mika-maa":
        return !!t.ls?.getItem(`tn-mm-${t.iso}`);
      case "paivan-visa":
        return !!t.ls?.getItem(`tn_paivan_visa_${t.iso}`) || t.tanaan[e.id] === t.iso || t.kaikki.has(e.id);
      default:
        return e.tyyppi === "visa" && t.kaikki.has(e.id);
    }
  } catch {
    return false;
  }
}

/** Kustakin paikasta ensimmäinen pelaamaton; jos kaikki pelattu, ensimmäinen. Sama ehdokas ei koskaan kahdesti. */
function valitse(paikat: SkPaikka[], t: Pelitieto | null): Array<{ paikka: number; e: Ehdokas }> {
  const kaytetty = new Set<string>();
  const ulos: Array<{ paikka: number; e: Ehdokas }> = [];
  for (const p of paikat) {
    const vapaat = p.ehdokkaat.filter((e) => !kaytetty.has(e.id));
    const e = (t ? vapaat.find((x) => !pelattu(x, t)) : undefined) ?? vapaat[0];
    if (!e) continue;
    kaytetty.add(e.id);
    ulos.push({ paikka: p.paikka, e });
  }
  return ulos;
}

export default function SeuraavaksiRivi({ otsikko, paikat, meta, id }: { otsikko: string; paikat: SkPaikka[]; meta: SkMeta; id: string }) {
  const [valitut, setValitut] = useState(() => valitse(paikat, null));
  const avain = paikat.map((p) => `${p.paikka}:${p.ehdokkaat.map((e) => e.id).join("|")}`).join(";");
  useEffect(() => {
    setValitut(valitse(paikat, lueStorage()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avain]);
  const ref = useRef<HTMLElement>(null);
  useSeuraavaksiMittaus(ref, meta, valitut.map((v) => v.e.id).join(","));
  if (!valitut.length) return null;

  return (
    <section ref={ref} className="sk-osio" aria-labelledby={`${id}-h`} data-tn-entry={`seuraavaksi:${meta.nakyma}`}>
      <h2 id={`${id}-h`} className="sk-h">{otsikko}</h2>
      <div className="sk-rivi">
        {valitut.map(({ paikka, e }) => (
          <RiviLinkki key={e.id} k={e} data={{ "data-sk-paikka": String(paikka), "data-sk-tyyppi": e.tyyppi, "data-sk-porras": e.porras }} />
        ))}
      </div>
    </section>
  );
}
