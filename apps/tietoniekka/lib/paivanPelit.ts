// PÄIVÄN PELIT: vaihtuva slotti (etusivu v5, 28.10.2026). Sisältö päiväkierroksen aikataulusta; kunnes aikataulu
// on kannassa, slotti luetaan tästä listasta päivän numeron mukaan (vain pelattavat). Kumpi? ja Päivän maa
// (Mikä maa?) syttyvät vaihtamalla tila = "pelattava", kun pelit julkaistaan.
export type SlottiPeli = {
  avain: string;
  /** "Päivän peli · <pelimuoto>" */
  pelimuoto: string;
  otsikko: string;
  rivi: string;
  cta: string;
  href: string;
  kuva: string | null;
  kuvaPos?: string;
  aksentti: string;
  tila: "pelattava" | "tulossa";
};

export const SLOTTI_PELIT: SlottiPeli[] = [
  { avain: "kumpi", pelimuoto: "Kumpi?", otsikko: "Päivän kysymys", rivi: "Valitse parista oikea.", cta: "Valitse", href: "", kuva: null, aksentti: "#C4A1FF", tila: "tulossa" },
  { avain: "mika-maa", pelimuoto: "Mikä maa?", otsikko: "Päivän maa", rivi: "Tunnista maa vihjeistä ja siluetista.", cta: "Arvaa", href: "", kuva: null, aksentti: "#B4532A", tila: "tulossa" },
  { avain: "kuvavisa-viikko", pelimuoto: "Kuvavisa", otsikko: "Viikon kuvavisa", rivi: "Sama setti kaikille koko viikon.", cta: "Pelaa", href: "/kuvavisa/viikko", kuva: "/20/etusivu/banneri-kuvavisat-liput.webp", aksentti: "#22D3EE", tila: "pelattava" },
  { avain: "kuntaliitos", pelimuoto: "Kuntaliitos", otsikko: "Päivän reitti", rivi: "Kunnasta toiseen naapurikuntien kautta.", cta: "Pelaa", href: "/peli/kuntaliitos", kuva: "/20/kuntaliitos/palapeli.webp", aksentti: "#4ADE80", tila: "pelattava" },
  { avain: "rajanaapurit", pelimuoto: "Rajanaapurit", otsikko: "Päivän reitti", rivi: "Maasta toiseen yhteisten rajojen yli.", cta: "Pelaa", href: "/peli/rajanaapurit", kuva: "/20/rajanaapurit/banneri-kartta.webp", aksentti: "#4ADE80", tila: "pelattava" },
];

/** Päivän slotti: pelattavat vuorotellen päivän numeron mukaan. */
export function paivanSlotti(paivaNro: number): SlottiPeli | null {
  const pelattavat = SLOTTI_PELIT.filter((s) => s.tila === "pelattava");
  return pelattavat.length ? pelattavat[((paivaNro % pelattavat.length) + pelattavat.length) % pelattavat.length] : null;
}
