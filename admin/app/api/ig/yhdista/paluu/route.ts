// Paluu Instagramin kirjautumisesta: koodi → pitkäikäinen token → ig_yhteys.

import { NextResponse, type NextRequest } from "next/server";
import { getCurrentSite } from "@/lib/sites";
import { yhdistaKoodilla } from "@/lib/ig/instagram";

export const dynamic = "force-dynamic";

function takaisin(req: NextRequest, params: Record<string, string>) {
  const u = new URL("/instagram", req.url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = NextResponse.redirect(u);
  res.cookies.delete({ name: "ig_state", path: "/api/ig/yhdista" });
  return res;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  if (q.get("error")) return takaisin(req, { ig: "virhe", syy: q.get("error_description") ?? q.get("error_reason") ?? q.get("error")! });
  const state = q.get("state");
  if (!state || state !== req.cookies.get("ig_state")?.value) return takaisin(req, { ig: "virhe", syy: "Tunniste ei täsmää — aloita yhdistäminen uudelleen." });
  // Instagram lisää koodin perään "#_", joka ei kuulu koodiin.
  const code = (q.get("code") ?? "").replace(/#_$/, "");
  if (!code) return takaisin(req, { ig: "virhe", syy: "Instagram ei palauttanut koodia." });
  try {
    const site = await getCurrentSite();
    const y = await yhdistaKoodilla(site.id, code);
    return takaisin(req, { ig: "yhdistetty", tili: y.kayttajanimi ?? "" });
  } catch (e) {
    return takaisin(req, { ig: "virhe", syy: e instanceof Error ? e.message : String(e) });
  }
}
