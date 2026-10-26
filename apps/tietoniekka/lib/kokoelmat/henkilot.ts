// TUNNETUT HENKILÖT rungolla (runko vaihe 3 ryhmä 3, 20.10.2026). Kohteet ovat henkilöitä, joilla on julkaistu
// visa; kortti vie henkilösivulle (Heikki 4.10.2026: siellä ovat henkilön kaikki pelit). Osiot = seitsemän
// henkilöryhmää (lib/henkiloRyhmat.ts, brief §3). V4 = "Tänään ja tulevat synttärit" (brief: palautetaan),
// V3:n yläpuolella henkilöhaku ja linkki kaikkiin henkilöihin A–Ö (myös henkilöt ilman visaa, /henkilot).
import type { Kokoelma } from "./tyypit";
import type { UlkoinenKohde } from "./data";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { helsinginPaiva } from "@/lib/aika";
import { henkiloKuva } from "@/lib/henkilokuvat";
import { henkiloHref } from "@/lib/henkiloSlug";
import { RYHMAT, ryhma, ryhmaOf } from "@/lib/henkiloRyhmat";
import { kokoelmaKortti } from "./rekisteri";

export const HENKILOT: Kokoelma = {
  slug: "tunnetut-henkilot",
  nimi: "Tunnetut henkilöt",
  eyebrow: "",
  title: "Tunnetut ",
  highlight: "henkilöt",
  ingress: "Näyttelijät, artistit, urheilijat ja muut tutut kasvot — kuinka hyvin tunnet heidät?",
  accent: kokoelmaKortti("tunnetut-henkilot")!.mastery.color,
  hero: { image: "/20/teema-tunnetut-henkilot.webp", focalX: 0.5, focalY: 0.35, alt: "Tunnettuja suomalaisia" },
  cta: "suosituin",
  osiotNimi: "Ryhmät",
  sections: RYHMAT.map((r) => ({ slug: `henkilot-${r.key}`, title: r.nimi, chip: r.lyhyt })),
  related: ["tv", "musiikki", "urheilu"],
  mastery: { name: kokoelmaKortti("tunnetut-henkilot")!.mastery.name, icon: "henkilo" },
  haku: {},
  korttiIlmanKuvaa: true,
};

export type Synttari = { nimi: string; href: string; kuva: string | null; paiva: string; ika: number; vari: string };
export type HakuHenkilo = { nimi: string; href: string };

type Celeb = {
  id: string; name: string; role: string | null; ryhma: string | null; laji: string | null;
  image_url: string | null; birth_date: string | null; trivia_quiz_id: string | null; priority: number | null;
};

/** Henkilöt rungon kohteiksi + synttäririvi + hakulista. */
export async function haeHenkilot(): Promise<{ kohteet: UlkoinenKohde[]; synttarit: Synttari[]; haku: HakuHenkilo[] } | null> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return null;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const db = sb as any;
  const { data } = await db
    .from("celebrities")
    .select("id, name, role, ryhma, laji, image_url, birth_date, trivia_quiz_id, priority")
    .eq("site_id", siteId)
    .order("name");
  const kaikki = (data ?? []) as Celeb[];

  /* Vain julkaistut visat (quiz_cards); erissä, ettei in()-lista kasva liian pitkäksi URL:ksi. */
  const idt = [...new Set(kaikki.map((c) => c.trivia_quiz_id).filter(Boolean))] as string[];
  const erat: string[][] = [];
  for (let i = 0; i < idt.length; i += 100) erat.push(idt.slice(i, i + 100));
  const tulokset = await Promise.all(erat.map((e) => db.from("quiz_cards").select("id, play_count").in("id", e)));
  const pelattu = new Map<string, number>(
    tulokset.flatMap((r: any) => ((r.data ?? []) as Array<{ id: string; play_count: number | null }>).map((x) => [x.id, x.play_count ?? 0] as const)),
  );
  const visalliset = kaikki.filter((c) => c.trivia_quiz_id && pelattu.has(c.trivia_quiz_id));

  const kohteet: UlkoinenKohde[] = visalliset.map((c) => ({
    tagit: [`henkilot-${ryhmaOf(c.ryhma, c.laji)}`],
    visa: {
      id: c.trivia_quiz_id!,
      slug: c.id,
      nimi: c.name,
      href: henkiloHref(c.name),
      kuva: henkiloKuva(c.image_url),
      kuvaPos: "50% 22%",
      meta: c.role ?? "",
      playCount: pelattu.get(c.trivia_quiz_id!) ?? 0,
    },
  }));

  /* Synttärit: Suomen päivästä eteenpäin, 12 lähintä (vain henkilöt, joilla on julkaistu visa). */
  const hp = helsinginPaiva();
  const tanaanAvain = hp.kk * 100 + hp.pv;
  const synttarit: Synttari[] = visalliset
    .filter((c) => c.birth_date)
    .map((c) => {
      const [v, kk, pv] = c.birth_date!.slice(0, 10).split("-").map(Number);
      const avain = kk * 100 + pv;
      const etaisyys = avain >= tanaanAvain ? avain - tanaanAvain : avain + 1300 - tanaanAvain;
      const tanaVuonna = avain >= tanaanAvain ? hp.vuosi : hp.vuosi + 1;
      return { c, etaisyys, v, kk, pv, ika: tanaVuonna - v };
    })
    .sort((a, b) => a.etaisyys - b.etaisyys)
    .slice(0, 12)
    .map(({ c, etaisyys, kk, pv, ika }) => ({
      nimi: c.name,
      href: henkiloHref(c.name),
      kuva: henkiloKuva(c.image_url),
      paiva: etaisyys === 0 ? "Tänään" : etaisyys === 1 ? "Huomenna" : `${pv}.${kk}.`,
      ika,
      vari: ryhma(ryhmaOf(c.ryhma, c.laji)).vari,
    }));

  return { kohteet, synttarit, haku: kaikki.map((c) => ({ nimi: c.name, href: henkiloHref(c.name) })) };
}
