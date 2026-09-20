// VISAN KOKOELMA — yksi resolveri visan kategorialle ja kokoelmasivulle.
//
// Siirretty app/(tn20)/peli/page.tsx:stä 19.9.2026 (Päivän visa -bugi B):
// etusivun Päivän visa -kortti näytti visan `collection`-kentän ("Yleistieto",
// jolle ei ole kokoelmasivua → 404), kun pelisivu näytti saman visan
// kategoriasta ratkaistun nimen ja linkin ("Suomen kaupungit" →
// /kokoelma/kaupungit). Nyt molemmat käyttävät tätä, joten ne sanovat saman.
//
// Kokoelman tunnistus (QA-003/013 + Heikki 1, 2, 5 — 29.8.2026):
// kaupunkivisat ovat kannassa collection=yleistieto/category=kaupungit,
// jääkiekko ja jalkapallo collection=urheilu → tunnistetaan category/genre-
// kentästä ja ohjataan omille teemasivuilleen. Yleistieto ei ole 2.0:ssa
// omana kokoelmana (Heikki 3) → hub /kokoelmat.

import { TIEDE_ACCENT, TIEDE_HERO } from "@/lib/tiede";
import { KAUPUNGIT_HERO_IMG } from "@/lib/kaupungit";
import { JK_HERO, JK_ACCENT } from "@/lib/jaakiekko";
import { JP_HERO } from "@/lib/jalkapallo";

export const COLLECTION_ACCENT: Record<string, string> = {
  tv: "#FF3D9E",
  urheilu: "#B6FF3C",
  elokuvat: "#FF5C3D",
  musiikki: "#A855F7",
  matkakohteet: "#46D6C8",
  yleistieto: "#E8A320",
  kulttuuri: "#E8A320",
  historia: "#E8A320",
  luonto: "#3FBF7F",
  "tunnetut-henkilot": "#C9A96A",
};
export const COLLECTION_HUB: Record<string, string> = {
  tv: "/kokoelma/tv",
  urheilu: "/kokoelma/urheilu",
  elokuvat: "/kokoelma/elokuvat",
  musiikki: "/kokoelma/musiikki",
  matkakohteet: "/kokoelma/matkakohteet",
  kulttuuri: "/kokoelma/kulttuuri",
  historia: "/kokoelma/historia",
  luonto: "/kokoelma/luonto",
  "tunnetut-henkilot": "/kokoelma/tunnetut-henkilot",
};
/* ── Kokoelman tunnistus (QA-003/013 + Heikki 1, 2, 5 — 29.8.2026):
   kaupunkivisat ovat kannassa collection=yleistieto/category=kaupungit,
   jääkiekko ja jalkapallo collection=urheilu → tunnistetaan category/genre-
   kentästä ja ohjataan omille teemasivuilleen. Yleistieto ei ole 2.0:ssa
   omana kokoelmana (Heikki 3) → hub /kokoelmat. ── */
export type Resolved = { key: string; label: string; hub: string; bg: string; accent: string };
export function resolveCollection(q: { collection: string | null; category: string | null; genre: string | null }): Resolved {
  const collection = q.collection ?? "yleistieto";
  const cat = q.category ?? "", genre = q.genre ?? "";
  /* Megat (category=mega, collection yleistieto tai tv): oma hub /megavisat.
     Lisätty 19.9.2026 — etusivun Päivän visa -kortti näytti niille
     "Yleistieto" / "Tv". Pelisivu ohjaa megat ?mega=-haaraan, joten tämä
     ei muuta pelinäkymää. */
  if (cat === "mega") return { key: "megavisat", label: "Megavisat", hub: "/megavisat", bg: "/20/megavisa.webp", accent: "#E8A320" };
  if (cat === "kaupungit") return { key: "kaupungit", label: "Suomen kaupungit", hub: "/kokoelma/kaupungit", bg: KAUPUNGIT_HERO_IMG, accent: "#E8A320" };
  /* Tiede & teknologia (20.9.2026): visat ovat kannassa yleistietoa, kokoelma
     tunnistetaan kategoriasta — sama periaate kuin kaupunkivisoilla. */
  if (cat === "tiede-teknologia") return { key: "tiede", label: "Tiede & teknologia", hub: "/kokoelma/tiede", bg: TIEDE_HERO.img, accent: TIEDE_ACCENT };
  if (cat === "jaakiekko" || genre === "jaakiekko") return { key: "jaakiekko", label: "Jääkiekko", hub: "/kokoelma/jaakiekko", bg: JK_HERO.img, accent: JK_ACCENT };
  if (genre === "jalkapallo") return { key: "jalkapallo", label: "Jalkapallo", hub: "/kokoelma/jalkapallo", bg: JP_HERO.img, accent: "#B6FF3C" };
  if (collection === "yleistieto") return { key: "yleistieto", label: "Yleistieto", hub: "/kokoelmat", bg: "/20/hero-mikko-laura.webp", accent: "#E8A320" };
  return {
    key: collection,
    label: COLLECTION_LABEL[collection] ?? "Visa",
    hub: COLLECTION_HUB[collection] ?? "/kokoelmat",
    bg: COLLECTION_BG[collection] ?? "/20/hero-mikko-laura.webp",
    accent: COLLECTION_ACCENT[collection] ?? "#E8A320",
  };
}

export const COLLECTION_BG: Record<string, string> = {
  tv: "/20/hero-tv-laura.webp",
  urheilu: "/20/hero-urheilu-mikko.webp",
  elokuvat: "/20/teema-elokuvat.webp",
  musiikki: "/20/teema-musiikki.webp",
  matkakohteet: "/20/maantieto/hero-landing.webp",
  kulttuuri: "/20/kulttuuri/hero-kollaasi.webp",
  historia: "/20/historia/hero-aikajana.webp",
  luonto: "/20/luonto/hero-landing.webp",
  "tunnetut-henkilot": "/20/teema-tunnetut-henkilot.webp",
};
export const COLLECTION_LABEL: Record<string, string> = {
  tv: "TV & Suoratoisto",
  urheilu: "Urheilu",
  elokuvat: "Elokuvat",
  musiikki: "Musiikki",
  matkakohteet: "Maantieto",
  yleistieto: "Yleistieto",
  kulttuuri: "Kulttuuri",
  historia: "Historia",
  luonto: "Luonto",
  "tunnetut-henkilot": "Tunnetut henkilöt",
};

