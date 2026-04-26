"use client";

import { useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — Etusivu
   Migraatio /Tietoniekka.com/index.html:stä Next.js App Router -sivuksi.
   v1: client component, hardcoded copy briefin osio 10 mukaan.
   Datafetch (Supabase) tulee myöhemmin — pidetään tämä yksinkertaisena.
   ───────────────────────────────────────────────────────────────── */

function daysUntil(targetDateStr: string): number {
  const target = new Date(targetDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HomePage() {
  // Päivämäärä, countdownit, scroll-reveal, sticky topbar, click feedback
  useEffect(() => {
    // 2. Pinnalla nyt -countdownit
    document.querySelectorAll<HTMLElement>(".event-card[data-target]").forEach((card) => {
      const target = card.dataset.target;
      if (!target) return;
      const days = daysUntil(target);
      const daysEl = card.querySelector(".days");
      const suffixEl = card.querySelector(".suffix");
      const countdownEl = card.querySelector(".event-countdown");
      if (days < 0) {
        if (countdownEl) countdownEl.innerHTML = '<span class="suffix">PÄÄTTYNYT</span>';
      } else if (days === 0) {
        card.classList.add("today");
        if (countdownEl) countdownEl.innerHTML = '<span class="countdown-pill">TÄNÄÄN!</span>';
      } else if (days <= 7) {
        if (daysEl) daysEl.textContent = String(days);
        if (suffixEl) suffixEl.textContent = days === 1 ? "PÄIVÄ" : "PÄIVÄÄ";
      } else {
        if (daysEl) daysEl.textContent = String(days);
        if (suffixEl) suffixEl.textContent = "PÄIVÄÄ";
      }
    });

    // 3. Scroll-reveal (Intersection Observer)
    const revealSelector = [
      ".section-header",
      ".section-subtitle",
      ".featured-quiz",
      ".pinnalla-strip",
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
          <p className="section-subtitle">Tuntuuko, että tänään kulkee?</p>
          <div className="featured-quiz" style={{ ["--quiz-tint" as string]: "rgba(26, 58, 69, 0.5)" } as React.CSSProperties}>
            <div className="quiz-progress">Kysymys 1 / 5</div>
            <h4 className="quiz-question">Mikä on Suomen pisin joki?</h4>
            <div className="quiz-options">
              <a className="quiz-option" href="peli.html?paivan_visa=1&first=A"><span className="badge">A</span> Tornionjoki</a>
              <a className="quiz-option" href="peli.html?paivan_visa=1&first=B"><span className="badge">B</span> Kemijoki</a>
              <a className="quiz-option" href="peli.html?paivan_visa=1&first=C"><span className="badge">C</span> Oulujoki</a>
              <a className="quiz-option" href="peli.html?paivan_visa=1&first=D"><span className="badge">D</span> Vantaanjoki</a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PINNALLA NYT */}
      <section className="pinnalla-nyt">
        <div className="container-wide">
          <h2 className="section-header">Mitä Suomi odottaa</h2>
          <p className="section-subtitle">virittäydy tunnelmaan teemavisalla</p>
        </div>
        <div className="container-wide">
          <div className="pinnalla-strip">
            <a className="event-card" href="peli.html?event=vappu" data-target="2026-05-01">
              <img src="/pinnalla_vappu.png" alt="Vappu" />
              <div className="event-name">Vappu</div>
              <div className="event-countdown">
                <span className="days">6</span>
                <span className="suffix">päivää</span>
              </div>
            </a>
            <a className="event-card" href="peli.html?event=jaakiekko_mm" data-target="2026-05-09">
              <img src="/pinnalla_jaakiekko_mm.png" alt="Jääkiekon MM-kisat" />
              <div className="event-name">Jääkiekko MM</div>
              <div className="event-countdown">
                <span className="days">14</span>
                <span className="suffix">päivää</span>
              </div>
            </a>
            <a className="event-card" href="peli.html?event=euroviisut" data-target="2026-05-16">
              <img src="/pinnalla_euroviisut.png" alt="Euroviisut" />
              <div className="event-name">Euroviisut</div>
              <div className="event-countdown">
                <span className="days">21</span>
                <span className="suffix">päivää</span>
              </div>
            </a>
          </div>
        </div>
        <div className="container-wide">
          <div className="featured-quiz" style={{ ["--quiz-tint" as string]: "rgba(31, 61, 46, 0.4)" } as React.CSSProperties}>
            <div className="quiz-header">
              <div>
                <h3>Teematrivia <span className="countdown">— 6 päivää!</span></h3>
                <p>Testaa ennen kuin olet nauttinut liikaa simaa!</p>
              </div>
            </div>
            <div className="quiz-progress">Kysymys 1 / 5</div>
            <h4 className="quiz-question">Mistä kaupungista suomalainen vappuperinne — haalarit ja lakki — sai alkunsa?</h4>
            <div className="quiz-options">
              <a className="quiz-option" href="peli.html?event=vappu&first=A"><span className="badge">A</span> Helsinki</a>
              <a className="quiz-option" href="peli.html?event=vappu&first=B"><span className="badge">B</span> Turku</a>
              <a className="quiz-option" href="peli.html?event=vappu&first=C"><span className="badge">C</span> Tampere</a>
              <a className="quiz-option" href="peli.html?event=vappu&first=D"><span className="badge">D</span> Jyväskylä</a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PÄIVÄN SANKARI — kuva + featured-quiz CTA (Heikki 2026-04-26) */}
      <section className="paivan-sankari">
        <div className="container-wide">
          <div className="sankari-card">
            <a href="sankari.html" className="sankari-photo">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=750&fit=crop&q=80" alt="Päivän sankari" />
              <div className="age-pill">🎂 Tänään 42 vuotta</div>
              <div className="sankari-overlay">
                <h3 className="sankari-name">IINA KUUSTONEN</h3>
                <p className="sankari-meta">Näyttelijä · Syntynyt 19.4.1984</p>
              </div>
              <span className="wiki-credit">📷 Wikipedia</span>
            </a>
            <div className="sankari-quiz-info">
              <span className="eyebrow">Tunne päivän sankari</span>
              <div className="quiz-progress">Kysymys 1 / 5</div>
              <h4 className="quiz-question">Kuinka vanha Iina Kuustonen täyttää tänään?</h4>
              <div className="quiz-options">
                <a className="quiz-option" href="peli.html?paivan_sankari=1&first=A"><span className="badge">A</span> 40</a>
                <a className="quiz-option" href="peli.html?paivan_sankari=1&first=B"><span className="badge">B</span> 42</a>
                <a className="quiz-option" href="peli.html?paivan_sankari=1&first=C"><span className="badge">C</span> 44</a>
                <a className="quiz-option" href="peli.html?paivan_sankari=1&first=D"><span className="badge">D</span> 46</a>
              </div>
              <a href="peli.html?paivan_sankari=1" className="btn btn-primary btn-large">PISTÄ TULEEN →</a>
            </div>
          </div>
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

      {/* 6. KATEGORIAT */}
      <section className="kategoriat">
        <div className="container-wide">
          <h2 className="section-header">Testaa tietosi eri aiheissa</h2>
          <p className="section-subtitle">mahtaakohan tietosi riittää? Kokeile nyt kuitenkin!</p>

          <article className="kategoria-inline-card" data-watermark="URHEILU" style={{ ["--kat-color" as string]: "var(--color-cat-urheilu)", ["--bg-image" as string]: "url(/urheilu_kuva.png)" } as React.CSSProperties}>
            <div className="kategoria-card-hero">
              <span className="eyebrow">— Kategoria</span>
              <h3>URHEILU</h3>
              <p>Jääkiekko, jalkapallo, yleisurheilu</p>
              <span className="badge-visat">18 visaa</span>
              <p className="description">Suomen urheilun huippuhetkistä ja suurista nimistä.</p>
            </div>
            <div className="kategoria-card-quiz">
              <div className="visa-title"><span>Näytätkin enemmän penkkiurheilijalta</span><span className="count">1 / 18</span></div>
              <div className="visa-progress">Kokeile · Kysymys 1 / 5</div>
              <h4 className="visa-question">Kuinka monta kertaa Suomi on voittanut jääkiekon MM-kultaa?</h4>
              <div className="visa-options">
                <a className="visa-option" href="peli.html?kat=urheilu&first=A"><span className="badge">A</span> 4</a>
                <a className="visa-option" href="peli.html?kat=urheilu&first=B"><span className="badge">B</span> 3</a>
                <a className="visa-option" href="peli.html?kat=urheilu&first=C"><span className="badge">C</span> 5</a>
                <a className="visa-option" href="peli.html?kat=urheilu&first=D"><span className="badge">D</span> 2</a>
              </div>
            </div>
          </article>

          <a href="#" className="kategoria-ad" aria-label="Mainos">
            <img src="/maantieto_ad.png" alt="" />
          </a>

          <article className="kategoria-inline-card" data-watermark="MAANTIETO" style={{ ["--kat-color" as string]: "var(--color-cat-maantieto)", ["--bg-image" as string]: "url(/maantieto_kuva.png)" } as React.CSSProperties}>
            <div className="kategoria-card-hero">
              <span className="eyebrow">— Kategoria</span>
              <h3>MAANTIETO</h3>
              <p>Suomi, Eurooppa, maailma</p>
              <span className="badge-visat">15 visaa</span>
              <p className="description">Paikat, pääkaupungit, vuoret ja virrat — kuinka hyvin tunnet maailman?</p>
            </div>
            <div className="kategoria-card-quiz">
              <div className="visa-title"><span>Ootko kiertänyt muutakin kuin tahkoa?</span><span className="count">1 / 15</span></div>
              <div className="visa-progress">Kokeile · Kysymys 1 / 10</div>
              <h4 className="visa-question">Mikä on Suomen suurin järvi?</h4>
              <div className="visa-options">
                <a className="visa-option" href="peli.html?kat=maantieto&first=A"><span className="badge">A</span> Päijänne</a>
                <a className="visa-option" href="peli.html?kat=maantieto&first=B"><span className="badge">B</span> Saimaa</a>
                <a className="visa-option" href="peli.html?kat=maantieto&first=C"><span className="badge">C</span> Inarijärvi</a>
                <a className="visa-option" href="peli.html?kat=maantieto&first=D"><span className="badge">D</span> Oulujärvi</a>
              </div>
            </div>
          </article>

          <article className="kategoria-inline-card" data-watermark="LUONTO" style={{ ["--kat-color" as string]: "var(--color-cat-luonto)", ["--bg-image" as string]: "url(/luonto_kuva.png)" } as React.CSSProperties}>
            <div className="kategoria-card-hero">
              <span className="eyebrow">— Kategoria</span>
              <h3>LUONTO</h3>
              <p>Suomen luonnon ihmeet ja eläimet</p>
              <span className="badge-visat">27 visaa</span>
              <p className="description">Testaa tietosi Suomen luonnosta, eläimistä ja upeista maisemista.</p>
            </div>
            <div className="kategoria-card-quiz">
              <div className="visa-title"><span>Mä tiedän, että susta löytyy eräjorma sisältä</span><span className="count">1 / 27</span></div>
              <div className="visa-progress">Kokeile · Kysymys 1 / 10</div>
              <h4 className="visa-question">Mikä on Suomen kansalliseläin?</h4>
              <div className="visa-options">
                <a className="visa-option" href="peli.html?kat=luonto&first=A"><span className="badge">A</span> Karhu</a>
                <a className="visa-option" href="peli.html?kat=luonto&first=B"><span className="badge">B</span> Ahma</a>
                <a className="visa-option" href="peli.html?kat=luonto&first=C"><span className="badge">C</span> Hirvi</a>
                <a className="visa-option" href="peli.html?kat=luonto&first=D"><span className="badge">D</span> Joutsen</a>
              </div>
            </div>
          </article>

          <article className="kategoria-inline-card" data-watermark="HISTORIA" style={{ ["--kat-color" as string]: "var(--color-cat-historia)", ["--bg-image" as string]: "url(/historia_kuva.png)" } as React.CSSProperties}>
            <div className="kategoria-card-hero">
              <span className="eyebrow">— Kategoria</span>
              <h3>HISTORIA</h3>
              <p>Suomi, maailma, henkilöt</p>
              <span className="badge-visat">22 visaa</span>
              <p className="description">Tapahtumat, jotka muokkasivat aikaansa — ja meidän tämän päivän.</p>
            </div>
            <div className="kategoria-card-quiz">
              <div className="visa-title"><span>Just ne kysymykset jolloin lintsasit koulussa</span><span className="count">1 / 22</span></div>
              <div className="visa-progress">Kokeile · Kysymys 1 / 12</div>
              <h4 className="visa-question">Minä vuonna Suomi itsenäistyi?</h4>
              <div className="visa-options">
                <a className="visa-option" href="peli.html?kat=historia&first=A"><span className="badge">A</span> 1906</a>
                <a className="visa-option" href="peli.html?kat=historia&first=B"><span className="badge">B</span> 1917</a>
                <a className="visa-option" href="peli.html?kat=historia&first=C"><span className="badge">C</span> 1918</a>
                <a className="visa-option" href="peli.html?kat=historia&first=D"><span className="badge">D</span> 1944</a>
              </div>
            </div>
          </article>

          <article className="kategoria-inline-card" data-watermark="TV-SARJAT" style={{ ["--kat-color" as string]: "var(--color-cat-tv-sarjat)", ["--bg-image" as string]: "url(/TV_kuva.png)" } as React.CSSProperties}>
            <div className="kategoria-card-hero">
              <span className="eyebrow">— Kategoria</span>
              <h3>TV-SARJAT</h3>
              <p>Klassikot, uutuudet, kulttisarjat</p>
              <span className="badge-visat">12 visaa</span>
              <p className="description">Tuntemiisi sarjoihin yllättäviä yksityiskohtia. Kuinka tarkkaan katsot?</p>
            </div>
            <div className="kategoria-card-quiz">
              <div className="visa-title"><span>Paljasta vaan, oot katsonut kaikki Metsolat</span><span className="count">1 / 12</span></div>
              <div className="visa-progress">Kokeile · Kysymys 1 / 8</div>
              <h4 className="visa-question">Mikä on Suomen pitkäikäisin kotimainen TV-sarja?</h4>
              <div className="visa-options">
                <a className="visa-option" href="peli.html?kat=tv-sarjat&first=A"><span className="badge">A</span> Salatut elämät</a>
                <a className="visa-option" href="peli.html?kat=tv-sarjat&first=B"><span className="badge">B</span> Kotikatu</a>
                <a className="visa-option" href="peli.html?kat=tv-sarjat&first=C"><span className="badge">C</span> Hovimäki</a>
                <a className="visa-option" href="peli.html?kat=tv-sarjat&first=D"><span className="badge">D</span> Reinikainen</a>
              </div>
            </div>
          </article>

          <article className="kategoria-inline-card" data-watermark="ELOKUVAT" style={{ ["--kat-color" as string]: "var(--color-cat-elokuvat)", ["--bg-image" as string]: "url(/elokuvat_kuva.png)" } as React.CSSProperties}>
            <div className="kategoria-card-hero">
              <span className="eyebrow">— Kategoria</span>
              <h3>ELOKUVAT</h3>
              <p>Kotimainen, Hollywood, Eurooppa</p>
              <span className="badge-visat">18 visaa</span>
              <p className="description">Klassikoista uusiin julkaisuihin — kuka teki ja milloin?</p>
            </div>
            <div className="kategoria-card-quiz">
              <div className="visa-title"><span>Ei ole sitten pelkkiä turhapuroja tarjolla</span><span className="count">1 / 18</span></div>
              <div className="visa-progress">Kokeile · Kysymys 1 / 10</div>
              <h4 className="visa-question">Kuka ohjasi Tuntemattoman sotilaan vuoden 2017 versiossa?</h4>
              <div className="visa-options">
                <a className="visa-option" href="peli.html?kat=elokuvat&first=A"><span className="badge">A</span> Aki Kaurismäki</a>
                <a className="visa-option" href="peli.html?kat=elokuvat&first=B"><span className="badge">B</span> Aku Louhimies</a>
                <a className="visa-option" href="peli.html?kat=elokuvat&first=C"><span className="badge">C</span> Klaus Härö</a>
                <a className="visa-option" href="peli.html?kat=elokuvat&first=D"><span className="badge">D</span> Jalmari Helander</a>
              </div>
            </div>
          </article>

          <article className="kategoria-inline-card" data-watermark="MUSIIKKI" style={{ ["--kat-color" as string]: "var(--color-cat-musiikki)", ["--bg-image" as string]: "url(/musiikki_kuva.png)" } as React.CSSProperties}>
            <div className="kategoria-card-hero">
              <span className="eyebrow">— Kategoria</span>
              <h3>MUSIIKKI</h3>
              <p>Hitit, klassikot, artistit</p>
              <span className="badge-visat">24 visaa</span>
              <p className="description">Suomalainen ja maailman musiikki. Kuka lauloi minkä ja milloin?</p>
            </div>
            <div className="kategoria-card-quiz">
              <div className="visa-title"><span>Ei taatusti yhtään sun playlistilta</span><span className="count">1 / 24</span></div>
              <div className="visa-progress">Kokeile · Kysymys 1 / 10</div>
              <h4 className="visa-question">Kuka voitti Eurovision Suomelle vuonna 2006?</h4>
              <div className="visa-options">
                <a className="visa-option" href="peli.html?kat=musiikki&first=A"><span className="badge">A</span> Lordi</a>
                <a className="visa-option" href="peli.html?kat=musiikki&first=B"><span className="badge">B</span> Krista Siegfrids</a>
                <a className="visa-option" href="peli.html?kat=musiikki&first=C"><span className="badge">C</span> Saara Aalto</a>
                <a className="visa-option" href="peli.html?kat=musiikki&first=D"><span className="badge">D</span> Pertti Kurikka</a>
              </div>
            </div>
          </article>

          <a href="#" className="kategoria-ad" aria-label="Mainos">
            <img src="/Ruokajajuoma_ad.png" alt="" />
          </a>

          <article className="kategoria-inline-card" data-watermark="RUOKA" style={{ ["--kat-color" as string]: "var(--color-cat-ruoka-juoma)", ["--bg-image" as string]: "url(/ruokajajuoma_kuva.png)" } as React.CSSProperties}>
            <div className="kategoria-card-hero">
              <span className="eyebrow">— Kategoria</span>
              <h3>RUOKA &amp; JUOMA</h3>
              <p>Ruokakulttuuri ja juomahistoria</p>
              <span className="badge-visat">14 visaa</span>
              <p className="description">Mitä syömme ja miksi — perinteistä ja uudesta keittiöstä.</p>
            </div>
            <div className="kategoria-card-quiz">
              <div className="visa-title"><span>Oot tässä varmasti parempi kuin keittiössä</span><span className="count">1 / 14</span></div>
              <div className="visa-progress">Kokeile · Kysymys 1 / 8</div>
              <h4 className="visa-question">Mikä on klassinen pääsiäisruoka Suomessa?</h4>
              <div className="visa-options">
                <a className="visa-option" href="peli.html?kat=ruoka-juoma&first=A"><span className="badge">A</span> Mämmi</a>
                <a className="visa-option" href="peli.html?kat=ruoka-juoma&first=B"><span className="badge">B</span> Karjalanpiirakka</a>
                <a className="visa-option" href="peli.html?kat=ruoka-juoma&first=C"><span className="badge">C</span> Mustamakkara</a>
                <a className="visa-option" href="peli.html?kat=ruoka-juoma&first=D"><span className="badge">D</span> Lanttulaatikko</a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* 7. TUNNISTA TÄMÄ */}
      <section className="tunnista-tama">
        <div className="container-wide">
          <div className="section-header-row">
            <h2 className="section-header">Tunnistatko kuvasta</h2>
            <a href="kuvavisat.html" className="see-all">Kaikki →</a>
          </div>
          <p className="section-subtitle">jospa kuvat olisi paremmin hallussa</p>

          <div className="kuvavisa-featured">
            <div className="quiz-header">
              <span className="emoji">🚩</span>
              <div>
                <h3>Tunnista maailman liput</h3>
                <p>50 kysymystä · pelaa minuutissa</p>
              </div>
            </div>
            <div className="flag-stage">
              <span className="flag-emoji">🇩🇰</span>
            </div>
            <div className="quiz-progress">Kysymys 1 / 50</div>
            <h4 className="quiz-question">Minkä maan lippu tämä on?</h4>
            <div className="quiz-options">
              <a className="quiz-option" href="peli.html?kuvavisa=liput&first=A"><span className="badge">A</span> Suomi</a>
              <a className="quiz-option" href="peli.html?kuvavisa=liput&first=B"><span className="badge">B</span> Ruotsi</a>
              <a className="quiz-option" href="peli.html?kuvavisa=liput&first=C"><span className="badge">C</span> Tanska</a>
              <a className="quiz-option" href="peli.html?kuvavisa=liput&first=D"><span className="badge">D</span> Norja</a>
            </div>
          </div>

          <div className="kuvavisa-grid">
            <a className="kuvavisa-card" href="peli.html?kuvavisa=paikkakunta">
              <div className="kuvavisa-emoji">🏘️</div>
              <span className="alaluokka-badge">Paikkakunta</span>
              <h3>Tunnista suomalainen paikkakunta kuvasta</h3>
              <p>10 kysymystä</p>
            </a>
            <a className="kuvavisa-card" href="peli.html?kuvavisa=logot">
              <div className="kuvavisa-emoji">🚜</div>
              <span className="alaluokka-badge">Logot</span>
              <h3>Tunnista traktori pelkästä logosta</h3>
              <p>15 kysymystä</p>
            </a>
            <a className="kuvavisa-card" href="peli.html?kuvavisa=vaakuna">
              <div className="kuvavisa-emoji">🛡️</div>
              <span className="alaluokka-badge">Vaakuna</span>
              <h3>Tunnista suomalainen kunnanvaakuna</h3>
              <p>20 kysymystä</p>
            </a>
          </div>
        </div>
      </section>

      {/* 8. ARVO SATUNNAINEN */}
      <section className="arvo-satunnainen">
        <div className="container-wide">
          <div className="arvo-card">
            <h2>Ei me kerrota kellekään</h2>
            <p>jos pelaat vielä lisää. 50+ visaa odottaa, noppa päättää.</p>
            <a href="peli.html?random=1" className="btn btn-primary btn-large">ANNA MENNÄ NYT VAAN →</a>
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
