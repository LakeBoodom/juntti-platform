// VAALIT JA POLITIIKKA rungolla (runko vaihe 3 ryhmä 3, 20.10.2026). Järjestys Heikin 18.10. linjauksen mukaan:
// Eduskuntavaalit-visat → Suomen politiikan historia (ristiinlistatut visat muista kokoelmista) → Vallan kasvot
// (puoluejohtajat, pääministerit, presidentit; kortti vie henkilösivulle). Kohteet tulevat lib/vaalit/data.ts:stä
// sivun omana tietolähteenä (haeRunkoData(k, ulkoiset)); osioiden sisäinen järjestys säilyy (paikkamäärä,
// aikajärjestys). V4 = vaalilaskuri (brief §3). Pelit (Vaalipiiriketju, Laita järjestykseen) V6:ssa.
import type { Kokoelma } from "./tyypit";
import type { UlkoinenKohde } from "./data";
import type { VaalitHub } from "@/lib/vaalit/data";
import { henkiloKuva } from "@/lib/henkilokuvat";
import { kokoelmaKortti } from "./rekisteri";

export const VAALIT: Kokoelma = {
  slug: "vaalit",
  nimi: "Vaalit ja politiikka",
  eyebrow: "Teemakokoelma",
  title: "Vaalit ja ",
  highlight: "politiikka",
  ingress: "Tunnetko eduskunnan? 200 kansanedustajaa, 13 vaalipiiriä ja Suomen politiikan pitkä linja.",
  accent: kokoelmaKortti("vaalit")!.mastery.color,
  hero: { image: "/20/vaalit/hero.webp", focalX: 0.5, focalY: 0.5, alt: "Eduskuntatalon pylväikkö ja portaat viistosti kuvattuna" },
  cta: "suosituin",
  osiotNimi: "Osiot",
  sections: [
    { slug: "vaalit-eduskunta", eyebrow: "Eduskunta", title: "Eduskuntavaalit", chip: "Eduskuntavaalit" },
    { slug: "vaalit-historia", eyebrow: "Historia", title: "Suomen politiikan historia", chip: "Politiikan historia" },
    { slug: "kasvot-puoluejohtajat", eyebrow: "Vallan kasvot", title: "Puoluejohtajat 2027 vaaleissa", chip: "Puoluejohtajat" },
    { slug: "kasvot-paaministerit", eyebrow: "Vallan kasvot", title: "Pääministerit Holkerista Orpoon", chip: "Pääministerit" },
    { slug: "kasvot-presidentit", eyebrow: "Vallan kasvot", title: "Tasavallan presidentit", chip: "Presidentit" },
  ],
  related: ["historia", "tunnetut-henkilot", "kaupungit"],
  mastery: { name: kokoelmaKortti("vaalit")!.mastery.name, icon: "vaalit" },
  haku: {},
};

/** Hubin data rungon kohteiksi. playCount = käänteinen järjestysnumero, jotta hubin järjestys säilyy. */
export function vaalitKohteet(d: VaalitHub): UlkoinenKohde[] {
  const visat = (lista: VaalitHub["omatVisat"], tagi: string): UlkoinenKohde[] =>
    lista.map((v, i) => ({
      tagit: [tagi],
      visa: {
        id: v.id,
        slug: v.href,
        nimi: v.otsikko,
        href: v.href,
        kuva: v.kuva?.src ?? null,
        kuvaPos: v.kuva ? `${Math.round(v.kuva.x * 100)}% ${Math.round(v.kuva.y * 100)}%` : undefined,
        meta: v.koti ? `${v.koti}-kokoelmasta` : "",
        playCount: 1000 - i,
      },
    }));
  const kasvot: UlkoinenKohde[] = d.kasvot.flatMap((r) =>
    r.kasvot.map((k, i) => ({
      tagit: [`kasvot-${r.avain}`],
      visa: {
        id: `${r.avain}:${k.href}`,
        slug: k.href,
        nimi: k.name,
        href: k.href,
        kuva: henkiloKuva(k.image_url),
        kuvaPos: "50% 22%",
        kuvaSovitus: "henkilo",
        meta: k.ala ?? "",
        playCount: 1000 - i,
      },
    })),
  );
  return [...visat(d.omatVisat, "vaalit-eduskunta"), ...visat(d.ristiinVisat, "vaalit-historia"), ...kasvot];
}
