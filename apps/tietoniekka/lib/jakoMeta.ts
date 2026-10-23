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

/* og:url = täsmälleen jaettu osoite parametreineen (Heikki 23.10.2026): Facebook seuraa og:url-osoitetta ja hakee
   sen jakokuvan ja -tekstit. Kun og:url oli parametriton canonical, Facebook näytti tuloslinkistä vanhan visakortin ja
   vei kaverin eri kierrokselle. <link rel="canonical"> pysyy parametrittomana (SEO). Vain sallitut parametrit
   mukaan. */
export function jakoOsoite(polku: string, sp: Record<string, string | string[] | undefined>, sallitut: string[]): string {
  /* Järjestys kuten saapuneessa osoitteessa; pilkut (?ids=a,b) jätetään koodaamatta, jotta osoite on sama kuin jaettu. */
  const osat = Object.keys(sp)
    .filter((k) => sallitut.includes(k))
    .flatMap((k) => {
      const v = sp[k];
      return typeof v === "string" && v.length > 0 && v.length <= 800 ? [`${encodeURIComponent(k)}=${encodeURIComponent(v).replace(/%2C/gi, ",")}`] : [];
    });
  return osat.length ? `${polku}?${osat.join("&")}` : polku;
}

/* Jakolinkkien og-kentät (Heikki 23.10.2026): postikortti, kysymyskortti, kuvavisan haastelinkki ja pelimuodot.
   Otsikko on sama kaikille; kuvaus kertoo tuloksen. Kortin kuva kertoo visan. */
export const JAKO_OG_OTSIKKO = "Suomen monipuolisin tietovisa- ja pelipaikka – tietäjille, arvaajille ja tuurilla seilaajille.";

/** "Sain 7/10: Rantalomailija. Pystytkö parempaan?" · täydet "Pystytkö samaan?" · ilman tasonimeä "Sain 7/10. …".
 *  Pelimuodoissa tulos yksikköineen: "Sain 32 kiekkoa: Turva piti. Pystytkö parempaan?" */
export function jakoKuvaus(tulos: string, tasonimi: string | null | undefined, taydet: boolean): string {
  const t = tasonimi?.trim();
  return `Sain ${tulos}${t ? `: ${t}` : ""}. ${taydet ? "Pystytkö samaan?" : "Pystytkö parempaan?"}`;
}

/** ?tulos=n-total → { n, kaikki }; virheellinen → null. */
export function jaettuTulos(raw: string | string[] | undefined | null): { n: number; kaikki: number } | null {
  const m = typeof raw === "string" ? raw.match(/^(\d{1,3})-(\d{1,3})$/) : null;
  if (!m) return null;
  const n = Number(m[1]), kaikki = Number(m[2]);
  return kaikki > 0 && n <= kaikki ? { n, kaikki } : null;
}

/** Pelimuodon jaettu tulos ?tulos=n-total → og-otsikko ja -kuvaus ("Sain 6/7 rajaa. Pystytkö parempaan?"); muuten null. */
export function pelituloksenOg(sp: Record<string, string | string[] | undefined>, yksikko: string): { title: string; description: string } | null {
  const t = jaettuTulos(sp.tulos);
  return t ? { title: JAKO_OG_OTSIKKO, description: jakoKuvaus(`${t.n}/${t.kaikki} ${yksikko}`, null, t.n === t.kaikki) } : null;
}
