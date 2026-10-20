// TUPLA TAI KUITTI — K2-aloituksen avattavat ohjeet ("Näin pelaat", "Pelin tausta"), yhteiset aihesivulle ja
// aiheen pelisivulle (pelikehys, 20.10.2026). Tekstit entiseltä aihesivulta (CD v0.2, 26.9.2026).
import { POTTI, TURVAT } from "@/lib/tuplaTaiKuitti";

const t1 = POTTI[TURVAT[0] - 1];
const t2 = POTTI[TURVAT[1] - 1];

export const TUPLA_SAANNOT = [
  { h: "Oikein tuplaa", s: "1 → 2 → 4 … 512." },
  { h: "Kuittaa tai tuplaa", s: "Ota potti tai jatka vaikeampaan kysymykseen." },
  { h: "Väärin vie potin", s: `Turvatasot ${t1} ja ${t2} jäävät sinulle.` },
];

export const TUPLA_ESITTELY = [
  {
    h: "Suomalaisen televisioviihteen klassikko.",
    s: "Tupla tai kuitti nähtiin Suomen televisiossa ensimmäisen kerran vuonna 1958. Pitkäaikaisen juontajansa Kirsti Rautiaisen tutuksi tekemä tietovisa saa nyt Tietoniekan oman version.",
  },
  {
    h: "Oma aihe, oma näytön paikka.",
    s: "Kilpailija valitsee aihealueensa ja pääsee näyttämään, kuinka syvälle hänen tietonsa ulottuvat. Kerrallaan valokeilassa on yksi kilpailija.",
  },
  {
    h: "Tuplaa tai lunasta voittosi.",
    s: "Oikean vastauksen jälkeen edessä on päätös: jatkaako tavoittelemaan kaksinkertaista palkintoa vai lopettaako ja pitääkö jo voitetun summan?",
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
