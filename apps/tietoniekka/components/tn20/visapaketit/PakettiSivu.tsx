// VISAPAKETTI-SIVU (toteutusbrief 28.10.2026 V-B; rakenne design-kankaan tauluista 1–2, ilme Neon Night).
// Hero (murupolku, h1, metarivi, Pelaa itse / Näytä ruudulla / Tulosta) → Aikuiset/Lapset-valitsin (vain
// 'molemmat') → kierrokset, joissa jokaisen kysymyksen vastaus <details>-elementissä → Pelaa visoina.
// Vastaukset ovat aina HTML:ssä (SSR), jotta hakukone näkee ne: se on sivun hakunäkyvyyden ydin.
// Ei FAQ-tekstiä, ei vetäjän ohjelaatikkoa eikä selitysosioita (UI-sääntö 9, linjaus 2.10.).
import type { CSSProperties } from "react";
import "@/app/(tn20)/visapaketit.css";
import Crumbs from "@/components/tn20/Crumbs";
import { runkoCond } from "@/components/tn20/runko/runkoFontti";
import { katko, pisinSana } from "@/lib/kokoelmat/data";
import { pieniKuva } from "@/lib/pienetKuvat";
import {
  VP_LANDING, type Kierros, type PakettiKysymys, type Sivu, type Taso,
  hakuosa, julkaisuPvm, kevytKuva, sarjaNimi, kierrosmaarat, kuvaOnKysymys, kysymysTeksti, lahdevisat, metarivi, oikeaVastaus, pakettiHref,
  tasonKierrokset, valitsinNakyy, viittaaVaihtoehtoihin,
} from "@/lib/visapaketit";
import VpAsiakas from "./VpAsiakas";

const TASOT: { taso: Taso; nimi: string }[] = [{ taso: "aikuiset", nimi: "Aikuiset" }, { taso: "lapset", nimi: "Lapset" }];

export default function PakettiSivu({ sivu, taso, esikatselu }: { sivu: Sivu; taso: Taso; esikatselu: string | null }) {
  const { vp, polku, painokset } = sivu;
  const p = vp.paketti;
  const sarjanPaasivu = !!painokset;
  const otsikko = sarjanPaasivu && p.sarja ? sarjaNimi(p.sarja) : p.otsikko;
  const molemmat = valitsinNakyy(p);
  const tasot: Taso[] = molemmat ? ["aikuiset", "lapset"] : [taso];
  const kaikki = tasot.flatMap((t) => tasonKierrokset(vp, t));
  const meta = [
    ...(p.painos_nimi ? [p.painos_nimi] : []),
    ...metarivi(p, kierrosmaarat(vp)),
  ];
  const pvm = p.sarja ? julkaisuPvm(p.published_at) : null;
  const haku = hakuosa(molemmat && taso === "lapset" ? "lapset" : null, esikatselu);
  const visat = lahdevisat(kaikki);
  const aiemmat = (painokset ?? []).filter((r) => r.slug !== p.slug);

  return (
    <main
      className={`tn-vp ${runkoCond.variable}`}
      data-vp
      style={(p.aksentti ? { "--vp-acc": p.aksentti } : undefined) as CSSProperties | undefined}
    >
      <Crumbs items={[{ label: "Visapaketit", href: VP_LANDING }, { label: otsikko }]} />

      <section className="tn-vp-hero" data-kuva={p.hero_image ? "" : undefined}>
        <div className="tn-vp-hero-teksti">
          {vp.esikatselu && (
            <p className="tn-vp-luonnos" role="status">
              {p.status === "published" ? "Esikatselu" : "Luonnos – ei julkaistu"}
            </p>
          )}
          <h1 className="tn-vp-h1" style={{ "--lw": pisinSana(otsikko) } as CSSProperties}>{katko(otsikko, true)}</h1>
          <p className="tn-vp-meta">
            {meta.join(" · ")}
            {pvm && <> · <time dateTime={p.published_at ?? undefined}>{pvm}</time></>}
          </p>
          <div className="tn-vp-toiminnot">
            <a className="tn-cta-lime tn-vp-cta" href="#pelaa">Pelaa itse</a>
            <a className="tn-vp-nappi" href={`${polku}/ruutu${haku}`} data-vp-tasolinkki="">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
              Näytä ruudulla
            </a>
            <a className="tn-vp-nappi" href={`${polku}/tulosta${haku}`} data-vp-tasolinkki="">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9V3h12v6" /><rect x="3" y="9" width="18" height="8" rx="2" /><path d="M6 14h12v7H6z" /></svg>
              Tulosta
            </a>
            <a className="tn-vp-nappi" href={`${polku}/vetaja${haku}`} data-vp-tasolinkki="">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></svg>
              Juontajalle
            </a>
          </div>
        </div>
        {p.hero_image && (
          <div className="tn-vp-hero-kuva">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.hero_image} alt={p.hero_alt ?? ""} width={1600} height={900} fetchPriority="high" />
          </div>
        )}
      </section>

      <section className="tn-vp-osio" aria-labelledby="vp-kysymykset">
        <div className="tn-vp-osio-otsake">
          <h2 id="vp-kysymykset" className="tn-vp-h2">Kysymykset ja vastaukset</h2>
          {molemmat && (
            <div className="tn-vp-valitsin" role="group" aria-label="Taso">
              {TASOT.map((t) => (
                <a key={t.taso} href={`${polku}${hakuosa(t.taso, esikatselu)}`}
                  data-vp-taso={t.taso} aria-current={t.taso === taso ? "true" : undefined}>
                  {t.nimi}
                </a>
              ))}
            </div>
          )}
        </div>
        {tasot.map((t) => (
          <div key={t} data-vp-kierrokset={t} hidden={t !== taso} className="tn-vp-kierrokset">
            {tasonKierrokset(vp, t).map((k) => <KierrosLista key={k.nro} k={k} />)}
          </div>
        ))}
      </section>

      {visat.length > 0 && (
        <section id="pelaa" className="tn-vp-osio" aria-labelledby="vp-pelaa">
          <h2 id="vp-pelaa" className="tn-vp-h2">Pelaa visoina</h2>
          <div className="tn-vp-visat">
            {visat.map((v) => {
              const kuva = v.hero_image ?? v.image_url;
              const nimi = v.display_title ?? v.title;
              return (
                <a key={v.id} className="tn-vp-visa" href={v.href} data-vp-pelaa="">
                  {kuva && (
                    <span className="tn-vp-visa-kuva" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pieniKuva(kuva)} alt="" loading="lazy" width={720} height={405} />
                    </span>
                  )}
                  <span className="tn-vp-visa-teksti">
                    <span className="tn-vp-visa-nimi" style={{ "--lw": pisinSana(nimi) } as CSSProperties}>{katko(nimi, true)}</span>
                    <span className="tn-card-cta">Pelaa →</span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {aiemmat.length > 0 && (
        <section className="tn-vp-osio" aria-labelledby="vp-painokset">
          <h2 id="vp-painokset" className="tn-vp-h2">Aiemmat painokset</h2>
          <ul className="tn-vp-painokset">
            {aiemmat.map((r) => (
              <li key={r.slug}>
                <a href={pakettiHref(r)}>
                  <span className="tn-vp-painos-nimi">{r.painos_nimi ?? r.otsikko}</span>
                  {r.published_at && <time className="tn-card-meta" dateTime={r.published_at}>{julkaisuPvm(r.published_at)}</time>}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <VpAsiakas packId={p.id} mittaa={!vp.esikatselu} />
    </main>
  );
}

function KierrosLista({ k }: { k: Kierros }) {
  return (
    <section className="tn-vp-kierros" aria-labelledby={`vp-k-${k.kohderyhma}-${k.nro}`}>
      <h3 id={`vp-k-${k.kohderyhma}-${k.nro}`} className="tn-vp-kierros-h">
        <span className="tn-vp-kierros-nro">Kierros {k.nro}</span>
        <span className="tn-vp-kierros-nimi">{k.nimi}</span>
      </h3>
      <ol className="tn-vp-kysymykset">
        {k.kysymykset.map((q) => <KysymysRivi key={q.id} q={q} />)}
      </ol>
    </section>
  );
}

function KysymysRivi({ q }: { q: PakettiKysymys }) {
  const vastaus = oikeaVastaus(q);
  return (
    <li className="tn-vp-kysymys" data-pois={q.visa_julkaistu ? undefined : ""}>
      <p className="tn-vp-kysymys-t">{kysymysTeksti(q)}</p>
      {!q.visa_julkaistu && <p className="tn-vp-varoitus">Visa ei ole julkaistu – kysymys ei näy julkaistussa paketissa.</p>}
      {kuvaOnKysymys(q) && (
        <figure className="tn-vp-kuva">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={kevytKuva(q.image_url!)} alt="" loading="lazy" decoding="async" width={1536} height={1024}
            style={q.image_position ? { objectPosition: q.image_position } : undefined} />
          {q.image_credit && <figcaption className="tn-vp-krediitti">{q.image_credit}</figcaption>}
        </figure>
      )}
      {q.animal_sound?.url && (
        <div className="tn-vp-aani">
          <audio controls preload="none" src={q.animal_sound.url} aria-label="Kuuntele ääni" />
          {q.animal_sound.tekija && (
            <span className="tn-vp-krediitti">Ääni: {q.animal_sound.tekija}{q.animal_sound.lisenssi ? ` / ${q.animal_sound.lisenssi}` : ""}</span>
          )}
        </div>
      )}
      {viittaaVaihtoehtoihin(q) && q.answers && (
        <ol className="tn-vp-vaihtoehdot" type="A">
          {q.answers.map((a) => <li key={a.text}>{a.text}</li>)}
        </ol>
      )}
      <details className="tn-vp-vastaus" data-q={q.id}>
        <summary><span className="tn-vp-nayta">Näytä vastaus</span><span className="tn-vp-piilota">Piilota vastaus</span></summary>
        <p className="tn-vp-vastaus-t">{vastaus}</p>
        {q.explanation && <p className="tn-vp-selitys">{q.explanation}</p>}
      </details>
    </li>
  );
}
