// Instagram-kuvan piirto: /api/ig/kuva?id=<ig_julkaisut.id>[&pohja=V-A][&ruutu=2][&vari=lime][&kentat=…][&lataa=1]
//
// Pohja, väri ja kentät (toimitetut tekstit, korvaava kuva) luetaan rivistä; adminin
// esikatselu voi antaa ne myös parametreina, jotta muokkaus näkyy ennen tallennusta.
// Suojattu adminin kirjautumisella (middleware) — julkaisuvaiheessa kuva tallennetaan
// Supabase Storageen, josta Instagram sen hakee.

import { ImageResponse } from "next/og";
import { getSupabaseAdmin } from "@juntti/db";
import { lataaFontit } from "@/lib/ig/fontit";
import { rivinSisalto, type RivinLahde } from "@/lib/ig/sisalto";
import { H, W, piirraSynttarit, piirraVisa, type Kentat, type Pohja, type VdVari } from "@/lib/ig/pohjat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;
const VISA = new Set(["V-A", "V-B", "V-C", "V-D", "V-E"]);
const SYNT = new Set(["S-A", "S-B", "S-C", "S-D"]);

function virhe(teksti: string, status = 400) {
  return new Response(teksti, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

type Rivi = RivinLahde & { pohja: Pohja; pohja_vari: VdVari | null; kentat: Kentat };

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("id") ?? "";
  if (!UUID.test(id)) return virhe("id puuttuu");
  const { data } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .select("site_id, paiva, slotti, quiz_id, pohja, pohja_vari, kentat")
    .eq("id", id)
    .maybeSingle();
  const rivi = data as unknown as Rivi | null;
  if (!rivi) return virhe("Julkaisua ei löytynyt", 404);

  const pohja = (u.searchParams.get("pohja") ?? rivi.pohja) as Pohja;
  const sallitut = rivi.slotti === "synttarit" ? SYNT : VISA;
  if (!sallitut.has(pohja)) return virhe("pohja ei sovi julkaisuun");
  const vari = (u.searchParams.get("vari") ?? rivi.pohja_vari ?? "lime") as VdVari;
  const ruutu = Math.max(1, Number(u.searchParams.get("ruutu") ?? 1)) - 1;
  let kentat: Kentat = rivi.kentat ?? {};
  const kp = u.searchParams.get("kentat");
  if (kp) {
    try { kentat = JSON.parse(kp) as Kentat; } catch { return virhe("kentat ei ole JSON"); }
  }

  const [fontit, sisalto] = await Promise.all([lataaFontit(), rivinSisalto(rivi, kentat)]);
  if (!sisalto) return virhe(rivi.slotti === "synttarit" ? "Päivälle ei ole synttärisankaria" : "Visaa ei löytynyt", 404);
  const piirros =
    sisalto.tyyppi === "visa"
      ? await piirraVisa(fontit.mitat, pohja, sisalto.v, kentat, vari)
      : await piirraSynttarit(fontit.mitat, pohja, sisalto.s, kentat);
  const el = piirros.ruudut[Math.min(ruutu, piirros.ruudut.length - 1)];

  const lataa = u.searchParams.get("lataa") === "1";
  const tiedosto = `tietoniekka-${rivi.paiva}-${pohja}${piirros.ruudut.length > 1 ? `-${ruutu + 1}` : ""}.png`;
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
