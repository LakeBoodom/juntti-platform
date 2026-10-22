// KUVAVISAT-kokoelman sisältö rungon sisällä (P5, Heikki 21.10.2026): "Tämän viikon visa" heti heron alla ja
// kategoriaruudukko esikatselukuvineen (palautettu KuvavisatHubista, poistettu 20.10. commitissa 4cae71d).
// Kortti avaa muunnelmat tiiviinä siruina (ei täysleveinä riveinä). Natiivi <details>, ei JavaScriptiä.
// Yhtenäisyys = sama kehys (rungon hero, pelit, lisää kokoelmia), ei sama minimalismi (DESIGN_SYSTEM.md).
import { ryhmiteltyVariaatiot, variaatioKuvaus, KEVYET_ESIKATSELUT, esikatselukopio, type KategoriaData } from "@/lib/kuvavisat2026";
import { ViikkovisaPromo, type ViikkoPromoData } from "@/components/tn20/ViikkovisaPromo";

/** Kevyet esikatselukopiot (public/20/kuvavisat/k/<type>.webp ja <type>-2.webp, 21.10.2026) — tallennustilan
 *  alkuperäiset olivat jopa 770 kt. Puuttuvalle kategorialle tallennustilan kuvat sellaisenaan. */
const esikatselut = (k: KategoriaData) =>
  KEVYET_ESIKATSELUT.has(k.meta.type) ? [esikatselukopio(k.meta.type, 0), esikatselukopio(k.meta.type, 1)] : k.esikatselut.slice(0, 2);

function KategoriaKortti({ k }: { k: KategoriaData }) {
  const ryhmat = ryhmiteltyVariaatiot(k.variaatiot);
  const kuvat = esikatselut(k);
  const grafiikka = k.meta.sovitus === "contain";
  return (
    <details className="kv-card" id={`kv-${k.meta.type}`} style={{ ["--kv-accent" as string]: k.meta.accent }}>
      <summary className="kv-card-summary">
        {kuvat.length > 0 && (
          <div className="kv-media">
            <div className={grafiikka ? "kv-media-plate" : "kv-media-photos"} aria-hidden="true">
              {kuvat.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  style={grafiikka || !k.meta.kuvaKohdistus ? undefined : { objectPosition: k.meta.kuvaKohdistus }}
                />
              ))}
            </div>
          </div>
        )}
        <div className="kv-card-body">
          <h3 className="kv-card-title">{k.meta.otsikko}</h3>
          <p className="kv-card-desc">{k.meta.kuvaus}</p>
          <div className="kv-card-meta">{variaatioKuvaus(k.variaatiot)}</div>
          <span className="kv-card-cta">
            Valitse visa
            <span className="kv-caret" aria-hidden="true">▾</span>
          </span>
        </div>
      </summary>
      <div className="kv-varlist">
        {ryhmat.map((r, i) => (
          <div className="kv-vargroup" key={r.label ?? `kaikki-${i}`}>
            {r.label && <span className="kv-vargroup-label">{r.label}</span>}
            <div className="kv-sirut">
              {r.items.map((v) => (
                <a key={v.key} className={`kv-siru${v.kaikki ? " kv-siru--kaikki" : ""}`} href={v.href}>
                  {v.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

export default function KuvavisaKategoriat({ kategoriat, viikkovisa }: { kategoriat: KategoriaData[]; viikkovisa: ViikkoPromoData | null }) {
  return (
    <div className="kv-runko">
      {viikkovisa && (
        <section className="kv-section kv-section--viikko" aria-labelledby="kv-viikko-otsikko">
          <div className="kv-section-head">
            <h2 className="kv-section-title" id="kv-viikko-otsikko">Tämän viikon visa</h2>
            <span className="kv-section-note">Uusi visa maanantaina</span>
          </div>
          <ViikkovisaPromo data={viikkovisa} sijainti="kokoelma" />
        </section>
      )}
      <section className="kv-section" id="osiot" aria-labelledby="kv-kategoriat-otsikko">
        <div className="kv-section-head">
          <h2 className="kv-section-title" id="kv-kategoriat-otsikko">Valitse kategoria</h2>
          <span className="kv-section-note">Kategoria avaa visat tasoittain ja alueittain</span>
        </div>
        <div className="kv-grid">
          {kategoriat.map((k) => (
            <KategoriaKortti key={k.meta.type} k={k} />
          ))}
        </div>
      </section>
    </div>
  );
}
