// "PELAA SEURAAVAKSI" -PILOTTI: yhteiset tyypit (palvelin + selain).

export type Ehdokas = {
  tyyppi: "visa" | "peli";
  /** Visalla quizzes.id (pelattu-tieto tn_played_quizzes), pelillä pelimuodon slug. */
  id: string;
  nimi: string;
  href: string;
  kuva: string | null;
  kuvaPos?: string;
  /** Tupla tai kuitin palkintoikoni ym. läpinäkyvä kuvitus kokonaisena. */
  sovitus?: "contain";
  /** Lajimerkki kuvan päällä: "Tietovisa", "Tupla tai kuitti", "Järjestä", "Karttapeli", "Kuvavisa". */
  merkki: string;
  /** Pelikortin oma rivi (pelimuodon kuvaus). */
  rivi?: string;
  /** Kuvaton visa: kuva-alueelle kokoelman tai lajin nimi aksenttivärillä (CD k2, A1-kuvaton tila). */
  kuvaton: string;
  /** Porras, josta ehdokas tuli (mittaus ja Heikin raportti), esim. "p1.aihe:NHL". */
  porras: string;
};

/** Kolme paikkaa (säännöt §2): 1 Syvemmälle, 2 Toinen peli, 3 Laajemmalle. Jokaisessa 3–5 ehdokasta järjestyksessä;
 *  selain valitsee kustakin ensimmäisen pelaamattoman. Listat ovat erilliset, joten sama ehdokas ei näy kahdessa paikassa. */
export type Seuraavat = {
  pilotti: "urheilu";
  p1: Ehdokas[];
  p2: Ehdokas[];
  p3: Ehdokas[];
  /** Tulosnäkymän lajilinkki ("Jääkiekko →") kokoelmalinkin tilalle. */
  lajiLinkki: { href: string; teksti: string };
  /** Lähde mittaukseen (visan slug). */
  lahde: string;
};
