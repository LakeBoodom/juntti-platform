// KOKOELMARUNKO V1–V7 (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys" §3, CD-arkki
// "Tietoniekka Kokoelmarunko ja pelikehys v2", 19.10.2026). Yksi runko kaikille kokoelmasivuille:
// sisältö ja ilme tulevat asetuksesta (lib/kokoelmat/<slug>.ts), visat osioihin tagista.
//   V1 hero · V2 oma edistyminen (METAPELI-lipun takana) · V3 osionavigaatio (≥ 3 osiota) ·
//   V4 tunnusosa (valinnainen) · V5 visakortit A/B/C · V6 pelit rekisteristä · V7 lisää kokoelmia
// Tyylit app/(tn20)/runko.css (sivu tuo). Palvelinkomponentti; selaimessa vain heron napin kohde,
// "Näytä kaikki" ja metapelin pelattu-tilat.
import type { CSSProperties, ReactNode } from "react";
import { preload } from "react-dom";
import Crumbs from "@/components/tn20/Crumbs";
import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import { KATKAISU, katko, pisinSana, type RunkoData, type RunkoKortti } from "@/lib/kokoelmat/data";
import { korttiHref, metarivi, sarjaNimi } from "@/lib/visapaketit";
import type { RunkoVisa } from "@/lib/kokoelmat/tyypit";
import RunkoHeroCta from "./RunkoHeroCta";
import RunkoNaytaKaikki from "./RunkoNaytaKaikki";
import RunkoMetapeli from "./RunkoMetapeli";
import { PeliIkoniSvg } from "./PeliIkoni";
import { runkoCond } from "./runkoFontti";
import Tunnusosa from "./Tunnusosa";

/** Heron mobiiliversio: jokaisesta runkosivun herokuvasta on 800 px kopio nimellä <nimi>-800.webp. */
const MOBIILI = "(max-width: 899px)";
const pieniKuva = (src: string) => (src.endsWith("-800.webp") ? src : src.replace(/\.webp$/, "-800.webp"));

const metapeliPaalla = () => ["1", "true"].includes(process.env.METAPELI_ENABLED ?? "");
const esikatselu = () => process.env.VERCEL_ENV !== "production";

const yli = (k: RunkoKortti) =>
  [k.nro > KATKAISU.mobiili ? "rk-yli-m" : "", k.nro > KATKAISU.desktop ? "rk-yli-d" : ""].filter(Boolean).join(" ") || undefined;

/** Kaikki kuvalliset kortit ovat samaa A-muotoa (Heikki 21.10.2026: leveä B-kortti rajasi pysty-, neliö- ja
 *  4:3-kuvat huonosti). Osion ensimmäinen tai nostettu visa on vain ensimmäisenä. eka = sivun ensimmäinen kortti
 *  (voi näkyä ensimmäisessä ruudussa): ei lazy, mutta matala prioriteetti, ettei se kilpaile heron (LCP) kanssa. */
function KorttiA({ v, eka }: { v: RunkoKortti; eka?: boolean }) {
  return (
    <a className={["rk-a", yli(v)].filter(Boolean).join(" ")} data-visa-id={v.id} href={v.href} style={{ "--lw": pisinSana(v.nimi) } as CSSProperties}>
      <span className="rk-a-kuva">
        {v.kuva ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.kuva} alt="" loading={eka ? undefined : "lazy"} fetchPriority={eka ? "low" : undefined} data-sovitus={v.kuvaSovitus} style={v.kuvaPos ? { objectPosition: v.kuvaPos } : undefined} />
        ) : (
          <span className="rk-a-ini" aria-hidden="true">{v.nimi.split(/\s+/).map((w) => w[0]).join("").slice(0, 2)}</span>
        )}
        <span className="rk-pelattu" aria-hidden="true">✓</span>
      </span>
      <span className="rk-a-teksti">
        <h3 className="rk-a-nimi">{katko(v.nimi, true)}</h3>
        {v.meta && <span className="tn-card-meta">{v.meta}</span>}
        <span className="tn-card-cta">Pelaa →</span>
      </span>
    </a>
  );
}

function RiviC({ v }: { v: RunkoKortti }) {
  return (
    <li className={yli(v)}>
      <a className="rk-c" data-visa-id={v.id} href={v.href}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {v.kuva && <img src={v.kuva} alt="" loading="lazy" width={48} height={48} />}
        <span className="rk-c-teksti">
          <span className="rk-c-nimi">{katko(v.nimi)}</span>
          {v.meta && <span className="tn-card-meta">{v.meta}</span>}
        </span>
        <span className="rk-pelattu" aria-hidden="true">✓</span>
        <span className="tn-card-cta">{v.soon ? "Tulossa" : "Pelaa →"}</span>
      </a>
    </li>
  );
}

/** v3Lisa: V3:n yläpuolelle tuleva lisä (Tunnetut henkilöt: henkilöhaku + A–Ö-linkki, brief §3). */
/** heroLisa: heron tilastorivin alle tuleva lisä (Vaalit: vaalilaskuri, kun V4 on pelibanneri — Heikki 20.10.2026). */
export default function KokoelmaRunko({ d, tunnusosa, v3Lisa, heroLisa, sisalto }: {
  d: RunkoData;
  tunnusosa?: ReactNode;
  v3Lisa?: ReactNode;
  heroLisa?: ReactNode;
  /** Sivun oma sisältö V2–V5:n tilalle (Kuvavisat: viikon visa + kategoriaruudukko, P5 21.10.2026).
   *  Hero (V1), pelit (V6) ja lisää kokoelmia (V7) tulevat rungosta. */
  sisalto?: ReactNode;
}) {
  const { k, osiot } = d;
  const otsikko = `${k.title}${k.highlight ?? ""}`;
  const lyhyt = otsikko.trim().length <= 12;
  const naytaV3 = osiot.length >= 3 && !k.signatureReplacesNav;
  const focal = `${Math.round((k.hero.focalX ?? 0.5) * 100)}% ${Math.round((k.hero.focalY ?? 0.5) * 100)}%`;
  const monta = d.pelit.length > 3;

  if (k.hero.image) {
    preload(pieniKuva(k.hero.image), { as: "image", fetchPriority: "high", media: MOBIILI });
    preload(k.hero.image, { as: "image", fetchPriority: "high", media: "(min-width: 900px)" });
  }

  return (
    <main className={`rk ${runkoCond.variable}`} data-runko data-tn-entry="kokoelma" style={{ "--rk-acc": k.accent } as CSSProperties}>
      <KokoelmaLd avain={k.slug} nimi={k.nimi} polku={`/kokoelma/${k.slug}`} />
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: k.nimi }]} />

      {/* ─── V1 Hero ─── */}
      <section className="rk-hero" aria-labelledby="rk-h1">
        <div className="rk-hero-kuva" data-tyhja={!k.hero.image || undefined}>
          {/* Kuvaa ei vielä ole → raidallinen paikka (CD 6a) */}
          {k.hero.image && (
            /* Mobiili (< 900 px) lataa aina 800 px version (<nimi>-800.webp), desktop 1600 px (Heikki 20.10.2026:
               1600 px kuva 390 px:n näytöllä). Esilataus mediaehdolla, ks. heroEsilataus. */
            <picture>
              <source media={MOBIILI} srcSet={pieniKuva(k.hero.image)} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={k.hero.image} alt={k.hero.alt} fetchPriority="high" style={{ objectPosition: focal }} />
            </picture>
          )}
        </div>
        <div className="rk-hero-teksti">
          {/* UI-tekstit B1 (26.10.2026): "Teemakokoelma"-yläotsikko pois — murupolku ja otsikko kertovat jo. */}
          {k.eyebrow && <span className="rk-eyebrow">{k.eyebrow}</span>}
          {/* KORTTISÄÄNTÖ: koko pisimmästä sanasta (Barlow Condensed 800 ≈ 0,52 em/merkki, CD 1A) */}
          <h1
            id="rk-h1"
            className="rk-h1"
            data-lyhyt={lyhyt || undefined}
            style={{ "--lw": pisinSana(otsikko) } as CSSProperties}
          >
            {katko(k.title, true)}
            {k.highlight && <span>{katko(k.highlight, true)}</span>}
          </h1>
          <p className="rk-ingress">{k.ingress}</p>
          {heroLisa}
          {d.suosituin && <RunkoHeroCta suosituin={d.suosituin} jarjestys={d.jarjestys} tila={k.cta} selite={k.ctaSelite} />}
        </div>
      </section>

      {/* Visapaketti (28.10.2026): pieni linkkikortti, ei banneria. Teema = kokoelman nimi; kausipaketti vain kaudella. */}
      {d.paketti && (
        <div className="rk-vp">
          <a className="rk-vp-kortti" href={korttiHref(d.paketti)}>
            <span className="rk-vp-kicker">Visapaketti</span>
            <span className="rk-vp-nimi">{d.paketti.sarja ? sarjaNimi(d.paketti.sarja) : d.paketti.otsikko}</span>
            <span className="tn-card-meta">{metarivi(d.paketti, d.paketti.kierroksia).join(" · ")}</span>
            <span className="tn-card-cta">Pelaa →</span>
          </a>
        </div>
      )}

      {sisalto ?? (
 <>
      {/* ─── V2 + V3 ─── */}
      <div className="rk-v23" data-v3={naytaV3 || undefined}>
        <RunkoMetapeli
          paalla={metapeliPaalla()}
          esikatselu={esikatselu()}
          mastery={k.mastery.name}
          ikoni={k.mastery.icon}
          visaIdt={d.jarjestys.map((v) => v.id)}
        />
        {v3Lisa}
        {naytaV3 && (
          <nav id="osiot" className="rk-v3" aria-label={k.osiotNimi}>
            <div className="rk-chipit">
              {osiot.map((o) => (
                <a key={o.slug} className="rk-chip" href={`#osio-${o.slug}`} data-osio={o.slug}>
                  {o.chip ?? o.title}
                  {/* Heikki 25.10.2026: ei määriä eikä "Aihepiirit"-otsikkoa; palaavalle pelaajalle "2/8" (RunkoMetapeli). */}
                  <span data-osio-maara={o.maara} />
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* ─── V4 Tunnusosa (valinnainen): sivun antama tai asetuksen signature ─── */}
      {tunnusosa ?? <Tunnusosa d={d} />}

      {/* ─── V5 Osiot ─── */}
      {osiot.map((o, oi) => {
        const a = o.kortit.filter((x) => x.muoto === "A");
        const c = o.kortit.filter((x) => x.muoto === "C");
        return (
          <section key={o.slug} id={`osio-${o.slug}`} className="rk-osio" data-osio={o.slug} data-eka={oi === 0 || undefined} aria-labelledby={`osio-${o.slug}-h`}>
            {/* Heikki 25.10.2026: ei eyebrow-yläotsikkoa ("Kuvataide ja muotoilu") eikä "N visaa" -määrää —
                osion nimi riittää. Määrärivi täyttyy vain palaavalle pelaajalle ("2/8 pelattu", RunkoMetapeli). */}
            <div className="rk-osio-otsake">
              <h2 id={`osio-${o.slug}-h`} className="rk-h2">{katko(o.title, true)}</h2>
              <span className="rk-osio-maara" data-osio-maara={o.maara} />
            </div>
            {(o.b || a.length > 0) && (
              <div className="rk-ruudukko" data-a={a.length}>
                {o.b && <KorttiA v={{ ...o.b, muoto: "A", nro: 0 }} eka={oi === 0} />}
                {a.map((v) => <KorttiA key={v.id} v={v} />)}
              </div>
            )}
            {c.length > 0 && (
              <ul className="rk-c-lista">
                {c.map((v) => <RiviC key={v.id} v={v} />)}
              </ul>
            )}
            <div className="rk-osio-ala">
              <RunkoNaytaKaikki maara={o.maara} mobiili={o.piilossaMobiili > 0} desktop={o.piilossaDesktop > 0} />
              {(naytaV3 || k.signatureReplacesNav) && (
                <a className="rk-paluu" href="#osiot">
                  <span aria-hidden="true">↑</span> {k.signatureReplacesNav ? k.tunnusosaTeksti?.eyebrow ?? k.osiotNimi : k.osiotNimi}
                </a>
              )}
            </div>
          </section>
        );
      })}
 </>
      )}

      {/* ─── V6 Pelit tässä kokoelmassa (pelimuotorekisteri, S4) ─── */}
      {d.pelit.length > 0 && (
        <section id="pelit" className="rk-pelit" aria-labelledby="rk-pelit-h" data-monta={monta || undefined}>
          <div className="rk-osio-otsake">
            <h2 id="rk-pelit-h" className="rk-h2 rk-h2--pieni">Pelaa myös näitä</h2>
            {monta && (
              <a className="rk-kaikki-pelit" href="/kokoelmat#pelimuodot">
                Kaikki pelit →
              </a>
            )}
          </div>
          <div className="rk-pelit-rivi">
            {d.pelit.map((p, i) => (
              <a key={p.slug} className="rk-peli" href={p.href} data-yli={i >= 3 || undefined} data-tulossa={p.tila === "tulossa" || undefined}>
                {p.kuva ? (
                  <span className="rk-peli-kuva" data-contain={p.kuva.contain || undefined} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.kuva.src} alt="" loading="lazy" width={240} height={240} />
                  </span>
                ) : (
                  <span className="rk-peli-ikoni" aria-hidden="true"><PeliIkoniSvg ikoni={p.ikoni} /></span>
                )}
                <span className="rk-peli-teksti">
                  <span className="rk-peli-nimi" style={{ "--lw": pisinSana(p.nimi) } as CSSProperties}>{katko(p.nimi, true)}</span>
                  <span className="rk-peli-kuvaus">{p.kuvaus}</span>
                </span>
                <span className="tn-card-cta">{p.tila === "tulossa" ? "Tulossa" : "Pelaa →"}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {k.kuvakrediitti && (
        <p className="rk-krediitti">
          {k.kuvakrediitti} · <a href="/kuvien-lahteet">tekijät ja lisenssit</a>
        </p>
      )}

      {/* ─── V7 Lisää kokoelmia (asetuksesta tai automaattisesti, S6) ─── */}
      {d.lisaa.length > 0 && (
        <section className="rk-lisaa" aria-labelledby="rk-lisaa-h">
          <h2 id="rk-lisaa-h" className="rk-h2 rk-h2--pieni">Pelaa vielä nämä</h2>
          <div className="rk-lisaa-rivi">
            {d.lisaa.map((m) => (
              <a key={m.slug} className="rk-kokoelma" href={m.href}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt="" loading="lazy" style={m.pos ? { objectPosition: m.pos } : undefined} />
                <span className="rk-kokoelma-teksti">
                  <span className="rk-kokoelma-nimi">{katko(m.nimi, true)}</span>
                  <span className="tn-card-meta">{m.maara} visaa</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
