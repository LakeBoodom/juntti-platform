// TIETOKETJU: IKÄJÄRJESTYS — pistelasku (ChainScoreResult).
// Tulosnäkymä on pelikehyksen PeliTulos (K4, 20.10.2026); entinen ChainResultSummary-komponentti poistettu.

export type ChainScoreResult = {
  score: number;
  correctCount: number;
  totalCount: number;
  longestCorrectChain: number;
};

/**
 * TILAPÄINEN PISTEKAAVA — EI LOPULLINEN (tehtävänanto kohta 3/ChainResultSummary):
 * score = täysin oikein × 100 + "lähes oikein" -bonus per etäisyys.
 * "Lähes oikein" -bonus väärin sijoitetulle kortille: max(0, 20 − 5 × |ero oikeaan paikkaan|).
 * Esim. yhden paikan verran väärässä → +15, kahden paikan → +10, jne. Tarkoitus on vain
 * palkita "melkein oikein" enemmän kuin täysin väärää järjestystä — pelisuunnittelu voi
 * halutessaan korvata tämän myöhemmin toisella kaavalla ilman että UI-komponentti muuttuu
 * (ChainResultSummary ottaa vastaan jo valmiiksi lasketun ChainScoreResultin).
 */
export function calculateChainScore(placedOrder: { id: string }[], correctOrder: { id: string }[]): ChainScoreResult {
  const correctIndexById = new Map(correctOrder.map((p, i) => [p.id, i]));
  let score = 0;
  let correctCount = 0;
  const correctFlags: boolean[] = [];

  placedOrder.forEach((person, placedIndex) => {
    const correctIndex = correctIndexById.get(person.id) ?? placedIndex;
    const isCorrect = correctIndex === placedIndex;
    correctFlags.push(isCorrect);
    if (isCorrect) {
      correctCount++;
      score += 100;
    } else {
      const distance = Math.abs(correctIndex - placedIndex);
      score += Math.max(0, 20 - 5 * distance);
    }
  });

  let longestCorrectChain = 0;
  let run = 0;
  for (const flag of correctFlags) {
    run = flag ? run + 1 : 0;
    if (run > longestCorrectChain) longestCorrectChain = run;
  }

  return { score, correctCount, totalCount: placedOrder.length, longestCorrectChain };
}
