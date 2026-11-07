// /kaupunki — julkaistut kaupunkisivut aakkosjärjestyksessä (brief 7.11.2026 §3): vaakuna, nimi, tunnusrivi ja
// visojen määrä (listalla määrä saa näkyä). Linkit Suomen kaupungit -kokoelmasivulta ja alatunnisteesta.
import type { Metadata } from "next";
import { JsonLd, abs, breadcrumbLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { brand } from "@/config/brand";
import { KAUPUNGIT_LISTA, archivoEm, haeKaupunkilista, kaupunkiHref, tunnusriviNakyviin } from "@/lib/kaupunkisivu";
import type { CSSProperties } from "react";
import "./kaupunki.css";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const n = (await haeKaupunkilista()).length;
  const title = "Kaupunkivisat – tietovisoja Suomen kaupungeista";
  const description = `${n} kaupunkia, jokaisella oma tietovisa. Pelaa oman kotikaupunkisi visat ja haasta kaveri.`;
  return {
    title: `${title} | ${brand.name}`,
    description,
    alternates: { canonical: KAUPUNGIT_LISTA },
    ...jakoMeta({ title, description, url: KAUPUNGIT_LISTA, kuva: "/og/kaupunki/helsinki" }),
  };
}

export default async function KaupunkilistaPage() {
  const lista = await haeKaupunkilista();
  return (
    <main className="ks ks-lista">
      <div className="ks-osio ks-lista-yla">
        <h1 className="ks-lista-h1" style={{ "--ks-em": archivoEm("Kaupungit", -0.02) } as CSSProperties}>Kaupungit</h1>
      </div>
      <div className="ks-osio">
        <ul className="ks-lista-rivit">
          {lista.map((k) => (
            <li key={k.slug}>
              <a href={kaupunkiHref(k.slug)}>
                {k.vaakuna_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ks-lista-vaakuna" src={k.vaakuna_url} alt="" width={40} height={48} loading="lazy" />
                ) : (
                  <span className="ks-lista-vaakuna" aria-hidden="true" />
                )}
                <span className="ks-lista-teksti">
                  <span className="ks-lista-nimi" style={{ "--ks-em": archivoEm(k.nimi) } as CSSProperties}>{k.nimi}</span>
                  {k.tunnusrivi && <span className="ks-lista-tunnus">{tunnusriviNakyviin(k.tunnusrivi)}</span>}
                </span>
                <span className="ks-lista-maara">{k.visoja === 1 ? "1 visa" : `${k.visoja} visaa`}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <nav className="tn-seo-nav ks-muru" aria-label="Murupolku">
        <div className="tn-seo-in">
          <a href="/">Etusivu</a>
          <span aria-hidden="true"> / </span>
          <a href="/kokoelma/kaupungit">Suomen kaupungit</a>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Kaupungit A–Ö</span>
        </div>
      </nav>
      <JsonLd data={breadcrumbLd([{ name: "Etusivu", url: "/" }, { name: "Suomen kaupungit", url: "/kokoelma/kaupungit" }, { name: "Kaupungit A–Ö" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Kaupunkivisat",
          url: abs(KAUPUNGIT_LISTA),
          inLanguage: "fi",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: lista.length,
            itemListElement: lista.map((k, i) => ({ "@type": "ListItem", position: i + 1, name: k.nimi, url: abs(kaupunkiHref(k.slug)) })),
          },
        }}
      />
    </main>
  );
}
