// PÄIVÄN VISA — kortin data ja tilan päättely (toteutusohje 19.9.2026, luku 7).
// Erillään PaivanVisaCard.tsx:stä (client-komponentti), jotta etusivun
// palvelinkomponentti voi kutsua paivanVisaTila()-funktiota.

export type PaivanVisaData = {
  /** Visan kokoelma ja sen sivu: "TV-sarjat" → /kokoelma/tv */
  badge: { label: string; href: string };
  title: string;
  /** "10 kysymystä" */
  meta: string | null;
  /** Tila B: visan teaser (tai kuvaus) */
  lede: string | null;
  intro: { headline: string | null; text: string | null } | null;
  /** "Tänään 7.10." */
  stamp: string;
  imageUrl: string | null;
  imagePos: string;
  imageAlt: string;
  playHref: string;
  playedHref: string;
};

export function paivanVisaTila(d: Pick<PaivanVisaData, "intro">): "A" | "B" | "C" {
  if (d.intro?.headline && d.intro.text) return "A";
  if (d.intro?.text) return "C";
  return "B";
}
