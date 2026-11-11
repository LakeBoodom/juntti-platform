// VAKAA JÄRJESTYS — päivän arvontojen pooli aina samassa järjestyksessä (tietomallin vaihe B2, 11.11.2026).
//
// Siemennetty arvonta (päivän rivi, Tupla tai kuitti -päiväsarja, henkilösivun järjestyskortti, äänivisan
// harhauttimet, etusivun rotaatio) sekoittaa poolin siinä järjestyksessä, jossa se annetaan. Ilman ORDER BY:tä
// Postgres palauttaa rivit missä järjestyksessä tahansa, joten mikä tahansa kantamuutos (uusi rivi, päivitys,
// vacuum, eri kyselysuunnitelma) saattoi vaihtaa kaikille saman päivän rivin kesken päivän.
//
// Korjaus: pooli järjestetään tunnisteen mukaan ennen siemenarvontaa. Vaihto tapahtuu vain päivän rajalla:
// VAKAA_JARJESTYS_ALKAEN-päivästä (Europe/Helsinki) alkaen uusi järjestys, sitä ennen kannan järjestys kuten
// ennen, jotta käynnissä olevan päivän rivit eivät vaihdu deployssa.

/** Ensimmäinen päivä (YYYY-MM-DD, Helsingin aika), jona pooli järjestetään. Seuraava päivä julkaisusta. */
export const VAKAA_JARJESTYS_ALKAEN = "2026-11-12";

export const vakaaJarjestysKaytossa = (paivaIso: string) => paivaIso >= VAKAA_JARJESTYS_ALKAEN;

/** Merkkijonojen vertailu koodiyksiköittäin: sama tulos kaikissa ympäristöissä (ei localeComparea). */
const vertaa = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Pooli tunnisteen mukaan järjestettynä, kun päivä on rajalla tai sen jälkeen; muuten kopio sellaisenaan.
 * `avain` tuottaa yksilöivän merkkijonon (yleensä id). Tasatilanteet säilyttävät annetun järjestyksen.
 */
export function vakaasti<T>(rivit: readonly T[], avain: (x: T) => string, paivaIso: string): T[] {
  const out = rivit.slice();
  if (!vakaaJarjestysKaytossa(paivaIso)) return out;
  return out.sort((a, b) => vertaa(avain(a), avain(b)));
}
