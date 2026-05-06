"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — Etusivu
   Migraatio /Tietoniekka.com/index.html:stä Next.js App Router -sivuksi.
   v1: client component, hardcoded copy briefin osio 10 mukaan.
   Datafetch (Supabase) tulee myöhemmin — pidetään tämä yksinkertaisena.
   ───────────────────────────────────────────────────────────────── */

import type { SankariData, QuizMeta } from "../lib/queries";
import { CATEGORIES, CATEGORY_BY_SLUG } from "../lib/categories";

type CategoryQuizMap = Record<string, QuizMeta | null>;

export type HomeClientProps = {
  todaysCelebrity: SankariData | null;
  todaysQuiz: QuizMeta | null;
  categoryQuizzes: CategoryQuizMap;
};

export function HomeClient({
  todaysCelebrity,
  todaysQuiz,
  categoryQuizzes
}: HomeClientProps) {
  const [todaysDateLabel, setTodaysDateLabel] = useState<string>("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("fi-FI", { weekday: "long", day: "numeric", month: "numeric" });
    const parts = fmt.formatToParts(new Date());
    const wd = (parts.find((p) => p.type === "weekday")?.value ?? "").trim();
    const d  = (parts.find((p) => p.type === "day")?.value ?? "").trim();
    const mo = (parts.find((p) => p.type === "month")?.value ?? "").trim();
    if (wd && d && mo) {
      setTodaysDateLabel(`${wd[0].toUpperCase()}${wd.slice(1)} ${d}.${mo}.`);
    }
  }, []);

  // Scroll-reveal, sticky topbar, click feedback
  useEffect(() => {
    // 3. Scroll-reveal (Intersection Observer)
    const revealSelector = [
      ".section-header",
      ".section-subtitle",
      ".featured-quiz",
      ".kategoria-inline-card",
      ".sankari-card",
      ".kuvavisa-featured",
      ".kuvavisa-card",
      ".arvo-card",
      ".mid-promo .promo-content",
    ].join(", ");
    const revealTargets = document.querySelectorAll<HTMLElement>(revealSelector);
    revealTargets.forEach((el) => el.classList.add("reveal"));

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
      revealTargets.forEach((el) => observer?.observe(el));
    } else {
      revealTargets.forEach((el) => el.classList.add("is-visible"));
    }

    // 4. Sticky topbar — body.is-scrolled kun scroll > 30 px
    let ticking = false;
    const updateScroll = () => {
      document.body.classList.toggle("is-scrolled", window.scrollY > 30);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();

    // 5. Quiz-vaihtoehtojen klikkauspalaute (kultaflashi 220 ms)
    const onOptionClick = (e: Event) => {
      const me = e as MouseEvent;
      if (me.metaKey || me.ctrlKey || me.shiftKey || me.button !== 0) return;
      const option = e.currentTarget as HTMLAnchorElement;
      const href = option.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      const parent = option.closest(".quiz-options, .visa-options");
      if (parent) {
        parent.querySelectorAll(".is-clicked").forEach((el) => el.classList.remove("is-clicked"));
      }
      option.classList.add("is-clicked");
      setTimeout(() => {
        window.location.href = href;
      }, 220);
    };
    const options = document.querySelectorAll<HTMLAnchorElement>(".quiz-option, .visa-option");
    options.forEach((o) => o.addEventListener("click", onOptionClick));

    // Cleanup
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
      options.forEach((o) => o.removeEventListener("click", onOptionClick));
    };
  }, []);

  return (
    <main>
      {/* Topbar — sticky, hero-elementistä ulos */}
      <header className="topbar">
        <div className="logo">
          <div className="name">
            <span className="tieto">TIETO</span>
            <span className="niekka">NIEKKA</span>
          </div>
          <span className="tagline">Testaa tietosi</span>
        </div>
      </header>

      {/* 1. HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="section-label with-dash">Testaa tietosi</span>
            <h1 className="hero-title">
              <span className="tieto-line">TIETO</span>
              <span className="niekka-line">NIEKKA</span>
            </h1>
            <p className="hero-subtitle">
              Naapurisi sai 4/5 — kyllä kai sinä hänet voitat?
            </p>
            <a href="#paivan-visa" className="btn btn-primary btn-large hero-cta">
              OTETAAN SELVÄÄ →
            </a>
          </div>
          <div className="hero-image">
            <img src="/Header5.png" alt="Tietoniekan juontajat" />
          </div>
        </div>
        <div className="hero-strip">
          <span className="pulse">NYT</span> Eiköhän jo pelata?
        </div>
      </section>

      {/* 2. PÄIVÄN VISA */}
      <section className="paivan-visa" id="paivan-visa">
        <div className="container-wide">
          <h2 className="section-header">Päivän visa</h2>
          <p className="section-subtitle">{todaysDateLabel && (<span style={{ color: "var(--color-gold)", fontWeight: 700, marginRight: 8 }}>{todaysDateLabel}</span>)}Tuntuuko, että tänään kulkee?</p>
          {todaysQuiz ? (() => {
            const cat = CATEGORY_BY_SLUG[todaysQuiz.category] ?? null;
            const bgImage = cat?.imageUrl ?? null;
            const katColor = cat?.colorVar ?? "var(--color-surface-card-dark)";
            return (
              <Link
                href={`/peli?paivan_visa=1&quiz_id=${todaysQuiz.id}`}
                className="featured-quiz paivan-visa-card"
                data-watermark={cat?.badge ?? ""}
                style={{
                  ["--quiz-tint" as string]: "rgba(15, 21, 32, 0.55)",
                  ["--kat-color" as string]: katColor,
                  ...(bgImage ? { ["--bg-image" as string]: `url(${bgImage})` } : {}),
                  textDecoration: "none",
                  display: "block",
                } as React.CSSProperties}
              >
                {cat && <span className="paivan-visa-eyebrow">— {cat.badge}</span>}
                <h4 className="quiz-question" style={{ marginBottom: "12px" }}>{todaysQuiz.title}</h4>
                {todaysQuiz.description && (
                  <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: "16px" }}>{todaysQuiz.description}</p>
                )}
                <span className="btn btn-primary btn-large" style={{ display: "inline-block" }}>PELAA NYT →</span>
              </Link>
            );
          })() : (
            <div className="featured-quiz" style={{ ["--quiz-tint" as string]: "rgba(26, 58, 69, 0.5)" } as React.CSSProperties}>
              <p style={{ color: "rgba(255,255,255,0.7)" }}>Päivän visaa ei ole vielä asetettu — kokeile kategoriavisaa!</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. PÄIVÄN SANKARI — kuva + featured-quiz CTA (Heikki 2026-04-26) */}
      <section className="paivan-sankari" id="paivan-sankari">
        <div className="container-wide">
          <h2 className="section-header">Päivän sankari</h2>
          <p className="section-subtitle">{todaysCelebrity ? `Tänään juhlitaan — tunnetko hänet?` : "Pieni hengähdys, ei sankaria tänään."}</p>
          {todaysCelebrity ? (() => {
            const today = new Date();
            const b = new Date(todaysCelebrity.birth_date);
            const age = today.getFullYear() - b.getFullYear();
            const sankariSlug = todaysCelebrity.slug ?? todaysCelebrity.id;
            const peliHref = `/peli?paivan_sankari=1${todaysCelebrity.trivia_quiz_id ? `&quiz_id=${todaysCelebrity.trivia_quiz_id}` : ""}`;
            return (
              <div className="sankari-card">
                <Link href={`/sankari/${sankariSlug}`} className="sankari-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={todaysCelebrity.image_url ?? `https://placehold.co/600x750/1a3a45/e8a320?text=${encodeURIComponent(todaysCelebrity.name)}`} alt={todaysCelebrity.name} />
                  <div className="age-pill">🎂 Tänään {age} vuotta</div>
                  <div className="sankari-overlay">
                    <h3 className="sankari-name">{todaysCelebrity.name.toUpperCase()}</h3>
                    <p className="sankari-meta">{todaysCelebrity.role} · Syntynyt {b.getDate()}.{b.getMonth() + 1}.{b.getFullYear()}</p>
                  </div>
                  {todaysCelebrity.wikipedia_url && <span className="wiki-credit">📷 Wikipedia</span>}
                </Link>
                {todaysCelebrity.trivia_quiz_id && (
                  <div className="sankari-quiz-info">
                    <span className="eyebrow">Tunne päivän sankari</span>
                    <a href={peliHref} className="btn btn-primary btn-large">PISTÄ TULEEN →</a>
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="sankari-card" style={{ padding: "var(--space-xl)" }}>
              <p className="sankari-meta" style={{ color: "var(--color-text-muted-light)", textAlign: "center" }}>
                Ei sankaria tänään — pelaa muita visoja!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. MID-PROMO */}
      <section className="mid-promo">
        <div className="promo-image">
          <img src="/Header1.png" alt="" />
        </div>
        <div className="promo-content">
          <h2>
            <span>Kyllä kansa tietää,</span><br />
            <span>sanoi Veikko aikanaan.</span><br />
            <span>Olikohan <span className="gold">oikeassa?</span></span>
          </h2>
        </div>
      </section>

      {/* 6. KATEGORIAT — silmukka CATEGORIES + categoryQuizzes (random per kategoria, päivittyy 1 h välein) */}
      <section className="kategoriat" id="kategoriat">
        <div className="container-wide">
          <h2 className="section-header">Testaa tietosi eri aiheissa</h2>
          <p className="section-subtitle">mahtaakohan tietosi riittää? Kokeile nyt kuitenkin!</p>

          {CATEGORIES.map((cat, idx) => {
            const quiz = categoryQuizzes[cat.slug];
            const peliHref = quiz ? `/peli?kat=${cat.slug}&quiz_id=${quiz.id}` : `/peli?kat=${cat.slug}`;
            return (
              <Fragment key={cat.slug}>
                {idx === 1 && (
                  <a href="#" className="kategoria-ad" aria-label="Mainos">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/maantieto_ad.png" alt="" />
                  </a>
                )}
                {idx === 7 && (
                  <a href="#" className="kategoria-ad" aria-label="Mainos">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Ruokajajuoma_ad.png" alt="" />
                  </a>
                )}
                <article
                  className="kategoria-inline-card"
                  data-watermark={cat.badge}
                  style={{
                    ["--kat-color" as string]: cat.colorVar,
                    ["--bg-image" as string]: `url(${cat.imageUrl})`,
                  } as React.CSSProperties}
                >
                  <Link href={`/kategoria/${cat.slug}`} className="kategoria-card-hero kategoria-card-hero-link">
                    <span className="eyebrow">— Kategoria</span>
                    <h3>{cat.title}</h3>
                    <p>{cat.description}</p>
                    <p className="description">{cat.intro}</p>
                  </Link>
                  {quiz ? (
                    <Link href={peliHref} className="kategoria-card-quiz kategoria-card-quiz-link">
                      <div className="visa-title">
                        <span>{quiz.title}</span>
                      </div>
                      {quiz.description && (
                        <p className="visa-question" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.35 }}>
                          {quiz.description}
                        </p>
                      )}
                      <span className="btn btn-primary btn-large" style={{ display: "inline-block", marginTop: "var(--space-md)" }}>
                        PELAA NYT →
                      </span>
                    </Link>
                  ) : (
                    <div className="kategoria-card-quiz">
                      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>
                        Kategoriavisa tulossa pian — tutustu kategoriaan yläosan otsikosta.
                      </p>
                    </div>
                  )}
                </article>
              </Fragment>
            );
          })}
        </div>
      </section>

      {/* 7. TUNNISTA TÄMÄ — kuvavisat (5 kategoriaa) */}
      <section className="tunnista-tama" id="tunnista-tama">
        <div className="container-wide">
          <h2 className="section-header">Tunnistatko kuvasta</h2>
          <p className="section-subtitle">jospa kuvat olisi paremmin hallussa</p>

          <article className="kategoria-inline-card kuvavisa-cta-card" data-watermark="LIPUT" style={{ ["--kat-color" as string]: "var(--color-cat-maantieto)", ["--bg-image" as string]: "url(/liput_kuva.png)" } as React.CSSProperties}>
            <Link href="/peli?kuvavisa=liput" className="kategoria-card-hero kategoria-card-hero-link">
              <span className="eyebrow">— Kuvavisa</span>
              <h3>LIPPUVISA</h3>
              <p>Maailman liput</p>
              <p className="description">Tunnista kuvan lippu — pelaa minuutissa.</p>
              <span className="btn btn-primary btn-large kuvavisa-cta-btn">PELAA NYT →</span>
            </Link>
          </article>

          <article className="kategoria-inline-card kuvavisa-cta-card" data-watermark="VAAKUNAT" style={{ ["--kat-color" as string]: "var(--color-cat-historia)", ["--bg-image" as string]: "url(/vaakunat_kuva.png)" } as React.CSSProperties}>
            <Link href="/peli?kuvavisa=vaakuna" className="kategoria-card-hero kategoria-card-hero-link">
              <span className="eyebrow">— Kuvavisa</span>
              <h3>VAAKUNAT</h3>
              <p>Suomen kunnat</p>
              <p className="description">Tunnista maakuntavaakuna — Pohjois-Karjalasta Lounais-Suomeen.</p>
              <span className="btn btn-primary btn-large kuvavisa-cta-btn">PELAA NYT →</span>
            </Link>
          </article>

          <article className="kategoria-inline-card kuvavisa-cta-card" data-watermark="LINNUT" style={{ ["--kat-color" as string]: "var(--color-cat-luonto)", ["--bg-image" as string]: "url(/linnut_kuva.png)" } as React.CSSProperties}>
            <Link href="/peli?kuvavisa=linnut" className="kategoria-card-hero kategoria-card-hero-link">
              <span className="eyebrow">— Kuvavisa</span>
              <h3>LINNUT</h3>
              <p>Suomen siivekkäät</p>
              <p className="description">Tunnista lintu kuvasta — eihän tämä ole varis sittenkään.</p>
              <span className="btn btn-primary btn-large kuvavisa-cta-btn">PELAA NYT →</span>
            </Link>
          </article>

          <article className="kategoria-inline-card kuvavisa-cta-card" data-watermark="KASVIT" style={{ ["--kat-color" as string]: "var(--color-cat-luonto)", ["--bg-image" as string]: "url(/kasvit_kuva.png)" } as React.CSSProperties}>
            <Link href="/peli?kuvavisa=kasvit" className="kategoria-card-hero kategoria-card-hero-link">
              <span className="eyebrow">— Kuvavisa</span>
              <h3>KASVIT</h3>
              <p>Suomen kasvio</p>
              <p className="description">Tunnista kasvi kuvasta — niittypursusta nokkoseen.</p>
              <span className="btn btn-primary btn-large kuvavisa-cta-btn">PELAA NYT →</span>
            </Link>
          </article>

          <article className="kategoria-inline-card kuvavisa-cta-card" data-watermark="ELÄIMET" style={{ ["--kat-color" as string]: "var(--color-cat-luonto)", ["--bg-image" as string]: "url(/elaimet_kuva.png)" } as React.CSSProperties}>
            <Link href="/peli?kuvavisa=elaimet" className="kategoria-card-hero kategoria-card-hero-link">
              <span className="eyebrow">— Kuvavisa</span>
              <h3>ELÄIMET</h3>
              <p>Pohjolan luonto</p>
              <p className="description">Tunnista eläin kuvasta — karhuista kärppiin.</p>
              <span className="btn btn-primary btn-large kuvavisa-cta-btn">PELAA NYT →</span>
            </Link>
          </article>
        </div>
      </section>

      {/* 8. ARVO SATUNNAINEN */}
      <section className="arvo-satunnainen" id="arvo-satunnainen">
        <div className="container-wide">
          <div className="arvo-card">
            <h2>Ei me kerrota kellekään</h2>
            <p>jos pelaat vielä lisää. 50+ visaa odottaa, noppa päättää.</p>
            <a href="/peli?random=1" className="btn btn-primary btn-large">ANNA MENNÄ NYT VAAN →</a>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="footer">
        <div className="footer-logo">TIETONIEKKA</div>
        <p className="footer-meta">
          © 2026 Tietoniekka.com ·{" "}
          <a href="/tietosuoja">Tietosuoja</a> ·{" "}
          <a href="/yhteystiedot">Yhteystiedot</a>
        </p>
        <p className="footer-meta" style={{ marginTop: "8px", opacity: 0.7 }}>
          Tietoniekka — ei menny kuin Strömsössä! Mutta huomenna uudestaan!
        </p>
      </footer>
    </main>
  );
}
