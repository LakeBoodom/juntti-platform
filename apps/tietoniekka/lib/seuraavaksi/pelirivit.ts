// "PELAA SEURAAVAKSI": PELIKORTIN KUVAUSRIVI (Heikki 11.11.2026, kierros 3 kohta 4). Poikkeus UI-sääntöön 9: vain korteissa,
// jotka vievät toiseen pelimuotoon (ei tietovisakorteissa), yksi rivi, enintään noin 45 merkkiä, kertoo mitä pelissä tehdään.
// Luvut tarkistettu pelien koodista 11.11.:
//   - Tupla tai kuitti: oikea vastaus tuplaa potin 1 → 512, oikean jälkeen kuittaus tai tupla, väärä vie potin (lib/tuplaTaiKuitti).
//   - Mikä maa?: 6 yritystä (lib/vihjepeli/tyypit ARVAUKSIA). Vihje 1 näkyy heti, siluetti vasta 4. vihjeenä
//     (VihjepeliClient), joten rivi on "vihjeistä", ei "siluetista".
//   - Järjestä-pakat: 8 korttia (pick 8 kaikissa pakoissa). Rivi pakan pelilauseesta ("Leijonat maaottelujen mukaan, …").
//   - Reittipelit: reitti lähtömaasta/-kunnasta maaliin rajanaapureiden kautta.
//   - Ikäjärjestys (henkilöpakat): 8 henkilöä (lib/ikajarjestysConstants ROUND_SIZE), syntymävuoden mukaan.
import type { Pelimuoto } from "@/lib/pelimuodot";
import { PAKAT } from "@/lib/jarjesta/pakat";
import { ARVAUKSIA } from "@/lib/vihjepeli/tyypit";
import { ROUND_SIZE } from "@/lib/ikajarjestysConstants";

const LUKUSANA: Record<number, string> = { 4: "neljällä", 5: "viidellä", 6: "kuudella", 7: "seitsemällä", 8: "kahdeksalla" };

export const MIKA_MAA_RIVI = `Tunnista maa vihjeistä ${LUKUSANA[ARVAUKSIA] ?? `${ARVAUKSIA}`} yrityksellä`;
export const TUPLA_RIVI = "Vastaa, tuplaa potti tai ota kuitti ajoissa";

const KIINTEAT: Record<string, string> = {
  kuntaliitos: "Rakenna reitti kunnasta toiseen rajojen yli",
  rajanaapurit: "Rakenna reitti maasta toiseen rajojen yli",
  vaalipiiriketju: "Ketjuta kansanedustajat vaalipiireittäin",
  ikajarjestys: "Järjestä tunnetut suomalaiset iän mukaan",
};

const PAKKA = new Map(PAKAT.map((p) => [`jarjesta-${p.slug}`, p]));
const pieni = (s: string) => s.charAt(0).toLocaleLowerCase("fi") + s.slice(1);

/** Rivi pelimuodon kortille; null = ei riviä (kortti pelkällä nimellä). */
export function pelinRivi(p: Pick<Pelimuoto, "slug" | "ikoni" | "kuvaus">): string | null {
  if (p.ikoni === "tupla") return TUPLA_RIVI;
  if (KIINTEAT[p.slug]) return KIINTEAT[p.slug];
  const pakka = PAKKA.get(p.slug);
  /* "Leijonat maaottelujen mukaan, eniten pelannut ensin." → "Järjestä leijonat maaottelujen mukaan" */
  if (pakka) return `Järjestä ${pieni(pakka.pelilause.split(",")[0].replace(/\.$/, ""))}`;
  /* Muut (kuva- ja äänivisat): pelimuodon oma kuvaus, jos se mahtuu riviin. */
  const k = p.kuvaus?.replace(/\.$/, "").trim();
  return k && k.length <= 48 ? k : null;
}

const PERUSLUKU: Record<number, string> = { 6: "kuusi", 7: "seitsemän", 8: "kahdeksan", 9: "yhdeksän", 10: "kymmenen" };
/** Ikäjärjestyksen pakan henkilö partitiivissa ("Laita kahdeksan muusikkoa ikäjärjestykseen"). */
const IKA_KOHDE: Record<string, string> = {
  urheilijat: "urheilijaa",
  muusikot: "muusikkoa",
  nayttelijat: "näyttelijää",
  kirjailijat: "kirjailijaa",
  "tunnetut-suomalaiset": "suomalaista",
};
export const ikaRivi = (pakka: string) => `Laita ${PERUSLUKU[ROUND_SIZE] ?? ROUND_SIZE} ${IKA_KOHDE[pakka] ?? "henkilöä"} ikäjärjestykseen`;
