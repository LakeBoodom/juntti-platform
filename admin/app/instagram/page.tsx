import { supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
import { Nav } from "@/components/nav";
import { lataaFontit } from "@/lib/ig/fontit";
import { korvaaKuva, paivaTeksti, type Kuva, type SynttariData, type VisaData } from "@/lib/ig/data";
import {
  POHJA_NIMET,
  SYNT_POHJAT,
  VISA_POHJAT,
  onHenkilopohja,
  onSynttaripohja,
  onVisapohja,
  sopiiKysymykseksi,
  tarkistaSynttarit,
  tarkistaVisa,
  type Pohja,
} from "@/lib/ig/pohjat";
import { synttariKuvateksti, visaKuvateksti } from "@/lib/ig/kuvateksti";
import { rivinSisalto } from "@/lib/ig/sisalto";
import { haeAsetukset, varmistaSuunnitelma, type Julkaisu } from "@/lib/ig/suunnitelma";
import { kokoelmaNimi } from "@/lib/kokoelmat";
import { getSupabaseAdmin } from "@juntti/db";
import { JulkaisuKortti, type KorttiData, type Mittaus } from "./julkaisu-kortti";
import { PaivitaLuvut, SlottiKytkin, UusiJulkaisu } from "./omat";
import { Juontajakuvat } from "./juontajakuvat";
import { haeJuontajakuvat } from "@/lib/ig/juontajat";
import { YhteysPaneeli } from "./yhteys";
import { haeTilinTiedot, haeYhteys, salaisuusAsetettu, type Tilastot } from "@/lib/ig/instagram";

export const dynamic = "force-dynamic";
// Suunnitelma hakee 14 päivän datan ja kuvat — annetaan aikaa ensilataukselle.
export const maxDuration = 60;

// Instagram-julkaisut (Claude Design kierros 4: motiivipohjat, kysymyskortit,
// juontajat). Suunnitelma, esikatselu, tekstit, hyväksyntä ja julkaisu Instagramiin.

type Mitat = Awaited<ReturnType<typeof lataaFontit>>["mitat"];

function kuvanTiedot(k: Kuva | null, r: Julkaisu): KorttiData["kuva"] {
  return {
    url: k?.url ?? null,
    leveys: k?.leveys ?? 0,
    korkeus: k?.korkeus ?? 0,
    fx: k?.fx ?? 50,
    fy: k?.fy ?? 40,
    korvattu: !!r.kentat?.kuva?.url,
  };
}

async function visaKortti(m: Mitat, r: Julkaisu, v0: VisaData): Promise<KorttiData> {
  const v = await korvaaKuva(v0, r.kentat?.kuva);
  const esteet: Record<string, string[]> = {};
  const huomiot: Record<string, string[]> = {};
  const vanha = !onVisapohja(r.pohja);
  if (!vanha) {
    for (const pohja of VISA_POHJAT) {
      const t = await tarkistaVisa({ m, siemen: r.paiva }, pohja, v, r.kentat ?? {});
      esteet[pohja] = t.esteet;
      huomiot[pohja] = t.huomiot;
    }
  }
  return {
    rivi: r,
    otsikko: v.nimi,
    ala: [v.kokoelma, `${v.kysymyksia} kysymystä`, v.fanitasot ? null : "ei fanitasoja"].filter(Boolean).join(" · "),
    pohjat: vanha ? [r.pohja] : VISA_POHJAT,
    esteet,
    huomiot,
    oletusKuvateksti: vanha ? "" : visaKuvateksti(v, r.pohja, r.kentat ?? {}),
    oletusTapahtuma: v0.introOtsikko,
    // Henkilökortissa kuva on henkilön oma (ellei toimitus ole vaihtanut sitä).
    kuva: kuvanTiedot(onHenkilopohja(r.pohja) && v.henkilo && !r.kentat?.kuva?.url ? v.henkilo.kuva : v.kuva, r),
    kysymykset: v.kysymykset.map((q) => ({ id: q.id, teksti: q.teksti, sopii: VISA_POHJAT.filter((p) => sopiiKysymykseksi(q, p)) })),
    fanitasot: { quizId: v.quizId, tasot: v.fanitasot },
    vanha,
  };
}

async function synttariKortti(m: Mitat, r: Julkaisu, s0: SynttariData): Promise<KorttiData> {
  const s = await korvaaKuva(s0, r.kentat?.kuva);
  const esteet: Record<string, string[]> = {};
  const huomiot: Record<string, string[]> = {};
  const vanha = !onSynttaripohja(r.pohja);
  if (!vanha) {
    for (const pohja of SYNT_POHJAT) {
      const t = await tarkistaSynttarit({ m, siemen: r.paiva }, pohja, s, r.kentat ?? {});
      esteet[pohja] = t.esteet;
      huomiot[pohja] = t.huomiot;
    }
  }
  return {
    rivi: r,
    otsikko: s.nimi,
    ala: `${s.muisto ? "olisi täyttänyt" : "täyttää"} ${s.ika} · ${s.rooli ?? ""}${s.visaNimi ? ` · visa: ${s.visaNimi}` : " · ei visaa"}`.trim(),
    pohjat: vanha ? [r.pohja] : SYNT_POHJAT,
    esteet,
    huomiot,
    oletusKuvateksti: vanha ? "" : synttariKuvateksti(s, r.pohja, r.kentat ?? {}),
    oletusTapahtuma: null,
    kuva: kuvanTiedot(s.kuva, r),
    kysymykset: [],
    fanitasot: null,
    vanha,
  };
}

export default async function InstagramPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = await searchParams;
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const site = await getCurrentSite();
  const [paivat, { mitat }, asetukset, { data: visat }, yhteys] = await Promise.all([
    varmistaSuunnitelma(site.id, 14),
    lataaFontit(),
    haeAsetukset(site.id),
    getSupabaseAdmin().from("quizzes").select("collection, category").eq("site_id", site.id).eq("status", "published"),
    haeYhteys(site.id),
  ]);
  let tili: { seuraajia: number | null; julkaisuja: number | null } | null = null;
  if (yhteys) {
    try { tili = await haeTilinTiedot(yhteys); } catch { /* näytetään ilman lukuja */ }
  }
  const ilmoitus =
    q.ig === "yhdistetty"
      ? { ok: true, teksti: `Instagram yhdistetty${q.tili ? `: @${q.tili}` : ""}. Kytke automaattinen julkaisu päälle, kun olet valmis.` }
      : q.ig === "virhe"
        ? { ok: false, teksti: `Yhdistäminen epäonnistui: ${q.syy ?? "tuntematon virhe"}` }
        : null;

  // Kampanjan kokoelmat: sivuston kokoelmanimet ja julkaistujen visojen määrä.
  const kokoelmaLkm = new Map<string, number>();
  for (const q of (visat ?? []) as unknown as Array<{ collection: string | null; category: string | null }>) {
    const n = kokoelmaNimi(q);
    kokoelmaLkm.set(n, (kokoelmaLkm.get(n) ?? 0) + 1);
  }
  const kokoelmat = [...kokoelmaLkm.entries()].sort((a, b) => a[0].localeCompare(b[0], "fi")).map(([nimi, lkm]) => ({ nimi, lkm }));

  const kortit: Array<{ paiva: string; visa: KorttiData | null; synt: KorttiData | null; omat: KorttiData[] }> = [];
  for (const p of paivat) {
    const visa = p.visa && p.visaRivi ? await visaKortti(mitat, p.visaRivi, p.visa) : null;
    const synt = p.synttarit && p.synttariRivi ? await synttariKortti(mitat, p.synttariRivi, p.synttarit) : null;
    const omat: KorttiData[] = [];
    for (const r of p.omat) {
      const sis = await rivinSisalto({ site_id: site.id, paiva: r.paiva, slotti: "oma", quiz_id: r.quiz_id }, r.kentat ?? {});
      if (sis?.tyyppi === "visa") omat.push(await visaKortti(mitat, r, sis.v));
    }
    kortit.push({ paiva: p.paiva, visa, synt, omat });
  }

  // Testin kertymä: montako kertaa kutakin pohjaa on suunniteltu tai julkaistu,
  // ja montako visaa Instagramista on avattu / pelattu loppuun (bio-sivun mittaus).
  const [{ data: kaikki }, { data: mittausRivit }] = await Promise.all([
    getSupabaseAdmin()
      .from("ig_julkaisut" as never)
      .select("id, pohja, tila, kokoelma, ig_tilastot")
      .eq("site_id", site.id)
      .neq("tila", "ohitettu"),
    getSupabaseAdmin().from("ig_mittaus" as never).select("julkaisu, tapahtuma, maara"),
  ]);
  const mittaus: Record<string, Mittaus> = {};
  let bioNaytot = 0;
  for (const m of (mittausRivit ?? []) as unknown as Array<{ julkaisu: string; tapahtuma: string; maara: number }>) {
    if (m.tapahtuma === "bio_naytto") { bioNaytot += m.maara; continue; }
    const e = (mittaus[m.julkaisu] ??= { klikkaus: 0, avaus: 0, valmis: 0 });
    if (m.tapahtuma === "klikkaus" || m.tapahtuma === "avaus" || m.tapahtuma === "valmis") e[m.tapahtuma] += m.maara;
  }
  type Tulos = { n: number; lukuja: number; reach: number; sitoutuminen: number; avaus: number; valmis: number };
  const tulokset = new Map<string, Tulos>();
  const kertyma = new Map<string, { yht: number; urheilu: number; julkaistu: number; avaus: number; valmis: number }>();
  for (const r of (kaikki ?? []) as unknown as Array<{ id: string; pohja: Pohja; tila: string; kokoelma: string | null; ig_tilastot: Tilastot | null }>) {
    if (r.tila === "julkaistu") {
      const t = tulokset.get(r.pohja) ?? { n: 0, lukuja: 0, reach: 0, sitoutuminen: 0, avaus: 0, valmis: 0 };
      t.n++;
      const i = r.ig_tilastot;
      if (i && typeof i.reach === "number") {
        t.lukuja++;
        t.reach += i.reach;
        t.sitoutuminen += (i.likes ?? 0) + (i.comments ?? 0) + (i.saved ?? 0) + (i.shares ?? 0);
      }
      t.avaus += mittaus[r.id]?.avaus ?? 0;
      t.valmis += mittaus[r.id]?.valmis ?? 0;
      tulokset.set(r.pohja, t);
    }
    const e = kertyma.get(r.pohja) ?? { yht: 0, urheilu: 0, julkaistu: 0, avaus: 0, valmis: 0 };
    e.yht++;
    if (r.kokoelma === "Urheilu" || r.kokoelma === "Jääkiekko") e.urheilu++;
    if (r.tila === "julkaistu") e.julkaistu++;
    e.avaus += mittaus[r.id]?.avaus ?? 0;
    e.valmis += mittaus[r.id]?.valmis ?? 0;
    kertyma.set(r.pohja, e);
  }

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Instagram</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Päivän visa ja Päivän synttärit seuraavalle 14 päivälle sekä omat julkaisut ja kampanjat (Claude Design
            kierros 4). Kortti puhuu katsojalle: koukku, palkinto ja CTA — visan nimi, päivämäärä ja tapahtuma kulkevat
            kuvatekstissä. Pohja valitaan kierron mukaan (sama pohja tai perhe ei toistu peräkkäin, jokainen pohja saa
            sekä urheilu- että muita aiheita) ja tekoäly luonnostelee tekstit. Tarkista, muokkaa ja hyväksy.
          </p>
        </div>

        <YhteysPaneeli
          yhteys={yhteys ? { kayttajanimi: yhteys.kayttajanimi, vanhenee: yhteys.token_vanhenee } : null}
          salaisuusOk={salaisuusAsetettu()}
          automaattinen={asetukset.automaattinen}
          ajat={{ visa_klo: asetukset.visa_klo, synttarit_klo: asetukset.synttarit_klo, omat_klo: asetukset.omat_klo }}
          ilmoitus={ilmoitus}
          seuraajia={tili?.seuraajia ?? null}
        />

        <section className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-3 rounded-md border p-4">
            <h2 className="text-sm font-semibold">Päivittäiset julkaisut</h2>
            <SlottiKytkin kentta="visa_paalla" paalla={asetukset.visa_paalla} nimi="Päivän visa" />
            <SlottiKytkin kentta="synttarit_paalla" paalla={asetukset.synttarit_paalla} nimi="Päivän synttärit" />
            <p className="text-xs text-muted-foreground">
              Pois päältä: sarjaa ei suunnitella eikä julkaista. Yksittäisen päivän julkaisun saa pois kortin
              Julkaistaan-kytkimellä.
            </p>
          </div>
          <UusiJulkaisu kokoelmat={kokoelmat} />
        </section>

        <Tulostaulukko tulokset={tulokset} />

        <Juontajakuvat kuvat={await haeJuontajakuvat(true)} />

        <section className="rounded-md border p-4">
          <h2 className="mb-2 text-sm font-semibold">Testin kertymä</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {[...VISA_POHJAT, ...SYNT_POHJAT, ...[...kertyma.keys()].filter((p) => !onVisapohja(p) && !onSynttaripohja(p))].map((p) => {
              const e = kertyma.get(p) ?? { yht: 0, urheilu: 0, julkaistu: 0, avaus: 0, valmis: 0 };
              return (
                <div key={p} className="rounded border px-2 py-1" title={POHJA_NIMET[p]}>
                  <span className="font-semibold">{p}</span> {POHJA_NIMET[p]}:{" "}
                  <span className="tabular-nums">{e.yht}</span> suunn. ·{" "}
                  <span className="tabular-nums">{e.urheilu}</span> urheilua ·{" "}
                  <span className="tabular-nums">{e.julkaistu}</span> julk. ·{" "}
                  <span className="tabular-nums">{e.avaus}</span> aloitusta IG:stä
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Tavoite designin mukaan noin 8–10 julkaisua per pohja ennen karsintaa. 4d (nostalgia), 4i (muisto,
            vaatii kuvaajan) ja 4j (tuotanto) valitaan käsin. Omat julkaisut lasketaan mukaan. Aloitukset = visa
            avattu Instagramin bio-sivulta (tietoniekka.fi/ig); bio-sivua avattu yhteensä {bioNaytot} kertaa.
          </p>
        </section>

        <div className="space-y-6">
          {kortit.map((k) => (
            <section key={k.paiva} className="space-y-3">
              <h2 className="text-lg font-semibold">{paivaTeksti(k.paiva)}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {k.visa ? (
                  <JulkaisuKortti data={k.visa} otsikko="Päivän visa" yhdistetty={!!yhteys} mittaus={mittaus[k.visa.rivi.id]} />
                ) : asetukset.visa_paalla && k.paiva <= paivat[13]?.paiva ? (
                  <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">Ei Päivän visaa.</div>
                ) : null}
                {k.synt ? (
                  <JulkaisuKortti data={k.synt} otsikko="Päivän synttärit" yhdistetty={!!yhteys} mittaus={mittaus[k.synt.rivi.id]} />
                ) : asetukset.synttarit_paalla && k.paiva <= paivat[13]?.paiva ? (
                  <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">Ei synttärisankaria.</div>
                ) : null}
                {k.omat.map((o) => (
                  <JulkaisuKortti key={o.rivi.id} yhdistetty={!!yhteys} mittaus={mittaus[o.rivi.id]} data={o} otsikko={o.rivi.kampanja ? `Kampanja · ${o.rivi.kampanja}` : "Oma julkaisu"} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

/** Designin mittaussuunnitelma: tavoittavuus, sitoutumisaste ja Instagramista
    aloitetut visat erikseen, pohjittain. Sitoutuminen = (tykkäykset + kommentit
    + tallennukset + jaot) / tavoittavuus niistä julkaisuista, joille luvut on haettu. */
function Tulostaulukko({ tulokset }: { tulokset: Map<string, { n: number; lukuja: number; reach: number; sitoutuminen: number; avaus: number; valmis: number }> }) {
  const rivit = [...VISA_POHJAT, ...SYNT_POHJAT, ...[...tulokset.keys()].filter((p) => !onVisapohja(p) && !onSynttaripohja(p))].filter((p) => tulokset.get(p)?.n);
  if (rivit.length === 0) return null;
  const luku = (n: number) => new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 1 }).format(n);
  return (
    <section className="rounded-md border p-4">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold">Tulokset pohjittain</h2>
        <PaivitaLuvut />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-xs">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-1 pr-3 font-medium">Pohja</th>
              <th className="py-1 pr-3 text-right font-medium">Julkaistu</th>
              <th className="py-1 pr-3 text-right font-medium">Tavoitti / julkaisu</th>
              <th className="py-1 pr-3 text-right font-medium">Sitoutuminen</th>
              <th className="py-1 pr-3 text-right font-medium">Aloituksia IG:stä / julkaisu</th>
              <th className="py-1 text-right font-medium">Pelattu loppuun</th>
            </tr>
          </thead>
          <tbody>
            {rivit.map((p) => {
              const t = tulokset.get(p)!;
              return (
                <tr key={p} className="border-t">
                  <td className="py-1.5 pr-3"><span className="font-semibold">{p}</span> {POHJA_NIMET[p]}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{t.n}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{t.lukuja ? luku(t.reach / t.lukuja) : "–"}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{t.reach ? `${luku((100 * t.sitoutuminen) / t.reach)} %` : "–"}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{luku(t.avaus / t.n)}</td>
                  <td className="py-1.5 text-right tabular-nums">{t.valmis}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Luvut päivittyvät automaattisesti muutaman tunnin välein 30 päivän ajan julkaisusta. Vertaa pohjia vasta, kun
        kullakin on useampi julkaisu — yksittäinen postaus riippuu paljon aiheesta ja päivästä.
      </p>
    </section>
  );
}
