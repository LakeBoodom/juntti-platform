// ÄÄNIVISA /aanivisa/<ryhmä> (brief §2.3, 8.10.2026): viikon visa (intro → 10 ääntä → tulos).
// Ei arkistoa eikä vaikeustasoparametria. Viikkosetti vaihtuu maanantaina → ISR 10 min riittää.
// Tuotannossa ryhmä näkyy vasta, kun sillä on ≥ 10 aktiivista ääntä (muuten 404); previewssä myös
// active=false-äänet (lib/aanivisat/data.ts esikatselu()).
import "../../aanivisa.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AanivisaClient from "@/components/tn20/aanivisa/AanivisaClient";
import { aanivisaHref, ryhmaPolusta, AANI_RYHMAT } from "@/lib/aanivisat";
import { esikatselu, haeAaniviikko } from "@/lib/aanivisat/data";
import { getSupabase } from "@/lib/supabase";
import { visaHref } from "@/lib/visaHref";
import { jakoMeta } from "@/lib/jakoMeta";

export const revalidate = 600;

export function generateStaticParams() {
  return AANI_RYHMAT.map((r) => ({ ryhma: r.polku }));
}

type Props = { params: Promise<{ ryhma: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = ryhmaPolusta((await params).ryhma);
  if (!r) return {};
  const title = `${r.otsikko} – viikon äänivisa`;
  // Kuvaus ilman lajinimiä (brief §2.3).
  const description = `${r.kuvaus} Viikon äänivisa, uudet äänet joka maanantai.`;
  return {
    title: { absolute: `${title} | Tietoniekka` },
    description,
    alternates: { canonical: aanivisaHref(r) },
    ...(esikatselu() ? { robots: { index: false, follow: false } } : {}),
    ...jakoMeta({ title, description, url: aanivisaHref(r), kuva: "/og/kokoelma/luonto" }),
  };
}

/** "Jatka aiheesta" (brief §2.4): Suomen linnut -tietovisa, Suomen pöllöt, Kuikka ja kuvavisa Suomen linnut. */
const JATKA: Record<string, Array<{ slug: string } | { otsikko: string; href: string }>> = {
  suomen_linnut: [
    { slug: "suomen-linnut-visa" },
    { slug: "suomen-pollot-yon-aanettomat-mestarit" },
    { slug: "kuikka-visa" },
    { otsikko: "Kuvavisa: Suomen linnut", href: "/kuvavisa/linnut" },
  ],
};

async function jatkaLinkit(ryhma: string) {
  const rivit = JATKA[ryhma] ?? [];
  const slugit = rivit.flatMap((r) => ("slug" in r ? [r.slug] : []));
  const sb = getSupabase();
  const { data } = sb && slugit.length
    ? await sb.from("quiz_cards" as never).select("slug, custom_slug, title, display_title").in("slug", slugit)
    : { data: [] };
  const kortit = new Map(((data ?? []) as Array<{ slug: string; custom_slug: string | null; title: string; display_title: string | null }>).map((k) => [k.slug, k]));
  return rivit.flatMap((r) => {
    if (!("slug" in r)) return [r];
    const k = kortit.get(r.slug);
    return k ? [{ otsikko: k.display_title ?? k.title, href: visaHref(k) }] : [];
  });
}

export default async function AanivisaSivu({ params }: Props) {
  const r = ryhmaPolusta((await params).ryhma);
  if (!r) notFound();
  const [viikko, jatka] = await Promise.all([haeAaniviikko(r), jatkaLinkit(r.key)]);
  if (!viikko || viikko.kysymykset.length === 0) notFound();
  return <AanivisaClient viikko={viikko} jatka={jatka} sivu={aanivisaHref(r)} />;
}
