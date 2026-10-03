// SEO-erä A9 (2.10.2026): kokoelmahubin CollectionPage + ItemList (visat /visa/<slug>-osoitteina).
// Käyttäjälle näkymätön. Visajoukko sama kuin ristiinnostoissa (lib/related.ts kokoelmanJoukko).
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { kokoelmanJoukko } from "@/lib/related";
import { JsonLd, abs } from "@/lib/jsonLd";
import { KATEGORIAT } from "@/lib/kuvavisat2026";
import { NAV_COLLECTIONS } from "@/lib/nav";
import { visaHref } from "@/lib/visaHref";

const ERIKOIS = new Set(["kaupungit", "tiede", "jaakiekko", "jalkapallo"]);

type Kohde = { name: string; url: string };

async function kohteet(avain: string): Promise<Kohde[]> {
  if (avain === "kuvavisat") return [...KATEGORIAT.map((k) => ({ name: k.otsikko, url: `/kuvavisa/${k.type}` })), { name: "Viikkovisa", url: "/kuvavisa/viikko" }];
  if (avain === "kokoelmat") return NAV_COLLECTIONS.map((c) => ({ name: c.label, url: `/kokoelma/${c.slug}` }));
  const sb = getSupabase();
  if (!sb) return [];
  const siteId = await getSiteId();
  let q = sb.from("quiz_cards" as never).select("id, slug, custom_slug, title, display_title, game_mode").order("title").limit(150);
  if (siteId) q = q.eq("site_id", siteId);
  q = avain === "megavisat" ? q.eq("game_mode" as never, "mega") : kokoelmanJoukko(q.neq("game_mode" as never, "mega"), { key: avain }, ERIKOIS.has(avain) ? null : avain);
  const { data } = await q;
  return ((data ?? []) as unknown as Array<{ id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null; game_mode: string | null }>)
    .map((r) => ({ name: r.display_title ?? r.title, url: visaHref(r) }));
}

export async function KokoelmaLd({ avain, nimi, polku }: { avain: string; nimi: string; polku: string }) {
  const lista = await kohteet(avain);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: nimi,
        url: abs(polku),
        inLanguage: "fi",
        isPartOf: { "@type": "WebSite", name: "Tietoniekka", url: abs("/") },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: lista.length,
          itemListElement: lista.map((k, i) => ({ "@type": "ListItem", position: i + 1, name: k.name, url: abs(k.url) })),
        },
      }}
    />
  );
}
