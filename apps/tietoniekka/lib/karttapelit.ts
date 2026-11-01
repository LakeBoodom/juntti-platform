// KARTTAPELIT — kolme karttaa yhdellä sivulla (CD-handoff "Rajanaapurit: Yhdysvallat", 4a; Heikki 1.11.2026).
// Sivu /peli/karttapelit on järjestetty karttojen mukaan: pelien nimet jäävät yläotsikoiksi. Uusi kartta = uusi rivi
// tähän. Koukku on viikon reitin käsin taivutettu otsikko, joten se vaihtuu maanantaisin. Kelpaa myös selaimeen.

import { RN_SIVU, RN_USA_SIVU } from "./rajanaapurit";
import { KL_SIVU } from "./kuntaliitos";
import { viikonReitti, viikonSiemen, type VIIKON_REITIT } from "./reittipeli/viikonReitit";

export const KARTTAPELIT_SIVU = "/peli/karttapelit";

export type Karttapeli = {
  peli: keyof typeof VIIKON_REITIT;
  laji: string;
  nimi: string;
  href: string;
  /** Koukun loppu viikon reitin otsikon perässä. */
  loppu: string;
  /** Kortin yksi lause: mitä pelissä tehdään ja mikä sääntö puree. */
  kuvaus: string;
  /** Aluevalinnan parametri; null = ei aluevalintaa. */
  param: string | null;
};

export const KARTTAPELIT: Karttapeli[] = [
  { peli: "rajanaapurit", laji: "Rajanaapurit", nimi: "Maailma", href: RN_SIVU, loppu: "maa kerrallaan", kuvaus: "Järjestä maat reitiksi. Vain maarajat kelpaavat.", param: "maanosa" },
  { peli: "kuntaliitos", laji: "Kuntaliitos", nimi: "Suomi", href: KL_SIVU, loppu: "kunta kerrallaan", kuvaus: "Järjestä kunnat reitiksi. Vain rajanaapurit kelpaavat.", param: "maakunta" },
  { peli: "osavaltiot", laji: "Rajanaapurit", nimi: "Yhdysvallat", href: RN_USA_SIVU, loppu: "osavaltio kerrallaan", kuvaus: "Järjestä osavaltiot reitiksi. Pelkkä nurkka ei riitä.", param: null },
];

/** "Kanadasta Panamaan maa kerrallaan"; kun lista on lopussa, pelkkä kartan nimi jää kortille. */
export function karttapelinKoukku(k: Karttapeli, viikko: string): string | null {
  const o = viikonReitti(k.peli, viikko)?.otsikko;
  return o ? `${o} ${k.loppu}` : null;
}

export const karttapelinKuva = (k: Karttapeli, viikko: string) => `/og/reitti/${k.peli}/hub?reitti=${viikonSiemen(viikko)}`;
