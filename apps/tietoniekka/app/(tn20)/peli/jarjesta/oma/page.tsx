// Laadullinen järjestyspakka henkilösivulta (TOTEUTUSBRIEF_LAADULLINEN_JARJESTYS_2026_10_04.md):
// /peli/jarjesta/oma?a=<attr_key>&h=<celebrity-id:t>&p=<henkilön slug>. Täsmälleen ne henkilöt, jotka
// henkilösivun kortti näytti. Parametrisivu → ei indeksoida (henkilösivu on indeksoitava sisältö).
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { arvoTeksti, haeLaatuArvot, haeLaatuDefit } from "@/lib/laadullinen";
import { fiPvm, parsePvm } from "@/lib/henkilo";
import { henkiloSlug } from "@/lib/henkiloSlug";
import { TkGameNav } from "@/components/tn20/TkGameNav";
import OmaJarjestysClient, { type OmaKohde } from "./OmaJarjestysClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Laita järjestykseen | Tietoniekka",
  robots: { index: false, follow: true },
};

type Sp = Promise<Record<string, string | string[] | undefined>>;

export default async function OmaJarjestysPage({ searchParams }: { searchParams: Sp }) {
  const sp = await searchParams;
  const a = typeof sp.a === "string" ? sp.a : "";
  const ids = (typeof sp.h === "string" ? sp.h.split(",") : []).filter((x) => /^[0-9a-f-]{36}$/i.test(x)).slice(0, 10);
  const p = typeof sp.p === "string" ? sp.p : null;
  const sb = getSupabase();
  const defit = sb ? await haeLaatuDefit(sb) : new Map();
  const def = defit.get(a);
  if (!sb || !def || ids.length < 3) {
    return (
      <main className="tk-page">
        <TkGameNav />
        <p className="tk-loading" role="alert">
          Tätä järjestystä ei löytynyt. <a href={p ? `/henkilo/${p}` : "/henkilot"}>Takaisin</a>
        </p>
      </main>
    );
  }
  const [arvot, { data: celebs }] = await Promise.all([
    haeLaatuArvot(sb, [a], ids),
    sb.from("celebrities").select("id, name, image_url").in("id", ids),
  ]);
  const henkilot = new Map(((celebs ?? []) as Array<{ id: string; name: string; image_url: string | null }>).map((c) => [c.id, c]));
  const kohteet: OmaKohde[] = (arvot.get(a) ?? [])
    .filter((x) => henkilot.has(x.celebId))
    .map((x) => {
      const c = henkilot.get(x.celebId)!;
      return { id: c.id, name: c.name, role: "", image_url: c.image_url, value: x.value, valueLabel: arvoTeksti(def, x) };
    });
  // Sekoitus palvelimella (ei Math.randomia renderissä → ei hydraatiovirhettä, ks. Ikäjärjestys).
  for (let i = kohteet.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kohteet[i], kohteet[j]] = [kohteet[j], kohteet[i]];
  }
  const asOf = parsePvm((arvot.get(a) ?? []).map((x) => x.asOf).filter(Boolean).sort().pop() ?? null);
  const oma = p ? [...henkilot.values()].find((c) => henkiloSlug(c.name) === p) : null;
  return (
    <OmaJarjestysClient
      otsikko={def.otsikko.charAt(0).toUpperCase() + def.otsikko.slice(1)}
      suunta={`${def.akseli[0]} ylimmäksi`}
      direction={def.winner === "high" ? "desc" : "asc"}
      kohteet={kohteet}
      tilastot={asOf ? `Tilastot: ${fiPvm(asOf)}` : null}
      takaisin={oma ? { href: `/henkilo/${p}`, nimi: oma.name } : { href: "/henkilot", nimi: "Tunnetut henkilöt" }}
    />
  );
}
