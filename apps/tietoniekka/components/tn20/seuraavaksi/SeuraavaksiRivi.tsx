"use client";
// "PELAA SEURAAVAKSI" -RIVI (pilotti, toteutusbrief 8.11.2026 §2; CD "Promojärjestelmä kierros 2": A1-visakortti,
// A2-pelikortti, osio-otsikko). Kolme samankokoista korttia: mobiilissa vaakarivi, jossa seuraava kortti näkyy reunassa,
// ≥ 768 px kolme saraketta. Koko kortti on linkki. Lajimerkki kuvan päällä vasemmassa yläkulmassa ("Tietovisa",
// "Tupla tai kuitti" …). "Pelaa →" kultaisena: rivissä ei ole limeä (päänappi on lime).
// Ehdokkaista valitaan selaimessa kustakin paikasta ensimmäinen pelaamaton (tn_played_quizzes); palvelimen HTML:ssä
// (ja ilman JS:ää) näkyy kunkin paikan ensimmäinen ehdokas.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { katko } from "@/lib/kokoelmat/data";
import type { Ehdokas } from "@/lib/seuraavaksi/tyypit";
import { useSeuraavaksiMittaus, type SkMeta } from "@/lib/seuraavaksi/mittaus";
import "./seuraavaksi.css";

/** Paikka 1–3 (mittaus). Sama lista voi olla kahdesti: aloitusnäkymä ottaa p1:stä kaksi (p1, p3, p1). */
export type SkPaikka = { paikka: number; ehdokkaat: Ehdokas[] };

function pelatut(): Set<string> {
  try {
    return new Set(JSON.parse(window.localStorage.getItem("tn_played_quizzes") ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

/** Kustakin paikasta ensimmäinen pelaamaton; jos kaikki pelattu, ensimmäinen. Sama ehdokas ei koskaan kahdesti. */
function valitse(paikat: SkPaikka[], pelattu: Set<string>): Array<{ paikka: number; e: Ehdokas }> {
  const kaytetty = new Set<string>();
  const ulos: Array<{ paikka: number; e: Ehdokas }> = [];
  for (const p of paikat) {
    const vapaat = p.ehdokkaat.filter((e) => !kaytetty.has(e.id));
    const pelaamattomat = vapaat.filter((e) => !pelattu.has(e.id));
    const e = pelaamattomat[0] ?? vapaat[0];
    if (!e) continue;
    kaytetty.add(e.id);
    ulos.push({ paikka: p.paikka, e });
  }
  return ulos;
}

export default function SeuraavaksiRivi({ otsikko, paikat, meta, id }: { otsikko: string; paikat: SkPaikka[]; meta: SkMeta; id: string }) {
  const [valitut, setValitut] = useState(() => valitse(paikat, new Set()));
  const avain = paikat.map((p) => `${p.paikka}:${p.ehdokkaat.map((e) => e.id).join("|")}`).join(";");
  useEffect(() => {
    setValitut(valitse(paikat, pelatut()));
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
          <a
            key={e.id}
            className="sk-kortti"
            href={e.href}
            data-sk-paikka={paikka}
            data-sk-tyyppi={e.tyyppi}
            data-sk-porras={e.porras}
          >
            <span className="sk-kuva" data-sovitus={e.sovitus}>
              {e.kuva ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.kuva} alt="" loading="lazy" decoding="async" width={320} height={200} style={e.kuvaPos ? ({ objectPosition: e.kuvaPos } as CSSProperties) : undefined} />
              ) : (
                <span className="sk-kuvaton" aria-hidden="true">{e.kuvaton}</span>
              )}
              <span className="sk-merkki">{e.merkki}</span>
            </span>
            <span className="sk-teksti">
              <span className="sk-nimi">{katko(e.nimi)}</span>
              {e.rivi && <span className="sk-kuvaus">{e.rivi}</span>}
              <span className="sk-cta">Pelaa <span aria-hidden="true">→</span></span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
