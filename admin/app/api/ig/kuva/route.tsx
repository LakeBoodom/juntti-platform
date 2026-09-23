// Instagram-kuvan piirto: /api/ig/kuva?id=<ig_julkaisut.id>[&pohja=4a][&ruutu=2][&kentat=…][&lataa=1]
//
// Pohja ja kentät (toimitetut tekstit, kysymykset, korvaava kuva) luetaan rivistä; adminin
// esikatselu voi antaa ne myös parametreina, jotta muokkaus näkyy ennen tallennusta.
// Suojattu adminin kirjautumisella (middleware) — julkaisuvaiheessa kuva tallennetaan
// Supabase Storageen, josta Instagram sen hakee.

import { getSupabaseAdmin } from "@juntti/db";
import { piirraRivi, pngVastaus, type PiirrettavaRivi } from "@/lib/ig/piirto";
import { onSynttaripohja, onVisapohja, type Kentat, type Pohja } from "@/lib/ig/pohjat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

function virhe(teksti: string, status = 400) {
  return new Response(teksti, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

type Rivi = PiirrettavaRivi;

export async function GET(req: Request) {
  const u = new URL(req.url);
  const id = u.searchParams.get("id") ?? "";
  if (!UUID.test(id)) return virhe("id puuttuu");
  const { data } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .select("site_id, paiva, slotti, quiz_id, pohja, kentat")
    .eq("id", id)
    .maybeSingle();
  const rivi = data as unknown as Rivi | null;
  if (!rivi) return virhe("Julkaisua ei löytynyt", 404);

  const pohja = (u.searchParams.get("pohja") ?? rivi.pohja) as Pohja;
  const sopii = rivi.slotti === "synttarit" ? onSynttaripohja(pohja) : onVisapohja(pohja);
  if (!sopii) return virhe("pohja ei sovi julkaisuun (kierroksen 2 pohjia ei enää piirretä)");
  const ruutu = Math.max(1, Number(u.searchParams.get("ruutu") ?? 1)) - 1;
  let kentat: Kentat = rivi.kentat ?? {};
  const kp = u.searchParams.get("kentat");
  if (kp) {
    try { kentat = JSON.parse(kp) as Kentat; } catch { return virhe("kentat ei ole JSON"); }
  }

  const p = await piirraRivi(rivi, { pohja, kentat });
  if (!p) return virhe(rivi.slotti === "synttarit" ? "Päivälle ei ole synttärisankaria" : "Visaa ei löytynyt", 404);
  const { piirros, fontit } = p;
  const el = piirros.ruudut[Math.min(ruutu, piirros.ruudut.length - 1)];

  const lataa = u.searchParams.get("lataa") === "1";
  const tiedosto = `tietoniekka-${rivi.paiva}-${pohja}${piirros.ruudut.length > 1 ? `-${ruutu + 1}` : ""}.png`;
  return pngVastaus(el, fontit, {
    "Cache-Control": "no-store",
    ...(lataa ? { "Content-Disposition": `attachment; filename="${tiedosto}"` } : {}),
  });
}
