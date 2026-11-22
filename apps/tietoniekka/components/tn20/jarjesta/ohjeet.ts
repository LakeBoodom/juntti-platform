// JÄRJESTÄ — Näin pelaat -kortit (jaettu NainPelaat, Heikki 22.11.2026: Järjestä sai kortit). Yhteinen pakkapeleille ja
// Ikäjärjestykselle: korttien määrä kierroksen koosta, järjestysohje pakan ylä- ja alapään merkeistä.
import type { OhjeKortti } from "@/components/tn20/ohjeet/NainPelaat";
import { VAIHTO_OHJE } from "@/lib/jarjesta/rivi";

export function jarjestaKortit(maara: number, jarjestys: string): [OhjeKortti, OhjeKortti, OhjeKortti] {
  return [
    { merkki: String(maara), otsikko: "Korjaa rivi", teksti: `${jarjestys} ${VAIHTO_OHJE}` },
    { merkki: { kuvake: "lukko" }, otsikko: "Lukitse valintasi", teksti: "Kun rivi on valmis, lukitse se. Oikeat paikat paljastuvat yksi kerrallaan." },
    { merkki: { kuvake: "nuoli" }, otsikko: "Uusi rivi heti", teksti: "Jokaiseen kierrokseen arvotaan uudet kortit, eikä sama kortti toistu peräkkäisillä kierroksilla." },
  ];
}
