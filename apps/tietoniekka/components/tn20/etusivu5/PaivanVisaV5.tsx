"use client";
// Etusivu — Päivän visa -kortti (CD "TN Etusivu mobiili v7", Heikki 30.10.2026; korvasi 29.10. nimiönauhan 4a/4b).
//   · kuvakortti: visan kansikuva taustalla, tumma liuku alhaalta, sisältö kortin alareunassa
//   · viikonpäivän tunnusväri (--pv-<viikonpäivä>, globals.css) merkissä "Päivän visa · Pe" ja 4 px yläreunan viivassa
//   · koukku: ajankohtaisuusteksti tai visan 1. kysymys; CTA lime "Pelaa päivän visa"
//   · uuden Päivän visan kentät: numero merkissä, rytmirivi CTA:n yläpuolella (kun olemassa)
//   · pelattu-tila: tulos "8/10" + "Nähdään huomenna", nappi "Katso vastaukset" (ei lime)
//   · nostomittaus (luku 9): näyttö kerran ≥ 50 % näkyvissä + klikkaus.
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { preload } from "react-dom";
import { kirjaaNosto, useNayttoMittaus } from "@/lib/nostoMittaus";
import { kuvanSrcSet } from "@/lib/kuvaVariantit";
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
/** Kuvan leveys näkymässä: mobiilissa koko palsta, desktopilla 1.55fr-palsta (≈ 680 px). */
const PV_SIZES = "(min-width: 1100px) 680px, 100vw";

export default function PaivanVisaV5({ k }: { k: PaivanVisaKortti }) {
  const [pelattu, setPelattu] = useState<Pelattu | null>(null);
  useEffect(() => setPelattu(luePelattu(k)), [k]);
  const mitta = { slotti: "paivan_visa" as const, quizId: k.quizId, intro: k.mitta.intro, kategoria: k.mitta.kategoria };
  const ref = useNayttoMittaus<HTMLAnchorElement>(() => kirjaaNosto({ ...mitta, tapahtuma: "naytto" }));
  /* LCP: kortin kuva on ensimmäisen näytön suurin elementti → esilataus <head>iin. */
  if (k.kuva) preload(k.kuva, { as: "image", fetchPriority: "high", imageSrcSet: kuvanSrcSet(k.kuva), imageSizes: PV_SIZES });
  const srcSet = k.kuva ? kuvanSrcSet(k.kuva) : undefined;

  return (
    <a
      ref={ref}
      className="tn-es-pv"
      href={pelattu ? (pelattu.vastaukset ? k.vastauksetHref : k.href) : k.href}
      data-tn-entry="etusivu:paivan-visa"
      data-pelattu={pelattu ? "" : undefined}
      data-kuva={k.kuva ? "" : undefined}
      style={{ "--pv": `var(--pv-${k.tunnusvari})` } as CSSProperties}
      onClick={() => { if (!pelattu) kirjaaNosto({ ...mitta, tapahtuma: "klikkaus" }); }}
    >
      {k.kuva && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tn-es-pv-img" src={k.kuva} srcSet={srcSet} sizes={srcSet ? PV_SIZES : undefined} alt="" fetchPriority="high"
          style={k.kuvaPos ? { objectPosition: k.kuvaPos } : undefined} />
      )}
      <span className="tn-es-pv-sisus">
        <span className="tn-es-pv-merkki">
          Päivän visa<span className="tn-es-pv-vp">{k.viikonpaiva}{k.nro != null ? ` · Nro ${k.nro}` : ""}</span>
        </span>
        {pelattu ? (
          <>
            <span className="tn-es-pv-tulos">
              {pelattu.oikein != null && <span className="tn-es-pv-tulos-n">{pelattu.oikein}/{pelattu.yhteensa}</span>}
              <span className="tn-es-pv-tulos-t">Nähdään huomenna</span>
            </span>
            <span className="tn-es-nappi tn-es-pv-nappi">{pelattu.vastaukset ? "Katso vastaukset" : "Pelaa uudelleen"}</span>
          </>
        ) : (
          <>
            {k.koukku && <span className="tn-es-pv-koukku-h" style={{ "--lw": pisin(k.koukku) } as CSSProperties}>{k.koukku}</span>}
            {k.koukkuTeksti && <span className="tn-es-pv-koukku-t">{k.koukkuTeksti}</span>}
            {k.rytmi && <RytmiRivi merkit={k.rytmi} />}
            <span className="tn-es-cta tn-cta-lime">Pelaa päivän visa</span>
          </>
        )}
      </span>
    </a>
  );
}
