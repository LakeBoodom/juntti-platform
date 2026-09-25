// TUPLA TAI KUITTI — pelisivun server-loader (esikatselu 25.9.2026).
// Arpoo kymmenen kysymyksen sarjan siemenestä palvelimella ja antaa sen clientille.
//   /peli/tupla-tai-kuitti/sm-liiga            päivän sarja (sama kaikille tänään)
//   /peli/tupla-tai-kuitti/sm-liiga?sarja=x7k2 tietty sarja (uusi arvonta, haastelinkki)
// Esikatseluvaiheessa ei linkitetä mistään eikä indeksoida.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { helsinginPaiva } from "@/lib/aika";
import { arvoSarja, teema as haeTeema, type KysymysRivi } from "@/lib/tuplaTaiKuitti";
import TuplaClient from "./TuplaClient";
import "../tupla.css";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ teema: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = haeTeema((await params).teema);
  return {
    title: t ? `Tupla tai kuitti – ${t.nimi} | Tietoniekka` : "Tupla tai kuitti | Tietoniekka",
    description: t?.kuvaus,
    robots: { index: false, follow: false },
  };
}

const SIEMEN = /^[a-z0-9-]{3,40}$/;

export default async function TuplaSivu({ params, searchParams }: Props) {
  const t = haeTeema((await params).teema);
  if (!t) notFound();
  const sp = await searchParams;
  const pyydetty = typeof sp.sarja === "string" && SIEMEN.test(sp.sarja) ? sp.sarja : null;
  const paiva = helsinginPaiva().iso;
  const siemen = pyydetty ?? `${t.slug}-${paiva}`;

  const sb = getSupabase();
  if (!sb) notFound();
  const { data: visat } = await sb.from("quizzes").select("id, title, display_title").in("slug", t.visat).eq("status", "published");
  // display_title puuttuu generoiduista tyypeistä (packages/db/types.ts) → paikallinen tyyppi.
  const rivit = (visat ?? []) as unknown as Array<{ id: string; title: string; display_title: string | null }>;
  const nimet = new Map(rivit.map((v) => [v.id, (v.display_title || v.title).trim()]));
  const { data } = await sb
    .from("questions")
    .select("id, quiz_id, question_text, explanation, answers, taso")
    .in("quiz_id", [...nimet.keys()])
    .is("image_url", null)
    .not("taso", "is", null);
  const sarja = arvoSarja((data ?? []) as unknown as KysymysRivi[], nimet, siemen);
  if (sarja.length < 10) notFound();

  return <TuplaClient teema={t} sarja={sarja} siemen={siemen} paivanSarja={!pyydetty} />;
}
