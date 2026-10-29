// VISAPAKETIN TULOSTE (V-B; design-kangas taulu 4): HTML + oma @media print. Joka kierros omalle sivulleen
// ("Joukkue: ____", kysymykset numeroituina, vastausviiva), lopuksi vastaussivu vetäjälle. Selaimen
// "Tallenna PDF:nä" riittää, erillistä PDF-generointia ei ole. Ruudulla sama sisältö arkkeina + Tulosta-nappi.
// Arkin yläosa (Heikki 29.10.): sanamerkki + kierros ylärivillä, paketin nimi + "Joukkue" alarivillä.
import "@/app/(tn20)/visapaketit.css";
import { runkoCond } from "@/components/tn20/runko/runkoFontti";
import {
  type Kierros, type PakettiKysymys, type Sivu, type Taso,
  hakuosa, kevytKuva, kuvaOnKysymys, kysymysTeksti, oikeaVastaus, tasonKierrokset, viittaaVaihtoehtoihin,
} from "@/lib/visapaketit";
import TulostaNappi from "./TulostaNappi";

export default function TulostaSivu({ sivu, taso, esikatselu }: { sivu: Sivu; taso: Taso; esikatselu: string | null }) {
  const { vp, polku } = sivu;
  const p = vp.paketti;
  const nimi = p.painos_nimi ? `${p.otsikko} · ${p.painos_nimi}` : p.otsikko;
  const kierrokset = tasonKierrokset(vp, taso);
  const takaisin = polku + hakuosa(p.kohderyhma === "molemmat" && taso === "lapset" ? "lapset" : null, esikatselu);

  return (
    <main className={`tn-vp-tuloste ${runkoCond.variable}`}>
      <h1 className="tn-vp-sr">{nimi} – tulostettavat kysymykset ja vastaukset</h1>
      <div className="tn-vp-tuloste-palkki">
        <a className="tn-vp-paluu" href={takaisin}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          {nimi}
        </a>
        <TulostaNappi packId={p.id} mittaa={!vp.esikatselu} />
      </div>

      {kierrokset.map((k) => (
        <section key={k.nro} className="tn-vp-arkki" aria-labelledby={`t-k${k.nro}`}>
          <header className="tn-vp-arkki-yla">
            <Logo />
            <span className="tn-vp-arkki-kicker">Kierros {k.nro} / {kierrokset.length}</span>
            <span className="tn-vp-arkki-paketti">{nimi}</span>
            <span className="tn-vp-joukkue">Joukkue: <span className="tn-vp-viiva" aria-hidden="true" /></span>
          </header>
          <h2 id={`t-k${k.nro}`} className="tn-vp-arkki-h">{k.nimi}</h2>
          <ol className="tn-vp-arkki-kysymykset">
            {k.kysymykset.map((q) => <TulosteKysymys key={q.id} q={q} />)}
          </ol>
        </section>
      ))}

      <section className="tn-vp-arkki tn-vp-arkki--vastaukset" aria-labelledby="t-vastaukset">
        <header className="tn-vp-arkki-yla">
          <Logo />
          <span className="tn-vp-arkki-kicker">Vetäjälle</span>
          <span className="tn-vp-arkki-paketti">{nimi}</span>
        </header>
        <h2 id="t-vastaukset" className="tn-vp-arkki-h">Vastaukset</h2>
        {kierrokset.map((k) => <Vastaukset key={k.nro} k={k} />)}
      </section>
    </main>
  );
}

/** Sivuston sanamerkki (sama kuin yläpalkissa ja televisionäkymässä), paperilla tummemmalla kullalla. */
function Logo() {
  return <span className="tn-vp-arkki-logo" aria-hidden="true"><b>TIETO</b>NIEKKA</span>;
}

function TulosteKysymys({ q }: { q: PakettiKysymys }) {
  return (
    <li>
      {kuvaOnKysymys(q) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="tn-vp-arkki-kuva" src={kevytKuva(q.image_url!)} alt="" width={1536} height={1024} />
      )}
      <p className="tn-vp-arkki-k">{kysymysTeksti(q)}</p>
      {viittaaVaihtoehtoihin(q) && q.answers && (
        <ol className="tn-vp-arkki-vaihtoehdot" type="A">
          {q.answers.map((a) => <li key={a.text}>{a.text}</li>)}
        </ol>
      )}
      <span className="tn-vp-vastausviiva" aria-hidden="true" />
    </li>
  );
}

function Vastaukset({ k }: { k: Kierros }) {
  return (
    <div className="tn-vp-arkki-vastauskierros">
      <h3 className="tn-vp-arkki-h3">Kierros {k.nro}: {k.nimi}</h3>
      <ol className="tn-vp-arkki-vastaukset">
        {k.kysymykset.map((q) => (
          <li key={q.id}>
            <b>{oikeaVastaus(q)}</b>
            {q.explanation && <span className="tn-vp-arkki-selitys"> – {q.explanation}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
