// TÄNÄÄN — lehden haku palvelimella. Tuotannossa julkinen avain: RLS näyttää vain julkaistut lehdet, joiden päivä on
// tänään tai aiemmin (Suomen aikaa), joten huomisen vastauksia ei voi lukea etukäteen. Esikatselussa (Vercel preview ja
// paikallinen kehitys) service role, jotta luonnoksia ja tulevia päiviä voi testata (?pvm=YYYY-MM-DD).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@juntti/db";
import type { Juttu, Kansi, Lehti, Pahkina } from "./tyypit";

/** Esikatselu = kaikki paitsi tuotanto. */
export const tanaanEsikatselu = () => process.env.VERCEL_ENV !== "production";

function asiakas() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const palvelu = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon) return null;
  const avain = tanaanEsikatselu() && palvelu ? palvelu : anon;
  return createClient<Database>(url, avain, { auth: { persistSession: false } });
}

const PVM = /^\d{4}-\d{2}-\d{2}$/;

export async function haeLehti(pvm: string): Promise<Lehti | null> {
  if (!PVM.test(pvm)) return null;
  const sb = asiakas();
  if (!sb) return null;
  const [{ data: l }, { data: j }] = await Promise.all([
    sb.from("tanaan_lehdet").select("pvm, tila, juhla, kansi, pahkina, loppi").eq("pvm", pvm).maybeSingle(),
    sb.from("tanaan_jutut").select("*").eq("pvm", pvm).order("sivu"),
  ]);
  if (!l || !l.pahkina || !j || j.length !== 7) return null;
  // Luonnos vain esikatselussa (tuotannossa RLS ei edes palauta sitä).
  if (l.tila !== "julkaistu" && !tanaanEsikatselu()) return null;
  const jutut: Juttu[] = [];
  for (const r of j) {
    if (!r.osasto || !r.juttu || !r.kysymys || !r.selitys || r.oikea == null || r.vaihtoehdot?.length !== 4) return null;
    jutut.push({
      sivu: r.sivu,
      osasto: r.osasto,
      juttu: r.juttu,
      teksti: (r.teksti as Juttu["teksti"]) ?? null,
      kuva: r.kuva,
      kuvaAlt: r.kuva_alt,
      kysymys: r.kysymys,
      vaihtoehdot: r.vaihtoehdot as Juttu["vaihtoehdot"],
      oikea: r.oikea,
      selitys: r.selitys,
      lahde: r.lahde,
      jatko: (r.jatko as Juttu["jatko"]) ?? null,
    });
  }
  return {
    pvm: l.pvm,
    juhla: l.juhla,
    jutut,
    pahkina: l.pahkina as Pahkina,
    kansi: (l.kansi as Kansi | null) ?? null,
    loppi: l.loppi ?? [],
    luonnos: l.tila !== "julkaistu",
  };
}
