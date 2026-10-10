// TIETONIEKKA — sitemap 2.0-rakenteesta (julkaisu 31.8.2026).
// 1.0:n /kategoria/* ja /sankari/* poistuivat julkaisussa (301-ohjaukset
// next.config.mjs:ssä) eivätkä kuulu enää sitemapiin. Visasivujen kanoninen
// osoite on /visa/<slug> (SEO_STRATEGIA §3.1).
//
// SEO-erä A5 (2.10.2026): hubit johdetaan samasta lähteestä kuin /kokoelmat ja navigaatio
// (NAV_COLLECTIONS) + kuvavisat; lisätty Ikäjärjestys, kuvavisat (/kuvavisa/<kortisto>),
// Viikkovisa, megavisat omina osoitteinaan (/peli?mega=) ja /kuvien-lahteet. Megat eivät enää
// päädy /visa/-osoitteina (ne antoivat 404).
import type { MetadataRoute } from "next";
import { TEEMAT, TUPLA_SIVU } from "@/lib/tuplaTaiKuitti";
import { KL_SIVU } from "@/lib/kuntaliitos";
import { JULKAISTUT, pakkaHref } from "@/lib/jarjesta/pakat";
import { VPK_SIVU } from "@/lib/vaalipiiriketju";
import { RN_SIVU } from "@/lib/rajanaapurit";
import { NAV_COLLECTIONS } from "@/lib/nav";
import { KATEGORIAT } from "@/lib/kuvavisat2026";
import { getPublishedQuizSlugs } from "@/lib/queries";
import { haeHakemisto } from "@/lib/henkilot";
import { KUUKAUDET, RYHMAT, kuukausiSlug } from "@/lib/henkiloRyhmat";
import { LAPSET_SIVU, lapsetNakyvissa } from "@/lib/lapset/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const revalidate = 3600;

/* Kokoelmahubit: navigaation kokoelmat (sama lista kuin /kokoelmat) + Kuvavisat, joka on
   navigaatiossa pelimuotona mutta jolla on oma hub-sivunsa. */
const COLLECTION_HUBS = [...NAV_COLLECTIONS.map((c) => c.slug), "kuvavisat"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const u = (polku: string, changeFrequency: "daily" | "weekly" | "monthly" | "yearly", priority: number, lastModified: Date = now) =>
    ({ url: `${SITE_URL}${polku}`, lastModified, changeFrequency, priority });

  const staticPages: MetadataRoute.Sitemap = [
    u("/", "daily", 1.0),
    u("/kokoelmat", "weekly", 0.9),
    u("/megavisat", "weekly", 0.8),
    u(TUPLA_SIVU, "weekly", 0.8),
    ...TEEMAT.map((t) => u(`${TUPLA_SIVU}/${t.slug}`, "daily", 0.6)),
    u(KL_SIVU, "daily", 0.7),
    u(RN_SIVU, "daily", 0.7),
    u("/peli/ikajarjestys", "weekly", 0.7),
    ...JULKAISTUT.map((p) => u(pakkaHref(p), "monthly", 0.6)),
    u(VPK_SIVU, "daily", 0.7),
    u("/kuvavisa/viikko", "weekly", 0.7),
    /* Lasten visat (vaihe 5): /lapset vasta kun LAPSET_ENABLED; julkaistut lasten visat tulevat quizPagesista. */
    ...(lapsetNakyvissa() ? [u(LAPSET_SIVU, "weekly", 0.8)] : []),
    u("/kuvien-lahteet", "monthly", 0.2),
    u("/tietosuoja", "yearly", 0.2),
  ];

  const collectionPages = COLLECTION_HUBS.map((slug) => u(`/kokoelma/${slug}`, "weekly", 0.9));
  const kuvavisaPages = [...KATEGORIAT.map((k) => k.type), "kaupungit"].map((k) => u(`/kuvavisa/${k}`, "weekly", 0.7));

  const quizzes = await getPublishedQuizSlugs();
  const quizPages: MetadataRoute.Sitemap = quizzes
    .filter((q) => q.slug)
    .map((q) => {
      const mod = q.updated_at ? new Date(q.updated_at) : now;
      return q.game_mode === "mega"
        ? u(`/peli?mega=${encodeURIComponent(q.slug)}`, "monthly", 0.7, mod)
        : u(`/visa/${q.slug}`, "monthly", 0.7, mod);
    });

  // Erä B3: henkilöhakemisto, ryhmät, lajit, synttärikuukaudet ja henkilösivut.
  const henkilot = await haeHakemisto();
  const lajit = [...new Set(henkilot.filter((h) => h.laji).map((h) => `${h.ryhma}/${h.laji}`))];
  const henkiloPages: MetadataRoute.Sitemap = [
    u("/henkilot", "weekly", 0.8),
    ...RYHMAT.map((r) => u(`/henkilot/${r.key}`, "weekly", 0.6)),
    ...lajit.map((l) => u(`/henkilot/${l}`, "weekly", 0.5)),
    ...KUUKAUDET.map((_, i) => u(`/henkilot/kuukausi/${kuukausiSlug(i)}`, "monthly", 0.5)),
    ...henkilot.map((h) => u(h.href, "weekly", 0.6)),
  ];

  return [...staticPages, ...collectionPages, ...kuvavisaPages, ...henkiloPages, ...quizPages];
}
