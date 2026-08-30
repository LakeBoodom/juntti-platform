"use client";
// TIETONIEKKA 2.0 — yhteinen alatunniste (QA-005, 29.8.2026).
// Aiemmin vain etusivulla; kokoelmasivuilla oli minifooter tai ei footeria
// lainkaan → Tietosuoja-linkki puuttui 8 sivulta. Renderöidään layoutista
// kaikille /2-0-sivuille; pelinäkymä on headeriton ja footeriton (pelikuoren
// säännöt), samoin kuin TopBar.
import { usePathname } from "next/navigation";
import { FOOTER_COLLECTIONS, FOOTER_MODES, FOOTER_SITE, FOOTER_INSTAGRAM } from "@/lib/etusivu";
import "./footer.css";

export default function SiteFooter() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/2-0/peli")) return null;
  const year = new Date().getFullYear();
  return (
      <footer className="tn-es-foot">
        <div className="tn-es-foot-in">
          <div className="tn-es-foot-grid">
            <div className="tn-es-foot-brand">
              <a className="tn-logo tn-es-foot-logo" href="/2-0">
                <b>TIETO</b>
                <span>NIEKKA</span>
              </a>
              <p className="tn-es-foot-desc">Suomalainen tietovisasivusto. Uusia tietovisoja jatkuvasti.</p>
              <div className="tn-es-foot-h">Seuraa Tietoniekkaa somessa</div>
              <a className="tn-es-foot-ig" href={FOOTER_INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Tietoniekka Instagramissa">
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" />
                </svg>
                Instagram
              </a>
            </div>
            <nav className="tn-es-foot-col" aria-label="Kokoelmat">
              <div className="tn-es-foot-h">Kokoelmat</div>
              {FOOTER_COLLECTIONS.map((c) => <a key={c.href} href={c.href}>{c.label}</a>)}
            </nav>
            <nav className="tn-es-foot-col" aria-label="Pelimuodot">
              <div className="tn-es-foot-h">Pelimuodot</div>
              {FOOTER_MODES.map((m) => <a key={m.href} href={m.href}>{m.label}</a>)}
            </nav>
            <nav className="tn-es-foot-col" aria-label="Tietoniekka">
              <div className="tn-es-foot-h">Tietoniekka</div>
              {FOOTER_SITE.map((m) => <a key={m.href} href={m.href}>{m.label}</a>)}
            </nav>
          </div>
          <div className="tn-es-foot-base">
            <span>© {year} Tietoniekka</span>
            <span>Tehty Suomessa</span>
          </div>
        </div>
      </footer>
  );
}
