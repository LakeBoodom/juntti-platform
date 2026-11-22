// KUMPI? 2.0 vaihe 2 — Putken jatkoerä: GET /api/kumpi/putki?sarja=putki-xxxx&alku=40 → seuraavat 40 kysymystä samasta
// jonosta (sama siemen → sama jono, lib/kumpi/generate.ts teePutki). Jono enintään 400 kysymystä.
import { NextResponse } from "next/server";
import { arvoPutki, kelpaaPutkiSiemen, PUTKI_ERA, PUTKI_MAX } from "@/lib/kumpi/sivu";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const siemen = p.get("sarja");
  const alku = Number(p.get("alku"));
  if (!kelpaaPutkiSiemen(siemen) || !Number.isInteger(alku) || alku < 0 || alku > PUTKI_MAX) {
    return NextResponse.json({ virhe: "virheellinen pyyntö" }, { status: 400 });
  }
  const kysymykset = alku >= PUTKI_MAX ? [] : await arvoPutki(siemen, alku, PUTKI_ERA);
  if (!kysymykset) return NextResponse.json({ virhe: "ei dataa" }, { status: 503 });
  return NextResponse.json(
    { kysymykset },
    { headers: { "Cache-Control": "private, max-age=600", "X-Robots-Tag": "noindex" } },
  );
}
