// JUHLAT-BANNERI etusivulle (CD "Juhlat-banneri v0.2" 4a, 28.9.2026). Etusivun ensimmäinen
// nosto ennen Päivän visaa (Heikki 28.9.2026: "Tehdään Halloweenista ykkösnosto").
// Fokuksessa lähin iso juhla, jolla on julkaistu visa (sama sääntö kuin kokoelman nostossa).
// Pääroolissa juhlan visan koukkukysymys, päivälaskuri rinnalla. Koko banneri vie visaan.
//
// Animaatio kerran latauksessa (~3 s): koukun sanat nousevat yksitellen, korostussana saa
// juhlan värin, laskuri laskee nollasta, lopuksi alarivi ja nappi. Jatkuvina vain lyhdyn
// lepatus kuvan päällä ja kysymysmerkin nykäisy. Vähennetty liike → kaikki valmiina heti.
// Laskuri Suomen ajan kalenteripäivinä (palvelin), juhlan päivinä "Nyt".

import {
  juhlaKalenteri, nostettava, paavisa, paiviaValissa, visaHref, vpLyhyt, type Esiintyma,
} from "@/lib/juhlat";
import { Laskenta } from "@/components/tn20/juhlat/Laskurit";

const hexA = (h: string, a: number) => {
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export function juhlaBanneriNosto(tanaan: number, julkaistut: Set<string>): Esiintyma | null {
  return nostettava(juhlaKalenteri(tanaan, julkaistut));
}

export function JuhlatBanneri({ nosto, tanaan }: { nosto: Esiintyma; tanaan: number }) {
  const visa = paavisa(nosto);
  const k = nosto.koukku && nosto.koukku.visa === visa ? nosto.koukku : null;
  const kysymys = k?.kysymys ?? `Kuinka hyvin tunnet juhlan: ${nosto.nimi}?`;
  const korostus = k?.korostus ?? kysymys.split(" ").pop()!;
  const ala = k?.ala ?? "Testaa tietosi!";
  const cta = k?.cta ?? "Pelaa visa";
  const kuva = k?.kuva ?? nosto.kuva;
  const kaynnissa = tanaan >= nosto.alku;
  const paivia = kaynnissa ? 0 : paiviaValissa(nosto.alku + (nosto.kohde ?? 0) * 864e5, tanaan);
  const yksikko = kaynnissa ? "Juhla on tänään" : `${paivia === 1 ? "päivä" : "päivää"} ${nosto.ill}`;
  const sanat = kysymys.split(" ");
  const tJalkeen = 120 + sanat.length * 110;

  return (
    <a
      className="jub"
      href={visaHref(visa)}
      style={{
        "--jub-a": nosto.accent, "--jub-glow": hexA(nosto.accent, 0.2), "--jub-lyhty": hexA(nosto.accent, 0.45),
        "--jub-hl": `${tJalkeen + 180}ms`, "--jub-q": `${tJalkeen + 900}ms`, "--jub-ala": `${tJalkeen + 500}ms`,
      } as React.CSSProperties}
    >
      <span className="jub-kuva" aria-hidden>
        {kuva && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={kuva.replace(/\.webp$/, "-800.webp")}
            srcSet={`${kuva.replace(/\.webp$/, "-800.webp")} 800w, ${kuva} 1600w`}
            sizes="(min-width: 1200px) 600px, (min-width: 600px) 400px, 100vw"
            alt=""
          />
        )}
        <span className="jub-lyhty" />
      </span>
      <span className="jub-meta">
        <span className="jub-tag">Juhlat</span>
        <span className="jub-nimi">{nosto.nimi}</span>
        <span className="jub-pvm">{vpLyhyt(nosto.alku)}</span>
      </span>
      <span className="jub-h" role="heading" aria-level={2}>
        {sanat.map((w, i) => {
          const d = { "--d": `${120 + i * 110}ms` } as React.CSSProperties;
          if (w !== korostus) return <span key={i} className="jub-sana" style={d}>{w}</span>;
          const q = w.endsWith("?");
          return (
            <span key={i} className={`jub-sana${i === sanat.length - 1 ? " jub-sana--loppu" : ""}`} style={d}>
              <span className="jub-hl">{q ? w.slice(0, -1) : w}</span>
              {q && <span className="jub-q">?</span>}
            </span>
          );
        })}
      </span>
      <span className="jub-ala">
        <span className="jub-s">{ala}</span>
        <span className="jub-cta">{cta} <span aria-hidden>→</span></span>
      </span>
      <span className="jub-cd">
        <span className="jub-cd-n"><Laskenta paivia={paivia} /></span>
        <span className="jub-cd-u">{yksikko}</span>
      </span>
    </a>
  );
}
