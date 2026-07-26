import type { Metadata } from "next";
import Link from "next/link";
import { getDuelData } from "../../lib/duel";
import { KumpiClient } from "./kumpi-client";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const metadata: Metadata = {
  title: "Kumpi? — kaksi vaihtoehtoa, vain toinen on oikein | Tietoniekka",
  description:
    "Kumpi on vanhempi? Kumpi heistä on näyttelijä? Kaksi vaihtoehtoa, kaksi sekuntia. Kuinka pitkälle pääset?",
  alternates: { canonical: `${SITE_URL}/kumpi` },
};

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

  return <KumpiClient data={data} />;
}
