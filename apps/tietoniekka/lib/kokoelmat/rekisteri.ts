// KOKOELMAREKISTERI — kaikki kokoelmasivut yhdessä paikassa (runko §1, 19.10.2026).
// - MESTARUUDET: yksi kokoelmasivu = yksi mestaruus (Heikki 19.10.2026, 16 kpl). Metapelin tekninen
//   toteutus lukee jaon tästä, ei quizzes.collection-kentästä. Aktivoidaan vasta, kun pisteytys,
//   saavutukset ja rekisteröityminen otetaan käyttöön (METAPELI_ENABLED). Nimet, joita CD ei vielä
//   antanut (merkitty *), ovat työnimiä.
// - KORTIT: V7 "Lisää kokoelmia" -kortti (kuva 4/3, nimi, visamäärä) ja automaattisen naapurivalinnan
//   pohja (S6: sama pääteema, sitten suosituimmat; suosio = järjestysluku, 1 = suosituin).
import type { Pääteema } from "./tyypit";

export type KokoelmaKortti = {
  slug: string;
  nimi: string;
  href: string;
  img: string;
  pos?: string;
  teema: Pääteema;
  suosio: number;
  /** Mestaruus: nimi, ikoni (merkkipohjan avain) ja väri. */
  mastery: { name: string; icon: string; color: string };
};

export const KOKOELMA_KORTIT: KokoelmaKortti[] = [
  { slug: "tunnetut-henkilot", nimi: "Tunnetut henkilöt", href: "/kokoelma/tunnetut-henkilot", img: "/20/kokoelmakortit/tunnetut-henkilot.webp", teema: "viihde", suosio: 1, mastery: { name: "Henkilöniekka", icon: "henkilo", color: "#C9A96A" } },
  { slug: "urheilu", nimi: "Urheilu", href: "/kokoelma/urheilu", img: "/20/urheilulajit/f1-kaikki-kortti.webp", teema: "urheilu", suosio: 2, mastery: { name: "Urheiluniekka*", icon: "urheilu", color: "#B6FF3C" } },
  { slug: "tv", nimi: "TV & suoratoisto", href: "/kokoelma/tv", img: "/20/etusivu/l-tv-masked-singer-kortti.webp", pos: "center 35%", teema: "viihde", suosio: 3, mastery: { name: "Sarjaniekka", icon: "tv", color: "#FF3D9E" } },
  { slug: "elokuvat", nimi: "Elokuvat", href: "/kokoelma/elokuvat", img: "/20/kokoelmakortit/elokuvat.webp", teema: "viihde", suosio: 4, mastery: { name: "Elokuvaniekka*", icon: "elokuva", color: "#FF5C3D" } },
  { slug: "musiikki", nimi: "Musiikki", href: "/kokoelma/musiikki", img: "/20/kokoelmakortit/musiikki.webp", teema: "viihde", suosio: 5, mastery: { name: "Musiikkiniekka*", icon: "musiikki", color: "#A855F7" } },
  { slug: "historia", nimi: "Historia", href: "/kokoelma/historia", img: "/20/etusivu/sp-turun-linna-kortti.webp", pos: "center 45%", teema: "tieto", suosio: 6, mastery: { name: "Historianiekka", icon: "historia", color: "#E8A320" } },
  { slug: "jaakiekko", nimi: "Jääkiekko", href: "/kokoelma/jaakiekko", img: "/20/jaakiekko/jk-leijonat-mm2026-kuva-kortti.webp", pos: "center 40%", teema: "urheilu", suosio: 7, mastery: { name: "Kiekkoniekka", icon: "kiekko", color: "#4FD1F5" } },
  { slug: "jalkapallo", nimi: "Jalkapallo", href: "/kokoelma/jalkapallo", img: "/20/etusivu/l-jalkapallo-kortti.webp", pos: "center 38%", teema: "urheilu", suosio: 8, mastery: { name: "Futisniekka", icon: "pallo", color: "#35D6A0" } },
  { slug: "kaupungit", nimi: "Suomen kaupungit", href: "/kokoelma/kaupungit", img: "/20/etusivu/sp-helsinki-kortti.webp", pos: "center 55%", teema: "tieto", suosio: 9, mastery: { name: "Kaupunkiniekka", icon: "kaupunki", color: "#E8A320" } },
  { slug: "matkakohteet", nimi: "Maantieto", href: "/kokoelma/matkakohteet", img: "/20/maantieto/suomen-majakat-kortti.webp", pos: "56% 50%", teema: "tieto", suosio: 10, mastery: { name: "Maantietoniekka*", icon: "kompassi", color: "#46D6C8" } },
  { slug: "luonto", nimi: "Luonto", href: "/kokoelma/luonto", img: "/20/etusivu/sp-revontulet.webp", pos: "center 40%", teema: "tieto", suosio: 11, mastery: { name: "Luontoniekka*", icon: "luonto", color: "#3FBF7F" } },
  { slug: "kulttuuri", nimi: "Kulttuuri", href: "/kokoelma/kulttuuri", img: "/20/kokoelmakortit/kulttuuri.webp", teema: "viihde", suosio: 12, mastery: { name: "Kulttuuriniekka*", icon: "kulttuuri", color: "#E8A320" } },
  { slug: "vaalit", nimi: "Vaalit ja politiikka", href: "/kokoelma/vaalit", img: "/20/vaalit/hero-kortti.webp", pos: "center 45%", teema: "tieto", suosio: 13, mastery: { name: "Vaaliniekka*", icon: "vaalit", color: "#B4A5FF" } },
  { slug: "tiede", nimi: "Tiede & teknologia", href: "/kokoelma/tiede", img: "/20/kokoelmakortit/tiede.webp", teema: "tieto", suosio: 14, mastery: { name: "Tiedeniekka", icon: "tiede", color: "#4FD1FF" } },
  { slug: "juhlat", nimi: "Juhlat ja pyhät", href: "/kokoelma/juhlat", img: "/20/kokoelmakortit/juhlat.webp", teema: "viihde", suosio: 15, mastery: { name: "Juhlaniekka", icon: "juhla", color: "#E8A320" } },
  { slug: "kuvavisat", nimi: "Kuvavisat", href: "/kokoelma/kuvavisat", img: "/20/kokoelmakortit/kuvavisat.webp", teema: "tieto", suosio: 16, mastery: { name: "Kuvaniekka", icon: "kuva", color: "#4C9AFF" } },
];

export const kokoelmaKortti = (slug: string) => KOKOELMA_KORTIT.find((k) => k.slug === slug) ?? null;

/** V7: asetuksen naapurit tai automaattinen valinta (S6): sama pääteema ensin, sitten suosituimmat. */
export function naapurit(slug: string, related?: string[]): KokoelmaKortti[] {
  if (related?.length) return related.map(kokoelmaKortti).filter((k): k is KokoelmaKortti => Boolean(k)).slice(0, 3);
  const oma = kokoelmaKortti(slug);
  return KOKOELMA_KORTIT.filter((k) => k.slug !== slug)
    .sort((a, b) => Number(b.teema === oma?.teema) - Number(a.teema === oma?.teema) || a.suosio - b.suosio)
    .slice(0, 3);
}
