import type { Metadata } from "next";
import { LearnArticle } from "../../components/tn20/LearnArticle";
import { getPageContent } from "../../lib/pageContent";
import Link from "next/link";
import { getDuelData } from "../../lib/duel";
import { JarjestaClient } from "./jarjesta-client";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

/* Metadata ja sivun aiheteksti page_content-taulusta (SEO_STRATEGIA.md §5.3).
   Jos riviä ei ole, käytetään aiempia kiinteitä tekstejä. */
export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("jarjesta");
  const title = pc?.seo_title ? `${pc.seo_title} | Tietoniekka` : "Järjestä oikein — viisi asiaa, yksi oikea järjestys | Tietoniekka";
  const description = pc?.seo_description ?? "Kumpi järvi on suurempi? Entä kun niitä on viisi? Järjestä kaupungit, tunturit ja tapahtumat oikeaan järjestykseen.";
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/jarjesta` },
    openGraph: { type: "website", locale: "fi_FI", siteName: "Tietoniekka", url: `${SITE_URL}/jarjesta`, title, description },
  };
}

export default async function JarjestaPage() {
  const data = await getDuelData();

  const playable = data?.defs.some((d) => d.rankLabel !== null && d.mode !== "flag");

  if (!data || !playable) {
    return (
      <main className="jrj-intro">
        <div className="jrj-intro-inner">
          <h1 className="jrj-title">Järjestä oikein</h1>
          <p className="jrj-lede">
            Peli ei ole juuri nyt käytettävissä. Kokeile hetken päästä uudelleen.
          </p>
          <Link href="/" className="jrj-cta">
            Takaisin etusivulle
          </Link>
        </div>
      </main>
    );
  }

  /* Pelin alle palvelimelta renderöity aiheteksti: mikä peli on ja miten
     sitä pelataan. Ei paljasta vastauksia — kertoo pelistä. (§5.3) */
  const pc = await getPageContent("jarjesta");

  return (
    <>
      <JarjestaClient data={data} />
      {pc?.learn && <LearnArticle learn={pc.learn} fallbackTitle={pc.name} accent="#E8A320" />}
    </>
  );
}
