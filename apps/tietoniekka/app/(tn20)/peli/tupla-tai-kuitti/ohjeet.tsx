// TUPLA TAI KUITTI — K2-aloituksen avattavat ohjeet ("Näin pelaat", "Pelin tausta"), yhteiset aihesivulle ja
// aiheen pelisivulle (pelikehys, 20.10.2026). Tekstit uusittu 12.11.2026 (Heikki).
import { POTTI, TURVAT } from "@/lib/tuplaTaiKuitti";

/* Heikki 12.11.2026: "Näin pelaat" = pelin ohjeet (enintään 3 kohtaa, kokonaisin lausein); "Pelin tausta" = vain formaatin
   historia Suomessa. Luvut pelin vakioista (POTTI, TURVAT), ei kovakoodattuja. Taustan lähde: fi.wikipedia.org/wiki/Tupla_tai_kuitti
   (12.11.2026); Wikipedian lähteettömiksi merkityt kohdat (palkintosummat) jätetty pois. */
const KYSYMYKSIA = POTTI.length;
const T1 = POTTI[TURVAT[0] - 1];
const T2 = POTTI[TURVAT[1] - 1];
const LUKU = ["", "ensimmäisen", "toisen", "kolmannen", "neljännen", "viidennen", "kuudennen", "seitsemännen", "kahdeksannen", "yhdeksännen"];

export const TUPLA_SAANNOT = [
  {
    h: "Valitse aihe",
    s: `Valitse aihealue, jossa tietosi ovat vahvimmillaan. Saat ${KYSYMYKSIA} kysymystä, ja jokainen on edellistä vaikeampi.`,
  },
  {
    h: "Tuplaa tai ota kuitti",
    s: `Jokainen oikea vastaus tuplaa pottisi: ensimmäisestä saat ${POTTI[0]}, viimeisestä ${POTTI[KYSYMYKSIA - 1]}. Oikean vastauksen jälkeen päätät itse, otatko kuitin ja pidät voittosi vai jatkatko vaikeampaan kysymykseen.`,
  },
  {
    h: "Väärä vastaus vie potin",
    s: `Jos vastaat väärin, potti menee. Turvatasot pelastavat osan: ${LUKU[TURVAT[0]]} oikean vastauksen jälkeen sinulle jää varmasti ${T1}, ${LUKU[TURVAT[1]]} jälkeen ${T2}.`,
  },
];

export const TUPLA_ESITTELY = [
  {
    h: "Ruutuun jo vuonna 1958.",
    s: "Ohjelma alkoi Tesvisiossa ja siirtyi myöhemmin MTV:lle. Idea juontaa amerikkalaiseen The $64,000 Question -visaan, ja Ruotsissa sama peli tunnettiin nimellä Kvitt eller dubbelt.",
  },
  {
    h: "Kirsti Rautiaisen ohjelma.",
    s: "Kirsti Rautiainen juonsi ohjelmaa vuodesta 1958 vuoteen 1988, ja Tupla tai kuitti on yhä Suomen television pitkäikäisin kotimainen tietovisa. MTV3 herätti ohjelman henkiin vuosiksi 2007–2008 Kirsi Salon juontamana.",
  },
  {
    h: "Nuoret mestarit.",
    s: "Erkki Tuomioja voitti pääpalkinnon 16-vuotiaana vuonna 1963 aiheenaan sodanjälkeinen kansainvälinen politiikka. Markku Kivekäs voitti 15-vuotiaana vuonna 1962 Aku Ankalla, ja myöhemmin hänestä tuli lehden päätoimittaja.",
  },
];

export function TuplaSaannot() {
  return (
    <ul>
      {TUPLA_SAANNOT.map((r) => (
        <li key={r.h}>
          <b>{r.h}.</b> {r.s}
        </li>
      ))}
    </ul>
  );
}

export function TuplaTausta() {
  return (
    <ol>
      {TUPLA_ESITTELY.map((e) => (
        <li key={e.h}>
          <b>{e.h}</b> {e.s}
        </li>
      ))}
    </ol>
  );
}
