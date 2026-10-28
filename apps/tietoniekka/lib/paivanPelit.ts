// PÄIVÄN PELIT: vaihtuva slotti (etusivu v5, 28.10.2026).
// Slotin sisältö tulee lähteistä, jotka palauttavat saman rajapinnan ({kicker, otsikko, rivi, kuva, href}) — slotti
// ei ole sidottu quizzes-tauluun. Lähteet kysytään järjestyksessä, ensimmäinen ei-tyhjä voittaa.
// Tuleva Päivän haaste (Heikki 28.10.): joka päivä uusi peli päivittäiseltä generaattorilta omaan tauluunsa, sama
// kaikille saman päivän ajan ja uudelleenpelattava → lisätään oma SlottiLahde listan alkuun, kicker "Päivän haaste".
export type PaivanSlotti = {
  /** Tunniste "n/3 pelattu tänään" -laskuriin (sama koko päivän). */
  avain: string;
  /** "Päivän peli", "Päivän haaste" */
  kicker: string;
  /** Desktopilla kickerin perään (" · Kuntaliitos"); mobiilissa ei. */
  tarkenne?: string;
  otsikko: string;
  rivi: string;
  cta: string;
  href: string;
  kuva: string | null;
  kuvaPos?: string;
  aksentti: string;
};
export type SlottiLahde = (paiva: { iso: string; nro: number }) => Promise<PaivanSlotti | null> | PaivanSlotti | null;

/* Kierto: olemassa olevat päiväpelit vuorotellen päivän numeron mukaan. Kumpi? ja Mikä maa? syttyvät, kun tila = "pelattava". */
type KiertoPeli = Omit<PaivanSlotti, "kicker" | "tarkenne"> & { pelimuoto: string; tila: "pelattava" | "tulossa" };
export const KIERTO: KiertoPeli[] = [
  { avain: "kumpi", pelimuoto: "Kumpi?", otsikko: "Päivän kysymys", rivi: "Valitse parista oikea.", cta: "Valitse", href: "", kuva: null, aksentti: "#C4A1FF", tila: "tulossa" },
  { avain: "mika-maa", pelimuoto: "Mikä maa?", otsikko: "Päivän maa", rivi: "Tunnista maa vihjeistä ja siluetista.", cta: "Arvaa", href: "", kuva: null, aksentti: "#B4532A", tila: "tulossa" },
  { avain: "kuvavisa-viikko", pelimuoto: "Kuvavisa", otsikko: "Viikon kuvavisa", rivi: "Sama setti kaikille koko viikon.", cta: "Pelaa", href: "/kuvavisa/viikko", kuva: "/20/etusivu/banneri-kuvavisat-liput.webp", aksentti: "#22D3EE", tila: "pelattava" },
  { avain: "kuntaliitos", pelimuoto: "Kuntaliitos", otsikko: "Päivän reitti", rivi: "Kunnasta toiseen naapurikuntien kautta.", cta: "Pelaa", href: "/peli/kuntaliitos", kuva: "/20/kuntaliitos/palapeli.webp", aksentti: "#4ADE80", tila: "pelattava" },
  { avain: "rajanaapurit", pelimuoto: "Rajanaapurit", otsikko: "Päivän reitti", rivi: "Maasta toiseen yhteisten rajojen yli.", cta: "Pelaa", href: "/peli/rajanaapurit", kuva: "/20/rajanaapurit/banneri-kartta.webp", aksentti: "#4ADE80", tila: "pelattava" },
];

const kierto: SlottiLahde = ({ nro }) => {
  const pelattavat = KIERTO.filter((s) => s.tila === "pelattava");
  if (!pelattavat.length) return null;
  const { pelimuoto, tila: _tila, ...p } = pelattavat[((nro % pelattavat.length) + pelattavat.length) % pelattavat.length];
  return { ...p, kicker: "Päivän peli", tarkenne: pelimuoto };
};

/** Lähteet etusijajärjestyksessä. */
export const SLOTIN_LAHTEET: SlottiLahde[] = [kierto];

export async function paivanSlotti(paiva: { iso: string; nro: number }): Promise<PaivanSlotti | null> {
  for (const lahde of SLOTIN_LAHTEET) {
    const s = await lahde(paiva);
    if (s) return s;
  }
  return null;
}
