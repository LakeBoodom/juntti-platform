// Sivuston haku (Heikki 16.11.2026): hakuindeksi palvelimella. Visat (quiz_cards), henkilösivut, kaupunkisivut,
// kokoelmat ja pelimuodot yhdeksi kevyeksi listaksi. Selain hakee sen /api/haku-reitiltä vasta, kun haku avataan
// (CDN-välimuisti tunnin), ja /haku-sivu käyttää samaa listaa palvelimella. Hakumoottori: lib/hakuMoottori.ts.
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { visaHref } from "@/lib/visaHref";
import { henkiloHref } from "@/lib/henkiloSlug";
import { kaupunkiHref, haeKaupungit } from "@/lib/kaupunkisivu";
import { NAV_COLLECTIONS, NAV_MODES, navHref } from "@/lib/nav";
import { COLLECTION_LABEL } from "@/lib/visanKokoelma";
import { KATEGORIAT } from "@/lib/kuvavisat2026";
import { lapsetNakyvissa } from "@/lib/lapset/data";
import type { HakuKohde } from "@/lib/hakuMoottori";

/** Kokoelmien ja pelien lisähakusanat: sanat, joilla ihmiset niitä etsivät, vaikka ne eivät ole nimessä. */
const KOKOELMA_SANAT: Record<string, string> = {
  tv: "tv-sarjat sarjat televisio suoratoisto netflix",
  urheilu: "urheilulajit ralli golf tennis f1 formula koripallo lentopallo salibandy",
  jaakiekko: "leijonat liiga nhl kiekko",
  jalkapallo: "futis valioliiga mestarien liiga huuhkajat maajoukkueet",
  matkakohteet: "maat pääkaupungit liput matkailu",
  kaupungit: "kunnat paikkakunnat",
  "tunnetut-henkilot": "julkkikset henkilöt",
  kulttuuri: "taide kirjallisuus arkkitehtuuri",
  historia: "sodat talvisota jatkosota presidentit",
  vaalit: "politiikka eduskunta puolueet",
  luonto: "eläimet linnut kasvit",
  tiede: "avaruus keksinnöt tekniikka",
  juhlat: "joulu juhannus pääsiäinen vappu itsenäisyyspäivä",
  lapset: "lasten visat lapsille",
};
const PELI_SANAT: Record<string, string> = {
  "/peli/karttapelit": "kartta rajanaapurit kuntaliitos yhdysvallat osavaltiot reittipeli junankuljettaja juna rautatie",
  "/peli/jarjesta": "ikäjärjestys järjestys presidentit",
  "/peli/mika-maa": "maa liput arvaa maa",
  "/peli/tupla-tai-kuitti": "riski tuplaa",
  "/megavisat": "megavisa iso visa",
  "/kokoelma/kuvavisat": "kuvat liput vaakunat",
  "/aanivisa/suomen-linnut": "äänet linnut laulu",
  "/visapaketit": "visailta pubivisa juhlat tulostettava",
  "/peli/vaalipiiriketju": "vaalit kansanedustajat",
};
/** Pelimuotojen omat pelit, jotka eivät ole valikossa omina riveinään. */
const LISAPELIT: HakuKohde[] = [
  { t: "p", n: "Rajanaapurit", h: "/peli/rajanaapurit", a: "valtiot kartta naapurit" },
  { t: "p", n: "Kuntaliitos", h: "/peli/kuntaliitos", a: "kunnat kartta" },
  { t: "p", n: "Junankuljettaja", h: "/peli/junankuljettaja", a: "juna rautatiet asemat radat kartta" },
  { t: "p", n: "Ikäjärjestys", h: "/peli/ikajarjestys", a: "kuka on vanhin järjestä" },
];

type Kortti = {
  id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null;
  collection: string | null; category: string | null; game_mode: string | null; tags: string[] | null;
  target_age: string | null; play_count: number | null; paikkakunnat: string[] | null;
};

export async function haeHakuindeksi(): Promise<HakuKohde[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  const kohteet: HakuKohde[] = [];
  if (sb && siteId) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const db = sb as any;
    const [kortit, henkilot] = await Promise.all([
      db.from("quiz_cards").select("id, slug, custom_slug, title, display_title, collection, category, game_mode, tags, target_age, play_count, paikkakunnat"),
      db.from("celebrities").select("name, nickname, role").eq("site_id", siteId),
    ]);
    const lapset = lapsetNakyvissa();
    for (const k of (kortit.data ?? []) as Kortti[]) {
      const lasten = k.target_age === "4-7" || k.target_age === "8-12";
      if (lasten && !lapset) continue;
      const nimi = (k.display_title || k.title).trim();
      const lisa = [
        k.display_title && k.title !== k.display_title ? k.title : "",
        k.collection ? COLLECTION_LABEL[k.collection] ?? "" : "",
        k.category ?? "",
        (k.tags ?? []).join(" "),
        (k.paikkakunnat ?? []).join(" "),
        k.game_mode === "mega" ? "megavisa" : "",
        lasten ? "lapset lasten" : "",
      ].filter(Boolean).join(" ");
      const kokoelma = k.game_mode === "mega" ? "Megavisa" : lasten ? "Lasten visat" : k.collection ? COLLECTION_LABEL[k.collection] : undefined;
      kohteet.push({ t: "v", n: nimi, h: visaHref(k), a: lisa || undefined, s: k.play_count ?? 0, c: kokoelma });
    }
    for (const h of (henkilot.data ?? []) as { name: string; nickname: string | null; role: string | null }[]) {
      kohteet.push({ t: "h", n: h.name, h: henkiloHref(h.name), a: [h.nickname, h.role].filter(Boolean).join(" ") || undefined });
    }
  }
  for (const k of await haeKaupungit()) {
    if (!k.julkaistu) continue;
    kohteet.push({ t: "k", n: k.nimi, h: kaupunkiHref(k.slug), a: [k.asukasnimitys, "kaupunki"].filter(Boolean).join(" ") });
  }
  for (const c of NAV_COLLECTIONS) {
    if (c.slug === "lapset" && !lapsetNakyvissa()) continue;
    kohteet.push({ t: "c", n: c.label, h: navHref(c), a: KOKOELMA_SANAT[c.slug] });
  }
  for (const m of NAV_MODES) kohteet.push({ t: "p", n: m.label, h: m.href, a: [PELI_SANAT[m.href], m.desc].filter(Boolean).join(" ") });
  kohteet.push(...LISAPELIT);
  for (const k of KATEGORIAT) kohteet.push({ t: "p", n: `Kuvavisa: ${k.otsikko}`, h: `/kuvavisa/${k.type}`, a: "kuvavisa kuvat" });
  return kohteet;
}
