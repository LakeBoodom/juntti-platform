// KUMPI? 2.0 — laatuportin raportti esikatselun datasta (scripts/kumpi-laatu.ts <preview-osoite>). Ajetaan palvelimella
// service role -datalla (luonnospelaajat + kytkemättömät määrittelyt); vastauksessa vain raportti ja 30 kysymyksen otos,
// ei teemojen dataa. Tuotannossa 404.
import { NextResponse } from "next/server";
import { haeKumpiData, kumpiEsikatselu } from "@/lib/kumpi/data";
import { laatuportti } from "@/lib/kumpi/laatu";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  if (!kumpiEsikatselu()) return new NextResponse("Not found", { status: 404 });
  const data = await haeKumpiData();
  if (!data) return NextResponse.json({ virhe: "ei dataa" }, { status: 500 });
  return NextResponse.json(laatuportti(data), { headers: { "X-Robots-Tag": "noindex" } });
}
