// K4 TULOS (§4, CD 5d–5k). Järjestys aina: 1 tulos → 2 metapelilohko (METAPELI-lipun takana; paikka varattu) →
// 3 päätoiminto "Pelaa uusi …" (karttaketjupeleissä harjoitusselite pienenä tekstinä napin alla, ei nappi) →
// 4 "Haasta kaveri" → 5 seuraava peli: 2–3 korttia pelimuotorekisteristä, saman kokoelman pelit ensin.
// Pelikohtainen tulosgrafiikka (tikapuut, reitti) tulee lisa-propsina tuloksen alle.
import type { ReactNode } from "react";
import type { Pelimuoto } from "@/lib/pelimuodot";
import { PeliIkoniSvg } from "@/components/tn20/runko/PeliIkoni";

export default function PeliTulos({
  eyebrow,
  iso,
  ala,
  lisa,
  paatoiminto,
  harjoitus,
  haasta,
  seuraavat,
}: {
  eyebrow: ReactNode;
  /** Iso tulos: "5 tuplausta", "6/6 rajaa". */
  iso: ReactNode;
  ala?: ReactNode;
  /** Pelin oma tulosgrafiikka (tikapuut, reitti, ennätys). */
  lisa?: ReactNode;
  paatoiminto: ReactNode;
  /** Pieni selite päätoiminnon alla (karttaketjupelien harjoitusketju). */
  harjoitus?: ReactNode;
  haasta: ReactNode;
  seuraavat: Pelimuoto[];
}) {
  return (
    <section className="pk-tulos" aria-labelledby="pk-tulos-h">
      <div className="pk-tulos-yla">
        <span className="pk-tulos-eyebrow">{eyebrow}</span>
        <h1 id="pk-tulos-h" className="pk-tulos-iso">{iso}</h1>
        {ala && <p className="pk-tulos-ala">{ala}</p>}
        {lisa}
      </div>
      {/* 2 · Metapelilohko: METAPELI_ENABLED-lipun takana (ei vielä toteutettu, ei jätä aukkoa). */}
      <div className="pk-tulos-toiminnot">
        {paatoiminto}
        {harjoitus && <p className="pk-harjoitus">{harjoitus}</p>}
        {haasta}
      </div>
      <SeuraavaPeli seuraavat={seuraavat} />
    </section>
  );
}

/** K4:n viides osa erikseen pelien omiin tulosnäkymiin (Vaalipiiriketju): 2–3 peliä rekisteristä. */
export function SeuraavaPeli({ seuraavat }: { seuraavat: Pelimuoto[] }) {
  if (!seuraavat.length) return null;
  return (
    <nav className="pk-seuraava" aria-labelledby="pk-seuraava-h">
      <h2 id="pk-seuraava-h" className="pk-seuraava-h">Seuraava peli</h2>
      <div className="pk-seuraava-rivi">
        {seuraavat.map((p) => (
          <a key={p.slug} className="pk-pelikortti" href={p.href}>
            <span className="pk-pelikortti-ikoni" aria-hidden="true"><PeliIkoniSvg ikoni={p.ikoni} /></span>
            <span className="pk-pelikortti-teksti">
              <span className="pk-pelikortti-nimi">{p.nimi}</span>
              <span className="pk-pelikortti-kuvaus">{p.kuvaus}</span>
            </span>
            <span className="pk-pelikortti-cta">Pelaa →</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
