// "Seuraava pakka" Järjestä-pakan tulosnäkymässä (osa C, 31.10.2026): korvaa Muut järjestyspelit -osion ja yleisen
// "Pelaa seuraavaksi" -rivin. Kortti aloittaa seuraavan pakan suoraan; "Kaikki pakat" on tuloksen toissijaisissa linkeissä.
import "@/app/(tn20)/peli/jarjesta/jarjesta.css";
import { aloitaHref, seuraavaPakka } from "@/lib/jarjesta/hub";

export default function SeuraavaPakka({ slug }: { slug: string }) {
  const p = seuraavaPakka(slug);
  return (
    <nav className="jh-seuraava" aria-labelledby="jh-seuraava-h" data-tn-entry="tulos:seuraava-pakka">
      <h2 id="jh-seuraava-h" className="jh-seuraava-h">Seuraava pakka</h2>
      <a className="jh-seuraava-kortti" href={aloitaHref(p)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.kuva} alt="" width={96} height={64} loading="lazy" />
        <span>
          <span className="jh-seuraava-nimi">{p.nimi}</span>
          <span className="jh-seuraava-meta">{p.meta}</span>
        </span>
        <span className="jh-seuraava-nuoli" aria-hidden="true">›</span>
      </a>
    </nav>
  );
}
