"use client";
// Aihesivujen pelihylly (erä B4, design v0.3 4a/4b). Hyllyn sääntö (CD):
//   - ensimmäinen peli on aina nosto (lime CTA — ainoa täytetty painike)
//   - pelityypillä oma aksentti: Ikäjärjestys violetti, henkilövisa meripihka
//   - 2 peliä: nosto + täysleveä rivi · 3–4: nosto + muut rinnakkain · 5+: kolmen sarake + "Kaikki"-linkki
//   - "Muista kokoelmista" -lista hyllyn alla
// Henkilövisan tila luetaan localStoragesta (GameClient → tn_quiz_results): pelattu → "Sait 4/5 · taso".
import { useEffect, useState } from "react";

export type HyllyLaatta = { name: string; image_url: string | null; oma: boolean };

export type HyllyPeli =
  | { tyyppi: "ikajarjestys"; otsikko: string; kuvaus: string; href: string; laatat: HyllyLaatta[] }
  | { tyyppi: "visa"; id: string; otsikko: string; href: string; fanitasot?: string[] | null }
  | { tyyppi: "muu"; eyebrow: string; otsikko: string; href: string; aksentti: string };

export type HyllyLinkki = { otsikko: string; href: string; meta?: string };

type Tulos = { right: number; total: number };
const KYNNYKSET = [0, 40, 60, 80, 100];

function lueTulos(id: string): Tulos | null {
  try {
    const t = JSON.parse(window.localStorage.getItem("tn_quiz_results") ?? "{}")[id];
    return t && Number.isFinite(t.right) && Number.isFinite(t.total) && t.total > 0 ? t : null;
  } catch {
    return null;
  }
}

const pisin = (t: string) => Math.max(...t.split(/\s+/).map((w) => w.length), 6);
const lw = (t: string) => ({ "--hub-lw": pisin(t) }) as React.CSSProperties;

function VisaTila({ peli, children }: { peli: Extract<HyllyPeli, { tyyppi: "visa" }>; children: (t: Tulos | null, taso: string | null) => React.ReactNode }) {
  const [tulos, setTulos] = useState<Tulos | null>(null);
  useEffect(() => setTulos(lueTulos(peli.id)), [peli.id]);
  let taso: string | null = null;
  if (tulos && peli.fanitasot) {
    const pct = (tulos.right / tulos.total) * 100;
    taso = peli.fanitasot[KYNNYKSET.reduce((acc, k, i) => (pct >= k ? i : acc), 0)] ?? null;
  }
  return <>{children(tulos, taso)}</>;
}

function TulosRivi({ tulos, taso }: { tulos: Tulos; taso: string | null }) {
  return (
    <span className="hub-visa-tulos">
      <span className="hub-visa-palkit" aria-hidden="true">
        {Array.from({ length: Math.min(tulos.total, 10) }, (_, i) => (
          <span key={i} className={i < tulos.right ? "on" : ""} />
        ))}
      </span>
      <span>
        Sait {tulos.right}/{tulos.total}
        {taso ? ` · ${taso}` : ""}
      </span>
    </span>
  );
}

/** Nosto: Ikäjärjestys (violetti, laatat + akseli) tai henkilövisa. */
function Nosto({ peli }: { peli: HyllyPeli }) {
  if (peli.tyyppi === "ikajarjestys") {
    return (
      <a className="hub-nosto hub-nosto--ika" href={peli.href} style={lw(peli.otsikko)}>
        <span className="hub-nosto-merkit">
          <span className="hub-tyyppi hub-tyyppi--ika">Ikäjärjestys</span>
          <span className="hub-nosto-kysymys">Kuka on vanhin?</span>
        </span>
        <span className="hub-nosto-otsikko">{peli.otsikko}</span>
        <span className="hub-nosto-kuvaus">{peli.kuvaus}</span>
        <span className="hub-ika-laatat">
          <span className="hub-ika-viiva" aria-hidden="true" />
          {peli.laatat.map((l) => (
            <span key={l.name} className={l.oma ? "hub-ika-laatta hub-ika-laatta--oma" : "hub-ika-laatta"}>
              <span className="hub-ika-kuva">
                {l.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image_url} alt="" loading="lazy" />
                ) : (
                  <span className="hub-laatta-ini" aria-hidden="true">
                    {l.name
                      .split(/\s+/)
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}
                <span className="hub-ika-savy" aria-hidden="true" />
                <span className={l.oma ? "hub-ika-merkki hub-ika-merkki--oma" : "hub-ika-merkki"} aria-hidden="true">
                  {l.oma ? "Raahaa" : "?"}
                </span>
              </span>
              <span className="hub-ika-nimi">{l.name}</span>
            </span>
          ))}
        </span>
        <span className="hub-ika-akseli" aria-hidden="true">
          <span>Vanhin</span>
          <span className="hub-ika-akseli-viiva" />
          <span>Nuorin</span>
        </span>
        <span className="hub-cta-lime">
          Pelaa <span aria-hidden="true">→</span>
        </span>
      </a>
    );
  }
  if (peli.tyyppi === "visa") {
    return (
      <VisaTila peli={peli}>
        {(tulos, taso) => (
          <a className="hub-nosto hub-nosto--visa" href={peli.href} style={lw(peli.otsikko)}>
            <span className="hub-tyyppi hub-tyyppi--visa">Henkilövisa</span>
            <span className="hub-nosto-otsikko">{peli.otsikko}</span>
            {tulos && <TulosRivi tulos={tulos} taso={taso} />}
            <span className="hub-cta-lime">{tulos ? "Pelaa uudelleen" : "Aloita visa"} <span aria-hidden="true">→</span></span>
          </a>
        )}
      </VisaTila>
    );
  }
  return (
    <a className="hub-nosto" href={peli.href} style={{ ...lw(peli.otsikko), ["--hub-acc" as string]: peli.aksentti }}>
      <span className="hub-tyyppi" style={{ background: peli.aksentti }}>
        {peli.eyebrow}
      </span>
      <span className="hub-nosto-otsikko">{peli.otsikko}</span>
      <span className="hub-cta-lime">
        Pelaa <span aria-hidden="true">→</span>
      </span>
    </a>
  );
}

/** Nostoa seuraavat pelit: täysleveä rivi (yksi) tai kortti (useampi). */
function Rivi({ peli, kortti }: { peli: HyllyPeli; kortti: boolean }) {
  if (peli.tyyppi === "visa") {
    return (
      <VisaTila peli={peli}>
        {(tulos, taso) => (
          <a className={kortti ? "hub-rivi hub-rivi--kortti hub-rivi--visa" : "hub-rivi hub-rivi--visa"} href={peli.href} style={lw(peli.otsikko)}>
            {!kortti && (
              <span className="hub-rivi-ikoni" aria-hidden="true">
                ?
              </span>
            )}
            <span className="hub-rivi-teksti">
              <span className="hub-rivi-eyebrow">Henkilövisa</span>
              <span className="hub-rivi-nimi">{peli.otsikko}</span>
              {tulos && <TulosRivi tulos={tulos} taso={taso} />}
            </span>
            <span className="hub-rivi-cta">{tulos ? "Pelaa uudelleen" : "Aloita visa →"}</span>
          </a>
        )}
      </VisaTila>
    );
  }
  const eyebrow = peli.tyyppi === "ikajarjestys" ? "Ikäjärjestys" : peli.eyebrow;
  const acc = peli.tyyppi === "ikajarjestys" ? "#C79BFF" : peli.aksentti;
  return (
    <a
      className={kortti ? "hub-rivi hub-rivi--kortti" : "hub-rivi"}
      href={peli.href}
      style={{ ...lw(peli.otsikko), ["--hub-acc" as string]: acc }}
    >
      <span className="hub-rivi-teksti">
        <span className="hub-rivi-eyebrow">{eyebrow}</span>
        <span className="hub-rivi-nimi">{peli.otsikko}</span>
      </span>
      <span className="hub-rivi-cta">Pelaa →</span>
    </a>
  );
}

export default function PeliHylly({
  otsikko,
  pelit,
  muista = [],
  kaikki,
}: {
  otsikko: string;
  pelit: HyllyPeli[];
  muista?: HyllyLinkki[];
  /** 5+ pelillä "Kaikki <nimen> pelit" -linkki. */
  kaikki?: { href: string; teksti: string };
}) {
  if (!pelit.length && !muista.length) return null;
  const [nosto, ...muut] = pelit;
  const nakyvat = muut.length >= 4 ? muut.slice(0, 3) : muut;
  return (
    <section className="hub-hylly" aria-label={otsikko}>
      {pelit.length > 0 && (
        <>
          <div className="hub-hylly-head">
            <h2 className="hub-hylly-otsikko">{otsikko}</h2>
            <span className="hub-hylly-n">{pelit.length === 1 ? "1 peli" : `${pelit.length} peliä`}</span>
          </div>
          <Nosto peli={nosto} />
          {nakyvat.length === 1 && <Rivi peli={nakyvat[0]} kortti={false} />}
          {nakyvat.length > 1 && (
            <div className={nakyvat.length === 2 ? "hub-rivit hub-rivit--2" : "hub-rivit hub-rivit--3"}>
              {nakyvat.map((p) => (
                <Rivi key={p.href} peli={p} kortti />
              ))}
            </div>
          )}
          {muut.length >= 4 && kaikki && (
            <a className="hub-hylly-kaikki" href={kaikki.href}>
              {kaikki.teksti} →
            </a>
          )}
        </>
      )}
      {muista.length > 0 && (
        <div className="hub-muista">
          <span className="hub-muista-otsikko">Muista kokoelmista</span>
          <ul>
            {muista.map((m) => (
              <li key={m.href}>
                <a href={m.href}>
                  <span>{m.otsikko}</span>
                  {m.meta && <span className="hub-muista-meta">{m.meta}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
