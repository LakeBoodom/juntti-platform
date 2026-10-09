// TIETONIEKKA 2.0 — LUONTO-kokoelma v3.0 (CD "TN Luonto-kokoelma v3.0", 1a desktop / 1b mobiili;
// toteutusbrief TOTEUTUSBRIEF_LUONTO_JA_AANIVISAT.md vaihe 1, 8.10.2026).
//
//   1. Hero = matala otsikkonauha (~260 px desktop): ei CTA-nappia, tilastorivi kannasta, kuva oikealla.
//   2. "Valitse pelimuoto" korvaa "Aloita näistä" -osion: Kuvavisa (Suomen linnut) + Tietovisa
//      (Lauran ja Mikon valinta). Äänivisa-kortti tulee ensimmäiseksi ja leveäksi vaiheessa 4 —
//      ruudukko on datavetoinen (pelimuodot[]), joten kortin lisäys ei muuta layoutia.
//   3. Kaikki luontovisat: 4 saraketta, matalat kortit, ei kysymysmääriä. Suodattimet pelimuoto
//      ensin (Kuvavisat; Äänivisat vaiheessa 4), sitten aiheet; alle 3 visan aihe piilotetaan.
//      Luonnon kuvavisat ovat listassa omina kortteinaan KUVAVISA-merkillä.
//
// Sivu ja suodattimet: page.tsx = ISR (ei parametreja), suodatettu/[...polku] = ?suodata=-versio
// (middleware). Suodatin on linkki → toimii ilman JS:ää ja Google seuraa sitä.

import "../../luonto3.css";
import { KokoelmaLd } from "@/components/tn20/KokoelmaLd";
import { jakoMeta } from "@/lib/jakoMeta";
import { visaHref } from "@/lib/visaHref";
import type { Metadata } from "next";
import { getSupabase } from "@/lib/supabase";
import { getSiteId } from "@/lib/queries";
import { getPageContent } from "@/lib/pageContent";
import { LearnArticle } from "@/components/tn20/LearnArticle";
import Crumbs from "@/components/tn20/Crumbs";
import {
  LUONTO_HERO, LUONTO_SUBS, LUONTO_AIHE_MIN, LUONTO_CURATED, LUONTO_KUVAVISAT, LUONTO_NOSTO_KUVAVISA, luontoImg,
} from "@/lib/luonto";
import { ShowAllCards } from "./ShowAllCards";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export async function generateMetadata(): Promise<Metadata> {
  const pc = await getPageContent("luonto");
  const title = pc?.seo_title ?? "Suomen luonto — eläimet, kasvit ja ilmiöt";
  const description =
    pc?.seo_description ??
    "Tietovisat suurpedoista lintuihin, soista revontuliin. Tunnetko lähimetsäsi?";
  const canonical = `${SITE_URL}/kokoelma/luonto`;
  return {
    title, description,
    alternates: { canonical },
    ...jakoMeta({ title, description, url: canonical, kuva: "/og/kokoelma/luonto" }),
  };
}

type Card = {
  id: string; slug: string | null; custom_slug: string | null;
  title: string; display_title: string | null; teaser: string | null;
  subcollection: string | null; badge: string | null; published_at: string | null;
};

/** Listan kortti: tietovisa tai kuvavisa (äänivisa vaiheessa 4). */
type Kohde = {
  key: string;
  muoto: "tietovisa" | "kuvavisa";
  otsikko: string;
  teaser: string | null;
  href: string;
  kuva: string | null;
  aihe: string | null;
  uusi?: boolean;
};

type KuvavisaTieto = { key: string; otsikko: string; kuvaus: string; href: string; kuvat: string[]; kuvia: number };

/** Luonnon kuvavisat kannasta: kuvamäärä ja kaksi esikatselukuvaa (sort_order) per kortti. */
async function haeKuvavisat(): Promise<KuvavisaTieto[]> {
  const sb = getSupabase();
  const siteId = await getSiteId();
  if (!sb || !siteId) return [];
  const tyypit = [...new Set(LUONTO_KUVAVISAT.map((k) => k.type))];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (sb as any)
    .from("kuvavisas")
    .select("type, image_url, tags, sort_order")
    .eq("site_id", siteId)
    .eq("active", true)
    .in("type", tyypit)
    .order("sort_order", { ascending: true });
  const rivit = (data ?? []) as Array<{ type: string; image_url: string; tags: string[] | null }>;
  return LUONTO_KUVAVISAT.map((k) => {
    const omat = rivit.filter((r) => r.type === k.type && (!k.tag || (r.tags ?? []).includes(k.tag)));
    return { key: k.key, otsikko: k.otsikko, kuvaus: k.kuvaus, href: k.href, kuvat: omat.slice(0, 2).map((r) => r.image_url), kuvia: omat.length };
  }).filter((k) => k.kuvia >= 10);
}

const luettelo = (sanat: string[]) =>
  sanat.length <= 1 ? sanat.join("") : `${sanat.slice(0, -1).join(", ")} ja ${sanat[sanat.length - 1]}`;

/* Ikonit (design v3.0): Kuvavisa = kamera, Tietovisa = rivit, Äänivisa = kaiutin. */
const IkoniKuva = ({ vari = "#0F0D07" }: { vari?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" stroke={vari} strokeWidth="2" fill="none" /><circle cx="12" cy="12" r="3.2" fill={vari} /></svg>
);
const IkoniTieto = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h9" stroke="#0F0D07" strokeWidth="2.4" strokeLinecap="round" /></svg>
);
const IkoniTahti = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.8z" fill="#E8A320" /></svg>
);

export default async function LuontoLanding({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = typeof sp.suodata === "string" ? sp.suodata : "kaikki";

  const sb = getSupabase();
  if (!sb) return <main style={{ padding: 32 }}>Ei tietokantayhteyttä.</main>;

  const [cardsRes, pc, kuvavisat] = await Promise.all([
    sb.from("quiz_cards" as never)
      .select("id, slug, custom_slug, title, display_title, teaser, subcollection, badge, published_at")
      .eq("collection", "luonto")
      .order("published_at", { ascending: false }),
    getPageContent("luonto"),
    haeKuvavisat(),
  ]);
  const cards = (cardsRes.data ?? []) as unknown as Card[];

  const tietovisat: Kohde[] = cards.map((c) => ({
    key: c.id,
    muoto: "tietovisa",
    otsikko: c.display_title ?? c.title,
    teaser: c.teaser,
    href: visaHref(c),
    kuva: luontoImg(c.slug) ?? LUONTO_HERO,
    aihe: c.subcollection,
    uusi: c.badge === "uusi",
  }));
  const kuvaKohteet: Kohde[] = kuvavisat.map((k) => ({
    key: `kv-${k.key}`, muoto: "kuvavisa", otsikko: k.otsikko, teaser: k.kuvaus, href: k.href, kuva: k.kuvat[0] ?? null, aihe: null,
  }));
  const kaikki = [...kuvaKohteet, ...tietovisat];
  const maara = kaikki.length;

  // Aiheet: alle LUONTO_AIHE_MIN visan aihe ei saa suodatinta (brief §1.2), mutta näkyy tilastorivillä.
  const aiheet = LUONTO_SUBS.map((s) => ({ ...s, n: tietovisat.filter((c) => c.aihe === s.key).length }));
  const aiheSuodattimet = aiheet.filter((a) => a.n >= LUONTO_AIHE_MIN);
  const pelimuotoSuodattimet = [
    ...(kuvaKohteet.length ? [{ key: "kuvavisat", label: "Kuvavisat", ikoni: <IkoniKuva vari="#4ADE80" /> }] : []),
  ];
  const tunnettu = filter === "kaikki" || pelimuotoSuodattimet.some((p) => p.key === filter) || aiheSuodattimet.some((a) => a.key === filter);
  const aktiivinen = tunnettu ? filter : "kaikki";
  const nakyvat =
    aktiivinen === "kaikki" ? kaikki
    : aktiivinen === "kuvavisat" ? kuvaKohteet
    : kaikki.filter((k) => k.aihe === aktiivinen);

  const tilasto = `${maara} visaa · ${luettelo(aiheet.filter((a) => a.n > 0).map((a) => a.sana))}`;

  // Valitse pelimuoto: Kuvavisa (Suomen linnut) + Tietovisa (Lauran ja Mikon valinta).
  const nostoKuva = kuvavisat.find((k) => k.key === LUONTO_NOSTO_KUVAVISA) ?? null;
  const pick = cards.find((c) => c.slug === LUONTO_CURATED.lauranJaMikon) ?? null;
  const pickOtsikko = pick ? pick.display_title ?? pick.title : "";
  const pisin = (t: string) => Math.max(...t.split(/\s+/).map((w) => w.length), 6);

  const article = pc?.learn ? (
    <LearnArticle learn={pc.learn} fallbackTitle="Luonto" accent="#3FBF7F" />
  ) : null;

  return (
    <main className="tnl tnl3" style={{ minHeight: "100dvh", paddingBottom: 60 }}>
      <KokoelmaLd avain="luonto" nimi="Luonto" polku="/kokoelma/luonto" />
      <Crumbs items={[{ label: "Kokoelmat", href: "/kokoelmat" }, { label: "Luonto" }]} />

      {/* ─── Hero: matala otsikkonauha, kuva oikealla (mobiilissa koko leveys) ─── */}
      <section className="tnl3-hero">
        <div className="tnl3-hero-kuva">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LUONTO_HERO} alt="" fetchPriority="high" />
        </div>
        <div className="tnl3-hero-teksti">
          <span className="tnl3-eyebrow">Teemakokoelma</span>
          <h1 className="tnl3-h1">
            Suomen luonto <span className="tnl3-h1-l2">lähimetsästä tunturiin</span>
          </h1>
          <span className="tnl3-tilasto tnl3-vain-desk">{tilasto}</span>
          <span className="tnl3-tilasto tnl3-vain-mob">{maara} visaa · lähimetsästä tunturiin</span>
        </div>
      </section>

      <div className="tnl-shell">
        {/* ─── Valitse pelimuoto ─── */}
        {(nostoKuva || pick) && (
          <section className="tnl3-osio">
            <h2 className="tnl3-h2">Valitse pelimuoto</h2>
            <div className="tnl3-muodot" data-n={(nostoKuva ? 1 : 0) + (pick ? 1 : 0)}>
              {nostoKuva && (
                <a className="tnl3-muoto" href={nostoKuva.href} style={{ ["--lw" as string]: pisin(nostoKuva.otsikko) }}>
                  <span className="tnl3-muoto-media tnl3-muoto-media--kaksi">
                    {nostoKuva.kuvat.map((u) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={u} src={u} alt="" loading="lazy" />
                    ))}
                    <span className="tnl3-pilleri"><IkoniKuva />Kuvavisa</span>
                  </span>
                  <span className="tnl3-muoto-ala">
                    <span className="tnl3-muoto-teksti">
                      <span className="tnl3-muoto-otsikko">{nostoKuva.otsikko}</span>
                      <span className="tnl3-muoto-kuvaus">{nostoKuva.kuvaus}</span>
                    </span>
                    <span className="tnl3-nuoli" aria-hidden="true">→</span>
                  </span>
                </a>
              )}
              {pick && (
                <a className="tnl3-muoto" href={visaHref(pick)} style={{ ["--lw" as string]: pisin(pickOtsikko) }}>
                  <span className="tnl3-muoto-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={luontoImg(pick.slug) ?? LUONTO_HERO} alt="" loading="lazy" />
                    <span className="tnl3-pilleri"><IkoniTieto />Tietovisa</span>
                  </span>
                  <span className="tnl3-muoto-ala">
                    <span className="tnl3-muoto-teksti">
                      <span className="tnl3-lm">
                        <IkoniTahti />
                        <span className="tnl3-vain-desk">Lauran ja Mikon valinta</span>
                        <span className="tnl3-vain-mob">L&amp;M valinta</span>
                      </span>
                      <span className="tnl3-muoto-otsikko">{pickOtsikko}</span>
                    </span>
                    <span className="tnl3-nuoli" aria-hidden="true">→</span>
                  </span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* ─── Kaikki luontovisat ─── */}
        <section className="tnl3-osio" id="kaikki">
          <div className="tnl3-osio-head">
            <h2 className="tnl3-h2">Kaikki luontovisat</h2>
            <span className="tnl3-maara">{maara}<span className="tnl3-vain-desk"> visaa</span></span>
          </div>
          <nav className="tnl3-suodattimet" aria-label="Suodata luontovisoja">
            <a href="/kokoelma/luonto#kaikki" className="tnl3-chip" data-active={aktiivinen === "kaikki" || undefined}>Kaikki</a>
            {pelimuotoSuodattimet.map((p) => (
              <a key={p.key} href={`/kokoelma/luonto?suodata=${p.key}#kaikki`} className="tnl3-chip tnl3-chip--muoto" data-active={aktiivinen === p.key || undefined}>
                {p.ikoni}{p.label}
              </a>
            ))}
            {pelimuotoSuodattimet.length > 0 && aiheSuodattimet.length > 0 && <span className="tnl3-chip-vali" aria-hidden="true" />}
            {aiheSuodattimet.map((a) => (
              <a key={a.key} href={`/kokoelma/luonto?suodata=${a.key}#kaikki`} className="tnl3-chip" data-active={aktiivinen === a.key || undefined}>
                {a.label}
              </a>
            ))}
          </nav>
          {nakyvat.length === 0 ? (
            <div className="tn-empty">Tällä suodattimella ei löytynyt visoja. Kokeile toista.</div>
          ) : (
            <ShowAllCards total={nakyvat.length}>
              {nakyvat.map((k) => (
                <a key={k.key} className="tnl3-kortti" href={k.href} style={{ ["--lw" as string]: pisin(k.otsikko) }}>
                  <span className="tnl3-kortti-media">
                    {k.kuva && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={k.kuva} alt="" loading="lazy" />
                    )}
                    {k.muoto === "kuvavisa" && <span className="tnl3-pilleri tnl3-pilleri--pieni"><IkoniKuva />Kuvavisa</span>}
                    {k.uusi && <span className="tnl-badge">Uusi</span>}
                  </span>
                  <span className="tnl3-kortti-teksti">
                    <span className="tnl3-kortti-otsikko">{k.otsikko}</span>
                    {k.teaser && <span className="tnl3-kortti-teaser">{k.teaser}</span>}
                  </span>
                </a>
              ))}
            </ShowAllCards>
          )}
        </section>
      </div>
      {article}
    </main>
  );
}
