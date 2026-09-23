// Instagram-ajastin: pg_cron kutsuu kymmenen minuutin välein (ks. migraatio
// 20260925_ig_yhteys_ja_ajastin). Tunnistautuminen x-ajastin-avain-otsakkeella,
// jonka arvo on ig_ajastin-taulussa. Middleware päästää tämän reitin läpi.

import { timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@juntti/db";
import { getCurrentSite } from "@/lib/sites";
import { ajastinKierros } from "@/lib/ig/julkaisu";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const annettu = req.headers.get("x-ajastin-avain") ?? "";
  const { data } = await getSupabaseAdmin().from("ig_ajastin" as never).select("avain").eq("id", 1).maybeSingle();
  const oikea = (data as unknown as { avain: string } | null)?.avain ?? "";
  const a = Buffer.from(annettu);
  const b = Buffer.from(oikea);
  if (!oikea || a.length !== b.length || !timingSafeEqual(a, b)) return new Response("ei", { status: 401 });

  const site = await getCurrentSite();
  const tulos = await ajastinKierros(site.id);
  return Response.json({ tulos });
}
