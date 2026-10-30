"use client";
// Etusivu — juhlabanneri (Promo 1, countdown-tila; CD "TN Etusivu mobiili v7" kohta 2 "v0.2 ilman looppeja", 30.10.2026).
//   · kuva + juhlan väri hehkuna (staattinen), "Juhlat"-tagi ja "Halloween · la 31.10.", laskuri oikeassa alakulmassa
//   · koukku = kysymys juhlan visasta, korostettu sana juhlan värillä; alarivi; lime "Selvitä vastaus →"
//   · juhlapäivänä laskurissa "Tänään" + tervehdys ("Hyvää halloweenia")
// Liike (UI-laatusäännöt 1–2): vain transform/opacity, ajetaan kerran kun banneri tulee näkyviin, ei looppeja.
//   Sanat nousevat → korostus pyyhkäistään (scaleX) → kysymysmerkki nykäisee kerran → alaosa ja laskuri; luku laskee 0 → n.
//   Palvelin renderöi valmiin tilan; animaatio käynnistyy vain, jos banneri on vielä näkymän alapuolella (ei välähdystä).
//   prefers-reduced-motion → ei animaatiota.
import type { CSSProperties } from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import { kuvanSrcSet } from "@/lib/kuvaVariantit";

export type JuhlabanneriData = {
  juhla: string; pvm: string; aksentti: string; paivia: number; yksikko: string;
  otsikko: string; korostus: string | null; ala: string | null; cta: string; href: string; kuva: string | null; kuvaPos?: string;
};

/** Sanat ja korostus: korostettava sana (välimerkkeineen) erotetaan; "?" saa oman nykäisyn. */
function sanat(otsikko: string, korostus: string | null) {
  return otsikko.split(/\s+/).map((w) => ({ w, kor: !!korostus && w === korostus }));
}

export default function Juhlabanneri({ b }: { b: JuhlabanneriData }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [tila, setTila] = useState<"valmis" | "odota" | "aja">("valmis");
  const [luku, setLuku] = useState(b.paivia);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // jo näkyvissä → ei animaatiota
    setTila("odota");
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      setTila("aja");
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Laskuri 0 → n: alkaa 1,5 s sisääntulon jälkeen, kesto 1,1 s, ease-out (cubic). */
  useEffect(() => {
    if (tila !== "aja" || b.paivia <= 0) return;
    let raf = 0;
    setLuku(0);
    const t0 = performance.now() + 1500;
    const askel = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / 1100));
      setLuku(Math.round(b.paivia * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(askel);
    };
    raf = requestAnimationFrame(askel);
    return () => cancelAnimationFrame(raf);
  }, [tila, b.paivia]);

  const lista = sanat(b.otsikko, b.korostus);
  const srcSet = b.kuva ? kuvanSrcSet(b.kuva) : undefined;
  const pisin = Math.max(...b.otsikko.split(/\s+/).map((w) => w.length), 4);

  return (
    <div className="tn-es-promo-paikka" data-tn-entry="etusivu:promo1">
      <a ref={ref} className="tn-jb" href={b.href} data-anim={tila} style={{ "--acc": b.aksentti, "--n": lista.length } as CSSProperties}>
        <span className="tn-jb-kuva">
          {b.kuva && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="tn-jb-img" src={b.kuva} srcSet={srcSet} sizes={srcSet ? "(min-width: 1100px) 420px, 100vw" : undefined} alt="" loading="lazy"
              style={b.kuvaPos ? { objectPosition: b.kuvaPos } : undefined} />
          )}
          <span className="tn-jb-hehku" aria-hidden="true" />
          <span className="tn-jb-yla">
            <span className="tn-jb-tag">Juhlat</span>
            <span className="tn-jb-label">{b.juhla} · {b.pvm}</span>
          </span>
          <span className="tn-jb-laskuri">
            <span className="tn-jb-luku" data-tanaan={b.paivia === 0 || undefined}>{b.paivia === 0 ? "Tänään" : luku}</span>
            <span className="tn-jb-yksikko">{b.yksikko}</span>
          </span>
        </span>
        <span className="tn-jb-teksti">
          <span className="tn-jb-h" style={{ "--lw": pisin } as CSSProperties}>
            {/* Väli sanaspanien ulkopuolella: inline-blockin sisäinen loppuväli katoaa. */}
            {lista.map(({ w, kor }, i) => {
              const tyyli = { "--i": i } as CSSProperties;
              const kysymys = kor && w.endsWith("?");
              return (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span className="tn-jb-sana" style={tyyli}>
                    {kor ? <mark className="tn-jb-mark">{kysymys ? w.slice(0, -1) : w}</mark> : w}
                    {kysymys && <span className="tn-jb-kysymys">?</span>}
                  </span>
                </Fragment>
              );
            })}
          </span>
          <span className="tn-jb-ala">
            {b.ala && <span className="tn-jb-alarivi">{b.ala}</span>}
            <span className="tn-es-cta tn-cta-lime tn-jb-cta">{b.cta} →</span>
          </span>
        </span>
      </a>
    </div>
  );
}
