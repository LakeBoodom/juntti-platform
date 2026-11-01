// /visapaketit — VISAPAKETTIEN LANDING (toteutusbrief 28.10.2026 V-C; CD 1a desktop, 1c mobiili).
// H1 + yksi lause → ajankohtainen paketti isona nostona (kausi kattaa tämän päivän, lähin kauden loppu voittaa;
// muuten pubivisan uusin painos) → muut paketit korttiruudukossa, kortin alalaidassa pikatoiminnot
// Pelaa · Ruudulle · Tulosta. Heikin katselmuksen poikkeamat CD:stä: ei teemasuodattimia, ei alalaidan
// selitysosiota, ei CTA:n viereistä käyttötaparivia, ei korttien taglineja (tilalla metarivi datasta).
// Pubivisalla on yksi kortti (sarja), ei korttia per painos. Kortti on article, otsikko on linkki (koko kortin
// osuma-alue ::after-pseudoelementillä) ja pikatoiminnot ovat omia linkkejään: ei sisäkkäisiä <a>-elementtejä.
// SEO-brief 1.11.2026: H1 "Visapaketit – valmiit tietovisat vastauksineen", 2–3 lauseen johdanto, kortin metarivissä
// kysymysmäärä ensin, nosto samalla article-rakenteella kuin kortit (Pelaa · Ruudulle · Tulosta + lastenversio)
// ja ItemList-rakenteinen data paketeista.
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import "../visapaketit.css";
import Crumbs from "@/components/tn20/Crumbs";
import { runkoCond } from "@/components/tn20/runko/runkoFontti";
import { jakoMeta } from "@/lib/jakoMeta";
import { JsonLd, abs } from "@/lib/jsonLd";
import { katko, pisinSana } from "@/lib/kokoelmat/data";
import { pieniKuva } from "@/lib/pienetKuvat";
import {
  type PakettiRivi, ajankohtainen, korttiHref, landinginPaketit, lapsetHref, listaaVisapaketit, metarivi, sarjaNimi, valitsinNakyy,
} from "@/lib/visapaketit";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Visapaketit – valmiit tietovisat vastauksineen | Tietoniekka";
  const description = "Valmiit tietovisakysymykset vastauksineen visailtaan: pelaa itse, näytä televisiosta kysymys kerrallaan tai tulosta joukkueille. Ilmainen.";
  const canonical = `${SITE_URL}/visapaketit`;
  return {
    title: { absolute: title }, description, alternates: { canonical },
    ...jakoMeta({ title, description, url: canonical, kuva: "/og/sivu/visapaketit" }),
  };
}

const nimi = (p: PakettiRivi) => (p.sarja ? sarjaNimi(p.sarja) : p.otsikko);
const meta = (p: PakettiRivi) => [...(p.sarja && p.painos_nimi ? [p.painos_nimi] : []), ...metarivi(p, p.kierroksia, p.kysymyksia)].join(" · ");
const lastenNimi = (p: PakettiRivi) => p.lasten_otsikko ?? `${p.otsikko} lapsille`;
const H1 = "Visapaketit – valmiit tietovisat vastauksineen";

/** Pikatoiminnot (kortti ja nosto): Pelaa · Ruudulle · Tulosta, 'molemmat'-paketilla lisäksi Lapsille. */
function Pikat({ p, lapset }: { p: PakettiRivi; lapset: boolean }) {
  const href = korttiHref(p);
  return (
    <nav className="tn-vp-pikat" aria-label={`${nimi(p)}: käyttötavat`}>
      <a href={`${href}#pelaa`}>Pelaa</a>
      <a href={`${href}/ruutu`}>Ruudulle</a>
      <a href={`${href}/tulosta`}>Tulosta</a>
      {lapset && valitsinNakyy(p) && <a href={lapsetHref(p)} aria-label={lastenNimi(p)}>Lapsille</a>}
    </nav>
  );
}
const tyyli = (p: PakettiRivi) => (p.aksentti ? ({ "--vp-acc": p.aksentti } as CSSProperties) : undefined);

export default async function VisapaketitSivu() {
  const kaikki = await listaaVisapaketit();
  const kortit = landinginPaketit(kaikki);
  const nosto = ajankohtainen(kaikki);
  const muut = kortit.filter((p) => !nosto || korttiHref(p) !== korttiHref(nosto));

  /* ItemList: paketit landingin järjestyksessä, 'molemmat'-paketin lastenversio omana kohtanaan (oma osoite). */
  const listaus = [...(nosto ? [nosto] : []), ...muut].flatMap((p) => [
    { name: nimi(p), url: korttiHref(p) },
    ...(valitsinNakyy(p) && !p.sarja ? [{ name: lastenNimi(p), url: lapsetHref(p) }] : []),
  ]);

  return (
    <main className={`tn-vp tn-vp-landing ${runkoCond.variable}`}>
      <Crumbs items={[{ label: "Visapaketit" }]} />
      {listaus.length > 0 && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Visapaketit",
          itemListElement: listaus.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, url: abs(x.url) })),
        }} />
      )}
      <header className="tn-vp-landing-yla">
        {/* Sitova välilyönti ennen ajatusviivaa: viiva ei aloita riviä. */}
        <h1 className="tn-vp-h1" style={{ "--lw": pisinSana(H1) } as CSSProperties}>{katko(H1.replace(" – ", "\u00a0– "), true)}</h1>
        <p className="tn-vp-ingressi">
          Valmiit tietovisat porukalle vastauksineen: pikkujouluihin, työpaikalle, luokkaan ja kotiin. Jokaisessa paketissa
          on kierroksiin jaetut kysymykset ja vastaukset. Pelaa itse, näytä kysymykset televisiosta tai tulosta ne
          joukkueille. Kaikki paketit ovat ilmaisia.
        </p>
      </header>

      {!kortit.length && <p className="tn-vp-tyhja">Visapaketit julkaistaan pian.</p>}

      {nosto && (
        <article className="tn-vp-nosto" style={tyyli(nosto)}>
          <div className="tn-vp-nosto-teksti">
            <span className="tn-vp-leima">Ajankohtainen{nosto.teema ? ` · ${nosto.teema}` : ""}</span>
            <h2 className="tn-vp-nosto-h" style={{ "--lw": pisinSana(nimi(nosto)) } as CSSProperties}>
              <a href={korttiHref(nosto)}>{katko(nimi(nosto), true)}</a>
            </h2>
            <span className="tn-vp-nosto-meta">{meta(nosto)}</span>
            {/* Visuaalinen CTA: koko kortti on otsikkolinkin osuma-aluetta (::after), kuten korteissa. */}
            <span className="tn-cta-lime tn-vp-cta" aria-hidden="true">Avaa paketti</span>
            {valitsinNakyy(nosto) && !nosto.sarja && (
              <a className="tn-vp-tasolinkki" href={lapsetHref(nosto)}>Lapsille: {lastenNimi(nosto)} →</a>
            )}
            <Pikat p={nosto} lapset={false} />
          </div>
          {nosto.hero_image && (
            <span className="tn-vp-nosto-kuva" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nosto.hero_image} alt={nosto.hero_alt ?? ""} width={1600} height={900} fetchPriority="high" />
            </span>
          )}
        </article>
      )}
      {muut.length > 0 && (
        <section className="tn-vp-osio" aria-labelledby="vp-kaikki">
          <h2 id="vp-kaikki" className="tn-vp-h2">Kaikki paketit</h2>
          <div className="tn-vp-ruudukko">
            {muut.map((p) => {
              const href = korttiHref(p);
              return (
                <article key={p.slug} className="tn-vp-kortti" style={tyyli(p)}>
                  <span className="tn-vp-kortti-kuva" aria-hidden="true">
                    {p.hero_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pieniKuva(p.hero_image)} alt="" loading="lazy" width={720} height={405} />
                    )}
                  </span>
                  <div className="tn-vp-kortti-teksti">
                    {p.teema && <span className="tn-vp-kicker">{p.teema}</span>}
                    <h3 className="tn-vp-kortti-h" style={{ "--lw": pisinSana(nimi(p)) } as CSSProperties}>
                      <a href={href}>{katko(nimi(p), true)}</a>
                    </h3>
                    <span className="tn-card-meta">{meta(p)}</span>
                  </div>
                  <Pikat p={p} lapset />
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
