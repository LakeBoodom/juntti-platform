import { supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
import { Nav } from "@/components/nav";
import { lataaFontit } from "@/lib/ig/fontit";
import { paivaTeksti } from "@/lib/ig/data";
import {
  POHJA_NIMET,
  SYNT_POHJAT,
  VISA_POHJAT,
  tarkistaSynttarit,
  tarkistaVisa,
  type Pohja,
} from "@/lib/ig/pohjat";
import { synttariKuvateksti, visaKuvateksti } from "@/lib/ig/kuvateksti";
import { varmistaSuunnitelma } from "@/lib/ig/suunnitelma";
import { getSupabaseAdmin } from "@juntti/db";
import { JulkaisuKortti, type KorttiData } from "./julkaisu-kortti";

export const dynamic = "force-dynamic";
// Suunnitelma hakee 14 päivän datan ja kuvat — annetaan aikaa ensilataukselle.
export const maxDuration = 60;

// Instagram-julkaisut (Claude Design kierros 2, A/B-testisarja).
// Vaihe 1: suunnitelma, esikatselu, tekstit ja hyväksyntä. Julkaisu Instagramiin
// tulee vaiheessa 2 — siihen asti hyväksytyn kuvan voi ladata ja julkaista käsin.

export default async function InstagramPage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const site = await getCurrentSite();
  const [paivat, { mitat }] = await Promise.all([varmistaSuunnitelma(site.id, 14), lataaFontit()]);

  const kortit: Array<{ paiva: string; visa: KorttiData | null; synt: KorttiData | null }> = [];
  for (const p of paivat) {
    let visa: KorttiData | null = null;
    if (p.visa && p.visaRivi) {
      const r = p.visaRivi;
      const esteet: Record<string, string[]> = {};
      const huomiot: Record<string, string[]> = {};
      for (const pohja of VISA_POHJAT) {
        const t = await tarkistaVisa(mitat, pohja, p.visa, r.kentat, r.pohja_vari ?? "lime");
        esteet[pohja] = t.esteet;
        huomiot[pohja] = t.huomiot;
      }
      visa = {
        rivi: r,
        otsikko: p.visa.nimi,
        ala: [p.visa.kokoelma, p.visa.introOtsikko].filter(Boolean).join(" · "),
        pohjat: VISA_POHJAT,
        esteet,
        huomiot,
        oletusKuvateksti: visaKuvateksti(p.visa),
      };
    }
    let synt: KorttiData | null = null;
    if (p.synttarit && p.synttariRivi) {
      const r = p.synttariRivi;
      const esteet: Record<string, string[]> = {};
      const huomiot: Record<string, string[]> = {};
      for (const pohja of SYNT_POHJAT) {
        const t = await tarkistaSynttarit(mitat, pohja, p.synttarit, r.kentat);
        esteet[pohja] = t.esteet;
        huomiot[pohja] = t.huomiot;
      }
      synt = {
        rivi: r,
        otsikko: p.synttarit.nimi,
        ala: `${p.synttarit.muisto ? "olisi täyttänyt" : "täyttää"} ${p.synttarit.ika} · ${p.synttarit.rooli ?? ""}`.trim(),
        pohjat: SYNT_POHJAT,
        esteet,
        huomiot,
        oletusKuvateksti: synttariKuvateksti(p.synttarit, r.pohja, r.kentat),
      };
    }
    kortit.push({ paiva: p.paiva, visa, synt });
  }

  // Testin kertymä: montako kertaa kutakin pohjaa on suunniteltu tai julkaistu.
  const { data: kaikki } = await getSupabaseAdmin()
    .from("ig_julkaisut" as never)
    .select("pohja, tila, kokoelma")
    .eq("site_id", site.id)
    .neq("tila", "ohitettu");
  const kertyma = new Map<string, { yht: number; urheilu: number; julkaistu: number }>();
  for (const r of (kaikki ?? []) as unknown as Array<{ pohja: Pohja; tila: string; kokoelma: string | null }>) {
    const e = kertyma.get(r.pohja) ?? { yht: 0, urheilu: 0, julkaistu: 0 };
    e.yht++;
    if (r.kokoelma === "Urheilu" || r.kokoelma === "Jääkiekko") e.urheilu++;
    if (r.tila === "julkaistu") e.julkaistu++;
    kertyma.set(r.pohja, e);
  }

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Instagram</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Päivän visa ja Päivän synttärit seuraavalle 14 päivälle. Pohja valitaan automaattisesti
            A/B-testin kierron mukaan (sama pohja ei toistu peräkkäin, kirkas V-D enintään kahdesti viikossa,
            jokainen pohja saa sekä urheilu- että muita aiheita). Voit vaihtaa pohjan, muokata tekstit ja
            hyväksyä julkaisun. Instagram-yhteys tulee seuraavaksi — siihen asti hyväksytyn kuvan voi ladata.
          </p>
        </div>

        <section className="rounded-md border p-4">
          <h2 className="mb-2 text-sm font-semibold">Testin kertymä</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {[...VISA_POHJAT, ...SYNT_POHJAT].map((p) => {
              const e = kertyma.get(p) ?? { yht: 0, urheilu: 0, julkaistu: 0 };
              return (
                <div key={p} className="rounded border px-2 py-1" title={POHJA_NIMET[p]}>
                  <span className="font-semibold">{p}</span> {POHJA_NIMET[p]}:{" "}
                  <span className="tabular-nums">{e.yht}</span> suunn. ·{" "}
                  <span className="tabular-nums">{e.urheilu}</span> urheilua ·{" "}
                  <span className="tabular-nums">{e.julkaistu}</span> julk.
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Tavoite designin mukaan noin 8–10 julkaisua per pohja ennen karsintaa. V-E (karuselli) ja S-A
            (henkilökuva, vaatii kuvaajan) valitaan käsin.
          </p>
        </section>

        <div className="space-y-6">
          {kortit.map((k) => (
            <section key={k.paiva} className="space-y-3">
              <h2 className="text-lg font-semibold">{paivaTeksti(k.paiva)}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {k.visa ? (
                  <JulkaisuKortti data={k.visa} otsikko="Päivän visa" />
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">Ei Päivän visaa.</div>
                )}
                {k.synt ? (
                  <JulkaisuKortti data={k.synt} otsikko="Päivän synttärit" />
                ) : (
                  <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">Ei synttärisankaria.</div>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
