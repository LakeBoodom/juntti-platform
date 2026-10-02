// JUHLAT — kokoelmasivu (CD "Juhlat-kokoelma", toteutettu 28.9.2026).
// Rakenne designin mukaan: otsikko → nosto (lähin iso juhla: kuva, laskuri, Tiesitkö,
// Pelaa myös) → Vuosikello (aikajana, 3 kuvakorttia, 4 päivälaattaa, loput kuukausittain)
// → Kaikki juhlavisat juhlittain + Ympäri vuoden.
//
// Poikkeamat designista (Heikki 28.9.2026 ja katselmointi):
//  - Nosto näyttää aina lähimmän ison juhlan, jolla on julkaistu visa (ei 28 päivän ikkunaa).
//  - "Pelaa myös" ei toista nostun omaa visaa: juhlan muut visat ja niiden perään
//    seuraavien juhlien visat (vähintään kolme korttia).
//  - Visailta (visapaketti) tehdään myöhemmin omana kokonaisuutenaan.
//  - Juhlakohtaisia alasivuja ei vielä ole: vuosikellon kortti vie juhlan visaan tai sen
//    visaryhmään Kaikki juhlavisat -listassa.
// Juhlat, päivämäärät, faktat ja kuvat: lib/juhlat.ts. Visat kannasta (collection='juhlat',
// vain julkaistut), kuva quizzes.hero_image.

import { jakoMeta } from "@/lib/jakoMeta";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { helsinginPaiva } from "@/lib/aika";
import Crumbs from "@/components/tn20/Crumbs";
import { NostoLaskuri } from "@/components/tn20/juhlat/Laskurit";
import {
  JUHLAT_KOKOELMA, JUHLAT_SIVU, JUHLAT_YMPARI_VUODEN, faktat, helsinginKeskiyo, juhlaKalenteri, kkLyhyt,
  kuukausi, lyhyt, nostettava, paavisa, paiviaValissa, pitka, pvm, visaHref, type Esiintyma,
} from "@/lib/juhlat";
import "../../juhlat.css";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const metadata: Metadata = {
  title: "Juhlat — tietovisat vuoden juhliin ja perinteisiin",
  description:
    "Tietovisat halloweenista jouluun ja vappuun: juhlien historia, perinteet ja herkut. Ajankohtainen juhla on aina ylimpänä. Ilmaisia visoja ilman kirjautumista.",
  alternates: { canonical: `${SITE_URL}${JUHLAT_SIVU}` },
  ...jakoMeta({
    url: `${SITE_URL}${JUHLAT_SIVU}`,
    title: "Juhlat — tietovisat vuoden juhliin",
    description: "Visat vuoden juhliin ja perinteisiin. Ajankohtainen juhla on aina ylimpänä.",
    kuva: "/og/kokoelma/juhlat",
  }),
};

type Visa = { slug: string; title: string; display_title: string | null; teaser: string | null; hero_image: string | null };

const pienet = (src: string) => src.replace(/\.webp$/, "-800.webp");
const srcSet = (src: string) => (src.endsWith("-800.webp") ? undefined : `${pienet(src)} 800w, ${src} 1600w`);
const paivaa = (n: number) => (n === 1 ? "päivä" : "päivää");
const visoja = (n: number) => (n === 0 ? "Visat tulossa" : n === 1 ? "1 visa" : `${n} visaa`);
const hexA = (h: string, a: number) => {
  const n = parseInt(h.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
/** Vuosikellon kortin linkki: yksi visa → visaan, useampi → visaryhmään, ei visoja → ei linkkiä. */
const juhlaHref = (o: Esiintyma) =>
  o.julkaistut.length === 1 ? visaHref(o.julkaistut[0]) : o.julkaistut.length > 1 ? `#juhla-${o.slug}` : null;

/* Esikatselu (ei tuotannossa): ?pvm=2026-12-10 näyttää sivun kyseisenä päivänä. */
const ESIKATSELU = process.env.VERCEL_ENV !== "production";

export default async function JuhlatSivu({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const simPvm = ESIKATSELU && typeof sp.pvm === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.pvm) ? sp.pvm : null;
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const { data } = await sb
    .from("quizzes")
    .select("slug, title, display_title, teaser, hero_image")
    .eq("collection" as unknown as "status", JUHLAT_KOKOELMA)
    .eq("status", "published");
  const visat = (data ?? []) as unknown as Visa[];
  const bySlug = new Map(visat.map((v) => [v.slug, v]));
  const nimi = (s: string) => bySlug.get(s)?.display_title ?? bySlug.get(s)?.title ?? s;

  const hp = simPvm
    ? (([vuosi, kk, pv]) => ({ vuosi, kk, pv }))(simPvm.split("-").map(Number))
    : helsinginPaiva();
  const tanaan = pvm(hp.vuosi, hp.kk, hp.pv);
  const kalenteri = juhlaKalenteri(tanaan, new Set(bySlug.keys()));
  const nosto = nostettava(kalenteri);
  const muut = kalenteri.filter((o) => o !== nosto);

  /* ── Nosto ── */
  const paa = nosto ? paavisa(nosto) : null;
  const pelaaMyos: { slug: string; juhla: Esiintyma }[] = [];
  if (nosto) {
    const nahty = new Set([paa]);
    for (const s of nosto.julkaistut) if (!nahty.has(s)) { nahty.add(s); pelaaMyos.push({ slug: s, juhla: nosto }); }
    for (const o of muut) {
      if (pelaaMyos.length >= 3) break;
      if (o.alku < nosto.alku) continue;
      for (const s of o.julkaistut) {
        if (pelaaMyos.length >= 3) break;
        if (!nahty.has(s)) { nahty.add(s); pelaaMyos.push({ slug: s, juhla: o }); }
      }
    }
  }

  /* ── Vuosikello: 3 kuvakorttia, 4 päivälaattaa, loput kuukausittain ── */
  const t1 = muut.slice(0, 3), t2 = muut.slice(3, 7), t3 = muut.slice(7);
  const t3Ryhmat: { label: string; rivit: Esiintyma[] }[] = [];
  for (const o of t3) {
    const label = kuukausi(o.alku);
    const viim = t3Ryhmat[t3Ryhmat.length - 1];
    if (viim?.label === label) viim.rivit.push(o);
    else t3Ryhmat.push({ label, rivit: [o] });
  }
  const t3Vuodet = [...new Set(t3.map((o) => new Date(o.alku).getUTCFullYear()))];
  const pct = (t: number) => `${Math.max(0, Math.min(100, (paiviaValissa(t, tanaan) / 365) * 100)).toFixed(2)}%`;
  const kuukaudet: { left: string; label: string }[] = [];
  for (let i = 1; i <= 12; i++) {
    const t = Date.UTC(hp.vuosi, hp.kk - 1 + i, 1);
    kuukaudet.push({ left: pct(t), label: kkLyhyt(t) });
  }

  /* ── Kaikki juhlavisat: juhlittain lähin ensin, sama visa vain kerran ── */
  const listattu = new Set<string>();
  const ryhmat: { id: string; label: string; pvm: string; accent: string; visat: string[] }[] = [];
  for (const o of kalenteri) {
    const rivit = o.julkaistut.filter((s) => !listattu.has(s));
    if (!rivit.length) continue;
    rivit.forEach((s) => listattu.add(s));
    ryhmat.push({ id: `juhla-${o.slug}`, label: o.nimi, pvm: lyhyt(o.alku), accent: o.accent, visat: rivit });
  }
  const ympari = JUHLAT_YMPARI_VUODEN.filter((s) => bySlug.has(s));
  if (ympari.length) ryhmat.push({ id: "ympari-vuoden", label: "Ympäri vuoden", pvm: "", accent: "#E8A320", visat: ympari });

  const laskurinKohde = nosto ? helsinginKeskiyo(nosto.alku + (nosto.kohde ?? 0) * 864e5) : 0;
  const nostonFaktat = nosto ? faktat(nosto) : [];

  return (
    <main className="ju">
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: "Juhlat" }]} />
      <div className="ju-wrap">
        <header className="ju-head">
          <div className="ju-head-teksti">
            <h1 className="ju-h1">Juhlat</h1>
            <p className="ju-lead">Visat vuoden juhliin ja perinteisiin. Ajankohtainen juhla on aina ylimpänä.</p>
          </div>
          <div className="ju-tanaan">Tänään {pitka(tanaan)}</div>
        </header>

        {nosto && paa ? (
          <section className="ju-nosto" aria-labelledby="ju-nosto-h" style={{ "--ju-a": nosto.accent, "--ju-glow": hexA(nosto.accent, 0.18) } as React.CSSProperties}>
            <div className="ju-hero">
              {nosto.kuva ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={nosto.kuva} srcSet={srcSet(nosto.kuva)} sizes="(min-width: 1400px) 1300px, 100vw" alt="" fetchPriority="high" />
              ) : (
                <span className="ju-hero-glow" aria-hidden />
              )}
              <span className="ju-hero-varjo" aria-hidden />
              <div className="ju-hero-body">
                <div className="ju-hero-teksti">
                  <span className="ju-hero-pvm">{pitka(nosto.alku)}</span>
                  <h2 className="ju-h2" id="ju-nosto-h">
                    {(nosto.rivit ?? [nosto.nimi]).map((r) => <span key={r}>{r}</span>)}
                  </h2>
                  <div className="ju-hero-toiminnot">
                    <a className="ju-btn" href={visaHref(paa)}>Pelaa visa</a>
                    <span className="ju-hero-visa">{nimi(paa)}</span>
                  </div>
                </div>
                <NostoLaskuri kohde={laskurinKohde} alkuNyt={Date.now()} otsikko={nosto.laskuri ?? nosto.nimi} />
              </div>
            </div>

            {nostonFaktat.length > 0 && (
              <div className="ju-osa">
                <div className="ju-kicker">Tiesitkö</div>
                <div className="ju-faktat">
                  {nostonFaktat.map((f) => (
                    <div key={f.label} className="ju-fakta">
                      <span className="ju-fakta-label">{f.label}</span>
                      <span className="ju-fakta-k">{f.k}</span>
                      <p>{f.t}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pelaaMyos.length > 0 && (
              <div className="ju-osa">
                <div className="ju-kicker">Pelaa myös</div>
                <div className="ju-visat">
                  {pelaaMyos.map(({ slug, juhla }) => {
                    const v = bySlug.get(slug)!;
                    const kuva = v.hero_image ?? juhla.kuva;
                    return (
                      <a key={slug} className="ju-visa" href={visaHref(slug)}>
                        <span className="ju-visa-kuva">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {kuva && <img src={kuva.endsWith(".webp") ? pienet(kuva) : kuva} alt="" loading="lazy" />}
                        </span>
                        <span className="ju-visa-body">
                          <span className="ju-visa-juhla" style={{ color: juhla.accent }}>{juhla.nimi}</span>
                          <span className="ju-visa-nimi">{v.display_title ?? v.title}</span>
                          {v.teaser && <span className="ju-visa-teaser">{v.teaser}</span>}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="ju-nosto">
            <div className="ju-tyhja">Juhlavisat julkaistaan pian. Katso alta, mitä juhlia on tulossa.</div>
          </section>
        )}

        {/* ─── Vuosikello ─── */}
        <section className="ju-kello" aria-labelledby="ju-kello-h">
          <div className="ju-sechead">
            <h2 className="ju-h2s" id="ju-kello-h">Vuosikello</h2>
            <div className="ju-secsub">Kaikki juhlat tästä päivästä eteenpäin</div>
          </div>

          <div className="ju-aika" aria-hidden>
            <span className="ju-aika-viiva" />
            {kuukaudet.map((k, i) => (
              <span key={k.left} className={`ju-aika-kk${i % 2 ? " ju-aika-kk--2" : ""}`} style={{ left: k.left }}>{k.label}</span>
            ))}
            <span className="ju-aika-pisteet">
              {kalenteri.map((o) => {
                const i = muut.indexOf(o);
                const koko = o === nosto || (i >= 0 && i < 3) ? 16 : i < 7 ? 11 : 7;
                return (
                  <span
                    key={`${o.slug}-${o.alku}`}
                    className="ju-aika-piste"
                    title={`${o.nimi} ${lyhyt(o.alku)}`}
                    style={{ left: pct(o.alku), width: koko, height: koko, background: i >= 7 ? hexA(o.accent, 0.55) : o.accent }}
                  />
                );
              })}
              <span className="ju-aika-nyt" />
            </span>
          </div>

          <div className="ju-t1">
            {t1.map((o) => {
              const href = juhlaHref(o);
              const kuva = o.kuva ?? o.korttikuva;
              const sisalto = (
                <>
                  {kuva ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={o.kuva ? pienet(o.kuva) : kuva} alt="" loading="lazy" />
                  ) : (
                    <span className="ju-t1-glow" style={{ background: `radial-gradient(circle at 70% 25%, ${hexA(o.accent, 0.35)}, transparent 65%)` }} aria-hidden />
                  )}
                  <span className="ju-t1-varjo" aria-hidden />
                  <span className="ju-t1-body">
                    <span className="ju-t1-pvm"><i style={{ background: o.accent }} />{pitka(o.alku)}</span>
                    <span className="ju-t1-nimi">{(o.rivit ?? [o.nimi]).map((r) => <span key={r}>{r}</span>)}</span>
                    <span className="ju-t1-ala">
                      <span><b>{paiviaValissa(o.alku, tanaan)}</b> {paivaa(paiviaValissa(o.alku, tanaan))}</span>
                      <span className="ju-t1-tila">{visoja(o.julkaistut.length)}</span>
                    </span>
                  </span>
                </>
              );
              return href
                ? <a key={`${o.slug}-${o.alku}`} className="ju-t1-kortti" href={href}>{sisalto}</a>
                : <div key={`${o.slug}-${o.alku}`} className="ju-t1-kortti">{sisalto}</div>;
            })}
          </div>

          <div className="ju-t2">
            {t2.map((o) => {
              const href = juhlaHref(o);
              const d = paiviaValissa(o.alku, tanaan);
              const sisalto = (
                <>
                  <span className="ju-t2-pv" style={{ background: hexA(o.accent, 0.14), borderColor: hexA(o.accent, 0.5) }}>
                    <b>{new Date(o.alku).getUTCDate()}</b>
                    <small style={{ color: o.accent }}>{kkLyhyt(o.alku)}</small>
                  </span>
                  <span className="ju-t2-teksti">
                    <span className="ju-t2-nimi">{o.nimi}</span>
                    <span className="ju-t2-meta">{d} {paivaa(d)} · {visoja(o.julkaistut.length)}</span>
                  </span>
                </>
              );
              return href
                ? <a key={`${o.slug}-${o.alku}`} className="ju-t2-kortti" href={href}>{sisalto}</a>
                : <div key={`${o.slug}-${o.alku}`} className="ju-t2-kortti">{sisalto}</div>;
            })}
          </div>

          {t3Ryhmat.length > 0 && (
            <div className="ju-t3">
              <div className="ju-t3-otsikko">{t3Vuodet.length === 1 ? `Vuosi ${t3Vuodet[0]}` : "Myöhemmin"}</div>
              <div className="ju-t3-kuut">
                {t3Ryhmat.map((g) => (
                  <div key={g.label} className="ju-t3-kk">
                    <span className="ju-t3-label">{g.label}</span>
                    {g.rivit.map((o) => {
                      const href = juhlaHref(o);
                      const rivi = <><span className="ju-t3-pvm">{lyhyt(o.alku)}</span><span>{o.nimi}</span></>;
                      return href
                        ? <a key={o.slug} className="ju-t3-rivi" href={href}>{rivi}</a>
                        : <span key={o.slug} className="ju-t3-rivi">{rivi}</span>;
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ─── Kaikki juhlavisat ─── */}
        {ryhmat.length > 0 && (
          <section className="ju-kaikki" aria-labelledby="ju-kaikki-h">
            <h2 className="ju-h2s" id="ju-kaikki-h">Kaikki juhlavisat</h2>
            <div className="ju-ryhmat">
              {ryhmat.map((g) => (
                <div key={g.id} id={g.id} className="ju-ryhma">
                  <div className="ju-ryhma-head">
                    <span className="ju-ryhma-nimi"><i style={{ background: g.accent }} />{g.label}</span>
                    <span className="ju-ryhma-pvm">{g.pvm}</span>
                  </div>
                  {g.visat.map((s) => (
                    <a key={s} className="ju-ryhma-rivi" href={visaHref(s)}>
                      <span>{nimi(s)}</span>
                      <span className="ju-ryhma-pelaa">Pelaa →</span>
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
