// ETUSIVUN KOUKKUBANNERI — Luonto / ruutana (CD "TN Luonto ruutana -banneri" 5a, 6.10.2026).
// Korvasi Tiede & teknologia -bannerin (Heikki 6.10.2026). Vie suoraan visaan Järvien kätketyt ihmeet;
// vastaus (ruutana) ei näy, kala on kuvassa vain siluettina.
// Kolme asettelua yhdestä DOMista kontin leveyden mukaan (ruutana-banneri.css): desktop ≥ 860
// (1160 × 268), tabletti 520–859 (760 × 240), mobiili < 520 (pystykuva, 380 × 600).
// Animaatio CSS:llä (n. 2,5 s kerran): sanat nousevat, "alkoholia" saa meripihkakorostuksen, nappi
// tulee viimeisenä; kuva liukuu 20 s; kysymysmerkki nykäisee 4,2 s välein. prefers-reduced-motion:
// kaikki näkyy heti ilman liikettä.
import type { CSSProperties } from "react";
import { visaHref } from "@/lib/visaHref";

const SLUG = "jarvien-katketyt-ihmeet-visa";
const SANAT = ["Mikä", "suomalainen", "järvikala", "selviää", "talvesta", "tuottamalla"];
const KOROSTUS_MS = 120 + (SANAT.length + 1) * 100 + 160;

export function RuutanaBanneri() {
  const viive = (ms: number) => ({ "--rb-viive": `${ms}ms` }) as CSSProperties;
  return (
    <div className="rb-wrap">
      <a className="rb" href={visaHref({ slug: SLUG })} aria-label="Järvien kätketyt ihmeet: Mikä suomalainen järvikala selviää talvesta tuottamalla alkoholia? Ota selvää visassa.">
        <span className="rb-kuva" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rb-kuva-laaja" src="/20/etusivu/banneri-ruutana-laaja.webp" alt="" loading="lazy" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rb-kuva-pysty" src="/20/etusivu/banneri-ruutana-pysty.webp" alt="" loading="lazy" />
        </span>
        <span className="rb-varjo" aria-hidden="true" />
        <span className="rb-yla">
          <span className="rb-tagi">Luonto</span>
          <span className="rb-visa">Järvien kätketyt ihmeet</span>
        </span>
        <span className="rb-teksti">
          <span className="rb-yla rb-yla--sisa">
            <span className="rb-tagi">Luonto</span>
            <span className="rb-visa">Järvien kätketyt ihmeet</span>
          </span>
          <span className="rb-h" aria-hidden="true">
            {SANAT.map((s, i) => (
              <span key={s} className="rb-sana" style={viive(120 + i * 100)}>
                {s}
              </span>
            ))}
            <span className="rb-sana rb-sana--viim" style={viive(120 + SANAT.length * 100)}>
              <span className="rb-korostus" style={viive(KOROSTUS_MS)}>alkoholia</span>
              <span className="rb-kysymys" style={viive(KOROSTUS_MS + 900)}>?</span>
            </span>
          </span>
          <span className="rb-cta" style={viive(KOROSTUS_MS + 400)}>Ota selvää →</span>
        </span>
      </a>
    </div>
  );
}
