// RAJANAAPURIT: YHDYSVALLAT — osavaltioreitit palvelimella (CD-handoff "Rajanaapurit: Yhdysvallat", 1.11.2026).
// Rajanaapurien variantti: sama moottori (lib/reittipeli/moottori.ts) ja näkymä, aineistona 48 manner-
// osavaltiota. Aineisto: scripts/rajanaapurit-osavaltiot-data.mjs (Albers, km). Ei aluevalintaa (Heikki 1.11.).

import data from "./osavaltiot.json";
import { luoReittimoottori, type RpData } from "@/lib/reittipeli/moottori";

const moottori = luoReittimoottori(data as unknown as RpData, {
  nimi: "rajanaapurit-usa",
  // Delaware–New Jersey (Delawarejoen saaret, ~0 km kartalla) hyväksytään tarkistuksessa, mutta ei arvota.
  arvontaMinM: 10000,
  // Yksikkö km: kartta vähintään 1 100 × 880 km, jottei lyhyt reitti zoomaudu yhden osavaltion kokoiseksi.
  minPad: 140,
  minLeveys: 1100,
  minKorkeus: 880,
  ruutu: 2,
  solut: 450,
  ryhmat: [],
  // Sama vaakamuotoinen kartta kuin maailmankartassa (.kl--rajanaapurit .kl-kartta-alue 5:4).
  suhde: 5 / 4,
  // 7c: Rhode Island (2 600 km²) ja Delaware (5 400 km²) löytyvät kartalta renkaan avulla, kun kartta on laaja.
  pikkuRengas: { karttaPx: 366, rajaPx2: 90, maxAla: 6000 },
});

export const arvoUsaReitti = moottori.arvoReitti;
export const usaReittiAlueista = moottori.reittiAlueista;
export const USA_PELATTAVIA = moottori.pelattavia;
export const USA_LAHDE = moottori.lahde;
export const usaKuvakartta = moottori.kuvakartta;
