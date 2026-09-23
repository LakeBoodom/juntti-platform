// Instagram-tilin yhdistäminen: ohjaa Instagramin kirjautumiseen. Suojattu adminin
// kirjautumisella (middleware); state-arvo tarkistetaan paluussa evästeestä.

import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { salaisuusAsetettu, valtuutusOsoite } from "@/lib/ig/instagram";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!salaisuusAsetettu()) {
    return NextResponse.redirect(new URL("/instagram?ig=virhe&syy=IG_APP_SECRET%20puuttuu", req.url));
  }
  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(valtuutusOsoite(state));
  res.cookies.set("ig_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/ig/yhdista", maxAge: 600 });
  return res;
}
