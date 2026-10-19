// KOKOELMARUNKO V1–V7 (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys" §3, CD-arkki
// "Tietoniekka Kokoelmarunko ja pelikehys v2", 19.10.2026). Yksi runko kaikille kokoelmasivuille:
// sisältö ja ilme tulevat asetuksesta (lib/kokoelmat/<slug>.ts), visat osioihin tagista.
//   V1 hero · V2 oma edistyminen (METAPELI-lipun takana) · V3 osionavigaatio (≥ 3 osiota) ·
//   V4 tunnusosa (valinnainen) · V5 visakortit A/B/C · V6 pelit rekisteristä · V7 lisää kokoelmia
// Tyylit app/(tn20)/runko.css (sivu tuo). Palvelinkomponentti; selaimessa vain heron napin kohde,
// "Näytä kaikki" ja metapelin pelattu-tilat.
import type { CSSProperties, ReactNode } from "react";
import Crumbs from "@/components/tn20/Crumbs";
import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import { katko, pisinSana, type RunkoData, type RunkoKortti } from "@/lib/kokoelmat/data";
import type { RunkoVisa } from "@/lib/kokoelmat/tyypit";
import RunkoHeroCta from "./RunkoHeroCta";
import RunkoNaytaKaikki from "./RunkoNaytaKaikki";
import RunkoMetapeli from "./RunkoMetapeli";
import { PeliIkoniSvg } from "./PeliIkoni";
import { runkoCond } from "./runkoFontti";
import Tunnusosa from "./Tunnusosa";

const metapeliPaalla = () => ["1", "true"].includes(process.env.METAPELI_ENABLED ?? "");
const esikatselu = () => process.env.VERCEL_ENV !== "production";

/** eka = sivun ensimmäinen B (voi näkyä ensimmäisessä ruudussa): ei lazy, mutta matala prioriteetti,
 *  ettei se kilpaile heron (LCP) kanssa. Muut B:t lazy. */
function KorttiB({ v, laaja, eka }: { v: RunkoVisa; laaja: boolean; eka: boolean }) {
  return (
    <a className="rk-b" data-laaja={laaja || undefined} data-visa-id={v.id} href={v.href} style={{ "--lw": pisinSana(v.nimi) } as CSSProperties}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {v.kuva && <img src={v.kuva} alt="" loading={eka ? undefined : "lazy"} fetchPriority={eka ? "low" : undefined} style={v.kuvaPos ? { objectPosition: v.kuvaPos } : undefined} />}
      <span className="rk-pelattu" aria-hidden="true">✓</span>
      <span className="rk-b-teksti">
        {v.meta && <span className="tn-card-meta rk-b-meta">{v.meta}</span>}
        <h3 className="rk-b-nimi">{katko(v.nimi)}</h3>
        <span className="tn-card-cta">Pelaa →</span>
      </span>
    </a>
  );
}

const yli = (k: RunkoKortti) =>
  [k.nro > 6 ? "rk-yli-m" : "", k.nro > 8 ? "rk-yli-d" : ""].filter(Boolean).join(" ") || undefined;

function KorttiA({ v }: { v: RunkoKortti }) {
  return (
    <a className={["rk-a", yli(v)].filter(Boolean).join(" ")} data-visa-id={v.id} href={v.href} style={{ "--lw": pisinSana(v.nimi) } as CSSProperties}>
      <span className="rk-a-kuva">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={v.kuva!} alt="" loading="lazy" style={v.kuvaPos ? { objectPosition: v.kuvaPos } : undefined} />
        <span className="rk-pelattu" aria-hidden="true">✓</span>
      </span>
      <span className="rk-a-teksti">
        <h3 className="rk-a-nimi">{katko(v.nimi)}</h3>
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

export default function KokoelmaRunko({ d, tunnusosa }: { d: RunkoData; tunnusosa?: ReactNode }) {
  const { k, osiot } = d;
  const otsikko = `${k.title}${k.highlight ?? ""}`;
  const lyhyt = otsikko.trim().length <= 12;
  const naytaV3 = osiot.length >= 3 && !k.signatureReplacesNav;
  const focal = `${Math.round((k.hero.focalX ?? 0.5) * 100)}% ${Math.round((k.hero.focalY ?? 0.5) * 100)}%`;
  const monta = d.pelit.length > 3;

  return (
    <main className={`rk ${runkoCond.variable}`} data-runko style={{ "--rk-acc": k.accent } as CSSProperties}>
      <KokoelmaLd avain={k.slug} nimi={k.nimi} polku={`/kokoelma/${k.slug}`} />
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: k.nimi }]} />

      {/* ─── V1 Hero ─── */}
      <section className="rk-hero" aria-labelledby="rk-h1">
        <div className="rk-hero-kuva" data-tyhja={!k.hero.image || undefined}>
          {/* Kuvaa ei vielä ole → raidallinen paikka (CD 6a) */}
          {k.hero.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={k.hero.image} alt={k.hero.alt} fetchPriority="high" style={{ objectPosition: focal }} />
          )}
        </div>
        <div className="rk-hero-teksti">
          <span className="rk-eyebrow">{k.eyebrow}</span>
          {/* KORTTISÄÄNTÖ: koko pisimmästä sanasta (Barlow Condensed 800 ≈ 0,52 em/merkki, CD 1A) */}
          <h1
            id="rk-h1"
            className="rk-h1"
            data-lyhyt={lyhyt || undefined}
            style={{ "--lw": pisinSana(otsikko) } as CSSProperties}
          >
            {katko(k.title)}
            {k.highlight && <span>{katko(k.highlight)}</span>}
          </h1>
          <p className="rk-ingress">{k.ingress}</p>
          <span className="rk-tilasto">
            {d.visoja} visaa · {osiot.length} {osiot.length === 1 ? "osio" : "osiota"}
          </span>
          {d.suosituin && <RunkoHeroCta suosituin={d.suosituin} jarjestys={d.jarjestys} tila={k.cta} />}
        </div>
      </section>

      {/* ─── V2 + V3 ─── */}
      <div className="rk-v23" data-v3={naytaV3 || undefined}>
        <RunkoMetapeli
          paalla={metapeliPaalla()}
          esikatselu={esikatselu()}
          mastery={k.mastery.name}
          ikoni={k.mastery.icon}
          visaIdt={d.jarjestys.map((v) => v.id)}
        />
        {naytaV3 && (
          <nav id="osiot" className="rk-v3" aria-label={k.osiotNimi}>
            <span className="rk-v3-otsikko">{k.osiotNimi}</span>
            <div className="rk-chipit">
              {osiot.map((o) => (
                <a key={o.slug} className="rk-chip" href={`#osio-${o.slug}`} data-osio={o.slug}>
                  {o.chip ?? o.title}
                  <span data-osio-maara={o.maara}>{o.maara}</span>
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* ─── V4 Tunnusosa (valinnainen): sivun antama tai asetuksen signature ─── */}
      {tunnusosa ?? <Tunnusosa k={k} />}

      {/* ─── V5 Osiot ─── */}
      {osiot.map((o, oi) => {
        const a = o.kortit.filter((x) => x.muoto === "A");
        const c = o.kortit.filter((x) => x.muoto === "C");
        return (
          <section key={o.slug} id={`osio-${o.slug}`} className="rk-osio" data-osio={o.slug} aria-labelledby={`osio-${o.slug}-h`}>
            {o.eyebrow && (
              <div className="rk-osio-eyebrow">
                <span>{o.eyebrow}</span>
                <i aria-hidden="true" />
              </div>
            )}
            <div className="rk-osio-otsake">
              <h2 id={`osio-${o.slug}-h`} className="rk-h2">{katko(o.title)}</h2>
              <span className="rk-osio-maara" data-osio-maara={o.maara}>{o.maara} visaa</span>
            </div>
            {(o.b || a.length > 0) && (
              <div className="rk-ruudukko" data-a={a.length}>
                {o.b && <KorttiB v={o.b} laaja={a.length < 2} eka={oi === 0} />}
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
              {naytaV3 && (
                <a className="rk-paluu" href="#osiot">
                  <span aria-hidden="true">↑</span> {k.osiotNimi}
                </a>
              )}
            </div>
          </section>
        );
      })}

      {/* ─── V6 Pelit tässä kokoelmassa (pelimuotorekisteri, S4) ─── */}
      {d.pelit.length > 0 && (
        <section className="rk-pelit" aria-labelledby="rk-pelit-h" data-monta={monta || undefined}>
          <div className="rk-osio-otsake">
            <h2 id="rk-pelit-h" className="rk-h2 rk-h2--pieni">Pelit tässä kokoelmassa</h2>
            {monta && (
              <a className="rk-kaikki-pelit" href="/kokoelmat#pelimuodot">
                Kaikki pelit ({d.pelit.length}) →
              </a>
            )}
          </div>
          <div className="rk-pelit-rivi">
            {d.pelit.map((p, i) => (
              <a key={p.slug} className="rk-peli" href={p.href} data-yli={i >= 3 || undefined} data-tulossa={p.tila === "tulossa" || undefined}>
                <span className="rk-peli-ikoni" aria-hidden="true"><PeliIkoniSvg ikoni={p.ikoni} /></span>
                <span className="rk-peli-teksti">
                  <span className="rk-peli-nimi">{katko(p.nimi)}</span>
                  <span className="rk-peli-kuvaus">{p.kuvaus}</span>
                </span>
                <span className="tn-card-cta">{p.tila === "tulossa" ? "Tulossa" : "Pelaa →"}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ─── V7 Lisää kokoelmia (asetuksesta tai automaattisesti, S6) ─── */}
      {d.lisaa.length > 0 && (
        <section className="rk-lisaa" aria-labelledby="rk-lisaa-h">
          <h2 id="rk-lisaa-h" className="rk-h2 rk-h2--pieni">Lisää kokoelmia</h2>
          <div className="rk-lisaa-rivi">
            {d.lisaa.map((m) => (
              <a key={m.slug} className="rk-kokoelma" href={m.href}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt="" loading="lazy" style={m.pos ? { objectPosition: m.pos } : undefined} />
                <span className="rk-kokoelma-teksti">
                  <span className="rk-kokoelma-nimi">{katko(m.nimi)}</span>
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
