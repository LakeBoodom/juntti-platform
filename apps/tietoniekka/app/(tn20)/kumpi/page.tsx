// KUMPI? 2.0 — pelimuodon hub /kumpi. Sama runko kuin Tupla tai kuitissa (Heikki 20.11.2026): HubHero (studiokuva +
// nimi + intro), teemat jaettuina riveinä (kuva 96 × 72, lajimerkkinä ryhmä, yksi tietorivi), ohjeet suljettuina.
// Kokoelma (Heikki 20.11.): Yleistieto ensin, sitten Suomi, Luonto, Urheilu, Jääkiekko (Legendat, Liiga, Oma seura),
// Maailma ja Ihmiset. Yleistieto, Urheilu ja Ihmiset ovat yhdistelmäteemoja (lib/kumpi/teemat.ts).
// Jääkiekolla kolme riviä (Legendat, Liiga, Oma seura); 17 seuraa vain Oma seura -valinnasta. Hubiin otetaan teema
// vain, jos siitä syntyy ≥ 30 kysymystä (lib/kumpi/sivu.ts). Vaihe 2 (22.11.2026): Päivän Kumpi? ja Putki listan
// kahdeksi ensimmäiseksi riviksi kultareunuksella. Heroon ei nappia (Heikki 22.11.: rivi on informatiivisempi, ei toistoa).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import Crumbs from "@/components/tn20/Crumbs";
import HubHero from "@/components/tn20/korttirivi/HubHero";
import { RiviLinkki, type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
import NainPelaat from "@/components/tn20/ohjeet/NainPelaat";
import OmaSeura from "@/components/tn20/kumpi/OmaSeura";
import { PaivanRivi, PutkiRivi } from "@/components/tn20/kumpi/Pelitavat";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { RYHMAT, RIVIKUVAT } from "@/lib/kumpi/teemat";
import { hubinTeemat } from "@/lib/kumpi/sivu";
import "@/components/tn20/kumpi/kumpi.css";

export const revalidate = 3600;

const KOROSTUS = "Kaksi vaihtoehtoa, vain toinen on oikein.";
const INTRO =
  "Kumpi kaupunki on vanhempi, kumpi järvi suurempi, kumpi pelasi enemmän Liiga-otteluita? Pelaa päivän kymmenen, valitse oma aiheesi tai lähde Putkeen, jossa kello käy ja yksi virhe riittää. Jääkiekosta voit valita myös oman seurasi.";

export const metadata: Metadata = {
  title: "Kumpi? – kaksi vaihtoehtoa, vain toinen on oikein",
  description: "Kumpi on vanhempi, kumpi suurempi, kumpi pelasi enemmän? Valitse aihe ja pelaa kymmenen kysymyksen kierros Suomesta, luonnosta, urheilusta, jääkiekosta ja maailmalta.",
  alternates: { canonical: "/kumpi" },
  ...jakoMeta({
    title: "Kumpi? – kaksi vaihtoehtoa, vain toinen on oikein",
    description: "Valitse aihe ja pelaa kymmenen kysymyksen kierros.",
    url: "/kumpi",
    kuva: "/og/sivu/kumpi",
  }),
};

export default async function KumpiHub() {
  const hub = await hubinTeemat();
  if (!hub) notFound();
  return (
    <PeliKehys iho="tumma">
      <JsonLd data={peliLd({ name: "Kumpi?", url: "/kumpi", description: KOROSTUS })} />
      <Crumbs items={[{ label: "Kumpi?" }]} />
      <main id="main">
        <div className="hub">
          <HubHero
            kuva={{
              src: "/20/kumpi/studio.webp",
              srcSet: "/20/kumpi/studio-800.webp 800w, /20/kumpi/studio.webp 1672w",
              alt: "Juontajat Kumpi?-studiossa",
              width: 1672,
              height: 941,
            }}
            nimi="Kumpi?"
            korostus={KOROSTUS}
            intro={INTRO}
          />
          <ul className="sk-rivi sk-rivi--hub" aria-label="Pelitavat ja aiheet">
            <li className="sk-li"><PaivanRivi eager /></li>
            <li className="sk-li"><PutkiRivi eager /></li>
            {RYHMAT.flatMap((r) => {
              const ryhmanTeemat = hub.teemat.filter((t) => t.teema.ryhma === r.avain);
              const omaSeura = r.avain === "jaakiekko" && hub.seurat.length > 0;
              // Lajimerkki vain ryhmissä, joissa on useampi rivi (Jääkiekko); muuten se toistaisi nimen.
              const merkki = ryhmanTeemat.length + (omaSeura ? 1 : 0) > 1 ? r.nimi : undefined;
              const rivit = ryhmanTeemat
                .map((t, i) => {
                  const k: RiviKortti = {
                    href: `/kumpi/${t.teema.slug}`,
                    kuva: RIVIKUVAT[t.teema.slug] ?? null,
                    kuvaton: t.teema.nimi,
                    merkki,
                    nimi: t.teema.nimi,
                    rivi: t.rivi,
                  };
                  return (
                    <li key={t.teema.slug} className="sk-li">
                      <RiviLinkki k={k} eager={r.avain === "yleistieto" && i < 1} />
                    </li>
                  );
                });
              if (omaSeura) {
                rivit.push(
                  <li key="oma-seura" className="sk-li">
                    <OmaSeura seurat={hub.seurat} kuva={RIVIKUVAT["oma-seura"]} merkki={merkki} />
                  </li>,
                );
              }
              return rivit;
            })}
          </ul>
          {/* Näin pelaat (Heikki 22.11.2026): jaettu NainPelaat, kolme korttia auki kaikissa pelimuodoissa. */}
          <NainPelaat
            className="hub-nain"
            kohdat={[
              { merkki: "10", otsikko: "Kymmenen kysymystä", teksti: "Kaksi vaihtoehtoa, vain toinen on oikein. Molempien arvot paljastuvat vastauksen jälkeen, ja kysymykset vaikeutuvat loppua kohti." },
              { merkki: "1", otsikko: "Päivän Kumpi?", teksti: "Sama kierros kaikille kaikista aiheista. Sen voi pelata kerran päivässä, ja uusi kierros vaihtuu keskiyöllä." },
              { merkki: { kuvake: "kello" }, otsikko: "Putki", teksti: "Kysymyksiä tulee, kunnes vastaat väärin. Aikaa on kymmenen sekuntia, 21. kysymyksestä alkaen seitsemän." },
            ]}
          />
        </div>
      </main>
    </PeliKehys>
  );
}
