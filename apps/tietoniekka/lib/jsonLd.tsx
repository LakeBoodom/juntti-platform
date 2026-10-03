// SEO-erä A9 (2.10.2026): rakenteinen data (JSON-LD), käyttäjälle näkymätön.
// BreadcrumbList (murupolkujen peili), Quiz (/visa/*), CollectionPage + ItemList (hubit),
// Game (pelimuodot). Ei FAQPage-schemaa (Heikin linjaus).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const abs = (polku: string) => (polku.startsWith("http") ? polku : `${SITE_URL}${polku.startsWith("/") ? "" : "/"}${polku}`);

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // "<" escapetaan, ettei otsikon merkkijono voi sulkea script-elementtiä
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export type Muru = { name: string; url?: string };

export function breadcrumbLd(murut: Muru[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: murut.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.name,
      ...(m.url ? { item: abs(m.url) } : {}),
    })),
  };
}

export function peliLd(o: { name: string; url: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Game",
    name: o.name,
    url: abs(o.url),
    description: o.description,
    inLanguage: "fi",
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Tietoniekka", url: SITE_URL },
  };
}
