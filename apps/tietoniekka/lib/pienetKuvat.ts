// PIENET KORTTIKUVAT (UI-laatu, kokoelmasivut kierros 1, T6.3 — 18.10.2026).
// /lapset latasi 1600 × 900 -kuvia 88–354 px:n kortteihin (≈ 2,4 Mt). Näistä on 720 px leveät kopiot
// kansiossa public/20/pienet/<sama polku>. pieniKuva(src) palauttaa pienen kopion, jos sellainen on.
const PIENET = new Set<string>([
  "/20/kuvavisat/elaimet/leijona.webp",
  "/20/lapset/aihe-elaimet.webp",
  "/20/lapset/aihe-joulu.webp",
  "/20/lapset/aihe-kirjat.webp",
  "/20/lapset/aihe-linnut.webp",
  "/20/lapset/hero-v1.webp",
  "/20/lapset/hero-v2.webp",
  "/20/lapset/hero-v3.webp",
  "/20/lapset/hero-v4.webp",
  "/20/lapset/hero-v5.webp",
  "/20/lapset/hero-v6.webp",
  "/20/lapset/hero-v7.webp",
  "/20/lapset/hero-v8.webp",
  "/20/lapset/hero-v9.webp",
  "/20/lapset/nosto-lasten-jouluvisat.webp",
  "/20/lapset/tulossa-lasten-kirjat.webp",
  "/20/lapset/tulossa-maailman-elaimet.webp",
]);

export const pieniKuva = (src: string): string => (PIENET.has(src) ? src.replace(/^\/20\//, "/20/pienet/") : src);
