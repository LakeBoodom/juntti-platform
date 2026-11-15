// TIETONIEKKA — sitemap 2.0-rakenteesta (julkaisu 31.8.2026).
// 1.0:n /kategoria/* ja /sankari/* poistuivat julkaisussa (301-ohjaukset next.config.mjs:ssä) eivätkä kuulu
// sitemapiin. Visasivujen kanoninen osoite on /visa/<slug> (SEO_STRATEGIA §3.1).
//
// 15.11.2026: rivit ja niiden todelliset muutospäivät (lastmod) tulevat lib/sivukartta.ts:stä. Sama sitemap.xml
// on IndexNow-ilmoitusten lähde (supabase/functions/indexnow): sivukartan osoite = ilmoitettava osoite.
import type { MetadataRoute } from "next";
import { sivukartanRivit } from "@/lib/sivukartta";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sivukartanRivit();
}
