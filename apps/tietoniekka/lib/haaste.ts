// KUVAVISAT 2.0 — HAASTELINKIT (K3, 17.9.2026)
//
// Lyhyt tunnus kannassa (kuvavisa_haasteet) aiemman ~370 merkin
// /peli?kuvavisa=liput&ids=<10 × uuid> tilalle: /h/abc123. Rivi kantaa myös
// haastajan tuloksen, jotta vastaanottaja näkee aloitusnäkymässä paljonko
// voitettavaa on ja tulosnäkymässä vertailun.
//
// Tunnus luetaan palvelimella (tämä moduuli) ja luodaan selaimessa
// GameClientissä RPC:llä vasta kun pelaaja pääsee tulosnäkymään — tyhjiä
// haasterivejä ei synny niistä peleistä joita ei koskaan jaeta.

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";

export type Haaste = {
  koodi: string;
  /** Kortiston URL-slug, sama arvo kuin /peli?kuvavisa= */
  kuvavisa: string;
  taso: string | null;
  maanosa: string | null;
  kuvaIdt: string[];
  kysymyksia: number;
  oikein: number;
  pisteet: number;
};

type Rivi = {
  koodi: string;
  kuvavisa: string;
  taso: string | null;
  maanosa: string | null;
  kuva_idt: string[];
  kysymyksia: number;
  haastajan_oikein: number;
  haastajan_pisteet: number;
};

/** Tunnus on 6 merkkiä aakkostosta 0-9 a-z ilman i, l ja o (ks. migraatio). */
export const HAASTE_KOODI = /^[0-9a-hjkmnp-z]{6}$/;

export async function haeHaaste(koodi: string): Promise<Haaste | null> {
  if (!HAASTE_KOODI.test(koodi)) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const siteId = await getSiteId();
  if (!siteId) return null;

  /* packages/db/types.ts ei tunne kuvavisa_haasteet-taulua: generoitu tiedosto
     on jäljessä (38 taulua, kannassa 149). Tyypittämätön asiakas + käsin
     kuvattu Rivi-tyyppi, kunnes types.ts generoidaan omana passinaan. */
  const sbAny = sb as unknown as SupabaseClient;
  const { data } = await sbAny
    .from("kuvavisa_haasteet")
    .select("koodi, kuvavisa, taso, maanosa, kuva_idt, kysymyksia, haastajan_oikein, haastajan_pisteet")
    .eq("koodi", koodi)
    .eq("site_id", siteId)
    .maybeSingle();

  const r = (data ?? null) as Rivi | null;
  if (!r) return null;
  return {
    koodi: r.koodi,
    kuvavisa: r.kuvavisa,
    taso: r.taso,
    maanosa: r.maanosa,
    kuvaIdt: r.kuva_idt ?? [],
    kysymyksia: r.kysymyksia,
    oikein: r.haastajan_oikein,
    pisteet: r.haastajan_pisteet,
  };
}
