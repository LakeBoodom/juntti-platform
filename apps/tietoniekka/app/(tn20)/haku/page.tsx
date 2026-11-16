// Sivuston haku (Heikki 16.11.2026): /haku?q=… — hakuikkunan varasivu (toimii ilman JavaScriptiä, linkitettävä).
// Ei hakukoneisiin (noindex): sisältö on muiden sivujen listaa. Sama indeksi ja hakumoottori kuin hakuikkunassa.
import type { Metadata } from "next";
import "@/components/tn20/haku/haku.css";
import Crumbs from "@/components/tn20/Crumbs";
import { HAKU_PLACEHOLDER, HakuIkoni } from "@/components/tn20/haku/HakuDialogi";
import { haeHakuindeksi } from "@/lib/haku";
import { hae, ryhmitellyt, valmistele } from "@/lib/hakuMoottori";

export const metadata: Metadata = {
  title: "Haku | Tietoniekka",
  robots: { index: false, follow: true },
  alternates: { canonical: "/haku" },
};

export default async function HakuSivu({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q ?? "").slice(0, 80);
  const ryhmat = q.trim().length >= 2 ? ryhmitellyt(hae(valmistele(await haeHakuindeksi()), q)) : [];
  return (
    <>
      <Crumbs items={[{ label: "Haku" }]} />
      <main className="tn-haku-sivu">
        <h1>Haku</h1>
        <form className="tn-haku-etusivu" role="search" action="/haku" method="get">
          <label htmlFor="tn-haku-sivu-q" className="tn-haku-sr">Haku</label>
          <span className="tn-haku-kentta">
            <HakuIkoni />
            <input id="tn-haku-sivu-q" name="q" type="search" autoComplete="off" placeholder={HAKU_PLACEHOLDER} defaultValue={q} />
          </span>
        </form>
        {q.trim().length >= 2 && ryhmat.length === 0 && <p className="tn-haku-tyhja">Ei osumia haulle ”{q.trim()}”.</p>}
        {ryhmat.map((g) => (
          <section key={g.t} className="tn-haku-ryhma" aria-label={g.otsikko}>
            <h2 className="tn-haku-ryhma-h">{g.otsikko}</h2>
            <ul>
              {g.rivit.map((r) => (
                <li key={r.h}>
                  <a href={r.h} className="tn-haku-rivi">{r.n}</a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </>
  );
}
