// ETUSIVUN MAINOSBANNERI — Tiede & teknologia (CD "Etusivun mainosbanneri",
// 20.9.2026). Sijainti: Kuvavisat-bannerin alla ennen Suosittuja kokoelmia
// (Heikki 20.9.2026). Sama komponentti kaventuu mobiilissa pystysuuntaiseksi.

import { TIEDE_BANNERI, TIEDE_HERO } from "@/lib/tiede";

export function TiedeBanneri() {
  return (
    <div className="tnt-banner-wrap">
      <a className="tnt-banner" href={TIEDE_BANNERI.href}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={TIEDE_HERO.img} alt="" loading="lazy" />
        <span className="tnt-banner-body">
          <span className="tnt-banner-kicker"><i aria-hidden />{TIEDE_BANNERI.kicker}</span>
          <span className="tnt-banner-title">{TIEDE_BANNERI.title}</span>
          <span className="tnt-banner-text">{TIEDE_BANNERI.text}</span>
          <span className="tnt-banner-actions">
            <span className="tnt-banner-btn">{TIEDE_BANNERI.cta}</span>
            <span className="tnt-banner-meta">{TIEDE_BANNERI.meta}</span>
          </span>
        </span>
      </a>
    </div>
  );
}
