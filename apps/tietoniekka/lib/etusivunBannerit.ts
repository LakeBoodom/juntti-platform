// ETUSIVUN PROMOBANNERIT (Claude Design kierros 12, toteutettu 18.9.2026) —
// datakerros. Staattinen kuori (otsikot, kuvat) asuu komponentissa
// components/tn20/EtusivunBannerit.tsx; tässä vain kannasta tulevat luvut ja
// henkilökuvat.
//
// Designin luvut ("9 kategoriaa · 500+ kuvaa") olivat esimerkkejä. Kategoriat
// lasketaan kannasta, ja kuvamäärä pyöristetään alaspäin täysiin satoihin
// ("600+"): Heikin linjaus 18.9. poisti eksaktit kuvamäärät, koska ne
// heittelevät datan mukana — pyöristetty alaraja pysyy totena.

import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { KATEGORIAT } from "@/lib/kuvavisat2026";

export type KuvavisaYhteenveto = { kategorioita: number; kuviaAlaraja: number };

export async function getKuvavisaYhteenveto(): Promise<KuvavisaYhteenveto | null> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return null;
  const { data } = await sb.from("kuvavisas").select("type").eq("site_id", siteId).eq("active", true);
  const rivit = (data ?? []) as Array<{ type: string }>;
  /* Vain kokoelmasivulla näkyvät kortistot (sama lista kuin hubissa). */
  const tyypit = new Set(KATEGORIAT.map((k) => k.type));
  const omat = rivit.filter((r) => tyypit.has(r.type));
  if (omat.length === 0) return null;
  return {
    kategorioita: new Set(omat.map((r) => r.type)).size,
    kuviaAlaraja: Math.floor(omat.length / 100) * 100,
  };
}

export type BanneriHenkilo = { id: string; name: string; image: string };

/* Designin henkilöt (paikanpitäjinä designissa, oikeat kuvat kannasta).
   Tunnettuja eri aloilta ja eri vuosikymmeniltä, jotta "vanhin → nuorin"
   -akseli lukee heti. Jos joku puuttuu kannasta, tilalle otetaan muita
   kuvallisia henkilöitä — banneri ei saa jäädä vajaaksi. */
const BANNERIN_HENKILOT = ["Leonardo DiCaprio", "Kimi Räikkönen", "Sanna Marin", "Taylor Swift"];

export async function getBanneriHenkilot(): Promise<BanneriHenkilo[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  type Rivi = { id: string; name: string; image_url: string | null; birth_date: string | null };
  const { data } = await sb
    .from("celebrities")
    .select("id, name, image_url, birth_date")
    .eq("site_id", siteId)
    .in("name", BANNERIN_HENKILOT)
    .not("image_url", "is", null)
    .not("birth_date", "is", null);
  let rivit = (data ?? []) as unknown as Rivi[];
  if (rivit.length < 4) {
    const { data: lisa } = await sb
      .from("celebrities")
      .select("id, name, image_url, birth_date")
      .eq("site_id", siteId)
      .not("image_url", "is", null)
      .not("birth_date", "is", null)
      .order("name")
      .limit(12);
    const jo = new Set(rivit.map((r) => r.id));
    rivit = [...rivit, ...((lisa ?? []) as unknown as Rivi[]).filter((r) => !jo.has(r.id))].slice(0, 4);
  }
  /* Järjestys vanhimmasta nuorimpaan — kuva havainnollistaa pelin ideaa. */
  return rivit
    .sort((a, b) => (a.birth_date ?? "").localeCompare(b.birth_date ?? ""))
    .map((r) => ({ id: r.id, name: r.name, image: r.image_url! }));
}
