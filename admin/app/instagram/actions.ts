"use server";

// Instagram-julkaisujen muokkaus adminissa: pohjan vaihto, toimitetut tekstit,
// kuvateksti ja hyväksyntä. Hyväksyntä tarkistaa esteet palvelimella uudelleen.

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";
import { getCurrentSite } from "@/lib/sites";
import { lataaFontit } from "@/lib/ig/fontit";
import { haePaivanSynttarit, haePaivanVisa } from "@/lib/ig/data";
import { tarkistaSynttarit, tarkistaVisa, type Kentat, type Pohja, type VdVari } from "@/lib/ig/pohjat";
import { luonnosteleHaaste } from "@/lib/ig/kuvateksti";

type Tulos = { ok: true } | { ok: false; virhe: string };

const VISA: Pohja[] = ["V-A", "V-B", "V-C", "V-D", "V-E"];
const SYNT: Pohja[] = ["S-A", "S-B", "S-C", "S-D"];

type Rivi = { id: string; site_id: string; paiva: string; slotti: "paivan_visa" | "synttarit"; pohja: Pohja; pohja_vari: VdVari | null; kentat: Kentat };

async function haeRivi(id: string): Promise<Rivi | null> {
  const { data } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .select("id, site_id, paiva, slotti, pohja, pohja_vari, kentat")
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as Rivi) ?? null;
}

function siivoaKentat(k: Kentat): Kentat {
  const t = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim() || undefined;
  const sisalto = (k.sisalto ?? [])
    .map((s) => ({ otsikko: t(s.otsikko) ?? "", teksti: t(s.teksti) ?? "" }))
    .filter((s) => s.otsikko || s.teksti)
    .slice(0, 3);
  const puhdas: Kentat = {
    haaste: t(k.haaste),
    haasteAla: t(k.haasteAla),
    koukku: t(k.koukku),
    koukkuAla: t(k.koukkuAla),
    kysymys: t(k.kysymys),
    kuvaaja: t(k.kuvaaja),
    ...(sisalto.length ? { sisalto } : {}),
  };
  return Object.fromEntries(Object.entries(puhdas).filter(([, v]) => v !== undefined)) as Kentat;
}

export async function tallennaJulkaisu(
  id: string,
  muutos: { pohja: Pohja; pohja_vari: VdVari | null; kentat: Kentat; kuvateksti: string | null },
): Promise<Tulos> {
  const rivi = await haeRivi(id);
  if (!rivi) return { ok: false, virhe: "Julkaisua ei löytynyt." };
  const sallitut = rivi.slotti === "paivan_visa" ? VISA : SYNT;
  if (!sallitut.includes(muutos.pohja)) return { ok: false, virhe: "Pohja ei sovi tähän julkaisuun." };

  const kuvateksti = (muutos.kuvateksti ?? "").trim();
  if (kuvateksti.length > 2200) return { ok: false, virhe: "Instagramin kuvateksti on enintään 2 200 merkkiä." };

  const { error } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .update({
      pohja: muutos.pohja,
      pohja_vari: muutos.pohja === "V-D" ? (muutos.pohja_vari ?? "lime") : null,
      pohja_valittu_kasin: muutos.pohja !== rivi.pohja ? true : undefined,
      muoto: muutos.pohja === "V-E" ? "karuselli" : "kuva",
      kentat: siivoaKentat(muutos.kentat),
      kuvateksti: kuvateksti || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);
  if (error) return { ok: false, virhe: error.message };
  revalidatePath("/instagram");
  return { ok: true };
}

/** Hyväksy julkaistavaksi — vain jos valitulla pohjalla ei ole esteitä. */
export async function hyvaksyJulkaisu(id: string): Promise<Tulos> {
  const rivi = await haeRivi(id);
  if (!rivi) return { ok: false, virhe: "Julkaisua ei löytynyt." };
  const site = await getCurrentSite();
  const { mitat } = await lataaFontit();
  let esteet: string[] = [];
  if (rivi.slotti === "paivan_visa") {
    const v = await haePaivanVisa(site.id, rivi.paiva);
    if (!v) return { ok: false, virhe: "Päivälle ei ole Päivän visaa." };
    esteet = (await tarkistaVisa(mitat, rivi.pohja, v, rivi.kentat, rivi.pohja_vari ?? "lime")).esteet;
  } else {
    const s = await haePaivanSynttarit(site.id, rivi.paiva);
    if (!s) return { ok: false, virhe: "Päivälle ei ole synttärisankaria." };
    esteet = (await tarkistaSynttarit(mitat, rivi.pohja, s, rivi.kentat)).esteet;
  }
  if (esteet.length) return { ok: false, virhe: `Ei voi hyväksyä: ${esteet.join(" ")}` };
  return asetaTila(id, "hyvaksytty");
}

export async function asetaTila(id: string, tila: "luonnos" | "hyvaksytty" | "ohitettu"): Promise<Tulos> {
  const { error } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .update({ tila, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .neq("tila", "julkaistu");
  if (error) return { ok: false, virhe: error.message };
  revalidatePath("/instagram");
  return { ok: true };
}

/** Poistaa rivin, jolloin suunnittelija valitsee pohjan uudelleen seuraavalla latauksella. */
export async function palautaAutomaattinen(id: string): Promise<Tulos> {
  const { error } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .delete()
    .eq("id", id)
    .in("tila", ["luonnos", "ohitettu"]);
  if (error) return { ok: false, virhe: error.message };
  revalidatePath("/instagram");
  return { ok: true };
}

export async function ehdotaHaaste(id: string): Promise<{ ok: true; haaste: string } | { ok: false; virhe: string }> {
  const rivi = await haeRivi(id);
  if (!rivi || rivi.slotti !== "paivan_visa") return { ok: false, virhe: "Haaste vain Päivän visalle." };
  const site = await getCurrentSite();
  const v = await haePaivanVisa(site.id, rivi.paiva, false);
  if (!v) return { ok: false, virhe: "Päivälle ei ole Päivän visaa." };
  const haaste = await luonnosteleHaaste(v);
  return haaste ? { ok: true, haaste } : { ok: false, virhe: "Tekoäly ei vastannut — kirjoita haaste itse." };
}
