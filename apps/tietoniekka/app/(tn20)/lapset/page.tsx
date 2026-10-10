// LASTEN VISAT — /lapset-kokoelmasivu (TOTEUTUSBRIEF_LASTEN_VISAT.md §6, design v0.2 3a–3d, 10.10.2026).
// Järjestys: hero + ikävalinta → ajankohtainen nosto → aiheet → kaikki visat → Tulossa → Aikuisille.
// Ikävalinta suodattaa nostun, aiheet, visat ja Tulossa-kaistan selaimessa (LapsetSivu), joten sivu
// pysyy ISR:nä. Piilossa tuotannossa, kunnes LAPSET_ENABLED=1 (previewssä aina näkyvissä).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Crumbs from "@/components/tn20/Crumbs";
import { jakoMeta } from "@/lib/jakoMeta";
import { helsinginPaiva } from "@/lib/aika";
import { pvm } from "@/lib/juhlat";
import { LAPSET_SIVU, LASTEN_IAT, esikatselu, haeLastenVisat, lapsetNakyvissa, type LastenIka } from "@/lib/lapset/data";
import { AIHEJARJESTYS, LASTEN_AIHEET, juontajaKuvat } from "@/lib/lapset/juontajat";
import { ajankohtainen } from "@/lib/lapset/nosto";
import { TULOSSA, TULOSSA_AIHEET } from "@/lib/lapset/tulossa";
import LapsetSivu, { type SivuAihe, type SivuNosto } from "./LapsetSivu";
import "../lapset-sivu.css";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";
const KUVAUS = "Tietovisoja lapsille: jouluvisat, eläinvisat ja lintuvisat pienille (4–7) ja isommille (8–12). Laura ja Mikko lukevat kysymykset ääneen. Ilmaiseksi, ilman kirjautumista ja mainoksia.";

export const metadata: Metadata = {
  title: { absolute: "Lasten visat – tietovisoja lapsille | Tietoniekka" },
  description: KUVAUS,
  alternates: { canonical: `${SITE_URL}${LAPSET_SIVU}` },
  ...jakoMeta({
    url: `${SITE_URL}${LAPSET_SIVU}`,
    title: "Lasten visat – tietovisoja lapsille",
    description: "Laura ja Mikko lukevat kysymykset ääneen. Visoja pienille ja isommille.",
    kuva: "/20/lapset/hero-v4.webp",
  }),
};

export default async function LapsetPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!lapsetNakyvissa()) notFound();
  /* Esikatselu: ?juhlapvm=2026-12-10 näyttää nostun kyseisenä päivänä (kuten etusivulla). */
  const sp = esikatselu() ? await searchParams : {};
  const sim = typeof sp.juhlapvm === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.juhlapvm) ? sp.juhlapvm.split("-").map(Number) : null;
  const hp = helsinginPaiva();
  const tanaan = sim ? pvm(sim[0], sim[1], sim[2]) : pvm(hp.vuosi, hp.kk, hp.pv);

  const visat = await haeLastenVisat();
  const nyt = ajankohtainen(visat, tanaan);

  const aiheet: SivuAihe[] = AIHEJARJESTYS.flatMap((avain) => {
    const a = LASTEN_AIHEET[avain];
    const iat = LASTEN_IAT.filter((ika) => visat.some((v) => v.aihe === avain && v.ika === ika)) as LastenIka[];
    if (!iat.length && !TULOSSA_AIHEET.includes(avain)) return [];
    return [{ avain, nimi: a.nimi, emoji: a.emoji, aksentti: a.aksentti, kuva: a.kuva, kuvaKohdistus: a.kuvaKohdistus ?? null, iat }];
  });

  const nosto: SivuNosto | null = nyt
    ? (() => {
        const a = LASTEN_AIHEET[nyt.aihe];
        return {
          aihe: nyt.aihe, juhla: nyt.juhla, emoji: a?.emoji ?? "⭐", nimi: a?.nimi ?? nyt.aihe,
          otsikko: a?.nosto.otsikko ?? "Uusimmat visat", kuvaus: a?.nosto.kuvaus ?? "", kuva: a?.nosto.kuva ?? null,
          aksentti: a?.aksentti ?? "#2F6B45",
        };
      })()
    : null;

  return (
    <main className="lps">
      <Crumbs items={[{ label: "Lasten visat" }]} />
      <LapsetSivu visat={visat} aiheet={aiheet} nosto={nosto} tulossa={TULOSSA} duo={juontajaKuvat(null).duo.innoissaan} />
    </main>
  );
}
