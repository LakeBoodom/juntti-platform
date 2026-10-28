// ETUSIVU v5 — näkymä (design Tietoniekka_Etusivu_v5: 5a desktop 1440, 5b mobiili 390, 5c promopaikka; Heikki 28.10.2026).
// Data: lib/etusivu5.ts. CSS: app/(tn20)/etusivu-v5.css (luokat .tn-es-*, mobile-first).
// Seuranta: jokainen osio kantaa data-tn-entry="etusivu:<osio>" (lib/seuranta.ts).
// Ei aputekstejä: otsikko, kortti, nappi. Osio-otsikon yläpuolella vain kicker-määrä.
import type { CSSProperties } from "react";
import type { EtusivuData } from "@/lib/etusivu5";
import PelattuTanaan from "./PelattuTanaan";

type D = NonNullable<EtusivuData>;

/** Pisimmän sanan pituus otsikon kokokaavaan (KORTTISÄÄNTÖ): --lw. Yhdysmerkki on katkaisukohta. */
const lw = (t: string) => ({ "--lw": Math.max(...t.split(/\s+/).flatMap((w) => w.split(/(?<=-)/)).map((w) => w.length), 4) }) as CSSProperties;

function Kuva({ src, pos, luokka, eager }: { src: string | null; pos?: string; luokka: string; eager?: boolean }) {
  if (!src) return <span className={luokka} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={luokka} src={src} alt="" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} style={pos ? { objectPosition: pos } : undefined} />
  );
}

function PaivanPelit({ d }: { d: D }) {
  const { pvm, visa, slotti, sankari } = d.paivanPelit;
  const maara = [visa, slotti, sankari].filter(Boolean).length;
  return (
    <section className="tn-es-pp" aria-labelledby="tn-es-pp-h" data-tn-entry="etusivu:paivan-pelit">
      <div className="tn-es-pp-paa">
        <div className="tn-es-otsake">
          <span className="tn-es-kicker tn-es-kicker--kulta">
            <span className="tn-es-vain-desk">{pvm.pitka}</span>
            <span className="tn-es-vain-mob">{pvm.lyhyt}</span>
          </span>
          <h2 id="tn-es-pp-h" className="tn-es-h2 tn-es-h2--iso">Päivän pelit</h2>
        </div>
        {maara > 0 && (
          <PelattuTanaan visaId={visa?.quizId ?? null} sankariId={sankari?.quizId ?? null} slotti={slotti?.avain ?? null} tanaan={d.today.iso} maara={maara} />
        )}
      </div>
      <div className="tn-es-pp-ruudukko">
        {visa && (
          <a className="tn-es-pv" href={visa.playHref} data-tn-entry="etusivu:paivan-visa">
            <Kuva src={visa.imageUrl} pos={visa.imagePos} luokka="tn-es-pv-kuva" eager />
            <span className="tn-es-pv-varjo" aria-hidden="true" />
            <span className="tn-es-pv-sisus">
              <span className="tn-es-tagit">
                <span className="tn-es-tag tn-es-tag--kulta">Päivän visa</span>
                <span className="tn-es-tag">{visa.badge.label}</span>
              </span>
              <span className="tn-es-pv-h" style={lw(visa.title)}>{visa.title}</span>
              <span className="tn-es-cta tn-cta-lime">Pelaa päivän visa</span>
            </span>
          </a>
        )}
        <div className="tn-es-pp-sivu">
          {slotti && (
            <a className="tn-es-slot" href={slotti.href} data-paivan-peli="slotti" data-tn-entry="etusivu:paivan-slotti" style={{ "--acc": slotti.aksentti } as CSSProperties}>
              <span className="tn-es-slot-kuva">
                <Kuva src={slotti.kuva} pos={slotti.kuvaPos} luokka="tn-es-slot-img" />
              </span>
              <span className="tn-es-slot-teksti">
                <span className="tn-es-laji">
                  <i aria-hidden="true" />
                  <span>Päivän peli<span className="tn-es-vain-desk"> · {slotti.pelimuoto}</span></span>
                </span>
                <span className="tn-es-slot-h" style={lw(slotti.otsikko)}>{slotti.otsikko}</span>
                <span className="tn-es-slot-rivi">{slotti.rivi}</span>
                <span className="tn-es-nappi tn-es-nappi--acc">{slotti.cta}</span>
              </span>
            </a>
          )}
          {sankari && (
            <a className="tn-es-synt" href={sankari.playHref} data-tn-entry="etusivu:synttarit">
              <span className="tn-es-synt-kuva">
                <Kuva src={sankari.kuva} pos={sankari.kuvaPos} luokka="tn-es-synt-img" />
              </span>
              <span className="tn-es-synt-teksti">
                <span className="tn-es-kicker tn-es-kicker--oranssi">{sankari.kicker.mobile}</span>
                <span className="tn-es-synt-h" style={lw(sankari.nimi)}>{sankari.nimi}</span>
                <span className="tn-es-nappi">Pelaa visa</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function Tiesitko({ t }: { t: NonNullable<D["tiesitko"]> }) {
  const i = t.kysymys.lastIndexOf(t.korostus);
  const alku = i >= 0 ? t.kysymys.slice(0, i) : t.kysymys;
  const loppu = i >= 0 ? t.kysymys.slice(i + t.korostus.length) : "";
  return (
    <a className="tn-es-tt" href={t.href} data-tn-entry="etusivu:tiesitko">
      <span className="tn-es-tt-kuva">
        <Kuva src={t.kuva} pos={t.kuvaPos} luokka="tn-es-tt-img" />
      </span>
      <span className="tn-es-tt-teksti">
        <span className="tn-es-tt-yla">
          <span className="tn-es-tag tn-es-tag--syaani">Tiesitkö?</span>
          <span className="tn-es-tt-kicker tn-es-vain-desk">{t.kicker}</span>
        </span>
        <span className="tn-es-tt-h">
          {alku}
          {i >= 0 && <mark>{t.korostus}</mark>}
          {loppu}
        </span>
        <span className="tn-es-cta tn-cta-lime">Ota selvää</span>
      </span>
    </a>
  );
}

function Aiheet({ a }: { a: D["aiheet"] }) {
  return (
    <section className="tn-es-osio" aria-labelledby="tn-es-aiheet-h" data-tn-entry="etusivu:kokoelmat">
      <div className="tn-es-otsake">
        <span className="tn-es-kicker">{a.kicker}</span>
        <h2 id="tn-es-aiheet-h" className="tn-es-h2">Selaa aiheittain</h2>
      </div>
      <div className="tn-es-aiheet">
        {a.tiilet.map((x) => (
          <a key={x.slug} className="tn-es-aihe" href={x.href}>
            <Kuva src={x.kuva} pos={x.kuvaPos} luokka="tn-es-aihe-img" />
            <span className="tn-es-aihe-nimi" lang="fi" style={lw(x.nimi)}>{x.nimi}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Pelit({ p }: { p: D["pelit"] }) {
  return (
    <section className="tn-es-osio" aria-labelledby="tn-es-pelit-h" data-tn-entry="etusivu:pelimuodot">
      <div className="tn-es-otsake">
        <span className="tn-es-kicker">{p.kicker}</span>
        <h2 id="tn-es-pelit-h" className="tn-es-h2">Valitse peli</h2>
      </div>
      {p.ryhmat.map((g) => (
        <div key={g.avain} className="tn-es-ryhma">
          <h3 className="tn-es-ryhma-h"><span>{g.nimi}</span></h3>
          <div className="tn-es-rivi" data-ryhma={g.avain}>
            {g.kortit.map((m) => {
              const sisus = (
                <>
                  <span className="tn-es-peli-kuva">
                    <Kuva src={m.kuva} pos={m.kuvaPos} luokka="tn-es-peli-img" />
                  </span>
                  {m.tila === "tulossa" && <span className="tn-es-leima">Tulossa</span>}
                  <span className="tn-es-peli-teksti">
                    <span className="tn-es-laji" style={{ "--acc": m.aksentti } as CSSProperties}>
                      <i aria-hidden="true" />
                      {m.laji}
                    </span>
                    <span className="tn-es-peli-h" lang="fi" style={lw(m.nimi)}>{m.nimi}</span>
                    <span className="tn-es-peli-rivi">{m.etusivu_rivi}</span>
                  </span>
                </>
              );
              return m.tila === "tulossa" ? (
                <div key={m.slug} className="tn-es-peli" data-tulossa aria-disabled="true">{sisus}</div>
              ) : (
                <a key={m.slug} className="tn-es-peli" href={m.href}>{sisus}</a>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function Promo1({ p }: { p: NonNullable<D["promo1"]> }) {
  return (
    <div className="tn-es-promo-paikka" data-tn-entry="etusivu:promo1">
      <a className="tn-es-promo tn-es-promo--1" href={p.href}>
        <span className="tn-es-promo-kuva">
          <Kuva src={p.kuva} pos={p.kuvaPos} luokka="tn-es-promo-img" />
        </span>
        <span className="tn-es-promo-teksti">
          <span className="tn-es-promo-yla">
            <span className="tn-es-kicker tn-es-kicker--oranssi">{p.kicker}</span>
            {p.tila === "countdown" && (
              <span className="tn-es-promo-laskuri">
                {p.paivia === 0 ? "Tänään" : (
                  <>
                    <b>{p.paivia}</b> <span className="tn-es-vain-desk">{p.paivia === 1 ? "päivä" : "päivää"}</span>
                    <span className="tn-es-vain-mob">pv</span>
                  </>
                )}
              </span>
            )}
          </span>
          <span className="tn-es-promo-ala">
            <span className="tn-es-promo-h" style={lw(p.otsikko)}>{p.otsikko}</span>
            <span className="tn-es-nappi">Pelaa</span>
          </span>
        </span>
      </a>
    </div>
  );
}

function Juontajat({ j }: { j: D["juontajat"] }) {
  return (
    <section className="tn-es-osio" aria-labelledby="tn-es-juontajat-h" data-tn-entry="etusivu:juontajat">
      <div className="tn-es-otsake">
        <span className="tn-es-kicker">Visajuontajat</span>
        <h2 id="tn-es-juontajat-h" className="tn-es-h2">Laura ja Mikko suosittelevat</h2>
      </div>
      <div className="tn-es-juontajat">
        {j.map((h) => (
          <a key={h.key} className="tn-es-juontaja" href={h.href}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tn-es-juontaja-img" src={h.kuva} alt={h.nimi} loading="lazy" />
            <span className="tn-es-juontaja-teksti">
              <span className="tn-es-kicker" style={{ color: h.aksentti }}>{h.nimi} suosittelee</span>
              <span className="tn-es-juontaja-h" style={lw(h.visa)}>{h.visa}</span>
              <span className="tn-es-juontaja-sitaatti">”{h.teaser}”</span>
              <span className="tn-es-nappi">Pelaa</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Promo2({ p }: { p: NonNullable<D["promo2"]> }) {
  return (
    <div className="tn-es-promo-paikka" data-tn-entry="etusivu:promo2">
      <a className="tn-es-promo tn-es-promo--2" href={p.href} rel="noopener">
        <span className="tn-es-promo-kuva">
          <Kuva src={p.kuva} luokka="tn-es-promo-img" />
        </span>
        <span className="tn-es-promo-teksti">
          <span className="tn-es-kicker">{p.kicker}</span>
          <span className="tn-es-ootko-h">{p.otsikko}</span>
          <span className="tn-es-ootko-cta">{p.cta}</span>
        </span>
      </a>
    </div>
  );
}

function LapsetJaPaketit({ l, paketit }: { l: D["lapset"]; paketit: D["paketit"] }) {
  if (!l && !paketit.length) return null;
  return (
    <div className="tn-es-lp" data-tn-entry="etusivu:lapset">
      {l && (
        <div className="tn-es-lapset">
          <a className="tn-es-lapset-paa" href={l.href}>
            <span className="tn-es-kicker tn-es-kicker--vihrea">Lapsille</span>
            <span className="tn-es-lp-h">Tietoniekka lapsille</span>
          </a>
          <div className="tn-es-lapset-iat">
            <a className="tn-es-nappi" href={`${l.href}?ika=4-7`}>4–7 v</a>
            <a className="tn-es-nappi" href={`${l.href}?ika=8-12`}>8–12 v</a>
          </div>
          <Kuva src="/20/lapset/hero-v1.webp" luokka="tn-es-lp-kuva" />
        </div>
      )}
      {paketit.map((p) => (
        <div key={p.avain} className="tn-es-paketti" data-tulossa={p.tila === "tulossa" || undefined} aria-disabled={p.tila === "tulossa" || undefined}>
          <span className="tn-es-paketti-teksti">
            <span className="tn-es-kicker tn-es-kicker--kulta2">{p.kicker}</span>
            <span className="tn-es-lp-h">{p.otsikko}</span>
            <span className="tn-es-paketti-rivi tn-es-vain-desk">{p.rivi}</span>
          </span>
          <Kuva src={p.kuva} luokka="tn-es-lp-kuva" />
        </div>
      ))}
    </div>
  );
}

export default function EtusivuV5({ d }: { d: D }) {
  return (
    <div className="tn-es5" data-tn-entry="etusivu:muu">
      <PaivanPelit d={d} />
      {d.tiesitko && <Tiesitko t={d.tiesitko} />}
      <Aiheet a={d.aiheet} />
      <Pelit p={d.pelit} />
      {d.promo1 && <Promo1 p={d.promo1} />}
      {d.juontajat.length > 0 && <Juontajat j={d.juontajat} />}
      {d.promo2 && <Promo2 p={d.promo2} />}
      <LapsetJaPaketit l={d.lapset} paketit={d.paketit} />
    </div>
  );
}
