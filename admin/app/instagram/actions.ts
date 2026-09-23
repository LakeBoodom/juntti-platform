"use server";

// Instagram-julkaisujen muokkaus adminissa: pohjan vaihto, toimitetut tekstit,
// kuvateksti ja hyväksyntä. Hyväksyntä tarkistaa esteet palvelimella uudelleen.

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";
import { getCurrentSite } from "@/lib/sites";
import { lataaFontit } from "@/lib/ig/fontit";
import { kelpaaKaistaleeksi, kelpaaKokoPinnaksi, kuvaOsoite, lataaKuva } from "@/lib/ig/data";
import { tarkistaSynttarit, tarkistaVisa, type Kentat, type Pohja, type VdVari } from "@/lib/ig/pohjat";
import { luonnosteleHaaste } from "@/lib/ig/kuvateksti";
import { rivinSisalto } from "@/lib/ig/sisalto";
import { lisaaPaivia, luoKampanja, luoOmaJulkaisu, tanaanHelsinki } from "@/lib/ig/suunnitelma";
import { kokoelmaNimi } from "@/lib/kokoelmat";
import { haeYhteys } from "@/lib/ig/instagram";
import { julkaiseRivi, paivitaTilastot } from "@/lib/ig/julkaisu";

type Tulos = { ok: true } | { ok: false; virhe: string };

const VISA: Pohja[] = ["V-A", "V-B", "V-C", "V-D", "V-E"];
const SYNT: Pohja[] = ["S-A", "S-B", "S-C", "S-D"];

type Rivi = {
  id: string; site_id: string; paiva: string; slotti: "paivan_visa" | "synttarit" | "oma";
  quiz_id: string | null; pohja: Pohja; pohja_vari: VdVari | null; kentat: Kentat;
};

async function haeRivi(id: string): Promise<Rivi | null> {
  const { data } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .select("id, site_id, paiva, slotti, quiz_id, pohja, pohja_vari, kentat")
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as Rivi) ?? null;
}

const rajaaProsentti = (n: unknown) => Math.min(100, Math.max(0, Math.round(Number(n) || 0)));

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
    tapahtuma: t(k.tapahtuma),
    otsake: t(k.otsake),
    ...(sisalto.length ? { sisalto } : {}),
    ...(k.kuva?.url?.trim()
      ? { kuva: { url: k.kuva.url.trim(), fx: rajaaProsentti(k.kuva.fx), fy: rajaaProsentti(k.kuva.fy) } }
      : {}),
  };
  return Object.fromEntries(Object.entries(puhdas).filter(([, v]) => v !== undefined)) as Kentat;
}

export async function tallennaJulkaisu(
  id: string,
  muutos: { pohja: Pohja; pohja_vari: VdVari | null; kentat: Kentat; kuvateksti: string | null },
): Promise<Tulos> {
  const rivi = await haeRivi(id);
  if (!rivi) return { ok: false, virhe: "Julkaisua ei löytynyt." };
  const sallitut = rivi.slotti === "synttarit" ? SYNT : VISA;
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
    .eq("id", id)
    .not("tila", "in", "(julkaistu,julkaistaan)");
  if (error) return { ok: false, virhe: error.message };
  revalidatePath("/instagram");
  return { ok: true };
}

/** Hyväksy julkaistavaksi — vain jos valitulla pohjalla ei ole esteitä. */
export async function hyvaksyJulkaisu(id: string): Promise<Tulos> {
  const rivi = await haeRivi(id);
  if (!rivi) return { ok: false, virhe: "Julkaisua ei löytynyt." };
  const { mitat } = await lataaFontit();
  const sisalto = await rivinSisalto(rivi, rivi.kentat ?? {});
  if (!sisalto) return { ok: false, virhe: rivi.slotti === "synttarit" ? "Päivälle ei ole synttärisankaria." : "Visaa ei löytynyt." };
  const esteet =
    sisalto.tyyppi === "visa"
      ? (await tarkistaVisa(mitat, rivi.pohja, sisalto.v, rivi.kentat ?? {}, rivi.pohja_vari ?? "lime")).esteet
      : (await tarkistaSynttarit(mitat, rivi.pohja, sisalto.s, rivi.kentat ?? {})).esteet;
  if (esteet.length) return { ok: false, virhe: `Ei voi hyväksyä: ${esteet.join(" ")}` };
  return asetaTila(id, "hyvaksytty");
}

export async function asetaTila(id: string, tila: "luonnos" | "hyvaksytty" | "ohitettu"): Promise<Tulos> {
  const { error } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .update({ tila, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .not("tila", "in", "(julkaistu,julkaistaan)");
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
  if (!rivi || rivi.slotti === "synttarit") return { ok: false, virhe: "Haaste vain visajulkaisuille." };
  const sisalto = await rivinSisalto(rivi, rivi.kentat ?? {}, false);
  if (!sisalto || sisalto.tyyppi !== "visa") return { ok: false, virhe: "Visaa ei löytynyt." };
  const haaste = await luonnosteleHaaste(sisalto.v);
  return haaste ? { ok: true, haaste } : { ok: false, virhe: "Tekoäly ei vastannut — kirjoita haaste itse." };
}

/* ── Päälle / pois ───────────────────────────────────────────────────── */

const KLO = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function tallennaAsetukset(muutos: {
  visa_paalla?: boolean;
  synttarit_paalla?: boolean;
  automaattinen?: boolean;
  visa_klo?: string;
  synttarit_klo?: string;
  omat_klo?: string;
}): Promise<Tulos> {
  for (const k of ["visa_klo", "synttarit_klo", "omat_klo"] as const) {
    const v = muutos[k];
    if (v !== undefined && !KLO.test(v)) return { ok: false, virhe: "Kellonaika muodossa 07:30." };
  }
  if (muutos.automaattinen && !(await haeYhteys((await getCurrentSite()).id))) {
    return { ok: false, virhe: "Yhdistä Instagram-tili ensin." };
  }
  const site = await getCurrentSite();
  const { error } = await getSupabaseAdmin()
    .from("ig_asetukset" as never)
    .upsert({ site_id: site.id, ...muutos, updated_at: new Date().toISOString() } as never, { onConflict: "site_id" });
  if (error) return { ok: false, virhe: error.message };
  revalidatePath("/instagram");
  return { ok: true };
}

/* ── Instagram-yhteys ja julkaisu ────────────────────────────────────── */

export async function julkaiseNyt(id: string): Promise<{ ok: true; permalink: string | null } | { ok: false; virhe: string }> {
  const t = await julkaiseRivi(id);
  revalidatePath("/instagram");
  return t;
}

/** Hakee Instagramin luvut heti kaikille viimeisen 30 päivän julkaisuille. */
export async function paivitaLuvut(): Promise<{ ok: true; maara: number } | { ok: false; virhe: string }> {
  const site = await getCurrentSite();
  try {
    const maara = await paivitaTilastot(site.id, { maxIka: 0, enintaan: 40 });
    revalidatePath("/instagram");
    return { ok: true, maara };
  } catch (e) {
    return { ok: false, virhe: e instanceof Error ? e.message : String(e) };
  }
}

export async function katkaiseYhteys(): Promise<Tulos> {
  const site = await getCurrentSite();
  const sb = getSupabaseAdmin();
  await sb.from("ig_asetukset" as never).update({ automaattinen: false } as never).eq("site_id", site.id);
  const { error } = await sb.from("ig_yhteys" as never).delete().eq("site_id", site.id);
  if (error) return { ok: false, virhe: error.message };
  revalidatePath("/instagram");
  return { ok: true };
}

/* ── Omat julkaisut ja kampanjat ─────────────────────────────────────── */

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export type VisaHaku = { id: string; nimi: string; kokoelma: string; kuva: boolean };

export async function haeVisoja(haku: string): Promise<VisaHaku[]> {
  const h = haku.trim();
  if (h.length < 2) return [];
  const site = await getCurrentSite();
  const { data } = await getSupabaseAdmin()
    .from("quizzes")
    .select("id, title, display_title, collection, category, hero_image, image_url")
    .eq("site_id", site.id)
    .eq("status", "published")
    .or(`title.ilike.%${h.replace(/[%,()]/g, " ")}%,display_title.ilike.%${h.replace(/[%,()]/g, " ")}%`)
    .order("published_at", { ascending: false })
    .limit(12);
  return ((data ?? []) as unknown as Array<{ id: string; title: string; display_title: string | null; collection: string | null; category: string | null; hero_image: string | null; image_url: string | null }>).map(
    (q) => ({ id: q.id, nimi: q.display_title ?? q.title, kokoelma: kokoelmaNimi(q), kuva: !!(q.hero_image ?? q.image_url) }),
  );
}

export async function luoOma(o: { paiva: string; quizId: string; otsake: string }): Promise<Tulos> {
  if (!ISO.test(o.paiva) || o.paiva < tanaanHelsinki()) return { ok: false, virhe: "Valitse päivä tänään tai myöhemmin." };
  if (!o.quizId) return { ok: false, virhe: "Valitse visa." };
  const site = await getCurrentSite();
  const r = await luoOmaJulkaisu(site.id, { paiva: o.paiva, quizId: o.quizId, otsake: o.otsake.trim() || null, kampanja: null });
  if (!r) return { ok: false, virhe: "Julkaisun luonti epäonnistui." };
  revalidatePath("/instagram");
  return { ok: true };
}

export async function luoKampanjaToiminto(o: { nimi: string; alku: string; paivia: number; kokoelma: string }): Promise<{ ok: true; teksti: string } | { ok: false; virhe: string }> {
  const nimi = o.nimi.trim();
  if (!nimi) return { ok: false, virhe: "Anna kampanjalle nimi (näkyy kuvan yläreunassa)." };
  if (!ISO.test(o.alku) || o.alku < tanaanHelsinki()) return { ok: false, virhe: "Valitse alkupäivä tänään tai myöhemmin." };
  const paivia = Math.round(o.paivia);
  if (!(paivia >= 1 && paivia <= 14)) return { ok: false, virhe: "Kampanjan pituus 1–14 päivää." };
  if (o.alku > lisaaPaivia(tanaanHelsinki(), 120)) return { ok: false, virhe: "Alkupäivä enintään neljän kuukauden päähän." };
  const site = await getCurrentSite();
  const t = await luoKampanja(site.id, { nimi, alku: o.alku, paivia, kokoelma: o.kokoelma });
  revalidatePath("/instagram");
  if (t.luotu === 0) return { ok: false, virhe: "Kokoelmasta ei löytynyt käyttämättömiä visoja." };
  return {
    ok: true,
    teksti: t.luotu < paivia ? `Luotiin ${t.luotu} julkaisua — kokoelmassa ei ollut enempää käyttämättömiä visoja.` : `Luotiin ${t.luotu} julkaisua.`,
  };
}

export async function vaihdaOmanVisa(id: string, quizId: string): Promise<Tulos> {
  const rivi = await haeRivi(id);
  if (!rivi || rivi.slotti !== "oma") return { ok: false, virhe: "Vain omien julkaisujen visan voi vaihtaa." };
  const { data: q } = await getSupabaseAdmin().from("quizzes").select("collection, category").eq("id", quizId).maybeSingle();
  if (!q) return { ok: false, virhe: "Visaa ei löytynyt." };
  const { error } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .update({ quiz_id: quizId, kokoelma: kokoelmaNimi(q as unknown as { collection: string | null; category: string | null }), tila: "luonnos", updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .not("tila", "in", "(julkaistu,julkaistaan)");
  if (error) return { ok: false, virhe: error.message };
  revalidatePath("/instagram");
  return { ok: true };
}

export async function poistaOma(id: string): Promise<Tulos> {
  const { error } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .delete()
    .eq("id", id)
    .eq("slotti", "oma")
    .not("tila", "in", "(julkaistu,julkaistaan)");
  if (error) return { ok: false, virhe: error.message };
  revalidatePath("/instagram");
  return { ok: true };
}

/* ── Kuvat ───────────────────────────────────────────────────────────── */

export type KuvanTiedot =
  | { ok: true; url: string; leveys: number; korkeus: number; kokoPinta: boolean; kaistale: boolean }
  | { ok: false; virhe: string };

async function tiedot(url: string): Promise<KuvanTiedot> {
  const k = await lataaKuva(url);
  if (!k) return { ok: false, virhe: "Kuvaa ei saatu haettua — tarkista osoite (suora kuvalinkki tai Commonsin tiedostosivu)." };
  return { ok: true, url, leveys: k.leveys, korkeus: k.korkeus, kokoPinta: kelpaaKokoPinnaksi(k), kaistale: kelpaaKaistaleeksi(k) };
}

/** Tarkistaa kuvaosoitteen (liitetty linkki) ja kertoo koon ennen käyttöä. */
export async function tarkistaKuvaOsoite(url: string): Promise<KuvanTiedot> {
  const u = kuvaOsoite(url);
  if (!/^https:\/\//i.test(u)) return { ok: false, virhe: "Osoitteen pitää alkaa https://" };
  return tiedot(u);
}

/** Toimituksen oma kuva julkiseen ig-kuvat-varastoon (Instagram hakee julkaisukuvat
    vaiheessa 2 samasta paikasta). Selain pienentää ison kuvan ennen lähetystä. */
export async function lataaIgKuva(formData: FormData): Promise<KuvanTiedot> {
  const file = formData.get("file") as File | null;
  if (!file || !file.size) return { ok: false, virhe: "Tiedosto puuttuu." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, virhe: "Tiedosto liian iso (max 8 MB)." };
  let jpeg: Buffer;
  try {
    jpeg = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch {
    return { ok: false, virhe: "Tiedosto ei ole kuva." };
  }
  const polku = `omat/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const sb = getSupabaseAdmin();
  const { error } = await sb.storage.from("ig-kuvat").upload(polku, jpeg, { contentType: "image/jpeg", upsert: false });
  if (error) return { ok: false, virhe: error.message };
  return tiedot(sb.storage.from("ig-kuvat").getPublicUrl(polku).data.publicUrl);
}
