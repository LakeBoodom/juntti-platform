"use client";
// TIETONIEKKA 2.0 — NAVIGAATIOJÄRJESTELMÄ (CD:n Navigaatiokonsepti, lukittu 17.8.2026).
// Kaksi valikkoa: Kokoelmat ("mistä aiheesta") + Pelimuodot ("miten pelataan").
// - Palkki on VAKIOKORKEUS 72 px (mobiilissa 56 px) — ei madallu scrollissa.
//   Tausta rgba(19,17,9,.86) + backdrop-blur(18px) + alaraja #241E13 aina
//   (etusivu-README 17.8.2026 voitti nav-konseptin 72→54-madalluksen, Heikki
//   vahvisti B-kohdassa). Alasivuilla 72 px:n spacer, jottei sisältö hypähdä.
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
// - ETUSIVU 2026 PROD (design_handoff_etusivu_2026_prod, 28.8.2026): logon alle
//   tagline "Suomalainen tietovisasivusto · 500+ visaa", nostot "Uusin kokoelma"
//   (piiloon < 1100 px) ja "Suosittu nyt" (piiloon < 700 px), Päivän putki -nappi
//   popoverilla (StreakButton) ja hampurilaisvalikko < 1100 px (aiemmin 760).
//   Palkki on nyt sticky NORMAALIVIRRASSA (ei fixed + spacer) — korkeus elää
//   taglinen mukana. Nostojen sisältö lib/etusivu.ts HEADER_PROMOS (kausivaihto
//   yhdestä paikasta).
// - Piilossa pelinäkymässä (/2-0/peli) — pelikuoren omat logosäännöt (lukittu 1.8.2026).
// - Ei Tänään-kohtaa, ei Klassista, ei hakua eikä tiliä (CD:n säännöt).
//   Kaikki linkit vievät todellisille sivuille — ei etusivun ankkureihin.
import "./topbar.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_COLLECTIONS, NAV_MODES, hubHref } from "@/lib/nav";
import { HEADER_PROMOS, SITE_TAGLINE } from "@/lib/etusivu";
import StreakButton from "./StreakButton";

type MenuId = "kokoelmat" | "pelimuodot";

export default function TopBar() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState<MenuId | null>(null);
  const [sheet, setSheet] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const kokoelmatBtn = useRef<HTMLButtonElement>(null);
  const pelimuodotBtn = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <div ref={rootRef} className="tn-nav-root" data-variant={home ? "home" : "page"}>
      <header className="tn-topbar">
        <div className="tn-topbar-in">
          <div className="tn-brand">
            <a className="tn-logo" href="/2-0">
              <b>TIETO</b>
              <span>NIEKKA</span>
            </a>
            <span className="tn-tagline">{SITE_TAGLINE}</span>
          </div>

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
            {/* Nostot: Uusin kokoelma (≥1100 px) · Suosittu nyt (≥700 px) */}
            {HEADER_PROMOS.map((p) => (
              <a key={p.key} className="tn-promo" data-promo={p.key} href={p.href}>
                <span className="tn-promo-dot" aria-hidden />
                <span className="tn-promo-kicker">{p.kicker}</span>
                <span className="tn-promo-label">{p.label} →</span>
              </a>
            ))}
            <StreakButton />
            {/* Mobiilivalikko: hampurilaisikoni (Heikin katselmus 18.8.2026 —
                korvasi "Selaa"-tekstinapin); < 1100 px (etusivu 2026 prod) */}
            <button type="button" className="tn-selaa" aria-label="Valikko" onClick={() => setSheet(true)}>
              <span className="tn-selaa-icon" aria-hidden>
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

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
