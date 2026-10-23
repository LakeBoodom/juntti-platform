// Facebookin kysymyskortti (Tulosnäkymä ja jakaminen, vaihe E; CD-arkki 2a–2d, osio 4A).
// Rajat: kysymys ≤ 90 merkkiä ja jokainen vaihtoehto ≤ 28 merkkiä; äänikysymykset ohitetaan.
// Valinta tehdään laitteella: 1) ensimmäinen väärin vastattu rajoihin mahtuva, 2) täysillä visan vaikein — kysymys-
// kohtaista oikein-%:ia ei vielä kerätä, joten ensimmäinen rajoihin mahtuva. 3) Jos sopivaa ei ole, Facebook-jako
// käyttää postikorttia (ei &k).
export const KYSYMYS_MAX = 90;
export const VAIHTOEHTO_MAX = 28;

export const mahtuuKorttiin = (q: { question: string; options: string[]; audio?: boolean }) =>
  !q.audio && q.question.trim().length <= KYSYMYS_MAX && q.options.length >= 2 && q.options.every((o) => o.trim().length <= VAIHTOEHTO_MAX);

export function valitseKorttikysymys<T extends { id?: string; question: string; options: string[]; audio?: boolean }>(
  kysymykset: T[],
  vastaukset: Array<"ok" | "bad" | "skipped" | string | undefined>,
  taydet: boolean,
): string | null {
  const ehdokkaat = kysymykset.map((q, i) => ({ q, i })).filter(({ q }) => !!q.id && mahtuuKorttiin(q));
  const valittu = taydet ? ehdokkaat[0] : ehdokkaat.find(({ i }) => vastaukset[i] === "bad");
  return valittu?.q.id ?? null;
}

/** Jakolinkkiin &k=<id> (tai ?k=, jos osoitteessa ei ole kyselyä). */
export function kysymysLinkki(url: string, id: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}k=${encodeURIComponent(id)}`;
}

/** Kortin vaihtoehdot aakkosjärjestyksessä: oikea vastaus ei erotu järjestyksestä eikä paikasta. */
export const korttiVaihtoehdot = (opts: string[]) => [...opts].map((o) => o.trim()).sort((a, b) => a.localeCompare(b, "fi"));
