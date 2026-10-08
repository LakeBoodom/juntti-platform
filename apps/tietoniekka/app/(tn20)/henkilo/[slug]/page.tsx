// Erä B3 (3.10.2026): henkilösivu /henkilo/<slug> — Henkilosivu_design_v0.2 (3a desktop = 2a, 3c mobiili = 1a).
// Lohkot ovat yleisiä komponentteja (components/tn20/hub/*), henkilökohtainen logiikka (ikä,
// synttärilaskuri, edesmennyt) on tässä tiedostossa. Ikä ja laskuri lasketaan Europe/Helsinki-ajassa
// (lib/henkilo.ts tanaan()); ISR 3600 → sivu ja <title> uusiutuvat useita kertoja vuorokaudessa, joten
// syntymäpäivänä ikä vaihtuu viimeistään tunnin kuluttua puolestayöstä. Esittely ja Lyhyesti näkyvät
// vain Heikin hyväksymille (facts_reviewed_at), muille bio_short.
import "../../henkilo.css";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Crumbs from "@/components/tn20/Crumbs";
import FaktaRivi, { Chip } from "@/components/tn20/hub/FaktaRivi";
import Lyhyesti from "@/components/tn20/hub/Lyhyesti";
import PeliHylly, { type HyllyPeli } from "@/components/tn20/hub/PeliHylly";
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

/** <title> ikähakuihin (8.10.2026): "Anssi Kela ikä – 54 vuotta", syntymäpäivänä "… täyttää tänään 54
 *  vuotta", edesmenneellä "… – syntymäpäivä ja tietovisa". Sama Open Graph -otsikkona. */
function sivuOtsikko(h: HenkiloSivu): string {
  if (h.death || !h.birth) return `${h.name} – syntymäpäivä ja tietovisa | Tietoniekka`;
  const nyt = tanaan();
  const ika = vuodet(h.birth, nyt);
  return paiviaSynttariin(h.birth, nyt) === 0
    ? `${h.name} täyttää tänään ${ika} vuotta | Tietoniekka`
    : `${h.name} ikä – ${ika} vuotta | Tietoniekka`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const h = await haeHenkiloSivu(slug);
  if (!h || "ohjaa" in h) return {};
  const url = henkiloHref(h.slug);
  const title = sivuOtsikko(h);
  return {
    title: { absolute: title },
    description: kuvaus(h),
    alternates: { canonical: url },
    ...jakoMeta({ title, description: kuvaus(h), url, kuva: `/og/henkilo/${encodeURIComponent(h.slug)}` }),
  };
}

export default async function HenkiloPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const h = await haeHenkiloSivu(slug);
  if (!h) notFound();
  if ("ohjaa" in h) permanentRedirect(henkiloHref(h.ohjaa));

  const nyt = tanaan();
  const R = ryhma(h.ryhma);
  const rooli = [h.role, h.nickname ? `”${h.nickname}”` : null].filter(Boolean).join(" · ");

  // Faktalohko: elossa iso ikä + lause "X on N-vuotias" + "Täyttää N · X päivän päästä"; edesmennyt
  // vuosiväli + "N vuotta" + neutraali chip. Päivämäärät <time datetime>-elementteinä (ikähaut 8.10.2026).
  let fakta: React.ReactNode = null;
  let synttarit = false;
  if (h.birth) {
    const syntRivi = (
      <>
        {h.death ? "Syntyi" : "Syntynyt"}{" "}
        <strong>
          <time dateTime={h.birthIso ?? undefined}>{fiPvm(h.birth)}</time>
        </strong>
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
              Kuoli{" "}
              <strong>
                <time dateTime={h.deathIso ?? undefined}>{fiPvm(h.death)}</time>
              </strong>
              {h.death_place ? ` ${h.death_place}` : ""}
            </>,
            <Chip key="c" chip={{ tyyli: "neutraali", teksti: `Olisi nyt ${vuodet(h.birth, nyt)} v · syntymäpäivä ${h.birth.d}.${h.birth.m}.` }} />,
          ]}
        />
      );
    } else {
      const ika = vuodet(h.birth, nyt);
      const p = paiviaSynttariin(h.birth, nyt);
      synttarit = p === 0;
      // Iso "53 v" on visuaalinen; sama tieto kokonaisena lauseena tietoriveillä (ei piilotekstiä).
      fakta = synttarit ? (
        <FaktaRivi
          suuri={String(ika)}
          yksikko="v"
          korostus
          rivit={[
            <span key="m" className="hub-synttarit-merkki">Synttärit tänään</span>,
            <span key="l" className="hub-fakta-lause">
              {h.name} täyttää tänään <strong>{ika}</strong> vuotta
            </span>,
            syntRivi,
          ]}
        />
      ) : (
        <FaktaRivi
          suuri={String(ika)}
          yksikko="v"
          rivit={[
            <span key="l" className="hub-fakta-lause">
              {h.name} on <strong>{ika}</strong>-vuotias
            </span>,
            syntRivi,
            <span key="t" className="hub-fakta-tayttaa">
              <span>Täyttää {ika + 1}</span>
              <Chip chip={{ tyyli: "kulta", teksti: paivaaTeksti(p) }} />
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

  const hyllyPelit: HyllyPeli[] = [];
  if (h.nosto) hyllyPelit.push({ tyyppi: "jarjestys", ...h.nosto });
  // "Aloita visa" vie suoraan 1. kysymykseen (Heikki 4.10.): henkilösivu on jo visan esittely.
  const aloitaHref = h.visa ? `${h.visa.href}${h.visa.href.includes("?") ? "&" : "?"}aloita=1` : "";
  if (h.visa) hyllyPelit.push({ tyyppi: "visa", id: h.visa.id, otsikko: h.visa.otsikko, href: aloitaHref, fanitasot: h.visa.fanitasot });
  const ini = h.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <main className="hs" style={{ ["--hs-lw" as string]: lw }}>
      <JsonLd data={personLd} />
      <Crumbs
        items={[
          { label: "Tunnetut henkilöt", href: "/kokoelma/tunnetut-henkilot" },
          { label: R.lyhyt, href: `/henkilot/${h.ryhma}` },
          { label: h.name },
        ]}
      />
      <div className="tn-shell hs-shell">
        <article className="hs-kortti">
          <div className="hs-grid">
            <div className="hs-vasen">
              <div className="hs-paa">
                <figure className="hs-muotokuva">
                  <div className="hs-passe">
                    <div className="hs-kuva">
                      {h.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={h.image_url} alt={h.name} style={{ objectPosition: `${h.focal.x * 100}% ${h.focal.y * 100}%` }} />
                      ) : (
                        <span className="hub-laatta-ini" aria-hidden="true">
                          {ini}
                        </span>
                      )}
                      <span className="hub-duotone" aria-hidden="true" />
                    </div>
                  </div>
                  {h.image_url && <figcaption>Kuva: Wikimedia Commons</figcaption>}
                </figure>
                <header className="hs-otsikko">
                  <span className="hub-eyebrow">{R.lyhyt}</span>
                  <h1 className="hs-h1">{h.name}</h1>
                  {rooli && <p className="hs-rooli">{rooli}</p>}
                </header>
              </div>
              {fakta}
              {h.esittely && <p className="hs-esittely">{h.esittely}</p>}
              <Lyhyesti rivit={h.faktat} />
            </div>
            <div className="hs-oikea">
              <PeliHylly
                otsikko={h.elatiivi ? `Pelaa ${h.elatiivi}` : `Pelaa: ${h.name}`}
                pelit={hyllyPelit}
                muista={h.aiheet.map((a) => ({ otsikko: a.otsikko, href: a.href, meta: a.meta }))}
                muistaOtsikko="Liittyvät visat"
              />
            </div>
          </div>
          <div className="hs-ala">
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
            <LahdeRivi wikipedia={h.wikipedia_url} />
          </div>
        </article>
      </div>
    </main>
  );
}
