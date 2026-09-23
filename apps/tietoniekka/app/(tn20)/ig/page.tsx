// INSTAGRAM-BIO-SIVU tietoniekka.fi/ig (26.9.2026). Instagram-profiilin linkki
// ("linkki biossa"): julkaisujen visat samoilla kuvilla kuin Instagramissa, jotta
// postauksen näkijä tunnistaa oman visansa. Uusin ensin; jos tänään ei ole vielä
// julkaistu mitään, ylimpänä on tämän päivän Päivän visa.
//
// Data: ig_bio(site) (vain julkaistut postaukset). Mittaus: bio_naytto + klikkaus
// täällä, avaus + valmis pelinäkymässä (?lahde=ig&j=<julkaisu>). Admin näyttää
// luvut julkaisukohtaisesti A/B-testin kolmantena mittarina.

import type { Metadata } from "next";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { IgNaytto, IgPelaa } from "./IgMittaus";
import "./ig.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Instagramista – pelaa julkaisujen visat",
  description: "Tietoniekan Instagram-julkaisujen visat yhdessä paikassa. Ilmaiseksi, ilman kirjautumista.",
  alternates: { canonical: "/ig" },
  // Bio-linkin kohde, ei hakukoneille tarkoitettu sisältösivu.
  robots: { index: false, follow: true },
};

type BioRivi = {
  julkaisu_id: string | null;
  paiva: string;
  slotti: "paivan_visa" | "synttarit" | "oma";
  julkaistu_at: string | null;
  quiz_id: string;
  otsikko: string;
  kuva: string | null;
  kokoelma: string | null;
  kampanja: string | null;
};

const VIIKONPAIVAT = ["su", "ma", "ti", "ke", "to", "pe", "la"];

function tanaan(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Helsinki" }).format(new Date());
}

function paivaLeima(iso: string, t: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const [ty, tm, td] = t.split("-").map(Number);
  const ero = Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(y, m - 1, d)) / 86400000);
  if (ero === 0) return "Tänään";
  if (ero === 1) return "Eilen";
  return `${VIIKONPAIVAT[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${d}.${m}.`;
}

function tyyppi(r: BioRivi): string {
  if (r.slotti === "paivan_visa") return "Päivän visa";
  if (r.slotti === "synttarit") return "Päivän synttärit";
  return r.kampanja ?? "Visa";
}

function peliHref(r: BioRivi, t: string): string {
  const p = new URLSearchParams({ quiz_id: r.quiz_id, lahde: "ig" });
  if (r.julkaisu_id) p.set("j", r.julkaisu_id);
  // Etusivun Päivän visa -kortin "pelattu"-tila vain tämän päivän visalle
  if (r.slotti === "paivan_visa" && r.paiva === t) p.set("paivan_visa", "1");
  return `/peli?${p.toString()}`;
}

export default async function IgBioPage() {
  const sb = getSupabase();
  const siteId = await getSiteId();
  let rivit: BioRivi[] = [];
  if (sb && siteId) {
    const { data } = await (sb as unknown as { rpc: (f: string, a: Record<string, unknown>) => Promise<{ data: unknown }> }).rpc("ig_bio", { p_site: siteId });
    rivit = (data ?? []) as BioRivi[];
  }
  const t = tanaan();
  const uusimmat = rivit.filter((r) => r.paiva === t);
  const aiemmat = rivit.filter((r) => r.paiva !== t);
  // Jos tänään ei ole mitään (ei aikataulua eikä julkaisua), nostetaan uusin esiin.
  const ylhaalla = uusimmat.length ? uusimmat : aiemmat.slice(0, 1);
  const lista = uusimmat.length ? aiemmat : aiemmat.slice(1);

  return (
    <main className="tnig">
      <IgNaytto />
      <header className="tnig-head">
        <p className="tnig-kicker">Instagramista</p>
        <h1 className="tnig-h1">Pelaa julkaisujen visat</h1>
        <p className="tnig-lede">Näit visan Instagramissa? Se löytyy tästä. Ilmainen, ei kirjautumista.</p>
      </header>

      {ylhaalla.length > 0 && (
        <section className="tnig-sect" aria-labelledby="tnig-uusin">
          <h2 id="tnig-uusin" className="tnig-sect-h">{uusimmat.length ? "Tänään" : "Uusin"}</h2>
          <ul className="tnig-list tnig-list--iso">
            {ylhaalla.map((r) => (
              <Rivi key={`${r.julkaisu_id ?? "pv"}-${r.quiz_id}`} r={r} t={t} iso />
            ))}
          </ul>
        </section>
      )}

      {lista.length > 0 && (
        <section className="tnig-sect" aria-labelledby="tnig-aiemmat">
          <h2 id="tnig-aiemmat" className="tnig-sect-h">Aiemmat julkaisut</h2>
          <ul className="tnig-list">
            {lista.map((r) => (
              <Rivi key={`${r.julkaisu_id ?? "pv"}-${r.quiz_id}`} r={r} t={t} />
            ))}
          </ul>
        </section>
      )}

      {rivit.length === 0 && <p className="tnig-tyhja">Uusia julkaisuja tulossa pian.</p>}

      <nav className="tnig-lisaa" aria-label="Lisää visoja">
        <Link href="/" className="tnig-lisaa-link">Kaikki visat etusivulla →</Link>
      </nav>
    </main>
  );
}

function Rivi({ r, t, iso }: { r: BioRivi; t: string; iso?: boolean }) {
  return (
    <li className={`tnig-item${iso ? " tnig-item--iso" : ""}`}>
      <IgPelaa href={peliHref(r, t)} julkaisu={r.julkaisu_id} className="tnig-card">
        <span className="tnig-thumb">
          {r.kuva ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.kuva} alt="" loading={iso ? "eager" : "lazy"} decoding="async" />
          ) : null}
        </span>
        <span className="tnig-body">
          <span className="tnig-meta">
            {paivaLeima(r.paiva, t)} · {tyyppi(r)}
          </span>
          <span className="tnig-title">{r.otsikko}</span>
          <span className="tnig-cta">Pelaa visa →</span>
        </span>
      </IgPelaa>
    </li>
  );
}
