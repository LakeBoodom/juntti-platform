import type { Metadata } from "next";
import { LearnArticle } from "../../components/tn20/LearnArticle";
import { getPageContent } from "../../lib/pageContent";
import Link from "next/link";
import { getDuelData } from "../../lib/duel";
import { KumpiClient } from "./kumpi-client";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

/* Metadata ja sivun aiheteksti page_content-taulusta (SEO_STRATEGIA.md §5.3).
   Jos riviä ei ole, käytetään aiempia kiinteitä tekstejä. */
export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("kumpi");
  const title = pc?.seo_title ? `${pc.seo_title} | Tietoniekka` : "Kumpi? — kaksi vaihtoehtoa, vain toinen on oikein | Tietoniekka";
  const description = pc?.seo_description ?? "Kumpi on vanhempi? Kumpi heistä on näyttelijä? Kaksi vaihtoehtoa, kaksi sekuntia. Kuinka pitkälle pääset?";
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/kumpi` },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: `${SITE_URL}/kumpi`, title, description },
  };
}

export default async function KumpiPage() {
  const data = await getDuelData();

  if (!data || !data.defs.length) {
    return (
      <main className="kumpi-empty">
        <h1>Kumpi?</h1>
        <p>Peli ei ole juuri nyt käytettävissä. Kokeile hetken päästä uudelleen.</p>
        <Link href="/" className="btn btn-primary">
          Takaisin etusivulle
        </Link>
      </main>
    );
  }

  /* Pelin alle palvelimelta renderöity aiheteksti: mikä peli on ja miten
     sitä pelataan. Ei paljasta vastauksia — kertoo pelistä. (§5.3) */
  const pc = await getPageContent("kumpi");

  return (
    <>
      <KumpiClient data={data} />
      {pc?.learn && <LearnArticle learn={pc.learn} fallbackTitle={pc.name} accent="#E8A320" />}
    </>
  );
}
