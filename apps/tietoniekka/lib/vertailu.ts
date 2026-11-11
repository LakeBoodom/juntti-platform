// Vertailupelien yhteiset säännöt (Kumpi?, Järjestä oikein, Laita järjestykseen).
// Tietomallin vaihe B (11.11.2026): monen kindin määrittelyt ja mittarisääntö.
//
// Puhdas moduuli ilman DB-riippuvuutta: käytetään sekä palvelimella että selaimessa.

/**
 * MITTARISÄÄNTÖ. Sama attribuutti voi mitata eri asiaa eri entiteeteillä
 * (ev_attendance: Pori Jazzilla pääkonserttien yleisö, Eukonkannossa katsojat).
 * Jos kummallakin rivillä on mittari ja ne eroavat, lukuja ei verrata keskenään.
 * Jos toiselta tai kummaltakaan puuttuu mittari (NULL = vanha rivi), verrataan kuten ennen.
 */
export function mittaritSopivat(a: string | null | undefined, b: string | null | undefined): boolean {
  const ma = a?.trim() || null;
  const mb = b?.trim() || null;
  return !ma || !mb || ma === mb;
}

/** Sopiiko uusi kohde jokaisen jo valitun kanssa. Pareittain, koska NULL sopii kaikkeen
 *  mutta 'x' ja 'y' eivät toisiinsa (A=x, B=NULL, C=y: A–B ja B–C käyvät, A–C ei). */
export function mittariSopiiKaikille(uusi: string | null | undefined, valitut: Array<string | null | undefined>): boolean {
  return valitut.every((m) => mittaritSopivat(uusi, m));
}

/**
 * Määrittelyn vertailupooli kindeinä. `kinds` asetettu → kaikki listan kindit
 * ("Kumpi on vanhempi, Pori Jazz vai Särkänniemi?" = recurring_event + attraction).
 * NULL tai tyhjä → vanha käytös, pelkkä `kind`.
 */
export function maarittelynKindit(kind: string, kinds: readonly string[] | null | undefined): string[] {
  return kinds && kinds.length ? [...kinds] : [kind];
}
