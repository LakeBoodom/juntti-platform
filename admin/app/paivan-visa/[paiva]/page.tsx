import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { getCurrentSite } from "@/lib/sites";
import { haePaivat, helsinkiTanaan, lisaaPaivia, paivaTeksti, TIETONIEKKA_URL } from "@/lib/paivan-visa";
import { PaivaEditori } from "./editori";

// PÄIVÄN VISA — yhden päivän toimitus (toteutusohje 19.9.2026, luku 8):
// visa, intro (otsikko 0/80, teksti 0/240, pehmeät rajat 60/160), lähde-URL,
// toimituksen muistiinpano, varoitukset ja esikatselu etusivun omilla
// komponenteilla (Tietoniekan /esikatselu/paivan-visa upotettuna).

export const dynamic = "force-dynamic";

export default async function PaivaSivu({ params }: { params: Promise<{ paiva: string }> }) {
  const { paiva } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paiva) || Number.isNaN(Date.parse(paiva))) notFound();

  const sb = await supabaseFromCookies();
  const { data: { user } } = await sb.auth.getUser();
  const site = await getCurrentSite();
  const { paivat, visat, paivatByVisa, saantoByDate } = await haePaivat(site.id, paiva, paiva);
  const p = paivat[0];
  const edelliset = [1, 2].map((n) => {
    const e = lisaaPaivia(paiva, -n);
    const r = saantoByDate.get(e);
    return { iso: e, kokoelma: r?.content_id ? visat.find((v) => v.id === r.content_id)?.kokoelma ?? null : null };
  });
  const { lyhyt, vp } = paivaTeksti(paiva);
  const tanaan = helsinkiTanaan();

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/paivan-visa" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Päivän visa
            </Link>
            <h1 className="text-2xl font-semibold">
              {vp} {lyhyt}
              {paiva === tanaan && <span className="ml-2 text-base font-medium text-amber-600">tänään</span>}
              {paiva < tanaan && <span className="ml-2 text-base font-medium text-muted-foreground">mennyt päivä</span>}
            </h1>
          </div>
          <div className="flex gap-2 text-sm">
            <Link className="rounded-md border px-3 py-1 hover:bg-muted" href={`/paivan-visa/${lisaaPaivia(paiva, -1)}`}>← Edellinen päivä</Link>
            <Link className="rounded-md border px-3 py-1 hover:bg-muted" href={`/paivan-visa/${lisaaPaivia(paiva, 1)}`}>Seuraava päivä →</Link>
          </div>
        </div>

        <PaivaEditori
          key={paiva}
          siteId={site.id}
          paiva={paiva}
          saanto={p.saanto}
          visat={visat}
          paivatByVisa={paivatByVisa}
          edelliset={edelliset}
          sankari={p.sankari}
          tietoniekkaUrl={TIETONIEKKA_URL}
        />
      </main>
    </>
  );
}
