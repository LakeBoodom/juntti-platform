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
  /** Lajimerkki: "Tietovisa", "Tupla tai kuitti", "Järjestä", "Karttapeli", "Kuvavisa"; paikassa 3 "Tänään · 11.11." tai "Suosittu". */
  merkki: string;
  /** Pieni live-piste merkin edessä (paikka 3, päivän data; ei muistovisassa). */
  live?: boolean;
  /** Yksi rivi nimen alla: pelikortissa mitä pelissä tehdään, paikan 3 portaissa a–c syy päivän datasta
   *  ("Stadin derbyn paluupari pelataan tänään", "Täyttää tänään 66 vuotta"). Tietovisakortissa ei riviä. */
  rivi?: string | null;
  /** Pelattu-tieto selaimessa: oletus = visa tn_played_quizzes-listassa (koskaan pelattu). Päivän pelit: pelattu tänään
   *  (Mikä maa: tn-mm-<pvm>; Päivän visa: tn_paivan_visa_<pvm>, tn_pelattu_pvm tai koskaan pelattu). */
  pelattu?: { tapa: "mika-maa" | "paivan-visa" };
  /** Kuvaton visa: kuva-alueelle kokoelman tai lajin nimi aksenttivärillä (CD k2, A1-kuvaton tila). */
  kuvaton: string;
  /** Porras, josta ehdokas tuli (mittaus ja Heikin raportti), esim. "p1.aihe:NHL". */
  porras: string;
};

/** Kolme paikkaa (Heikki 11.11. kierros 3): 1 Lähin sama, 2 Sama aihe toisena pelimuotona, 3 Tänään. Jokaisessa 3–5 ehdokasta järjestyksessä;
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
