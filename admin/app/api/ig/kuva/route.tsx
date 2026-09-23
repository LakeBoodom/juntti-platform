// Instagram-kuvan piirto: /api/ig/kuva?paiva=2026-09-25&slotti=paivan_visa&pohja=V-A[&ruutu=2][&vari=lime][&kentat=…]
//
// Kentät (toimitetut tekstit) luetaan ig_julkaisut-rivistä; adminin esikatselu voi
// antaa ne myös parametrina, jotta muokkaus näkyy ennen tallennusta.
// Suojattu adminin kirjautumisella (middleware) — julkaisuvaiheessa kuva tallennetaan
// Supabase Storageen, josta Instagram sen hakee.

import { ImageResponse } from "next/og";
import { getSupabaseAdmin } from "@juntti/db";
import { getCurrentSite } from "@/lib/sites";
import { lataaFontit } from "@/lib/ig/fontit";
import { haePaivanSynttarit, haePaivanVisa } from "@/lib/ig/data";
import { H, W, piirraSynttarit, piirraVisa, type Kentat, type Pohja, type VdVari } from "@/lib/ig/pohjat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const POHJAT = new Set(["V-A", "V-B", "V-C", "V-D", "V-E", "S-A", "S-B", "S-C", "S-D"]);

function virhe(teksti: string, status = 400) {
  return new Response(teksti, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const paiva = u.searchParams.get("paiva") ?? "";
  const slotti = u.searchParams.get("slotti") ?? "";
  const pohja = u.searchParams.get("pohja") ?? "";
  const ruutu = Math.max(1, Number(u.searchParams.get("ruutu") ?? 1)) - 1;
  const vari = (u.searchParams.get("vari") ?? "lime") as VdVari;
  if (!ISO.test(paiva)) return virhe("paiva puuttuu tai on väärässä muodossa");
  if (slotti !== "paivan_visa" && slotti !== "synttarit") return virhe("slotti: paivan_visa | synttarit");
  if (!POHJAT.has(pohja)) return virhe("tuntematon pohja");

  const site = await getCurrentSite();
  let kentat: Kentat = {};
  const kp = u.searchParams.get("kentat");
  if (kp) {
    try { kentat = JSON.parse(kp) as Kentat; } catch { return virhe("kentat ei ole JSON"); }
  } else {
    const { data } = await getSupabaseAdmin()
      .from("ig_julkaisut" as never)
      .select("kentat")
      .eq("site_id", site.id)
      .eq("paiva", paiva)
      .eq("slotti", slotti)
      .maybeSingle();
    kentat = ((data as unknown as { kentat: Kentat } | null)?.kentat ?? {}) as Kentat;
  }

  const fontit = await lataaFontit();
  let piirros;
  if (slotti === "paivan_visa") {
    const v = await haePaivanVisa(site.id, paiva);
    if (!v) return virhe("Päivälle ei ole Päivän visaa", 404);
    piirros = await piirraVisa(fontit.mitat, pohja as Pohja, v, kentat, vari);
  } else {
    const s = await haePaivanSynttarit(site.id, paiva);
    if (!s) return virhe("Päivälle ei ole synttärisankaria", 404);
    piirros = await piirraSynttarit(fontit.mitat, pohja as Pohja, s, kentat);
  }
  const el = piirros.ruudut[Math.min(ruutu, piirros.ruudut.length - 1)];

  const lataa = u.searchParams.get("lataa") === "1";
  const tiedosto = `tietoniekka-${paiva}-${pohja}${piirros.ruudut.length > 1 ? `-${ruutu + 1}` : ""}.png`;
  return new ImageResponse(el, {
    width: W,
    height: H,
    fonts: fontit.satori,
    headers: {
      "Cache-Control": "no-store",
      ...(lataa ? { "Content-Disposition": `attachment; filename="${tiedosto}"` } : {}),
    },
  });
}
