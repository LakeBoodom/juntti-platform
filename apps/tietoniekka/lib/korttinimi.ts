// Jakojen ja korttien visanimi (Tulosnäkymä ja jakaminen -brief §3, 20.10.2026): quizzes.korttinimi ?? lyhennetty title.
// Lyhennetty title = osa ennen ensimmäistä ajatusviivaa (välilyöntien ympäröimä –, — tai -), kaksoispistettä,
// kysymys- tai huutomerkkiä. Sanan sisäistä yhdysmerkkiä ("Hämähäkkimies-elokuvat", "SM-liiga") ei katkaista.
// Jos lyhennys jäisi alle 4 merkin, käytetään koko nimeä.
export function lyhennettyNimi(title: string): string {
  const osa = title.split(/\s[–—-]\s|[:?!]/)[0].trim();
  return osa.length >= 4 ? osa : title.trim();
}

export const korttinimi = (q: { korttinimi?: string | null; title: string }) => q.korttinimi?.trim() || lyhennettyNimi(q.title);

/* JAKOTEKSTIT v4 (6.11.2026, Heikki): koko Tietoniekassa kolme jakotekstiä, jotka kuulostavat ihmisen kirjoittamilta.
   Pelin esittely, pelityyppi ja koukku ovat esikatselukortin tehtävä, eivät viestin. Säännöt: korttinimi alussa
   (ei taivutusta, ei "visa"-häntää), ei emojeita, huutomerkkejä, tasonimiä, "Pystytkö parempaan?"-kehotusta eikä
   sanaa Tietoniekka; ilman osoitetta enintään 120 merkkiä. Osoite lisätään omalle rivilleen (Jakoalue / jakoviesti). */

/** Jaa peli: "Suomen majakat – kokeile tätä:" */
export const jaaPeliTeksti = (nimi: string) => `${nimi} – kokeile tätä:`;

/** Jaa tulokseni: "Suomen majakat: sain 7/10 oikein. Kokeile itse:". Tuloslause pienellä alkukirjaimella. */
export const tulosjakoteksti = (nimi: string, tuloslause: string) => `${nimi}: ${tuloslause}. Kokeile itse:`;

/** Vastahaaste lyhyillä tuloksilla ilman verbiä: "Minä 4/5, sinä 3/5. Uusi kierros?" */
export const vastahaasteteksti = (oma: string, kaveri: string) => `Minä ${oma}, sinä ${kaveri}. Uusi kierros?`;

/** Viesti osoitteineen: osoite omalla rivillään. */
export const jakoviesti = (teksti: string, url: string) => `${teksti}\n${url}`;

const JARJESTYS = ["ensimmäisellä", "toisella", "kolmannella", "neljännellä", "viidennellä", "kuudennella", "seitsemännellä", "kahdeksannella", "yhdeksännellä"];
/** Järjestysluku adessiivina sanana ("kolmannella"), 10 ja yli numerona ("11."). */
export const jarjestysluvulla = (n: number) => (n >= 1 && n <= JARJESTYS.length ? JARJESTYS[n - 1] : `${n}.`);

/* Tasonimi tuloksesta (quizzes.fanitasot, 5 nimeä, rajat 0/40/60/80/100 %) — sama logiikka kuin GameClientin
   faniIndeksi. Jakokuvat (postikortin tasonauha) ja tuloslinkin og:description. */
export function tasonimiTuloksesta(fanitasot: unknown, oikein: number, kysymyksia: number): string | null {
  if (!Array.isArray(fanitasot) || fanitasot.length !== 5 || !fanitasot.every((t) => typeof t === "string" && t.trim())) return null;
  const pct = kysymyksia > 0 ? (oikein / kysymyksia) * 100 : 0;
  const i = pct >= 100 ? 4 : pct >= 80 ? 3 : pct >= 60 ? 2 : pct >= 40 ? 1 : 0;
  return (fanitasot[i] as string).trim();
}
