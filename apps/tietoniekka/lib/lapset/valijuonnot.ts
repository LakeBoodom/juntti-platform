// LASTEN VISAT — välijuonnot (TOTEUTUSBRIEF_LASTEN_VISAT.md §1, §5; data LASTEN_VISAT_DATA.json 2026-10-04).
//
// 48 yleistä klippiä, jotka eivät ole kysymyskohtaisia: oikein, melkein (pienet väärin), väärin (isommat),
// viimeinen kysymys, intro, tulos ja vinkit loppu. Tiedostonimi kertoo käytön: yl-<tyyppi>-<juontaja>-<nro>.
// Äänet: public/aanet/lapset/yleiset/<avain>.mp3. Kuplan teksti on aina täsmälleen klipin teksti.

export type Juontaja = "laura" | "mikko";

export const VALIJUONNOT: Record<string, string> = {
  "yl-intro-isommat-laura": "Moi! Minä olen Laura. Kymmenen kysymystä on tulossa. Jos jokin mietityttää, kysy vinkkiä!",
  "yl-intro-isommat-mikko": "Moi, Mikko täällä! Nyt katsotaan, kuinka paljon tiedät. Vinkkejä saa kysyä, mutta niitä on vain kolme!",
  "yl-intro-pienet-laura": "Moi! Minä olen Laura. Pelataanko yhdessä? Jos tarvitset apua, kysy minulta tai Mikolta vinkkiä!",
  "yl-intro-pienet-mikko": "Moi, minä olen Mikko! Tänään pelataan yhdessä. Kysy minulta vinkkiä, niin keksin jotain hassua!",
  "yl-melkein-laura-01": "Melkein! Katsotaanpa yhdessä.",
  "yl-melkein-laura-02": "Ei ihan, mutta hyvä yritys! Katso, tässä se on.",
  "yl-melkein-laura-03": "Melkein osui! Nyt sinä tiedät tämänkin.",
  "yl-melkein-mikko-01": "Melkein! Katsotaanpa yhdessä.",
  "yl-melkein-mikko-02": "Hups, ei ihan! Mutta katso, tuossa se on!",
  "yl-melkein-mikko-03": "Melkein! Minäkin olisin arvannut noin!",
  "yl-oikein-laura-01": "Hienoa, oikea vastaus!",
  "yl-oikein-laura-02": "Juuri niin!",
  "yl-oikein-laura-03": "Aivan oikein, hyvin mietitty!",
  "yl-oikein-laura-04": "Oikein meni!",
  "yl-oikein-laura-05": "Loistavaa, tiesit sen!",
  "yl-oikein-laura-06": "Kyllä vain, se on oikein!",
  "yl-oikein-mikko-01": "Jee, oikein! Anna ylävitonen!",
  "yl-oikein-mikko-02": "Bingo! Hyvä, Niekka!",
  "yl-oikein-mikko-03": "Oikein! Nyt minä hyppään ilosta!",
  "yl-oikein-mikko-04": "Napakymppi!",
  "yl-oikein-mikko-05": "Mahtavaa! Sinä olet nopeampi kuin minä!",
  "yl-oikein-mikko-06": "Oikein! Taputetaan yhdessä!",
  "yl-tulos-heikko-laura": "Kiitos, kun pelasit! Nyt tiedät monta uutta asiaa.",
  "yl-tulos-heikko-mikko": "Hyvä yritys! Pelataanko uudestaan? Nyt sinä jo tiedät vastaukset!",
  "yl-tulos-hyva-laura": "Vau, melkein kaikki oikein! Olet oikea tietoniekka.",
  "yl-tulos-hyva-mikko": "Huippusuoritus! Taidan tarvita sinulta vinkkejä!",
  "yl-tulos-keski-laura": "Hienosti pelattu! Moni asia oli jo tuttu.",
  "yl-tulos-keski-mikko": "Hyvä peli! Seuraavalla kerralla vielä enemmän!",
  "yl-tulos-pienet-laura": "Hienosti pelattu yhdessä! Kolme tähteä teille!",
  "yl-tulos-pienet-mikko": "Mahtavaa! Pelasitte koko visan, kolme tähteä!",
  "yl-vaarin-laura-01": "Voi ei, tämä meni nyt väärin. Mutta ei hätää!",
  "yl-vaarin-laura-02": "Melkein! Katso, tässä on oikea vastaus.",
  "yl-vaarin-laura-03": "Ei tällä kertaa, mutta seuraava voi mennä oikein.",
  "yl-vaarin-laura-04": "Hyvä yritys! Nyt tiedät tämänkin.",
  "yl-vaarin-laura-05": "Ei se mitään, tästä oppii uutta!",
  "yl-vaarin-laura-06": "Tämä oli vaikea. Kokeillaan seuraavaa!",
  "yl-vaarin-mikko-01": "Hups! Ei se mitään, minäkin mokaan joka päivä!",
  "yl-vaarin-mikko-02": "Melkein osui! Seuraava on sinun.",
  "yl-vaarin-mikko-03": "Voi kurjuus! Mutta nyt sinä tiedät oikean vastauksen.",
  "yl-vaarin-mikko-04": "Ei hätää! Tämä oli kinkkinen.",
  "yl-vaarin-mikko-05": "Hups heijaa! Jatketaan!",
  "yl-vaarin-mikko-06": "Ei mennyt, mutta hyvä arvaus!",
  "yl-viimeinen-laura-01": "Ja sitten viimeinen kysymys!",
  "yl-viimeinen-laura-02": "Vielä yksi kysymys jäljellä!",
  "yl-viimeinen-mikko-01": "Viimeinen kysymys, nyt jännittää!",
  "yl-viimeinen-mikko-02": "Tämä on viimeinen. Keskitytään!",
  "yl-vinkit-loppu-laura": "Vinkit on nyt käytetty, mutta sinä pärjäät kyllä!",
  "yl-vinkit-loppu-mikko": "Hups, vinkkipussi on tyhjä! Nyt omilla aivoilla!",
};

export const valijuontoUrl = (avain: string) => `/aanet/lapset/yleiset/${avain}.mp3`;

/** Kaikki tietyn tyypin klipit juontajalle, esim. tyyppi "oikein" → yl-oikein-laura-01, -02 … */
export function klipit(tyyppi: string, juontaja: Juontaja): string[] {
  const alku = `yl-${tyyppi}-${juontaja}`;
  return Object.keys(VALIJUONNOT).filter((k) => k === alku || k.startsWith(alku + "-"));
}

/** Arvottu klippi, ei sama kuin edellinen (brief §5: "arvottu versio, ei samaa kahdesti peräkkäin"). */
export function arvoKlippi(tyyppi: string, juontaja: Juontaja, edellinen?: string | null): string | null {
  const kaikki = klipit(tyyppi, juontaja);
  if (!kaikki.length) return null;
  const valinnat = kaikki.length > 1 ? kaikki.filter((k) => k !== edellinen) : kaikki;
  return valinnat[Math.floor(Math.random() * valinnat.length)];
}
