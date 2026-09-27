// RAJANAAPURIT — reitin arvonta ja kartta palvelimella (27.9.2026). Sama moottori kuin
// Kuntaliitoksessa (lib/reittipeli/moottori.ts). Aineisto: scripts/rajanaapurit-data.mjs.

import data from "./maat.json";
import { luoReittimoottori, type RpData } from "@/lib/reittipeli/moottori";

const moottori = luoReittimoottori(data as unknown as RpData, {
  nimi: "rajanaapurit",
  // Arvonnassa vain yli 10 km:n maarajat: Botswana–Sambia (~150 m) ja Azerbaidžan–Turkki (7 km,
  // Naxçıvan) hyväksytään tarkistuksessa, mutta eivät ole reilu ratkaisu.
  arvontaMinM: 10000,
  // Aineiston yksikkö 1 km päiväntasaajalla (Mercator): reunatila vähintään 150 km, kartta vähintään 800 × 1000 km.
  minPad: 150,
  minLeveys: 800,
  minKorkeus: 1000,
  ruutu: 3,
  // Valtiorajat ovat pitkiä: 450 ruutua riittää 400–600 px:n kartalle ja puolittaa sivun koon.
  solut: 450,
  // Papua-Uusi-Guinea (Oseania) on mukana reiteillä Indonesian kautta, mutta ei omana valintana.
  ryhmat: ["Eurooppa", "Aasia", "Afrikka", "Amerikka"],
  // Maailmankartta on vaakamuotoinen (CD v0.2: mobiili ~366 × 300 px) → kuvasuhde 5:4.
  suhde: 5 / 4,
  // maxAla 15 000 (Mercator-km²): Liechtenstein, Andorra, Luxemburg, Brunei, Gambia, Qatar.
  pikkuRengas: { karttaPx: 366, rajaPx2: 70, maxAla: 15000 },
});

export const arvoReitti = moottori.arvoReitti;
export const RN_MAANOSAT = moottori.valikko;
export const maanosaTunnuksella = moottori.ryhmaTunnuksella;
export const RN_LAHDE = moottori.lahde;
