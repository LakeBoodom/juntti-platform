// Jakojen ja korttien visanimi (Tulosnäkymä ja jakaminen -brief §3, 20.10.2026): quizzes.korttinimi ?? lyhennetty title.
// Lyhennetty title = osa ennen ensimmäistä ajatusviivaa (välilyöntien ympäröimä –, — tai -), kaksoispistettä,
// kysymys- tai huutomerkkiä. Sanan sisäistä yhdysmerkkiä ("Hämähäkkimies-elokuvat", "SM-liiga") ei katkaista.
// Jos lyhennys jäisi alle 4 merkin, käytetään koko nimeä.
export function lyhennettyNimi(title: string): string {
  const osa = title.split(/\s[–—-]\s|[:?!]/)[0].trim();
  return osa.length >= 4 ? osa : title.trim();
}

export const korttinimi = (q: { korttinimi?: string | null; title: string }) => q.korttinimi?.trim() || lyhennettyNimi(q.title);

/* Jakoteksti (vaihe C, 22.10.2026) — WhatsApp, Kopioi ja Jaa…; osoite lisätään perään erikseen. Ei emojeita.
   "{nimi} – sain 7/10 Tietoniekassa: {tasonimi}. Pystytkö parempaan?" · täydet → "Pystytkö samaan?" ·
   ilman tasonimeä kaksoispiste ja tasonimi jäävät pois. */
export function jakoteksti(nimi: string, oikein: number, kysymyksia: number, tasonimi?: string | null): string {
  const taso = tasonimi?.trim();
  return `${nimi} – sain ${oikein}/${kysymyksia} Tietoniekassa${taso ? `: ${taso}` : ""}. ${oikein === kysymyksia ? "Pystytkö samaan?" : "Pystytkö parempaan?"}`;
}

/* Vastahaaste (vaihe A): "{nimi} – sain 8/10 Tietoniekassa, sinä 7/10. Vastahaaste: pystytkö parempaan?" */
export function vastahaasteteksti(nimi: string, oikein: number, kysymyksia: number, kaveri: { oikein: number; kysymyksia: number }): string {
  return `${nimi} – sain ${oikein}/${kysymyksia} Tietoniekassa, sinä ${kaveri.oikein}/${kaveri.kysymyksia}. Vastahaaste: ${oikein === kysymyksia ? "pystytkö samaan?" : "pystytkö parempaan?"}`;
}

/* Pelimuotojen väliaikainen jakoteksti (pikakorjaus 22.10.2026) samalla kaavalla:
   "Tupla tai kuitti: SM-liiga – sain 32 kiekkoa Tietoniekassa. Pystytkö parempaan?" — ei emojeita eikä tulosriviä.
   Kunnollinen jakoalue tulee pelimuotobriefissä (Jakoalue-komponentti). */
export function pelijakoteksti(nimi: string, tulos: string, taydet = false): string {
  return `${nimi} – sain ${tulos} Tietoniekassa. ${taydet ? "Pystytkö samaan?" : "Pystytkö parempaan?"}`;
}

/* Tasonimi tuloksesta (quizzes.fanitasot, 5 nimeä, rajat 0/40/60/80/100 %) — sama logiikka kuin GameClientin
   faniIndeksi. Jakokuvat (postikortin tasonauha) ja tuloslinkin og:description. */
export function tasonimiTuloksesta(fanitasot: unknown, oikein: number, kysymyksia: number): string | null {
  if (!Array.isArray(fanitasot) || fanitasot.length !== 5 || !fanitasot.every((t) => typeof t === "string" && t.trim())) return null;
  const pct = kysymyksia > 0 ? (oikein / kysymyksia) * 100 : 0;
  const i = pct >= 100 ? 4 : pct >= 80 ? 3 : pct >= 60 ? 2 : pct >= 40 ? 1 : 0;
  return (fanitasot[i] as string).trim();
}
