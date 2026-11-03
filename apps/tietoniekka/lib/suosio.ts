// Visan suosio (3.11.2026): quiz_cards.suosio_90pv = eri selaimet 90 päivältä (migraatio 20261130_quiz_suosio).
// Data on ohutta (useimmilla pelatuilla visoilla 1–2 selainta), joten visa nousee vasta rajan ylitettyään;
// muuten yksi pelaaja voisi vaihtaa osion ensimmäisen kortin tai heron kohteen.
export const SUOSIO_RAJA = 5;

export const suosio = (selaimia: number) => (selaimia >= SUOSIO_RAJA ? selaimia : 0);
