// Facebookin kysymyskortti (Tulosnäkymä ja jakaminen, vaihe E; CD-arkki 2a–2d, osio 4A).
// Rajat: kysymys ≤ 90 merkkiä ja jokainen vaihtoehto ≤ 28 merkkiä; äänikysymykset ohitetaan.
// Jakotekstit v4 (vaihe 2, 7.11.2026): kortin kysymys on visan koukku, joka valitaan palvelimella (lib/koukku.ts).
// Laitteella valittu kompastuskysymys (&k=) poistui; vanhojen linkkien kuvavisan ?k= toimii yhä haastetunnuksella.
export const KYSYMYS_MAX = 90;
export const VAIHTOEHTO_MAX = 28;

export const mahtuuKorttiin = (q: { question: string; options: string[]; audio?: boolean }) =>
  !q.audio && q.question.trim().length <= KYSYMYS_MAX && q.options.length >= 2 && q.options.every((o) => o.trim().length <= VAIHTOEHTO_MAX);

/** Kortin vaihtoehdot aakkosjärjestyksessä: oikea vastaus ei erotu järjestyksestä eikä paikasta. */
export const korttiVaihtoehdot = (opts: string[]) => [...opts].map((o) => o.trim()).sort((a, b) => a.localeCompare(b, "fi"));
