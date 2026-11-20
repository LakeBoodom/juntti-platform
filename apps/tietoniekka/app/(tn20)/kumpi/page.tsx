// KUMPI? 2.0 — pelimuodon hub /kumpi. Sama runko kuin Tupla tai kuitissa (Heikki 20.11.2026): HubHero (studiokuva +
// nimi + intro), teemat jaettuina riveinä (kuva 96 × 72, lajimerkkinä ryhmä, yksi tietorivi), ohjeet suljettuina.
// Kokoelma (Heikki 20.11.): Yleistieto ensin, sitten Suomi, Luonto, Urheilu, Jääkiekko (Legendat, Liiga, Oma seura),
// Maailma ja Ihmiset. Yleistieto, Urheilu ja Ihmiset ovat yhdistelmäteemoja (lib/kumpi/teemat.ts).
// Jääkiekolla kolme riviä (Legendat, Liiga, Oma seura); 17 seuraa vain Oma seura -valinnasta. Hubiin otetaan teema
// vain, jos siitä syntyy ≥ 30 kysymystä (lib/kumpi/sivu.ts). Päivän Kumpi? ja Putki tulevat vaiheessa 2.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import Crumbs from "@/components/tn20/Crumbs";
import HubHero from "@/components/tn20/korttirivi/HubHero";
import { RiviLinkki, type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
import HubOhjeet from "@/components/tn20/korttirivi/HubOhjeet";
import OmaSeura from "@/components/tn20/kumpi/OmaSeura";
import { JsonLd, peliLd } from "@/lib/jsonLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { RYHMAT, RIVIKUVAT } from "@/lib/kumpi/teemat";
import { hubinTeemat } from "@/lib/kumpi/sivu";
import "@/components/tn20/kumpi/kumpi.css";

export const revalidate = 3600;

const KOROSTUS = "Kaksi vaihtoehtoa, vain toinen on oikein.";
const INTRO =
  "Kumpi kaupunki on vanhempi, kumpi järvi suurempi, kumpi pelasi enemmän Liiga-otteluita? Pelaa kymmenen kysymyksen kierros kaikista aiheista tai valitse oma teemasi. Jääkiekosta voit valita myös oman seurasi.";

export const metadata: Metadata = {
  title: "Kumpi? – kaksi vaihtoehtoa, vain toinen on oikein",
  description: "Kumpi on vanhempi, kumpi suurempi, kumpi pelasi enemmän? Valitse teema ja pelaa kymmenen kysymyksen kierros Suomesta, luonnosta, urheilusta, jääkiekosta ja maailmalta.",
  alternates: { canonical: "/kumpi" },
  ...jakoMeta({
    title: "Kumpi? – kaksi vaihtoehtoa, vain toinen on oikein",
    description: "Valitse teema ja pelaa kymmenen kysymyksen kierros.",
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
          <ul className="sk-rivi sk-rivi--hub" aria-label="Teemat">
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
                      <RiviLinkki k={k} eager={(r.avain === "yleistieto" || r.avain === "suomi") && i < 2} />
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
