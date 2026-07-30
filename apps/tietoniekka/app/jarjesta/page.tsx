import type { Metadata } from "next";
import Link from "next/link";
import { getDuelData } from "../../lib/duel";
import { JarjestaClient } from "./jarjesta-client";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const metadata: Metadata = {
  title: "Järjestä oikein — viisi asiaa, yksi oikea järjestys | Tietoniekka",
  description:
    "Kumpi järvi on suurempi? Entä kun niitä on viisi? Järjestä kaupungit, tunturit ja tapahtumat oikeaan järjestykseen.",
  alternates: { canonical: `${SITE_URL}/jarjesta` },
};

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

  return <JarjestaClient data={data} />;
}
