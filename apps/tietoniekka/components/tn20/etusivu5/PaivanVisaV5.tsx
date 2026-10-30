"use client";
// Etusivu v5 — Päivän visa -kortti (brief päivitys 29.10.2026, CD "Päivän visa oma ilme v2" 4a mobiili / 4b desktop).
//   · nimiönauha päivän tunnusvärillä (--pv-<viikonpäivä>): "Päivän visa · To 29.10." + "Nro 167" kun numero on olemassa
//   · koukku: ajankohtaisuusteksti tai visan 1. kysymys; "Tänään"-chip ja rytmirivi vain uudella Päivän visalla
//   · pelattu-tila: tulos "8/10" + "Nähdään huomenna", nappi "Katso vastaukset" (ei lime)
//   · nostomittaus (luku 9): näyttö kerran ≥ 50 % näkyvissä + klikkaus.
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { kirjaaNosto, useNayttoMittaus } from "@/lib/nostoMittaus";
import type { PaivanVisaKortti, PaivanVisaTulos, RytmiMerkki } from "@/lib/paivanVisaKortti";
import { PAIVAN_VISA_KEY, localDateKey } from "@/components/tn20/PaivanVisaCard";

type Pelattu = { oikein: number; yhteensa: number; vastaukset: boolean } | { oikein: null; yhteensa: null; vastaukset: false };

/** Tämän päivän tulos: ensisijaisesti tn_paivan_visa_{pvm}; vanha merkintä (PAIVAN_VISA_KEY) + tn_quiz_results varalla. */
function luePelattu(k: PaivanVisaKortti): Pelattu | null {
  try {
    const t = JSON.parse(localStorage.getItem(k.pelattuAvain) ?? "null") as PaivanVisaTulos | null;
    if (t && t.quizId === k.quizId) return { oikein: t.oikein, yhteensa: t.yhteensa, vastaukset: t.vastaukset?.length > 0 };
    if (localStorage.getItem(PAIVAN_VISA_KEY) !== localDateKey()) return null;
    const r = (JSON.parse(localStorage.getItem("tn_quiz_results") ?? "{}") as Record<string, { right: number; total: number }>)[k.quizId];
    return r ? { oikein: r.right, yhteensa: r.total, vastaukset: false } : { oikein: null, yhteensa: null, vastaukset: false };
  } catch {
    return null;
  }
}


/** Rytmirivi: viiva = tekstikysymys, neliö = kuvakysymys, ympyrä = finaali. Päivän värinen, ei tilaa. */
export function RytmiRivi({ merkit }: { merkit: RytmiMerkki[] }) {
  const kuvia = merkit.filter((m) => m === "kuva").length;
  return (
    <span className="tn-es-rytmi" role="img" aria-label={`${merkit.length} kysymystä, joista ${kuvia} kuvakysymystä${merkit.includes("finaali") ? " ja finaali" : ""}`}>
      {merkit.map((m, i) => <i key={i} data-m={m} />)}
    </span>
  );
}

/** Pisimmän sanan pituus (KORTTISÄÄNTÖ --lw). */
const pisin = (t: string) => Math.max(...t.split(/\s+/).map((w) => w.length), 4);

export default function PaivanVisaV5({ k }: { k: PaivanVisaKortti }) {
  const [pelattu, setPelattu] = useState<Pelattu | null>(null);
  useEffect(() => setPelattu(luePelattu(k)), [k]);
  const mitta = { slotti: "paivan_visa" as const, quizId: k.quizId, intro: k.mitta.intro, kategoria: k.mitta.kategoria };
  const ref = useNayttoMittaus<HTMLAnchorElement>(() => kirjaaNosto({ ...mitta, tapahtuma: "naytto" }));
  const nimio = `Päivän visa · ${k.viikonpaiva} ${k.pvm}`;

  return (
    <a
      ref={ref}
      className="tn-es-pv"
      href={pelattu ? (pelattu.vastaukset ? k.vastauksetHref : k.href) : k.href}
      data-tn-entry="etusivu:paivan-visa"
      data-pelattu={pelattu ? "" : undefined}
      style={{ "--pv": `var(--pv-${k.tunnusvari})`, "--n": nimio.length, "--nro": k.nro != null ? 1 : 0 } as CSSProperties}
      onClick={() => { if (!pelattu) kirjaaNosto({ ...mitta, tapahtuma: "klikkaus" }); }}
    >
      <span className="tn-es-pv-nauha">
        <span className="tn-es-pv-nimio">
          <span className="tn-es-pv-nimi">Päivän visa</span>
          <span className="tn-es-pv-erotin" aria-hidden="true"> · </span>
          <span className="tn-es-pv-pvm">{k.viikonpaiva} {k.pvm}</span>
        </span>
        {k.nro != null && <span className="tn-es-pv-nro">Nro {k.nro}</span>}
        <span className="tn-es-pv-viiva" aria-hidden="true" />
      </span>
      {pelattu ? (
        <span className="tn-es-pv-sisus tn-es-pv-sisus--pelattu">
          <span className="tn-es-pv-tulos">
            {pelattu.oikein != null && <span className="tn-es-pv-tulos-n">{pelattu.oikein}/{pelattu.yhteensa}</span>}
            <span className="tn-es-pv-tulos-t">Nähdään huomenna</span>
          </span>
          <span className="tn-es-nappi tn-es-pv-nappi">{pelattu.vastaukset ? "Katso vastaukset" : "Pelaa uudelleen"}</span>
        </span>
      ) : (
        <span className="tn-es-pv-sisus">
          <span className="tn-es-pv-koukku">
            {k.ajankohtainen && <span className="tn-es-pv-chip"><i aria-hidden="true" />Tänään</span>}
            {k.koukku && <span className="tn-es-pv-koukku-h" style={{ "--lw": pisin(k.koukku) } as CSSProperties}>{k.koukku}</span>}
            {k.koukkuTeksti && <span className="tn-es-pv-koukku-t">{k.koukkuTeksti}</span>}
          </span>
          <span className="tn-es-pv-ala">
            <span className="tn-es-cta tn-cta-lime">Pelaa</span>
            {k.rytmi && <RytmiRivi merkit={k.rytmi} />}
          </span>
        </span>
      )}
    </a>
  );
}
