// TIETONIEKKA 2.0 — MEGAVISAT-LANDING (CD:n design 13.8.2026,
// design_handoff_megavisat: hero "Pitkä peli" + juliste + juontajanostot →
// pituusvalinta 20/50/100 → aihekorttiruudukko → Näin mega toimii).
// Heikki lukitsi 14.8.2026: kaikki aihekortit näkyvät heti; Aloita vain
// aiheissa joihin mega on koottu adminissa, muut himmennettyinä (kasvukoukku
// — korttia ei piiloteta eikä lukita, CD:n sääntö). Pituus on sivun tila
// URL-parametrissa (?pituus=50) — toteutettu server-linkeillä kuten muutkin
// 2.0-suodattimet (koodikannan käytäntö voittaa prototyypin toteutustavan).
// Suodattimista mukana Kaikki + Uudet; Suosituimmat aktivoituu kun pelidataa
// on, Kesken jääneet vaatii kirjautumisen (3.0) — sama periaate kuin
// hubien Suosituimmat-riveissä.
// TODO (työjärjestys kohta 9): megat ovat draftina — näkyvät 2.0-previewssä
// tarkoituksella; hallittu julkaisu tehdään 2.0-launchissa.

import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import {
  MEGA_TOPICS, MEGA_NOSTOT, MEGA_LENGTHS, MEGA_POSTER, MEGA_HERO_CTA_SLUG,
  type MegaLength,
} from "@/lib/megavisat";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Megavisat — 20, 50 ja 100 kysymyksen visat | Tietoniekka";
  const description =
    "Megavisa on yksi istunto ilman taukoja: valitse aihe, valitse pituus ja pelaa loppuun. Ei selityksiä — vain pisteet ja putki.";
  const canonical = `${SITE_URL}/2-0/megavisat`;
  return {
    title, description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: canonical, title, description },
  };
}

type MegaRow = { id: string; slug: string | null; title: string; teaser: string | null; created_at: string | null };

const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // sama 7 pv sääntö kuin UUSI-badge

export default async function MegavisatLanding({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawPituus = typeof sp.pituus === "string" ? parseInt(sp.pituus, 10) : 50;
  const pituus: MegaLength = (MEGA_LENGTHS as number[]).includes(rawPituus) ? (rawPituus as MegaLength) : 50;
  const suodata = sp.suodata === "uudet" ? "uudet" : "kaikki";

  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const { data } = await sb
    .from("quizzes" as never)
    .select("id, slug, title, teaser, created_at")
    .eq("game_mode" as unknown as "status", "mega");
  const megas = new Map<string, MegaRow>();
  for (const m of (data ?? []) as unknown as MegaRow[]) if (m.slug) megas.set(m.slug, m);

  const isNewMega = (slug: string | undefined) => {
    const m = slug ? megas.get(slug) : undefined;
    return !!m?.created_at && Date.now() - new Date(m.created_at).getTime() < NEW_WINDOW_MS;
  };

  // Aiheen tila valitulla pituudella
  const topicState = MEGA_TOPICS.map((t) => {
    const slug = t.megaSlugs[pituus];
    const playable = !!(slug && megas.has(slug));
    // Kasvukoukku: jos valittu pituus puuttuu mutta jokin toinen on koottu
    const altLength = MEGA_LENGTHS.find((l) => l !== pituus && t.megaSlugs[l] && megas.has(t.megaSlugs[l]!));
    const anyNew = MEGA_LENGTHS.some((l) => isNewMega(t.megaSlugs[l]));
    return { t, slug, playable, altLength, anyNew };
  }).filter((s) => suodata !== "uudet" || s.anyNew);

  const availableCount = topicState.filter((s) => s.playable).length;
  const totalMegas = megas.size;

  const heroCta = megas.get(MEGA_HERO_CTA_SLUG);
  const nostot = MEGA_NOSTOT.filter((n) => megas.has(n.megaSlug));
  const gridHref = (p: number, f: string) =>
    `/2-0/megavisat?pituus=${p}${f === "uudet" ? "&suodata=uudet" : ""}#megat`;

  return (
    <main className="tnm" style={{ minHeight: "100dvh" }}>
      {/* ─── Hero: Pitkä peli + juliste (sädeviuhka) ─── */}
      <section className="tnm-herowrap">
        <div className="tn-shell tnm-hero">
          <div className="tnm-hero-left">
            <nav className="tnm-crumb">
              <a href="/2-0#pelimuodot">Pelimuodot</a>
              {" / "}
              <span>Megavisat</span>
            </nav>
            <span className="tnm-badge">Megavisat</span>
            <h1 className="tnm-h1">Pitkä<br />peli</h1>
            <div className="tnm-h1sub">20 · 50 · 100 kysymystä</div>
            <p className="tnm-lede">
              Megavisa on yksi istunto ilman taukoja: valitse aihe, valitse pituus ja pelaa
              loppuun. <b>Ei selityksiä</b> — vain pisteet ja putki.
            </p>

            {nostot.length > 0 && (
              <>
                <div className="tnm-hostrow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/20/megavisat/host-laura.webp" alt="Juontaja Laura" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/20/megavisat/host-mikko.webp" alt="Juontaja Mikko" />
                  <div>
                    <div className="tnm-hostrow-title">Lauran ja Mikon valinnat</div>
                    <div className="tnm-hostrow-sub">Kolme megaa, jotka juontajat pelaavat itse</div>
                  </div>
                </div>
                <div className="tnm-nostot">
                  {nostot.map((no) => {
                    const m = megas.get(no.megaSlug)!;
                    return (
                      <a key={no.megaSlug} className="tnm-nosto" href={`/2-0/peli?mega=${no.megaSlug}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={no.img} alt="" loading="lazy" />
                        <span className="tnm-nosto-body">
                          <span className="tnm-nosto-attr">{no.attribution}</span>
                          <span className="tnm-nosto-title">{m.title}</span>
                          <span className="tnm-nosto-quote">{no.quote}</span>
                        </span>
                        <span className="tnm-nosto-num">
                          {no.length}
                          <small>~{Math.round((no.length * 24) / 60)} min</small>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="tnm-hero-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="tnm-poster" src={MEGA_POSTER} alt="Megavisan juliste" fetchPriority="high" />
            {heroCta && (
              <a className="tnm-cta" href={`/2-0/peli?mega=${MEGA_HERO_CTA_SLUG}`}>
                Aloita suuri mega 50 →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ─── Aiheen mega: pituus + suodatin + ruudukko ─── */}
      <section className="tn-shell tnm-section" id="megat">
        <div className="tnm-gridhead">
          <div>
            <h2 className="tnm-h2">Kaikki megavisat</h2>
            <p className="tnm-gridnote">
              {availableCount} aihetta tarjoaa juuri nyt mega {pituus} -kierroksen · {totalMegas} megaa yhteensä
            </p>
          </div>
          <div className="tnm-controls">
            <span className="tnm-ctrl-label">Pituus</span>
            {MEGA_LENGTHS.map((l) => (
              <a key={l} className="tnm-pill" data-tone="gold" data-active={l === pituus || undefined} href={gridHref(l, suodata)}>
                {l}
              </a>
            ))}
            <span className="tnm-ctrl-sep" aria-hidden="true" />
            <a className="tnm-pill" data-active={suodata === "kaikki" || undefined} href={gridHref(pituus, "kaikki")}>Kaikki</a>
            <a className="tnm-pill" data-active={suodata === "uudet" || undefined} href={gridHref(pituus, "uudet")}>Uudet</a>
          </div>
        </div>

        {topicState.length === 0 ? (
          <div className="tn-empty">Ei uusia megoja juuri nyt — katso kaikki aiheet.</div>
        ) : (
          <div className="tnm-grid">
            {topicState.map(({ t, slug, playable, altLength }) => {
              const inner = (
                <>
                  <span className="tnm-card-top">
                    <span className="tnm-card-tag">
                      <i style={{ background: t.tagColor }} />
                      {t.tag}
                    </span>
                    <span className="tnm-card-row">
                      <span className="tnm-card-title">{t.title}</span>
                      <span className="tnm-card-num">{pituus}</span>
                    </span>
                  </span>
                  <span className="tnm-card-desc">{t.desc}</span>
                  <span className="tnm-card-foot">
                    {playable ? (
                      <span className="tnm-card-cta">Aloita →</span>
                    ) : altLength ? (
                      <span className="tnm-card-cta" data-dim>Pelaa mega {altLength} →</span>
                    ) : (
                      <span className="tnm-card-cta" data-dim>Tulossa</span>
                    )}
                  </span>
                </>
              );
              if (playable) {
                return (
                  <a key={t.key} className="tnm-card" href={`/2-0/peli?mega=${slug}`}>{inner}</a>
                );
              }
              if (altLength) {
                return (
                  <a key={t.key} className="tnm-card" data-dim href={`/2-0/peli?mega=${t.megaSlugs[altLength]}`}>{inner}</a>
                );
              }
              return (
                <div key={t.key} className="tnm-card" data-dim>{inner}</div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Näin mega toimii ─── */}
      <section className="tn-shell tnm-section">
        <h2 className="tnm-h2">Näin mega toimii</h2>
        <div className="tnm-rules">
          {[
            { n: 1, t: "Valitse pituus", d: "20 kysymystä kahvitauolle, 50 illan pelisessioon, 100 kun haluat todistaa jotain." },
            { n: 2, t: "Yksi istunto, ei taukoja", d: "Mega ei tallenna välitilaa. Poistuminen kesken päättää kierroksen." },
            { n: 3, t: "Putki ratkaisee sijoituksen", d: "Peräkkäiset oikeat kertovat pisteet. Yksi väärä nollaa kertoimen." },
          ].map((r) => (
            <div key={r.n} className="tnm-rule">
              <span className="tnm-rule-num">{r.n}</span>
              <span>
                <b>{r.t}</b>
                <p>{r.d}</p>
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="tnm-footer">
        <div className="tn-shell">
          <span>© 2026 Tietoniekka</span>
          <a href="/2-0">Etusivu</a>
        </div>
      </footer>
    </main>
  );
}
