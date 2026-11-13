// KUVAVISAT /kokoelma/kuvavisat hub-rungolla (Heikki 12.11.2026, vaihe 3): 1) hero = nykyinen kollaasikuva + nimi + intro
// (KUVAVISAT.ingress) ja nappi "Pelaa viikkovisa" / "Katso tuloksesi" (Heikki 13.11.); 2) ei nostoa: viikkovisa on listan ensimmäinen rivi merkillä "Viikkovisa · vk {n}" (sama koko kuin
// muut); 3) kahdeksan aihetta jaettuina riveinä (kuva 96 px, nimi, kuvausrivi), rivin napautus avaa aiheen visat rivin alle
// (HubAvattavat, natiivi <details>; "Valitse visa" -pudotusvalikko ja "Pelaa vielä nämä" -osio poistuivat).
// Aiheiden kuvat = entiset esikatselukuvat rivikopioina (public/20/rivi/kuvavisa-<tyyppi>.webp; grafiikka vaalealla levyllä).
// Staattinen segmentti ohittaa [collection]-reitin. Tiedot: lib/kuvavisat2026.ts (getKuvavisatHub, getViikkovisa).
import type { Metadata } from "next";
import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import Crumbs from "@/components/tn20/Crumbs";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import HubHero from "@/components/tn20/korttirivi/HubHero";
import ViikkovisaCta from "@/components/tn20/korttirivi/ViikkovisaCta";
import { HubAvattavat, type AvattavaRivi, type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
import { jakoMeta } from "@/lib/jakoMeta";
import { getPageContent } from "@/lib/pageContent";
import { KUVAVISAT } from "@/lib/kokoelmat/kuvavisat";
import { getKuvavisatHub, getViikkovisa, ryhmiteltyVariaatiot } from "@/lib/kuvavisat2026";
import { viikkoInfo } from "@/lib/viikkovisa";

export const revalidate = 300; // SEO-erä A4 (2.10.2026): ISR 5 min

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("kuvavisat");
  const title = pc?.seo_title ?? "Kuvavisat — tietovisat";
  const description =
    pc?.seo_description ??
    "Tunnista liput, vaakunat, linnut, eläimet, maalaukset, rakennukset ja kasvit. Valitse kategoria ja sinulle sopiva vaikeustaso.";
  const canonical = `${SITE_URL}/kokoelma/kuvavisat`;
  return { title, description, alternates: { canonical }, ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/kuvavisat" }) };
}

export default async function KuvavisatLanding() {
  const [hub, vv] = await Promise.all([getKuvavisatHub(), getViikkovisa()]);
  /* Viikkotiedot palvelimella (viikkoInfo), ei selaimen kellosta. */
  const info = vv ? viikkoInfo(vv.vuosi, vv.viikko) : null;
  const viikko: RiviKortti[] = vv && info
    ? [{ href: "/kuvavisa/viikko", kuva: "/20/rivi/kuvavisa-viikko.webp", kuvaton: "Viikkovisa", merkki: `Viikkovisa · vk ${info.viikko}`, nimi: "Viikon kuvavisa", rivi: `${vv.kuvaIdt.length} kuvaa kaikista aiheista · ${info.jaljellaTeksti}` }]
    : [];
  /* Aiheen visat: "Kaikki <monikko>" ensin, sitten vaikeustasot ja maanosat. */
  const aiheet: AvattavaRivi[] = hub.kategoriat.map((k) => {
    const ryhmat = ryhmiteltyVariaatiot(k.variaatiot);
    const jarj = [...ryhmat.filter((r) => !r.label), ...ryhmat.filter((r) => r.label)];
    return {
      avain: `kv-${k.meta.type}`,
      kortti: { href: `#kv-${k.meta.type}`, kuva: `/20/rivi/kuvavisa-${k.meta.type}.webp`, kuvaton: k.meta.otsikko, nimi: k.meta.otsikko, rivi: k.meta.kuvaus },
      ryhmat: jarj.map((r) => ({ otsikko: r.label, linkit: r.items.map((v) => ({ href: v.href, nimi: v.label })) })),
    };
  });

  return (
    <PeliKehys iho="tumma">
      <KokoelmaLd avain={KUVAVISAT.slug} nimi={KUVAVISAT.nimi} polku="/kokoelma/kuvavisat" />
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: KUVAVISAT.nimi }]} />
      <main data-tn-entry="kokoelma">
        <div className="hub">
          <HubHero
            kuva={{
              src: KUVAVISAT.hero.image!,
              srcSet: "/20/kuvavisat/hero-800.webp 800w, /20/kuvavisat/hero.webp 1915w",
              alt: KUVAVISAT.hero.alt ?? "",
              width: 1915,
              height: 821,
            }}
            nimi={KUVAVISAT.nimi}
            intro={KUVAVISAT.ingress}
            cta={info ? <ViikkovisaCta avain={info.avain} /> : undefined}
          />
          <HubAvattavat kortit={viikko} avattavat={aiheet} nimi="Kuvavisat" />
        </div>
      </main>
    </PeliKehys>
  );
}
