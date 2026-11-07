// KAUPUNKISIVU /kaupunki/<slug> (TOTEUTUSBRIEF Kaupunkisivut v1 7.11.2026; CD "Tietoniekka_Kaupunkisivu" kierros 1, 1a–2b).
// Ensimmäinen ruutu kuuluu kaupungille: kuva, nimi, koukku, tunnusrivi ja pääovi (kaupunkivisa, ainoa lime-elementti).
// Sen alla kauden nosto, visaryhmät ja syntyneet; tyhjät osiot puuttuvat kokonaan. Kaikki linkit palvelimella
// renderöityjä <a href> -linkkejä. Visamäärä vain otsikossa ja kuvauksessa, ei sivulla (Heikki 1.11.).
// ISR 1 h; julkaisemattomat näkyvät vain esikatselussa (noindex), ks. lib/kaupunkisivu.ts.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { brand } from "@/config/brand";
import { JsonLd, abs, breadcrumbLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { heroFokus } from "@/lib/herotila";
import {
  archivoEm, haeKaupunkisivu, pisimmanSananEm, tunnusriviNakyviin, kaupunginKoukku, kaupunkiHref, type KaupunkiVisa, type Kaupunkisivu,
} from "@/lib/kaupunkisivu";
import SukulaisLaatat from "@/components/tn20/hub/SukulaisLaatat";
import { KAUPUNGIT } from "@/lib/kaupungit";
import { KAUPUNGIT_KOKOELMA } from "@/lib/kokoelmat/kaupungit";

/* Murupolku Suomen kaupungit -hubiin ja kaupungin alueen osioon (Heikki 7.11.2026: kaupunkisivu ei korvaa hubia,
   vaan on sen alasivu): Etusivu › Suomen kaupungit › Savo ja Karjala › Mikkeli. */
const HUB = "/kokoelma/kaupungit";
function alue(slug: string): { nimi: string; href: string } | null {
  const region = KAUPUNGIT.find((k) => k.id === slug)?.region;
  const osio = region ? KAUPUNGIT_KOKOELMA.sections.find((s) => s.title === region) : undefined;
  return region && osio ? { nimi: region, href: `${HUB}#osio-${osio.slug}` } : null;
}
import KaupunkiJako from "../KaupunkiJako";
import "../../henkilo.css";
import "../kaupunki.css";

export const revalidate = 3600;
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

/** Kuvauksen osat sen mukaan, mitä sivulla on (brief 1.11. §4). */
function kuvaus(s: Kaupunkisivu): string {
  const k = s.kaupunki;
  const osat: string[] = [];
  const ryhma = (nimi: string) => s.ryhmat.some((g) => g.nimi === nimi);
  if (ryhma("Historia ja maamerkit") || s.kaupunkivisa) osat.push("historia");
  if (ryhma("Urheilu")) osat.push("urheilu");
  if (ryhma("Kulttuuri ja kieli")) osat.push("kulttuuri");
  if (s.henkilot.length) osat.push(k.asukasnimitys ? `tunnetut ${k.asukasnimitys}` : `${k.inessiivi} syntyneet`);
  const lista = osat.length > 1 ? `${osat.slice(0, -1).join(", ")} ja ${osat[osat.length - 1]}` : osat[0];
  /* Pelkkä kaupunkivisa: sen oma kuvaus kertoo enemmän kuin "historia". */
  const pelaa = s.visoja >= 2 ? `Pelaa ${s.visoja} tietovisaa ${k.elatiivi}: ${lista}.` : s.kaupunkivisa?.kuvaus ?? `Pelaa tietovisa ${k.elatiivi}.`;
  const koukku = k.hook?.trim();
  const teksti = koukku ? `${koukku} ${pelaa}` : pelaa;
  return teksti.length <= 160 ? teksti : pelaa.slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await haeKaupunkisivu(slug);
  if (!s) return { title: "Sivua ei löytynyt", robots: { index: false } };
  const k = s.kaupunki;
  /* Juurilayoutin otsikkopohja ei periydy (tn20)-layoutin ohi, joten brändi lisätään itse kuten muilla sivuilla. */
  const title = `${s.visoja >= 3 ? `${k.nimi}-visat – ${s.visoja} tietovisaa ${k.elatiivi}` : `${k.nimi}-visa – tietovisa ${k.elatiivi}`} | ${brand.name}`;
  const description = kuvaus(s);
  return {
    title,
    description,
    alternates: { canonical: kaupunkiHref(k.slug) },
    ...(k.julkaistu ? {} : { robots: { index: false, follow: false } }),
    ...jakoMeta({ title: `${k.korttinimi ?? k.nimi}-visat`, description: kaupunginKoukku(k), url: kaupunkiHref(k.slug), kuva: `/og/kaupunki/${k.slug}` }),
  };
}

function Visakortti({ v, yksin }: { v: KaupunkiVisa; yksin: boolean }) {
  return (
    <li className={yksin ? "ks-kortti ks-kortti--yksin" : "ks-kortti"}>
      <a href={v.href}>
        <span className="ks-kortti-kuva">
          {v.kuva ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.kuva} alt="" loading="lazy" decoding="async" style={v.kuvaPos ? { objectPosition: v.kuvaPos } : undefined} />
          ) : (
            /* Kuvaton visa: tekstikortti (brief 1.11. §2). Nimi on myös alla, joten tämä on koriste. */
            <span className="ks-kortti-teksti" aria-hidden="true">{v.title}</span>
          )}
        </span>
        <span className="ks-kortti-nimi">{v.title}</span>
        {/* Heikki 7.11.2026: kortin pitää näyttää peliltä (Jukurit näytti pelkältä seuralta) → sama kehote kuin
            kokoelmasivujen korteissa (UI-sääntö 8, .tn-card-cta). */}
        <span className="tn-card-cta">Pelaa →</span>
      </a>
    </li>
  );
}

export default async function KaupunkiPage({ params }: Props) {
  const { slug } = await params;
  const s = await haeKaupunkisivu(slug);
  if (!s) notFound();
  const k = s.kaupunki;
  const visa = s.kaupunkivisa;
  const fokus = heroFokus(k.hero_kuva, null, null, 0.35);
  const kuvaPos = `${Math.round(fokus.x * 100)}% ${Math.round(fokus.y * 100)}%`;
  /* Kaupunkikuvista on 800 px:n kopio kansiossa k/ (kokoelmakortit); 1600 px:n alkuperäinen leveille näytöille. */
  const pieni = k.hero_kuva?.match(/^\/20\/kaupungit\/([a-z]+)\.webp$/) ? k.hero_kuva.replace("/20/kaupungit/", "/20/kaupungit/k/") : null;
  const korttinimi = k.korttinimi ?? k.nimi;
  const a = alue(k.slug);
  const visat = [...(visa ? [visa] : []), ...(s.kausinosto ? [s.kausinosto] : []), ...s.ryhmat.flatMap((g) => g.visat)];

  return (
    <main className="ks">
      <section className="ks-hero" aria-labelledby="ks-h1" style={{ "--ks-em": archivoEm(k.nimi, -0.025) } as CSSProperties}>
        <div className="ks-hero-kuva" aria-hidden="true">
          {k.hero_kuva && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={k.hero_kuva}
              srcSet={pieni ? `${pieni} 800w, ${k.hero_kuva} 1600w` : undefined}
              sizes="100vw"
              alt=""
              fetchPriority="high"
              decoding="async"
              style={{ objectPosition: kuvaPos }}
            />
          )}
        </div>
        <div className="ks-hero-teksti">
          <p className="ks-eyebrow">Kaupunki</p>
          <h1 id="ks-h1" className="ks-h1">{k.nimi}</h1>
          <p className="ks-koukku">{kaupunginKoukku(k)}</p>
          {visa && (
            <a className="ks-selvaa" href="#kaupunkivisa">
              Ota selvää pelaamalla <span className="ks-nuoli" aria-hidden="true" />
            </a>
          )}
          {k.tunnusrivi && <p className="ks-tunnus">{tunnusriviNakyviin(k.tunnusrivi)}</p>}
        </div>
        {visa && (
          <div className="ks-hero-kortti">
            <a id="kaupunkivisa" className="ks-visa" href={visa.href} style={{ "--ks-em": pisimmanSananEm(visa.title) } as CSSProperties}>
              <span className="ks-visa-yla">
                {k.vaakuna_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ks-vaakuna" src={k.vaakuna_url} alt="" width={44} height={52} />
                )}
                <span className="ks-visa-eyebrow">Aloita tästä · Kaupunkivisa</span>
              </span>
              <h2 className="ks-visa-nimi">{visa.title}</h2>
              {visa.kuvaus && <span className="ks-visa-kuvaus">{visa.kuvaus}</span>}
              <span className="ks-pelaa tn-cta-lime">Pelaa</span>
            </a>
          </div>
        )}
      </section>

      {s.kausinosto && (
        <div className="ks-osio ks-kausi-osio">
          <a className="ks-kausi" href={s.kausinosto.href} style={{ "--ks-em": pisimmanSananEm(s.kausinosto.title) } as CSSProperties}>
            <span className="ks-kausi-kuva">
              {s.kausinosto.kuva && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.kausinosto.kuva} alt="" loading="lazy" style={s.kausinosto.kuvaPos ? { objectPosition: s.kausinosto.kuvaPos } : undefined} />
              )}
            </span>
            <span className="ks-kausi-teksti">
              <span className="ks-kausi-tag">{s.kausinosto.kausi}</span>
              <span className="ks-kausi-nimi">{s.kausinosto.title}</span>
              {s.kausinosto.kuvaus && <span className="ks-kausi-kuvaus">{s.kausinosto.kuvaus}</span>}
            </span>
            <span className="ks-kausi-cta">Pelaa <span aria-hidden="true">→</span></span>
          </a>
        </div>
      )}

      {s.ryhmat.map((g) => (
        <section key={g.nimi} className="ks-osio ks-ryhma" aria-label={g.otsikko}>
          <div className="ks-osio-otsikko">
            <h2 className="ks-h2" style={{ "--ks-em": pisimmanSananEm(g.otsikko) } as CSSProperties}>{g.otsikko}</h2>
          </div>
          <ul className="ks-kortit">
            {g.visat.map((v) => <Visakortti key={v.id} v={v} yksin={g.visat.length === 1} />)}
          </ul>
        </section>
      ))}

      {s.henkilot.length > 0 && (
        <div className="ks-osio ks-henkilot">
          {/* "Kaikki →" puuttuu: henkilöhakemistoa ei voi suodattaa syntymäpaikalla (brief §1.3, raportoitu). */}
          <SukulaisLaatat otsikko={`${k.inessiivi} ${s.henkilot.length === 1 ? "syntynyt" : "syntyneitä"}`} laatat={s.henkilot.map((h) => ({ ...h, ala: "" }))} cta="Pelaa →" />
        </div>
      )}

      <div className="ks-osio">
        <KaupunkiJako slug={k.slug} korttinimi={korttinimi} />
      </div>

      <nav className="tn-seo-nav ks-muru" aria-label="Murupolku">
        <div className="tn-seo-in">
          <a href="/">Etusivu</a>
          <span aria-hidden="true"> / </span>
          <a href={HUB}>{KAUPUNGIT_KOKOELMA.nimi}</a>
          <span aria-hidden="true"> / </span>
          {a && (
            <>
              <a href={a.href}>{a.nimi}</a>
              <span aria-hidden="true"> / </span>
            </>
          )}
          <span aria-current="page">{k.nimi}</span>
        </div>
      </nav>
      <JsonLd data={breadcrumbLd([{ name: "Etusivu", url: "/" }, { name: KAUPUNGIT_KOKOELMA.nimi, url: HUB }, ...(a ? [{ name: a.nimi, url: a.href }] : []), { name: k.nimi }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${k.nimi}-visat`,
          url: abs(kaupunkiHref(k.slug)),
          description: kaupunginKoukku(k),
          inLanguage: "fi",
          about: { "@type": "City", name: k.nimi },
          publisher: { "@type": "Organization", name: brand.name, url: abs("/") },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: visat.length,
            itemListElement: visat.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: v.title, url: abs(v.href) })),
          },
        }}
      />
    </main>
  );
}
