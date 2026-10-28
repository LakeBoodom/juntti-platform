// TIETONIEKKA 2.0 — ETUSIVU v5 (brief "Etusivun uusi rakenne", hyväksytty 28.10.2026; design Tietoniekka_Etusivu_v5).
// Osiot: Päivän pelit → Tiesitkö? → Selaa aiheittain → Valitse peli → Promo 1 → Laura ja Mikko → Promo 2 →
// Tietoniekka lapsille → Visapaketit. Kaikki datasta (lib/etusivu5.ts), näkymä components/tn20/etusivu5/EtusivuV5.tsx.
// Korvasi 28.8.–27.10.2026 bannerisarjan (Juhlat, Tupla, Rajanaapurit, Kuvavisat, Luonto/Äänivisa, Suositut kokoelmat,
// Kuka on vanhin?, Päivän sankari, Kuntaliitos, juontajat, Uusimmat visat).
import { PaivaVahti } from "@/components/tn20/PaivaVahti";
import { brand } from "@/config/brand";
import { JsonLd, abs } from "@/lib/jsonLd";
import { haeEtusivu } from "@/lib/etusivu5";
import EtusivuV5 from "@/components/tn20/etusivu5/EtusivuV5";
import "./etusivu.css";
import "./etusivu-v5.css";

/* ISR 5 min. Keskiyön vaihto: PaivaVahti (app/api/etusivu-paiva). */
export const revalidate = 300;

/* Esikatselu (ei tuotannossa): ?sankari=YYYY-MM-DD näyttää toisen päivän synttärisankarin,
   ?pv=A|B|C Päivän visan koukkutilan suurimmalla sallitulla tekstillä (80 + 240 merkkiä). */
const ESIKATSELU = process.env.VERCEL_ENV !== "production";
const MALLI_INTRO = {
  headline: "Kahdeksankymmentä merkkiä pitkä koukkuotsikko täyttää rivin aivan reunaan asti",
  text: "Kahdensadanneljänkymmenen merkin mittainen koukkuteksti vie laatasta kolme riviä työpöydällä ja näyttää tarkalleen kuinka korkeaksi laatta kasvaa silloin kun toimitus käyttää koko sallitun tilan viimeistä merkkiä myöten loppuun.",
};

export default async function Etusivu20({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = ESIKATSELU ? await searchParams : {};
  const sankari = ESIKATSELU && typeof sp.sankari === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.sankari) ? sp.sankari : null;
  const pvMalli = !ESIKATSELU ? undefined
    : sp.pv === "A" ? MALLI_INTRO : sp.pv === "C" ? { headline: null, text: MALLI_INTRO.text } : sp.pv === "B" ? null : undefined;
  const d = await haeEtusivu({ sankariPaiva: sankari, pvMalli });
  if (!d) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  return (
    <main className="tn-es-page">
      {/* SEO 16.10.2026: etusivun WebPage, pääkuvana brändin jakokuva. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${abs("/")}#webpage`,
          url: abs("/"),
          name: `Tietovisat – ilmaisia tietovisoja | ${brand.name}`,
          inLanguage: "fi-FI",
          isPartOf: { "@id": `${abs("/")}#website` },
          about: { "@id": `${abs("/")}#organization` },
          primaryImageOfPage: { "@type": "ImageObject", url: abs("/og-image.png"), width: 1200, height: 630 },
          image: abs("/og-image.png"),
        }}
      />
      {/* H1 = sivuston nimi, näkymätön (design: logo navigaatiossa); "Päivän pelit" on H2. */}
      <h1 className="tn-es-sr-only">{brand.name} – suomalainen tietovisasivusto</h1>
      <PaivaVahti pvm={d.today.iso} />
      <EtusivuV5 d={d} />
    </main>
  );
}
