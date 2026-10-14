// Wikimedia-pikkukuvan koko näyttökoon mukaan (UI-laatu K2 14.10.2026). Henkilökuvat ovat kannassa 330 px:n
// pikkukuvia, mutta avatarit näytetään 26–125 px:n kokoisina → ladataan Wikimedian vakiokoko (60/120/250 px),
// jolloin esim. pelisivun "Visassa mukana" -kuva on ~3 kt eikä ~40 kt. Muut kuin pikkukuva-URL:t palautetaan sellaisenaan.
export type WikiKoko = 60 | 120 | 250 | 330;

export function wikiPikkukuva<T extends string | null | undefined>(url: T, koko: WikiKoko): T {
  if (!url || !url.includes("upload.wikimedia.org/") || !url.includes("/thumb/")) return url;
  return url.replace(/\/(\d+)px-([^/?#]+)(?=[?#]|$)/, (m, w: string, nimi: string) =>
    Number(w) > koko ? `/${koko}px-${nimi}` : m,
  ) as T;
}
