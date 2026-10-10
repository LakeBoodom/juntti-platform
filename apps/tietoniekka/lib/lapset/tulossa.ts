// LASTEN VISAT — /lapset-sivun Tulossa-kaista (TOTEUTUSBRIEF_LASTEN_VISAT.md §6, design v0.2).
// Konfiguraatio, ei kantaa: kortti poistetaan täältä, kun aiheen ensimmäinen visa julkaistaan.
// Aiheet, joilla ei ole yhtään näkyvää visaa, näytetään aihegridissä himmennettyinä Tulossa-kortteina
// (TULOSSA_AIHEET), jotta Kirjat näkyy jo pilotissa.
import type { LastenIka } from "@/lib/lapset/data";

export type TulossaKortti = { avain: string; otsikko: string; kuvaus: string; iat: LastenIka[]; aihe: string; kuva: string | null; kuvaKohdistus?: string };

export const TULOSSA: TulossaKortti[] = [
  {
    avain: "maailman-elaimet", otsikko: "Maailman eläimet", kuvaus: "Aavikolta, viidakosta ja mereltä.", iat: ["4-7", "8-12"],
    aihe: "elaimet", kuva: "/20/kuvavisat/elaimet/leijona.webp", kuvaKohdistus: "30% 30%",
  },
  { avain: "lasten-kirjat", otsikko: "Lasten kirjat", kuvaus: "Kirjat, sadut ja kirjasto.", iat: ["8-12"], aihe: "kirjat", kuva: null },
];

export const TULOSSA_AIHEET = ["kirjat"];
