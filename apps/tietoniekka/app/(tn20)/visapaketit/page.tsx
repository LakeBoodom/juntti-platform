// /visapaketit — VISAPAKETTIEN LANDING (toteutusbrief 28.10.2026 V-C; CD 1a desktop, 1c mobiili).
// H1 + yksi lause → ajankohtainen paketti isona nostona (kausi kattaa tämän päivän, lähin kauden loppu voittaa;
// muuten pubivisan uusin painos) → muut paketit korttiruudukossa, kortin alalaidassa pikatoiminnot
// Pelaa · Ruudulle · Tulosta. Heikin katselmuksen poikkeamat CD:stä: ei teemasuodattimia, ei alalaidan
// selitysosiota, ei CTA:n viereistä käyttötaparivia, ei korttien taglineja (tilalla metarivi datasta).
// Pubivisalla on yksi kortti (sarja), ei korttia per painos. Kortti on article, otsikko on linkki (koko kortin
// osuma-alue ::after-pseudoelementillä) ja pikatoiminnot ovat omia linkkejään: ei sisäkkäisiä <a>-elementtejä.
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import "../visapaketit.css";
import Crumbs from "@/components/tn20/Crumbs";
import { runkoCond } from "@/components/tn20/runko/runkoFontti";
import { jakoMeta } from "@/lib/jakoMeta";
import { katko, pisinSana } from "@/lib/kokoelmat/data";
import { pieniKuva } from "@/lib/pienetKuvat";
import {
  type PakettiRivi, ajankohtainen, korttiHref, landinginPaketit, listaaVisapaketit, metarivi, sarjaNimi,
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
const meta = (p: PakettiRivi) => [...(p.sarja && p.painos_nimi ? [p.painos_nimi] : []), ...metarivi(p, p.kierroksia)].join(" · ");
const tyyli = (p: PakettiRivi) => (p.aksentti ? ({ "--vp-acc": p.aksentti } as CSSProperties) : undefined);

export default async function VisapaketitSivu() {
  const kaikki = await listaaVisapaketit();
  const kortit = landinginPaketit(kaikki);
  const nosto = ajankohtainen(kaikki);
  const muut = kortit.filter((p) => !nosto || korttiHref(p) !== korttiHref(nosto));

  return (
    <main className={`tn-vp tn-vp-landing ${runkoCond.variable}`}>
      <Crumbs items={[{ label: "Visapaketit" }]} />
      <header className="tn-vp-landing-yla">
        <h1 className="tn-vp-h1" style={{ "--lw": pisinSana("Visapaketit") } as CSSProperties}>Visapaketit</h1>
        <p className="tn-vp-ingressi">Valmiit tietovisat porukalle vastauksineen.</p>
      </header>

      {!kortit.length && <p className="tn-vp-tyhja">Visapaketit julkaistaan pian.</p>}

      {nosto && (
        <a className="tn-vp-nosto" href={korttiHref(nosto)} style={tyyli(nosto)}>
          <span className="tn-vp-nosto-teksti">
            <span className="tn-vp-leima">Ajankohtainen{nosto.teema ? ` · ${nosto.teema}` : ""}</span>
            <span className="tn-vp-nosto-h" style={{ "--lw": pisinSana(nimi(nosto)) } as CSSProperties}>{katko(nimi(nosto), true)}</span>
            <span className="tn-vp-nosto-meta">{meta(nosto)}</span>
            <span className="tn-cta-lime tn-vp-cta">Avaa paketti</span>
          </span>
          {nosto.hero_image && (
            <span className="tn-vp-nosto-kuva">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={nosto.hero_image} alt={nosto.hero_alt ?? ""} width={1600} height={900} fetchPriority="high" />
            </span>
          )}
        </a>
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
                  <nav className="tn-vp-pikat" aria-label={`${nimi(p)}: käyttötavat`}>
                    <a href={`${href}#pelaa`}>Pelaa</a>
                    <a href={`${href}/ruutu`}>Ruudulle</a>
                    <a href={`${href}/tulosta`}>Tulosta</a>
                  </nav>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
