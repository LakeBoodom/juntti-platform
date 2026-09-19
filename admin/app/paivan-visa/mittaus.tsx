import { getSupabaseAdmin } from "@juntti/db";
import { lisaaPaivia } from "@/lib/paivan-visa-yhteiset";

// MITTAUS (toteutusohje 19.9.2026, luku 9): kannattaako introtyö?
// Päivän visa introlla (tilat A/C) vs. ilman (B) ja Päivän sankari — näytöt,
// klikkaukset ja klikkausprosentti viimeiseltä 30 päivältä + kokoelmittain.
// Lähde: paivan_nosto_tilasto (etusivu kirjaa, ei henkilötietoja).

type Rivi = { paiva: string; slotti: string; intro_tila: string | null; kategoria: string | null; naytot: number; klikkaukset: number };

function summa(rivit: Rivi[]) {
  const n = rivit.reduce((a, r) => a + r.naytot, 0);
  const k = rivit.reduce((a, r) => a + r.klikkaukset, 0);
  return { n, k, ctr: n ? (100 * k) / n : null, paivia: new Set(rivit.map((r) => r.paiva)).size };
}

export async function Mittaus({ tanaan }: { tanaan: string }) {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("paivan_nosto_tilasto" as never)
    .select("paiva, slotti, intro_tila, kategoria, naytot, klikkaukset")
    .gte("paiva", lisaaPaivia(tanaan, -29))
    .lte("paiva", tanaan);
  const rivit = (data ?? []) as unknown as Rivi[];
  const pv = rivit.filter((r) => r.slotti === "paivan_visa");
  const ryhmat = [
    { nimi: "Päivän visa — intro (A/C)", ...summa(pv.filter((r) => r.intro_tila === "A" || r.intro_tila === "C")) },
    { nimi: "Päivän visa — ei introa (B)", ...summa(pv.filter((r) => r.intro_tila === "B" || !r.intro_tila)) },
    { nimi: "Päivän sankari", ...summa(rivit.filter((r) => r.slotti === "paivan_sankari")) },
  ];
  const kokoelmat = Object.entries(
    pv.reduce<Record<string, Rivi[]>>((acc, r) => {
      (acc[r.kategoria ?? "—"] ??= []).push(r);
      return acc;
    }, {}),
  )
    .map(([nimi, l]) => ({ nimi, ...summa(l) }))
    .sort((a, b) => b.n - a.n);
  const pros = (x: number | null) => (x == null ? "—" : `${x.toFixed(1)} %`);

  return (
    <details className="rounded-md border p-4">
      <summary className="cursor-pointer text-sm font-medium">
        Mittaus: 30 päivää {rivit.length === 0 && <span className="font-normal text-muted-foreground">(ei vielä dataa)</span>}
      </summary>
      <div className="mt-3 grid gap-6 md:grid-cols-2">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr><th className="py-1">Lohko</th><th>Päiviä</th><th>Näytöt</th><th>Klikit</th><th>Klikki-%</th></tr>
          </thead>
          <tbody>
            {ryhmat.map((g) => (
              <tr key={g.nimi} className="border-t">
                <td className="py-1">{g.nimi}</td><td>{g.paivia}</td><td>{g.n}</td><td>{g.k}</td><td className="font-medium">{pros(g.ctr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr><th className="py-1">Päivän visa: kokoelma</th><th>Näytöt</th><th>Klikit</th><th>Klikki-%</th></tr>
          </thead>
          <tbody>
            {kokoelmat.map((g) => (
              <tr key={g.nimi} className="border-t">
                <td className="py-1">{g.nimi}</td><td>{g.n}</td><td>{g.k}</td><td>{pros(g.ctr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Näyttö = lohko vähintään puoliksi näkyvissä sivulatauksen aikana; klikkaus = pelilinkki. Mittaus alkoi 19.9.2026.
      </p>
    </details>
  );
}
