// LASTEN VISAT — adminin yhteiset vakiot (TOTEUTUSBRIEF_LASTEN_VISAT.md §8, vaihe 6, 10.10.2026).
// Sama sisältö kuin sivustolla: apps/tietoniekka/lib/lapset/{data,juontajat}.ts ja migraatio 20261105.
// Lasten visa = quizzes.target_age 4-7 tai 8-12.

export const LASTEN_IAT = ["4-7", "8-12"] as const;
export type LastenIka = (typeof LASTEN_IAT)[number];
export const onLastenVisa = (t: string | null | undefined): t is LastenIka => t === "4-7" || t === "8-12";

/** quizzes.target_age (check-rajoite: 30-50, 50-70, kaikki, 4-7, 8-12) */
export const KOHDERYHMAT = [
  { value: "kaikki", label: "Aikuiset – kaikki" },
  { value: "30-50", label: "Aikuiset 30–50" },
  { value: "50-70", label: "Aikuiset 50–70" },
  { value: "4-7", label: "🧸 Lapset: pienet 4–7" },
  { value: "8-12", label: "🚀 Lapset: isommat 8–12" },
] as const;
export const IKA_MERKKI: Record<LastenIka, string> = { "4-7": "🧸 4–7", "8-12": "🚀 8–12" };

export const LUKIJAT = [
  { value: "laura", label: "Laura" },
  { value: "mikko", label: "Mikko" },
] as const;

/** quizzes.lasten_aihe → /lapset-sivun aihe. Juhla-aiheen slug = lib/juhlat.ts:n juhla (esim. joulu). */
export const LASTEN_AIHEET = [
  { value: "joulu", label: "🎄 Joulu" },
  { value: "elaimet", label: "🦔 Eläimet" },
  { value: "linnut", label: "🐦 Linnut" },
  { value: "kirjat", label: "📚 Kirjat" },
] as const;

export const KYSYMYSTYYPIT = [
  { value: "teksti", label: "Teksti", kuvaus: "Tekstikysymys ja tekstivastaukset (kysymyskuva valinnainen)" },
  { value: "kuva", label: "Kysymyskuva", kuvaus: "Kysymyskuva + tekstivastaukset" },
  { value: "kuvavastaukset", label: "Kuvavastaukset", kuvaus: "Jokaisella vastauksella oma kuva" },
  { value: "aani", label: "Eläinääni", kuvaus: "Eläinääni + tekstivastaukset" },
  { value: "aani_kuvavastaukset", label: "Eläinääni + kuvat", kuvaus: "Eläinääni + kuvavastaukset" },
] as const;
export type KysymysTyyppi = (typeof KYSYMYSTYYPIT)[number]["value"];
export const onKysymysTyyppi = (s: string): s is KysymysTyyppi => KYSYMYSTYYPIT.some((t) => t.value === s);
export const vaatiiVastauskuvat = (t: KysymysTyyppi) => t === "kuvavastaukset" || t === "aani_kuvavastaukset";
export const vaatiiElainaanen = (t: KysymysTyyppi) => t === "aani" || t === "aani_kuvavastaukset";

/** Juontajaklipit questions.audio-objektissa: url + äänitetty teksti (teksti_<avain>), johon editori vertaa. */
export const KLIPIT = [
  { avain: "kysymys", label: "Kysymys", kentta: "question_text" },
  { avain: "vihje_laura", label: "Lauran vihje", kentta: "vihje_laura" },
  { avain: "vihje_mikko", label: "Mikon vihje", kentta: "vihje_mikko" },
  { avain: "tiesitko", label: "Tiesitkö", kentta: "explanation" },
] as const;

/** Sivuston mediapolku (/aanet/…, /20/…) soitettavaksi tai näytettäväksi adminissa. */
export const mediaUrl = (pohja: string, polku: string | null | undefined) =>
  !polku ? null : /^https?:\/\//.test(polku) ? polku : `${pohja.replace(/\/$/, "")}${polku.startsWith("/") ? "" : "/"}${polku}`;
