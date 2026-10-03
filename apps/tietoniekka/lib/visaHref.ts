// SEO-erä A1 (2.10.2026): kaikki sisäiset visalinkit kanoniseen muotoon /visa/<slug>.
// Ennen etusivu ja henkilöhub käyttivät /peli?quiz_id=<uuid> ja muut hubit /peli?visa=<slug>,
// jolloin yksikään sisäinen linkki ei osoittanut canonical-osoitteeseen. Vanhat muodot toimivat
// edelleen (canonical on niissäkin /visa/<slug>).
//
// Avaimena on `slug`, koska /visa/[slug] hakee sillä (custom_slug vain varalla; 2.10. kannassa ei
// yhtään visaa, jonka custom_slug eroaisi slugista). Megavisoilla on oma reittinsä /peli?mega=.

export type VisaLinkki = {
  slug?: string | null;
  custom_slug?: string | null;
  id?: string | null;
  game_mode?: string | null;
};

export function visaHref(q: VisaLinkki): string {
  const slug = q.slug || q.custom_slug;
  if (q.game_mode === "mega" && slug) return `/peli?mega=${encodeURIComponent(slug)}`;
  if (slug) return `/visa/${encodeURIComponent(slug)}`;
  if (q.id) return `/peli?quiz_id=${q.id}`;
  return "/";
}

/** Pelkästä slugista (hubien kovakoodatut slugit, esim. juhlat ja jääkiekon kortit). */
export const visaSlugHref = (slug: string) => `/visa/${encodeURIComponent(slug)}`;
