"use client";
// TIETONIEKKA 2.0 — NAVIGAATIOJÄRJESTELMÄ (CD:n Navigaatiokonsepti, lukittu 17.8.2026).
// Kaksi valikkoa: Kokoelmat ("mistä aiheesta") + Pelimuodot ("miten pelataan").
// - Palkki 72 → 54 px kun scrollY > 48 px (160 ms ease-out; prefers-reduced-motion
//   poistaa animaation, korkeus vaihtuu silti).
// - Etusivulla palkki kelluu läpikuultavana heron päällä (ei spaceria); alasivuilla
//   umpinainen tausta + alaraja + 72 px:n spacer, jottei sisältö hypähdä.
// - Valikot aukeavat klikistä tai Enteristä — EI hoverista. Esc, uusi klikkaus
//   painikkeeseen tai klikkaus ulkopuolelle sulkee; fokus palaa avanneeseen
//   painikkeeseen. Nuolinäppäimet liikkuvat valikon riveillä (eivät vieritä sivua).
// - Heikin katselmus 17.8.: valikoissa EI selitetekstejä (footnotet), EI
//   visamääriä eikä erillistä Sulje-nappia — valikko on pelkkä linkkilista.
// - Aktiivinen sijainti: lihavointi + 3 px lime-alleviivaus + aria-current="page".
//   Etusivulla mikään kohta ei ole aktiivinen. Kuvavisat-hub lasketaan Pelimuodoksi
//   (Heikki 17.8.: lippuvisat yms. ovat Kuvavisoja — eri navigaatio kuin kokoelmilla).
// - Mobiili (<760 px): yksi 56 px:n palkki + Selaa-alapaneeli (Pelimuodot ja
//   Kokoelmat ryhminä, kosketuskohteet ≥48 px, sulku kahvasta/X:stä/Escistä/taustasta).
// - 🔥 Putki -pilleri lukee samaa localStorage-avainta kuin PutkiCard
//   (tn_paivan_visa_putki: putki elossa jos viimeisin peli tänään tai eilen).
// - Piilossa pelinäkymässä (/2-0/peli) — pelikuoren omat logosäännöt (lukittu 1.8.2026).
// - Ei Tänään-kohtaa, ei Klassista, ei hakua eikä tiliä (CD:n säännöt).
//   Kaikki linkit vievät todellisille sivuille — ei etusivun ankkureihin.
import "./topbar.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_COLLECTIONS, NAV_MODES, hubHref } from "@/lib/nav";

type MenuId = "kokoelmat" | "pelimuodot";

function readPutkiCount(): number {
  try {
    const d = (n: Date) =>
      `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    const raw = window.localStorage.getItem("tn_paivan_visa_putki");
    if (!raw) return 0;
    const { count, last } = JSON.parse(raw) as { count: number; last: string };
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return last === d(today) || last === d(yesterday) ? count : 0;
  } catch {
    return 0;
  }
}

export default function TopBar() {
  const pathname = usePathname() ?? "";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<MenuId | null>(null);
  const [sheet, setSheet] = useState(false);
  const [putki, setPutki] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const kokoelmatBtn = useRef<HTMLButtonElement>(null);
  const pelimuodotBtn = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Palkin madallus: kynnys 48 px vieritystä */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setPutki(readPutkiCount()), []);

  /* Sulje valikko: klikkaus ulkopuolelle */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  /* Avautuessa fokus valikon ensimmäiseen riviin (CD: Enter avaa ja siirtää fokuksen) */
  useEffect(() => {
    if (open && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>("a, button");
      first?.focus();
    }
  }, [open]);

  /* Selaa-paneeli: lukitse taustan vieritys */
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  const closeMenu = useCallback(
    (refocus = true) => {
      const btn = open === "kokoelmat" ? kokoelmatBtn.current : pelimuodotBtn.current;
      setOpen(null);
      if (refocus) btn?.focus();
    },
    [open],
  );

  /* Esc sulkee valikon ja paneelin */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sheet) setSheet(false);
      else if (open) closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, sheet, closeMenu]);

  /* Pelinäkymä on headeriton (pelikuoren logosäännöt, lukittu 1.8.2026) */
  if (pathname.startsWith("/2-0/peli")) return null;

  const home = pathname === "/2-0" || pathname === "/2-0/";
  const isKuvavisat = pathname.startsWith("/2-0/kokoelma/kuvavisat");
  const activeKokoelmat =
    (pathname.startsWith("/2-0/kokoelma") && !isKuvavisat) || pathname.startsWith("/2-0/kokoelmat");
  const activePelimuodot = pathname.startsWith("/2-0/megavisat") || isKuvavisat;

  /* Nuolinäppäimet valikon riveillä — eivät vieritä sivua */
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? Math.min(i + 1, items.length - 1) : Math.max(i - 1, 0);
    items[next]?.focus();
  };

  const toggle = (id: MenuId) => setOpen((cur) => (cur === id ? null : id));

  return (
    <div
      ref={rootRef}
      className="tn-nav-root"
      data-variant={home ? "home" : "page"}
      data-scrolled={scrolled ? "" : undefined}
    >
      <header className="tn-topbar">
        <div className="tn-topbar-in">
          <a className="tn-logo" href="/2-0">
            <b>TIETO</b>
            <span>NIEKKA</span>
          </a>

          {/* Työpöytävalikot */}
          <nav className="tn-topnav" aria-label="Päävalikko">
            <div className="tn-topnav-item">
              <button
                ref={kokoelmatBtn}
                type="button"
                className={activeKokoelmat ? "tn-topnav-btn tn-active" : "tn-topnav-btn"}
                aria-expanded={open === "kokoelmat"}
                aria-current={activeKokoelmat ? "page" : undefined}
                onClick={() => toggle("kokoelmat")}
              >
                Kokoelmat <span className="tn-caret" aria-hidden />
              </button>
              {open === "kokoelmat" && (
                <div ref={menuRef} className="tn-menu tn-menu-kokoelmat" onKeyDown={onMenuKeyDown}>
                  <a className="tn-menu-all" href="/2-0/kokoelmat" onClick={() => closeMenu(false)}>
                    Kaikki kokoelmat <span aria-hidden>→</span>
                  </a>
                  <div className="tn-menu-grid">
                    {NAV_COLLECTIONS.map((c) => (
                      <a
                        key={c.slug}
                        className="tn-menu-row"
                        href={hubHref(c.slug)}
                        style={{ "--dot": c.color } as React.CSSProperties}
                        onClick={() => closeMenu(false)}
                      >
                        <span className="tn-menu-dot" aria-hidden />
                        <span className="tn-menu-label">{c.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="tn-topnav-item">
              <button
                ref={pelimuodotBtn}
                type="button"
                className={activePelimuodot ? "tn-topnav-btn tn-active" : "tn-topnav-btn"}
                aria-expanded={open === "pelimuodot"}
                aria-current={activePelimuodot ? "page" : undefined}
                onClick={() => toggle("pelimuodot")}
              >
                Pelimuodot <span className="tn-caret" aria-hidden />
              </button>
              {open === "pelimuodot" && (
                <div ref={menuRef} className="tn-menu tn-menu-pelimuodot" onKeyDown={onMenuKeyDown}>
                  {NAV_MODES.map((m) => (
                    <a
                      key={m.href}
                      className="tn-menu-row tn-menu-mode"
                      href={m.href}
                      style={{ "--dot": m.color } as React.CSSProperties}
                      onClick={() => closeMenu(false)}
                    >
                      <span className="tn-menu-dot" aria-hidden />
                      <span className="tn-menu-modetext">
                        <span className="tn-menu-label">{m.label}</span>
                        <span className="tn-menu-desc">{m.desc}</span>
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="tn-topbar-right">
            {putki > 0 && (
              <span className="tn-streak-pill" title="Päivän visan putki">
                <span aria-hidden>🔥</span> Putki {putki}
              </span>
            )}
            <button type="button" className="tn-selaa" onClick={() => setSheet(true)}>
              Selaa
            </button>
          </div>
        </div>
      </header>

      {/* Alasivuilla sisältö alkaa palkin alta — varataan aina 72 px */}
      {!home && <div className="tn-topbar-spacer" aria-hidden />}

      {/* Mobiilin Selaa-paneeli */}
      {sheet && (
        <div className="tn-sheet-root">
          <button
            type="button"
            className="tn-sheet-backdrop"
            aria-label="Sulje valikko"
            onClick={() => setSheet(false)}
          />
          <div className="tn-sheet" role="dialog" aria-modal="true" aria-label="Selaa">
            <button type="button" className="tn-sheet-handle" aria-label="Sulje" onClick={() => setSheet(false)} />
            <div className="tn-sheet-head">
              <span className="tn-sheet-title">Selaa</span>
              <button type="button" className="tn-sheet-x" aria-label="Sulje" onClick={() => setSheet(false)}>
                ✕
              </button>
            </div>
            <p className="tn-sheet-group">Pelimuodot</p>
            {NAV_MODES.map((m) => (
              <a
                key={m.href}
                className="tn-sheet-row tn-sheet-mode"
                href={m.href}
                style={{ "--dot": m.color } as React.CSSProperties}
                onClick={() => setSheet(false)}
              >
                <span className="tn-menu-dot" aria-hidden />
                <span className="tn-menu-modetext">
                  <span className="tn-menu-label">{m.label}</span>
                  <span className="tn-menu-desc">{m.desc}</span>
                </span>
              </a>
            ))}
            <p className="tn-sheet-group">Kokoelmat</p>
            {NAV_COLLECTIONS.map((c) => (
              <a
                key={c.slug}
                className="tn-sheet-row"
                href={hubHref(c.slug)}
                style={{ "--dot": c.color } as React.CSSProperties}
                onClick={() => setSheet(false)}
              >
                <span className="tn-menu-dot" aria-hidden />
                <span className="tn-menu-label">{c.label}</span>
              </a>
            ))}
            <a className="tn-sheet-all" href="/2-0/kokoelmat" onClick={() => setSheet(false)}>
              Kaikki kokoelmat →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
