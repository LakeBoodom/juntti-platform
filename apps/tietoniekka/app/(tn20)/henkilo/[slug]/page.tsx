// Erä B3 (3.10.2026): henkilösivu /henkilo/<slug> — Henkilosivu_design_v0.2 (3a desktop = 2a, 3c mobiili = 1a).
// Lohkot ovat yleisiä komponentteja (components/tn20/hub/*), henkilökohtainen logiikka (ikä,
// synttärilaskuri, edesmennyt) on tässä tiedostossa. ISR 3600: laskuri voi olla korkeintaan tunnin
// vanha. Esittely ja Lyhyesti näkyvät vain Heikin hyväksymille (facts_reviewed_at), muille bio_short.
import "../../henkilo.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Crumbs from "@/components/tn20/Crumbs";
import FaktaRivi, { Chip } from "@/components/tn20/hub/FaktaRivi";
import Lyhyesti from "@/components/tn20/hub/Lyhyesti";
import PeliHylly from "@/components/tn20/hub/PeliHylly";
import SukulaisLaatat from "@/components/tn20/hub/SukulaisLaatat";
import LahdeRivi from "@/components/tn20/hub/LahdeRivi";
import { JsonLd, abs } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { ryhma } from "@/lib/henkiloRyhmat";
import { fiPvm, haeHenkiloSivu, paiviaSynttariin, paivaaTeksti, tanaan, vuodet, type HenkiloSivu } from "@/lib/henkilo";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

const henkiloHref = (slug: string) => `/henkilo/${encodeURIComponent(slug)}`;

function kuvaus(h: HenkiloSivu): string {
  const osat: string[] = [];
  if (h.role) osat.push(`${h.name} – ${h.role.charAt(0).toLowerCase() + h.role.slice(1)}.`);
  if (h.birth) {
    const synt = `${h.death ? "Syntyi" : "Syntynyt"} ${fiPvm(h.birth)}${h.birth_place ? ` ${h.birth_place}` : ""}`;
    osat.push(h.death ? `${synt}, kuoli ${fiPvm(h.death)}.` : `${synt}, ikä ${vuodet(h.birth, tanaan())} vuotta.`);
  }
  osat.push(h.visa ? "Testaa tietosi tietovisassa." : "");
  return osat.join(" ").trim();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const h = await haeHenkiloSivu(slug);
  if (!h) return {};
  const url = henkiloHref(h.slug);
  const title = h.death ? `${h.name} – elämä, syntymäpäivä ja tietovisa` : `${h.name} – ikä, syntymäpäivä ja tietovisa`;
  return {
    title: `${title} | Tietoniekka`,
    description: kuvaus(h),
    alternates: { canonical: url },
    ...jakoMeta({ title: h.name, description: kuvaus(h), url, kuva: `/og/henkilo/${encodeURIComponent(h.slug)}` }),
  };
}

export default async function HenkiloPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const h = await haeHenkiloSivu(slug);
  if (!h) notFound();

  const nyt = tanaan();
  const R = ryhma(h.ryhma);
  const rooli = [h.role, h.nickname ? `”${h.nickname}”` : null].filter(Boolean).join(" · ");

  // Faktalohko: elossa iso ikä + "Täyttää N · X päivän päästä"; edesmennyt vuosiväli + "N vuotta" + neutraali chip.
  let fakta: React.ReactNode = null;
  if (h.birth) {
    const syntRivi = (
      <>
        {h.death ? "Syntyi" : "Syntynyt"} <strong>{fiPvm(h.birth)}</strong>
        {h.birth_place ? ` ${h.birth_place}` : ""}
      </>
    );
    if (h.death) {
      fakta = (
        <FaktaRivi
          suuri={`${h.birth.y}–${h.death.y}`}
          suuriAla={`${vuodet(h.birth, h.death)} vuotta`}
          rivit={[
            syntRivi,
            <>
              Kuoli <strong>{fiPvm(h.death)}</strong>
              {h.death_place ? ` ${h.death_place}` : ""}
            </>,
            <Chip key="c" chip={{ tyyli: "neutraali", teksti: `Olisi nyt ${vuodet(h.birth, nyt)} v · syntymäpäivä ${h.birth.d}.${h.birth.m}.` }} />,
          ]}
        />
      );
    } else {
      const ika = vuodet(h.birth, nyt);
      const p = paiviaSynttariin(h.birth, nyt);
      fakta = (
        <FaktaRivi
          suuri={String(ika)}
          yksikko="v"
          rivit={[
            syntRivi,
            <span key="t" className="hub-fakta-tayttaa">
              <span>{p === 0 ? `Täyttää tänään ${ika}` : `Täyttää ${ika + 1}`}</span>
              {p > 0 && <Chip chip={{ tyyli: "kulta", teksti: paivaaTeksti(p) }} />}
            </span>,
          ]}
        />
      );
    }
  }

  const lw = Math.max(...h.name.split(/\s+/).map((w) => w.length), 6);

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: h.name,
    ...(h.birthIso ? { birthDate: h.birthIso } : {}),
    ...(h.deathIso ? { deathDate: h.deathIso } : {}),
    ...(h.birth_place ? { birthPlace: { "@type": "Place", name: h.birth_place } } : {}),
    ...(h.role ? { jobTitle: h.role } : {}),
    ...(h.image_url ? { image: h.image_url } : {}),
    ...(h.wikipedia_url ? { sameAs: [h.wikipedia_url] } : {}),
    url: abs(henkiloHref(h.slug)),
    ...(h.visa ? { subjectOf: { "@type": "Quiz", name: h.visa.otsikko, url: abs(h.visa.href) } } : {}),
  };

  return (
    <main className="hs" style={{ ["--hs-lw" as string]: lw }}>
      <JsonLd data={personLd} />
      <Crumbs
        items={[
          { label: "Tunnetut henkilöt", href: "/kokoelma/tunnetut-henkilot" },
          { label: R.lyhyt },
          { label: h.name },
        ]}
      />
      <div className="tn-shell hs-shell">
        <article className="hs-top">
          <header className="hs-otsikko">
            <span className="hub-eyebrow hs-eyebrow-desk">Tunnetut henkilöt · {R.lyhyt}</span>
            <span className="hub-eyebrow hs-eyebrow-mob">{R.nimi}</span>
            <h1 className="hs-h1">{h.name}</h1>
            {rooli && <p className="hs-rooli">{rooli}</p>}
          </header>
          <div className="hs-kuva">
            {h.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={h.image_url} alt={h.name} style={{ objectPosition: `${h.focal.x * 100}% ${h.focal.y * 100}%` }} />
            ) : (
              <span className="hub-laatta-ini" aria-hidden="true">
                {h.name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            )}
            <span className="hub-duotone" aria-hidden="true" />
            <span className="hs-kuva-fade" aria-hidden="true" />
            {h.image_url && <span className="hs-kuva-credit">Kuva: Wikimedia Commons</span>}
          </div>
          <div className="hs-vasen">
            {fakta}
            {h.esittely && <p className="hs-esittely">{h.esittely}</p>}
          </div>
          <div className="hs-oikea">
            <Lyhyesti rivit={h.faktat} />
            <PeliHylly
              visa={h.visa ? { id: h.visa.id, eyebrow: "Henkilövisa", otsikko: h.visa.otsikko, href: h.visa.href, fanitasot: h.visa.fanitasot } : null}
              pelit={[]}
            />
          </div>
        </article>

        <div className="hs-ala">
          <div className="hs-ala-vasen">
            <SukulaisLaatat
              otsikko={h.muut.otsikko}
              laatat={h.muut.laatat.map((l) => ({ ...l, href: henkiloHref(l.slug) }))}
              kaikki={{ n: h.muut.kaikki, href: h.muut.kaikkiHref }}
            />
            {h.samanaPaivana.length > 0 && h.birth && (
              <SukulaisLaatat
                otsikko={`Samana päivänä syntyneet (${h.birth.d}.${h.birth.m}.)`}
                laatat={h.samanaPaivana.map((l) => ({ ...l, href: henkiloHref(l.slug) }))}
              />
            )}
          </div>
          <div className="hs-ala-oikea">
            <PeliHylly otsikko="Lisää pelattavaa" visa={null} pelit={h.pelit} />
            <LahdeRivi kuva={h.image_url ? "Wikimedia Commons" : null} wikipedia={h.wikipedia_url} />
          </div>
        </div>
      </div>
    </main>
  );
}
