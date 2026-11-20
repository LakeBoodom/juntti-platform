// KUMPI? 2.0 — pelimuodon hub /kumpi (brief B + Heikki 20.11.2026). Hub-runko: hero (logo h1:nä + intro), teemat
// jaettuina riveinä kuudessa ryhmässä (Heikki 20.11.: HubRivit, ei CD:n vaakaruudukkoja), ohjeet suljettuina.
// Jääkiekolla kolme riviä (Legendat, Liiga, Oma seura); 17 seuraa vain Oma seura -valinnasta, jotta hubi ei näytä
// jääkiekkopeliltä. Hubiin otetaan teema vain, jos siitä syntyy ≥ 30 kysymystä (lib/kumpi/sivu.ts).
// Vaihe 1 (Heikki 20.11.): Päivän Kumpi? ja Putki tulevat vaiheessa 2, joten hubissa ei vielä ole niiden kortteja.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import Crumbs from "@/components/tn20/Crumbs";
import { RiviLinkki, type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
import HubOhjeet from "@/components/tn20/korttirivi/HubOhjeet";
import "@/components/tn20/korttirivi/hub.css";
import KumpiLogo from "@/components/tn20/kumpi/KumpiLogo";
import OmaSeura from "@/components/tn20/kumpi/OmaSeura";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { RYHMAT } from "@/lib/kumpi/teemat";
import { hubinTeemat } from "@/lib/kumpi/sivu";
import "@/components/tn20/kumpi/kumpi.css";

export const revalidate = 3600;

const KOROSTUS = "Kaksi vaihtoehtoa, vain toinen on oikein.";
const INTRO =
  "Kumpi pelasi enemmän Liiga-otteluita, kumpi kaupunki on vanhempi, kumpi järvi suurempi? Valitse teema ja pelaa kymmenen kysymyksen kierros. Jääkiekosta voit valita myös oman seurasi.";

export const metadata: Metadata = {
  title: "Kumpi? – kaksi vaihtoehtoa, vain toinen on oikein",
  description: "Kumpi pelasi enemmän, kumpi on vanhempi, kumpi suurempi? Valitse teema ja pelaa kymmenen kysymyksen kierros jääkiekosta, urheilusta, Suomesta, luonnosta ja maailmalta.",
  alternates: { canonical: "/kumpi" },
  ...jakoMeta({
    title: "Kumpi? – kaksi vaihtoehtoa, vain toinen on oikein",
    description: "Valitse teema ja pelaa kymmenen kysymyksen kierros.",
    url: "/kumpi",
    kuva: "/og/sivu/kumpi",
  }),
};

const RIVIKUVA = "/20/kumpi/rivi.svg";

export default async function KumpiHub() {
  const hub = await hubinTeemat();
  if (!hub) notFound();
  const kortti = (slug: string, nimi: string, rivi: string): RiviKortti => ({
    href: `/kumpi/${slug}`, kuva: RIVIKUVA, sovitus: "contain", kuvaton: nimi, nimi, rivi,
  });
  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Kumpi?", url: "/kumpi", description: KOROSTUS })} />
      <Crumbs items={[{ label: "Kumpi?" }]} />
      <main id="main">
        <div className="hub">
          <header className="hub-hero hub-hero--ilman kp-hubi-hero">
            <div className="hub-hero-teksti">
              <h1 className="hub-h1"><KumpiLogo className="kp-logo--hero" /></h1>
              <p className="hub-intro"><strong>{KOROSTUS}</strong> {INTRO}</p>
            </div>
          </header>
          {RYHMAT.map((r) => {
            const teemat = hub.teemat.filter((t) => t.teema.ryhma === r.avain);
            const omaSeura = r.avain === "jaakiekko" && hub.seurat.length > 0;
            if (!teemat.length && !omaSeura) return null;
            return (
              <section key={r.avain} className="kp-ryhma" aria-labelledby={`kp-r-${r.avain}`}>
                <h2 id={`kp-r-${r.avain}`} className="kp-ryhma-h">{r.nimi}</h2>
                <ul className="sk-rivi sk-rivi--hub">
                  {teemat.map((t, i) => (
                    <li key={t.teema.slug} className="sk-li">
                      <RiviLinkki k={kortti(t.teema.slug, t.teema.nimi, t.rivi)} eager={r.avain === "jaakiekko" && i < 2} />
                    </li>
                  ))}
                  {omaSeura ? (
                    <li className="sk-li">
                      <OmaSeura seurat={hub.seurat} kuva="/20/kumpi/seura.svg" />
                    </li>
                  ) : null}
                </ul>
              </section>
            );
          })}
          <HubOhjeet
            kohdat={[
              {
                otsikko: "Näin pelaat",
                sisalto: (
                  <p>
                    Napauta vaihtoehtoa, jonka uskot oikeaksi. Molempien arvot paljastuvat kortteihin, ja peli siirtyy
                    itsestään seuraavaan kysymykseen – tai heti, kun napautat ruutua. Kierroksessa on kymmenen kysymystä,
                    ja ne vaikeutuvat loppua kohti.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </main>
    </PeliKehys>
  );
}
