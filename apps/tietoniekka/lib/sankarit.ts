/* ─────────────────────────────────────────────────────────────────
   Tietoniekka — Päivän sankari -data
   v1: hardcoded placeholder. Admin-tool täyttää myöhemmin
   syntymäaika + rooli + Wikipedia-kuva automaattisesti.
   ───────────────────────────────────────────────────────────────── */

export type Sankari = {
  slug: string;
  name: string;             // "IINA KUUSTONEN"
  role: string;             // "Näyttelijä"
  birthDate: string;        // ISO "1984-04-19"
  bio: string;              // 2-4 lauseen tausta, näkyy sankari-sivulla
  imageUrl: string;         // headshot URL (placeholder Unsplash → Wikipedia jatkossa)
  wikiCredit?: string;      // "📷 Wikipedia"
};

/** Ikä laskettuna tämän päivän mukaan */
export function getAge(birthDate: string): number {
  const today = new Date();
  const b = new Date(birthDate);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

/** Päivämäärä suomalaisessa muodossa "19.4.1984" */
export function formatBirthDateFi(birthDate: string): string {
  const d = new Date(birthDate);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

export const SANKARIT: Sankari[] = [
  {
    slug: "iina-kuustonen",
    name: "IINA KUUSTONEN",
    role: "Näyttelijä",
    birthDate: "1984-04-19",
    bio: "Suomalainen näyttelijä, joka tunnetaan rooleistaan elokuvassa Toiset tytöt (Jussi-ehdokkuus 2015) sekä TV-sarjoissa Karjalan kunnailla, Putous ja Nyrkki. Näyttelijä Kari Heiskasen tytär — suvun näyttelijäperinne kolmannessa polvessa.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=750&fit=crop&q=80",
    wikiCredit: "📷 Wikipedia",
  },
];

export const SANKARI_BY_SLUG: Record<string, Sankari> = Object.fromEntries(
  SANKARIT.map(s => [s.slug, s])
);

export function getSankari(slug: string): Sankari | null {
  return SANKARI_BY_SLUG[slug] ?? null;
}

/** Päivän sankari — toistaiseksi aina sama Iina (placeholder). Admin-tool valitsee päivittäin. */
export function getPaivanSankari(): Sankari {
  return SANKARIT[0];
}
