// KUVAVISAT rungolla (runko vaihe 3 ryhmä 3, 20.10.2026). Kohteet eivät ole quiz_cards-visoja vaan kuvavisojen
// kategorioita ja niiden muunnelmia (taso, maanosa) — sivu antaa ne rungolle omana tietolähteenään
// (haeRunkoData(k, ulkoiset), lib/kuvavisat2026.ts getKuvavisatHub). Osio = kategoria, B = "Kaikki <monikko>"
// esikatselukuvalla (grafiikka kokonaisena levyllä), muunnelmat C-rivejä. Heron nappi arpoo kuvavisan
// (entinen "Arvo satunnainen kuvavisa"); viikon kuvavisa on V6-peli (lib/pelimuodot.ts).
import type { Kokoelma } from "./tyypit";
import type { UlkoinenKohde } from "./data";
import { KATEGORIAT, type KategoriaData } from "@/lib/kuvavisat2026";
import { kokoelmaKortti } from "./rekisteri";

export const KUVAVISAT: Kokoelma = {
  slug: "kuvavisat",
  nimi: "Kuvavisat",
  eyebrow: "Teemakokoelma",
  title: "Kuva",
  highlight: "visat",
  ingress: "Tunnista liput, vaakunat, linnut, eläimet, maalaukset, rakennukset ja kasvit kuvasta.",
  accent: kokoelmaKortti("kuvavisat")!.mastery.color,
  hero: { image: "/20/kuvavisat/hero.webp", focalX: 0.5, focalY: 0.5, alt: "Kuvavisojen kuvia: liput, linnut ja maalaukset" },
  cta: "arvo",
  osiotNimi: "Kategoriat",
  sections: KATEGORIAT.map((m) => ({ slug: `kv-${m.type}`, eyebrow: m.sovitus === "contain" ? "Grafiikka" : "Valokuva", title: m.otsikko, chip: m.otsikko.replace(/^Suomen /, "").replace(/^Maiden /, "") })),
  related: ["luonto", "matkakohteet", "tunnetut-henkilot"],
  mastery: { name: kokoelmaKortti("kuvavisat")!.mastery.name, icon: "kuva" },
  haku: {},
};

/** Kategoriat ja muunnelmat rungon kohteiksi: "Kaikki" ensin (B), sitten tasot ja maanosat. */
export function kuvavisaKohteet(kategoriat: KategoriaData[]): UlkoinenKohde[] {
  return kategoriat.flatMap((k) => {
    const kaikki = k.variaatiot.find((v) => v.kaikki);
    const muut = k.variaatiot.filter((v) => !v.kaikki);
    return [...(kaikki ? [kaikki] : []), ...muut].map((v, i) => ({
      tagit: [`kv-${k.meta.type}`],
      visa: {
        id: v.href,
        slug: v.href,
        nimi: v.label,
        href: v.href,
        kuva: v.kaikki ? k.esikatselut[0] ?? null : null,
        kuvaPos: v.kaikki ? k.meta.kuvaKohdistus : undefined,
        kuvaSovitus: v.kaikki && k.meta.sovitus === "contain" ? "contain" : undefined,
        meta: v.kaikki ? k.meta.kuvaus : "",
        /* Järjestys osion sisällä: Kaikki → tasot → maanosat (S1: ensimmäinen = B). */
        playCount: 1000 - i,
      },
    }));
  });
}
