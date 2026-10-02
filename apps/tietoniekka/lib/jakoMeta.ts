// SEO-erä A2 (2.10.2026): yhteinen openGraph + twitter -metadata jakokuvalla.
// Next yhdistää metadatan matalasti: kun sivu asettaa openGraph-olion, juuren og:image katoaa.
// Siksi jokainen sivu, joka asettaa openGraphin, käyttää tätä ja antaa oman kuvansa (/og/…).
import type { Metadata } from "next";

export function jakoMeta(o: { title: string; description?: string | null; url: string; kuva: string }): Pick<Metadata, "openGraph" | "twitter"> {
  const description = o.description ?? undefined;
  return {
    openGraph: {
      type: "website", locale: "fi_FI", siteName: "Tietoniekka",
      url: o.url, title: o.title, description,
      images: [{ url: o.kuva, width: 1200, height: 630, alt: o.title }],
    },
    twitter: { card: "summary_large_image", title: o.title, description, images: [o.kuva] },
  };
}
