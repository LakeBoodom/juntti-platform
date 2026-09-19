// PÄIVÄN VISA -ESIKATSELU adminille. Näyttää etusivun Päivän visa -osion ja
// Päivän sankari -rivin halutulle päivälle täsmälleen etusivun komponenteilla.
//
//   ?rule=<schedule_rules.id>        tallennettu päivä (visa + intro)
//   ?quiz=<quiz id>&paiva=YYYY-MM-DD tallentamaton valinta (ei introa)
//   &tila=A|B|C                      pakota tila (A vaatii otsikon ja tekstin)
//
// Kaikki sisältö tulee kannasta — osoitteella ei voi syöttää tekstiä sivulle.

import { notFound } from "next/navigation";
import { getSupabase, SITE_SLUG } from "@/lib/supabase";
import { helsinginPaiva } from "@/lib/aika";
import PaivanVisaCard from "@/components/tn20/PaivanVisaCard";
import PaivanSankari from "@/components/tn20/PaivanSankari";
import { paivanVisaTila } from "@/lib/paivanVisa";
import { rakennaPaivanVisa } from "@/lib/paivanVisaData";
import { muotoileSankari, type SankariRivi } from "@/lib/paivanSankari";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export default async function PaivanVisaEsikatselu({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : null);
  const sb = getSupabase();
  if (!sb) notFound();

  let quizId: string | null = null;
  let paiva: string = helsinginPaiva().iso;
  let intro: { headline: string | null; text: string | null } | null = null;

  const rule = one("rule");
  if (rule && UUID.test(rule)) {
    const { data } = await sb
      .from("schedule_rules")
      .select("content_id, scheduled_date, intro_headline, intro_text")
      .eq("id", rule)
      .maybeSingle();
    const r = data as { content_id: string | null; scheduled_date: string | null; intro_headline: string | null; intro_text: string | null } | null;
    if (!r?.content_id) notFound();
    quizId = r.content_id;
    if (r.scheduled_date) paiva = r.scheduled_date;
    intro = { headline: r.intro_headline, text: r.intro_text };
  } else {
    const q = one("quiz");
    const p = one("paiva");
    if (!q || !UUID.test(q)) notFound();
    quizId = q;
    if (p && ISO.test(p)) paiva = p;
  }

  /* Pakotettu tila: A vain jos molemmat tekstit ovat olemassa. */
  const tila = one("tila");
  if (tila === "B") intro = null;
  else if (tila === "C" && intro) intro = { headline: null, text: intro.text };

  const { data: site } = await sb.from("sites").select("id").eq("slug", SITE_SLUG).maybeSingle();
  const siteId = (site as { id: string } | null)?.id ?? null;
  const [daily, sRes] = await Promise.all([
    rakennaPaivanVisa(sb, { quizId: quizId!, paiva, intro }),
    siteId
      ? sb.rpc("paivan_sankari" as never, { p_site: siteId, p_date: paiva } as never)
      : Promise.resolve({ data: [] }),
  ]);
  if (!daily) notFound();
  const sankariRivi = ((sRes.data ?? []) as SankariRivi[])[0] ?? null;
  const [, kk, pv] = paiva.split("-").map(Number);

  return (
    <main className="tn-es-page">
      <div className="tn-es-main">
        <section aria-labelledby="paivan-visa-h">
          <div className="tn-es-head tn-es-head--row">
            <h2 className="tn-es-h2 tn-es-h2--nowrap" id="paivan-visa-h">Päivän visa</h2>
            {paivanVisaTila(daily) === "B" && <span className="tn-es-date">Tänään {pv}.{kk}.</span>}
          </div>
          <PaivanVisaCard data={daily} esikatselu />
        </section>
        {sankariRivi && <PaivanSankari data={muotoileSankari(sankariRivi)} />}
      </div>
    </main>
  );
}
