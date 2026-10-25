// PELIMUOTOREKISTERI (S4, runko §3 V6 — 19.10.2026). Yksi lista: jokainen pelimuoto ilmoittaa,
// mitä kokoelmia se palvelee (serves). Kokoelmasivun "Pelit tässä kokoelmassa" (V6) ja pelien
// tulosnäkymän "Seuraava peli" (K4) hakevat pelit täältä — kokoelman asetuksessa ei ole pelilistaa.
// Uusi pelimuoto tai Tupla tai kuitin aihe ilmestyy oikeille sivuille itsestään.
import { TEEMAT, TUPLA_SIVU } from "./tuplaTaiKuitti";
import { JULKAISTUT, pakkaHref } from "./jarjesta/pakat";

export type PeliIkoni = "kuva" | "aani" | "ika" | "jarjestys" | "kartta" | "tupla" | "kumpi" | "ketju";

export type Pelimuoto = {
  slug: string;
  /** Pelin oma nimi otsikkona ("Tupla tai kuitti: SM-liiga"). */
  nimi: string;
  ikoni: PeliIkoni;
  /** Yksi rivi. */
  kuvaus: string;
  href: string;
  tila: "pelattava" | "tulossa";
  /** Kokoelmat (kokoelmasivun slug), joita peli palvelee. */
  serves: string[];
  /** Pelin oma kuva kokoelmasivun pelikorttiin ikonin tilalle (P6, Heikki 21.10.2026; toistaiseksi Luonnon pelit).
   *  contain = kuvitus läpinäkyvällä taustalla kokonaisena (Tupla tai kuitin aiheikonit). */
  kuva?: { src: string; contain?: boolean };
};

/** Tupla tai kuitin aihe → kokoelma. Kausipainokset (Halloween, joulu) palvelevat Juhlia. */
const TUPLA_KOKOELMA: Record<string, string> = {
  "sm-liiga": "jaakiekko",
  "suomen-kaupungit": "kaupungit",
  luonto: "luonto",
  musiikki: "musiikki",
  kulttuuri: "kulttuuri",
  "tv-ja-suoratoisto": "tv",
  historia: "historia",
  maantieto: "matkakohteet",
};

/** Laita järjestykseen -pakat, joilla on oma korttikuva public/20/vaalit/pakat/<slug>.webp. Henkilöpakkojen kuvat
 *  (presidentit … eduskunta-pisimpaan, 25.10.2026) on koottu kolmesta omasta kasvokopiosta public/20/vaalit/kasvot. */
const PAKKAKUVAT = new Set(["eduskuntaryhmat", "puolueet-ika", "vaalipiirit-paikat", "presidentit", "paaministerit", "paaministerit-kesto", "eduskunta-pisimpaan"]);

export const PELIMUODOT: Pelimuoto[] = [
  ...TEEMAT.map((t) => ({
    slug: `tupla-${t.slug}`,
    nimi: `Tupla tai kuitti: ${t.nimi}`,
    ikoni: "tupla" as const,
    kuvaus: "Tuplaa potti tai kuittaa ajoissa.",
    href: `${TUPLA_SIVU}/${t.slug}`,
    tila: "pelattava" as const,
    serves: [TUPLA_KOKOELMA[t.slug] ?? (t.painos ? "juhlat" : "")].filter(Boolean),
    /* Pelin oma kuva kaikissa korteissa (pelimuotojen kehys, Heikki 25.10.2026): teeman 3D-palkintoikoni. */
    kuva: { src: t.kuva, contain: true },
  })),
  { slug: "kuntaliitos", nimi: "Kuntaliitos", ikoni: "ketju", kuvaus: "Rakenna reitti naapurikuntien kautta.", href: "/peli/kuntaliitos", tila: "pelattava", serves: ["kaupungit", "matkakohteet"], kuva: { src: "/20/kuntaliitos/palapeli.webp" } },
  { slug: "rajanaapurit", nimi: "Rajanaapurit", ikoni: "ketju", kuvaus: "Ketjuta maat yhteisen rajan kautta.", href: "/peli/rajanaapurit", tila: "pelattava", serves: ["matkakohteet"], kuva: { src: "/20/rajanaapurit/banneri-kartta.webp" } },
  { slug: "vaalipiiriketju", nimi: "Vaalipiiriketju", ikoni: "ketju", kuvaus: "Kulje vaalipiiristä toiseen kansanedustajien kautta.", href: "/peli/vaalipiiriketju", tila: "pelattava", serves: ["vaalit"], kuva: { src: "/20/vaalit/vaalipiiriketju-kortti.webp" } },
  { slug: "ikajarjestys", nimi: "Ikäjärjestys", ikoni: "ika", kuvaus: "Järjestä tunnetut henkilöt iän mukaan.", href: "/peli/ikajarjestys", tila: "pelattava", serves: ["tunnetut-henkilot"], kuva: { src: "/20/pelit/k/ikajarjestys.webp" } },
  /* Viikon kuvavisa (15 kuvaa, vaihtuu maanantaisin) — entinen "Tämän viikon visa" -kaista Kuvavisat-sivulla. */
  { slug: "kuvavisa-viikko", nimi: "Viikon kuvavisa", ikoni: "kuva", kuvaus: "15 kuvaa, uusi visa joka maanantai.", href: "/kuvavisa/viikko", tila: "pelattava", serves: ["kuvavisat"], kuva: { src: "/20/pelit/k/kuvavisat.webp" } },
  { slug: "kuvavisat", nimi: "Kuvavisat", ikoni: "kuva", kuvaus: "Tunnista liput, vaakunat, eläimet ja maalaukset kuvasta.", href: "/kokoelma/kuvavisat", tila: "pelattava", serves: ["matkakohteet"], kuva: { src: "/20/pelit/k/kuvavisat.webp" } },
  { slug: "aanivisat", nimi: "Äänivisa: Suomen linnut", ikoni: "aani", kuvaus: "Tunnista lintu laulusta.", href: "/aanivisa/suomen-linnut", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/aanivisat.webp" } },
  /* Luonnon kuvavisat omina peleinään (runko vaihe 3, 20.10.2026: Luonto-sivun "Valitse pelimuoto" -kortit → V6). */
  { slug: "kuvavisa-linnut", nimi: "Kuvavisa: Suomen linnut", ikoni: "kuva", kuvaus: "Siivet, nokat ja höyhenpuvut lähikuvassa.", href: "/kuvavisa/linnut", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/kuvavisa-linnut.webp" } },
  { slug: "kuvavisa-elaimet", nimi: "Kuvavisa: Suomen eläimet", ikoni: "kuva", kuvaus: "Pedot, sorkkaeläimet, kalat ja matelijat kuvasta.", href: "/kuvavisa/elaimet?alue=suomi", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/kuvavisa-elaimet.webp" } },
  { slug: "kuvavisa-kasvit", nimi: "Kuvavisa: Suomen kasvit ja puut", ikoni: "kuva", kuvaus: "Lehti, kukka ja kaarna tunnistettavina.", href: "/kuvavisa/kasvit", tila: "pelattava", serves: ["luonto"], kuva: { src: "/20/pelit/k/kuvavisa-kasvit.webp" } },
  /* Suomen kaupungit -megavisa — entisen Kaupungit-sivun nosto (runko vaihe 3, 20.10.2026). Rekisteri on staattinen,
     joten kuvauksissa ei ole kysymysmääriä (Heikki 20.10.: luvut datasta) — määrä näkyy megan omalla sivulla. */
  { slug: "mega-suomen-kaupungit", nimi: "Megavisa: Suomen kaupungit", ikoni: "jarjestys", kuvaus: "Kaikki 20 kaupunkia yhdessä istunnossa.", href: "/peli?mega=suomen-kaupungit-mega", tila: "pelattava", serves: ["kaupungit"], kuva: { src: "/20/pelit/k/megavisat.webp" } },
  /* Laita järjestykseen -pakat (julkaistut, lib/jarjesta/pakat.ts) palvelevat oman kokoelmansa sivua
     (runko vaihe 3, 20.10.2026: Vaalit-hubin pakkakortit → V6). */
  ...JULKAISTUT.map((p) => ({
    slug: `jarjesta-${p.slug}`,
    nimi: `Laita järjestykseen: ${p.kortti.otsikko}`,
    ikoni: "jarjestys" as const,
    kuvaus: p.kortti.meta,
    href: pakkaHref(p),
    tila: "pelattava" as const,
    serves: [p.collection.slug],
    /* Pakan oma korttikuva, muuten Vaalit-hubin kuva (kevyet kopiot, lähteet kuvalahteet.ts). */
    kuva: { src: PAKKAKUVAT.has(p.slug) ? `/20/vaalit/pakat/${p.slug}.webp` : "/20/vaalit/hero-kortti.webp" },
  })),
  { slug: "megavisat", nimi: "Megavisat", ikoni: "jarjestys", kuvaus: "Pitkät visat yhdellä istumalla.", href: "/megavisat", tila: "pelattava", serves: [], kuva: { src: "/20/pelit/k/megavisat.webp" } },
];

/** Kokoelman pelit: pelattavat ensin, sitten tulossa olevat. */
export const kokoelmanPelimuodot = (kokoelma: string) =>
  PELIMUODOT.filter((p) => p.serves.includes(kokoelma)).sort((a, b) => Number(a.tila === "tulossa") - Number(b.tila === "tulossa"));

/** K4 "Seuraava peli" (§4): 2–3 peliä rekisteristä, saman kokoelman pelit ensin, nykyinen peli pois.
 *  Ensin eri pelimuodot (yksi per ikoni), sitten täydennys. */
export function seuraavatPelit(nykyinen: string, koti?: string, n = 3): Pelimuoto[] {
  const ehdokkaat = PELIMUODOT.filter((p) => p.slug !== nykyinen && p.tila === "pelattava");
  const kotona = (p: Pelimuoto) => !!koti && p.serves.includes(koti);
  const jarj = [...ehdokkaat.filter(kotona), ...ehdokkaat.filter((p) => !kotona(p))];
  const valitut: Pelimuoto[] = [];
  for (const p of jarj) if (valitut.length < n && !valitut.some((v) => v.ikoni === p.ikoni)) valitut.push(p);
  for (const p of jarj) if (valitut.length < n && !valitut.includes(p)) valitut.push(p);
  return valitut;
}
