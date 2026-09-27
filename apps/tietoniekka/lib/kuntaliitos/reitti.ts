// KUNTALIITOS — reitin arvonta ja kartta palvelimella (26.9.2026).
// Kunta-aineisto (kunnat.json, ~420 kt) luetaan vain täällä; selaimelle lähtee yksi reitti
// ja sen alueen kartta. Aineisto generoidaan: scripts/kuntaliitos-data.mjs.
// Moottori on yhteinen Rajanaapurit-pelin kanssa (lib/reittipeli/moottori.ts, 27.9.2026).

import data from "./kunnat.json";
import { luoReittimoottori, type RpData } from "@/lib/reittipeli/moottori";

const moottori = luoReittimoottori(
  { lahde: data.lahde, alueet: data.kunnat, rajat: data.rajat } as unknown as RpData,
  {
    nimi: "kuntaliitos",
    // Arvonnassa vain selvät maarajat: lyhyt kulmakosketus tai merialueen raja ei ole reilu ratkaisu.
    arvontaMinM: 2000,
    // Aineiston yksikkö 100 m: reunatila vähintään 12 km, kartta vähintään 40 × 50 km, ruutu 200 m.
    minPad: 120,
    minLeveys: 400,
    minKorkeus: 500,
    ruutu: 2,
    // Ahvenanmaa ei ole valikossa: sieltä ei pääse maateitse mantereelle, eikä saarten sisällä
    // ole kahdeksan kunnan maarajareittiä (testattu 26.9.2026: 0 / 200 arvontaa).
    eiValikkoon: ["Ahvenanmaa"],
  },
);

export const arvoReitti = moottori.arvoReitti;
export const KL_MAAKUNNAT = moottori.valikko;
export const maakuntaTunnuksella = moottori.ryhmaTunnuksella;
export const KL_LAHDE = moottori.lahde;
