// NÄIN PELAAT (Heikki 22.11.2026): kaikkien pelimuotojen ohjeet samalla tavalla. Otsikko "Näin pelaat" ja tasan kolme
// korttia, aina auki: merkki (pelin luku, esim. 6 yritystä, tai piirretty kuvake) + otsikko + 1–2 lausetta. Malli Mikä maa?
// -aloituksesta. Mobiilissa kortit allekkain, kun tilaa on ≥ 720 px, kolme rinnakkain (container query).
// Värit kortin paikan mukaan (kulta, terrakotta, turkoosi); iho tulee kääreen data-iho-attribuutista (tumma oletus, kerma).
// Lisätiedot (lähteet, pelin tausta) eivät kuulu kortteihin: ne tulevat children-osana korttien alle tai erilliseen
// suljettuun HubOhjeet-osioon. Kuvakkeet ovat SVG:tä, ei emojia (iOS piirtää ↗:n emojina).
import type { ReactNode } from "react";
import "./nainpelaat.css";

export type OhjeKuvake = "nuoli" | "vaihto" | "lukko" | "ketju" | "kello";
export type OhjeKortti = {
  /** Luku tai lyhyt merkki ("6", "10 s") tai kuvake, jos pelissä ei ole luontevaa lukua. */
  merkki: string | { kuvake: OhjeKuvake };
  otsikko: string;
  teksti: ReactNode;
};

const POLUT: Record<OhjeKuvake, ReactNode> = {
  nuoli: <path d="M7 17 17 7M9 7h8v8" />,
  vaihto: <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />,
  lukko: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  ketju: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  kello: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </>
  ),
};

export default function NainPelaat({
  kohdat,
  otsikko = "Näin pelaat",
  id = "nain-pelaat",
  className,
  children,
}: {
  kohdat: [OhjeKortti, OhjeKortti, OhjeKortti];
  otsikko?: string;
  /** Otsikon id (aria-labelledby); anna oma, jos sivulla on useampi osio. */
  id?: string;
  className?: string;
  /** Korttien alle: lähde tai ruudunlukijan lisäohje (esim. näppäimistö). */
  children?: ReactNode;
}) {
  return (
    <section className={`tn-ohjeet${className ? ` ${className}` : ""}`} aria-labelledby={id}>
      <h2 id={id} className="tn-ohjeet-h">{otsikko}</h2>
      <ol className="tn-ohjeet-kortit">
        {kohdat.map((k) => (
          <li key={k.otsikko} className="tn-ohjeet-kortti">
            <span className="tn-ohjeet-merkki" aria-hidden="true">
              {typeof k.merkki === "string" ? (
                k.merkki
              ) : (
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  {POLUT[k.merkki.kuvake]}
                </svg>
              )}
            </span>
            <div>
              <h3>{k.otsikko}</h3>
              <p>{k.teksti}</p>
            </div>
          </li>
        ))}
      </ol>
      {children}
    </section>
  );
}
