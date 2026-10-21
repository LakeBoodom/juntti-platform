// Jakojen ja korttien visanimi (Tulosnäkymä ja jakaminen -brief §3, 20.10.2026): quizzes.korttinimi ?? lyhennetty title.
// Lyhennetty title = osa ennen ensimmäistä ajatusviivaa (välilyöntien ympäröimä –, — tai -), kaksoispistettä,
// kysymys- tai huutomerkkiä. Sanan sisäistä yhdysmerkkiä ("Hämähäkkimies-elokuvat", "SM-liiga") ei katkaista.
// Jos lyhennys jäisi alle 4 merkin, käytetään koko nimeä.
export function lyhennettyNimi(title: string): string {
  const osa = title.split(/\s[–—-]\s|[:?!]/)[0].trim();
  return osa.length >= 4 ? osa : title.trim();
}

export const korttinimi = (q: { korttinimi?: string | null; title: string }) => q.korttinimi?.trim() || lyhennettyNimi(q.title);
