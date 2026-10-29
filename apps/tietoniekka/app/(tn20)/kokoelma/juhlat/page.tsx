// JUHLAT yhteisellä rungolla (TOTEUTUSBRIEF "Kokoelmasivun runko ja pelikehys", vaihe 3, 20.10.2026).
// Kokoelma rakennetaan pyynnön päivästä (lib/kokoelmat/juhlat.ts): osiot lähin juhla ensin, V4 = juhlakello
// (laskuri + vuosikello). Vanha sivukohtainen toteutus (CD "Juhlat-kokoelma" 28.9.2026: nosto, Tiesitkö,
// Pelaa myös, kuvallinen vuosikello) poistettu. Esikatselussa ?pvm=2026-12-10 näyttää sivun sinä päivänä.
import "../../runko.css";
import type { Metadata } from "next";
import { jakoMeta } from "@/lib/jakoMeta";
import { getSupabase } from "@/lib/supabase";
import { helsinginPaiva } from "@/lib/aika";
import KokoelmaRunko from "@/components/tn20/runko/KokoelmaRunko";
import Juhlakello from "@/components/tn20/runko/Juhlakello";
import { haeRunkoData } from "@/lib/kokoelmat/data";
import { juhlatKokoelma } from "@/lib/kokoelmat/juhlat";
import { JUHLAT_KOKOELMA, JUHLAT_SIVU, helsinginKeskiyo, juhlaKalenteri, lyhyt, nostettava, paavisa, pitka, pvm } from "@/lib/juhlat";

/* SEO-erä A4: ISR 5 min (esikatselun ?pvm= luetaan vain previewissä). */
export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";
const ESIKATSELU = process.env.VERCEL_ENV !== "production";

export const metadata: Metadata = {
  title: "Juhlat — tietovisat vuoden juhliin ja perinteisiin",
  description:
    "Tietovisat halloweenista jouluun ja vappuun: juhlien historia, perinteet ja herkut. Ilmaisia visoja ilman kirjautumista.",
  alternates: { canonical: `${SITE_URL}${JUHLAT_SIVU}` },
  ...jakoMeta({
    url: `${SITE_URL}${JUHLAT_SIVU}`,
    title: "Juhlat — tietovisat vuoden juhliin",
    description: "Visat vuoden juhliin ja perinteisiin.",
    kuva: "/og/kokoelma/juhlat",
  }),
};

export default async function JuhlatSivu({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = ESIKATSELU ? await searchParams : {};
  const simPvm = ESIKATSELU && typeof sp.pvm === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.pvm) ? sp.pvm : null;
  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const { data } = await sb.from("quiz_cards" as never).select("slug").eq("collection", JUHLAT_KOKOELMA);
  const julkaistut = new Set(((data ?? []) as unknown as { slug: string }[]).map((r) => r.slug));
  const hp = simPvm ? (([vuosi, kk, pv]) => ({ vuosi, kk, pv }))(simPvm.split("-").map(Number)) : helsinginPaiva();
  const tanaan = pvm(hp.vuosi, hp.kk, hp.pv);
  const kalenteri = juhlaKalenteri(tanaan, julkaistut);
  const nosto = nostettava(kalenteri);

  const d = await haeRunkoData(juhlatKokoelma(kalenteri, nosto));
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  /* Heron nappi: lähimmän ison juhlan visa (ensikävijä); palaava saa seuraavan pelaamattoman sivun järjestyksessä. */
  const paa = nosto ? paavisa(nosto) : null;
  const paaVisa = paa ? d.osiot.flatMap((o) => [...(o.b ? [o.b] : []), ...o.kortit]).find((v) => v.slug === paa) : null;
  if (paaVisa) d.suosituin = { id: paaVisa.id, nimi: paaVisa.nimi, href: paaVisa.href };

  /* Vuosikello: kalenterin juhlat, joilla on julkaistu visa. Yhteinen visa (Isän- ja äitienpäivä) näkyy vain
     lähimmän juhlan osiossa, joten myöhempi juhla linkittää siihen osioon. */
  const osioVisalle = new Map<string, string>();
  for (const o of d.osiot) for (const v of [...(o.b ? [o.b] : []), ...o.kortit]) osioVisalle.set(v.slug, o.slug);
  const rivit = kalenteri
    .filter((o) => o.julkaistut.length > 0)
    .map((o) => {
      const oma = d.osiot.find((x) => x.slug === o.slug);
      return {
        slug: o.slug,
        nimi: o.nimi,
        pvm: lyhyt(o.alku),
        osio: oma ? o.slug : osioVisalle.get(o.julkaistut[0]) ?? o.slug,
        maara: oma?.maara ?? o.julkaistut.length,
      };
    });
  const ympari = d.osiot.find((o) => o.slug === "ympari-vuoden");
  if (ympari) rivit.push({ slug: ympari.slug, nimi: "Ympäri vuoden", pvm: "Koko vuosi", osio: ympari.slug, maara: ympari.maara });

  const kello = (
    <Juhlakello
      d={d}
      rivit={rivit}
      nosto={
        nosto
          ? {
              pvm: pitka(nosto.alku),
              kohde: helsinginKeskiyo(nosto.alku + (nosto.kohde ?? 0) * 864e5),
              otsikko: nosto.laskuri ?? nosto.nimi,
            }
          : null
      }
    />
  );
  return <KokoelmaRunko d={d} tunnusosa={kello} />;
}
