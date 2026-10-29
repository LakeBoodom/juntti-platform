// VISAPAKETTI — muokkaus (V-D): kentät, kierrokset (lisää, nimeä, järjestä, kohderyhmä) ja kysymykset (haku visan
// nimellä, kokoelmalla, section_tags-tagilla ja tekstillä; järjestys nuolilla). Vuotosääntö: yhdestä visasta enintään
// 4–5 kysymystä pakettiin → hakutuloksissa näkyy, montako samasta visasta on jo paketissa, ja yli viiden kohdalla
// varoitus (ei lasten kierroksilla, jotka käyttävät lähdevisansa kokonaan).
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, Plus, Trash2, Upload } from "lucide-react";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  asetaJulkaisu, lisaaKierros, lisaaKysymys, poistaKierros, poistaKysymys, siirraKierros, siirraKysymys, tallennaKierros, tallennaPaketti,
} from "../actions";
import { esikatseluUrl, haeKysymyksia, haePaketti } from "../data";

export const dynamic = "force-dynamic";

const VUOTORAJA = 5;

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function PakettiPage({ params, searchParams }: Props) {
  const { id } = await params;
  const h = await searchParams;
  const sb = await supabaseFromCookies();
  const { data: { user } } = await sb.auth.getUser();
  const admin = getSupabaseAdmin();
  const site = await getCurrentSite();
  const data = await haePaketti(admin, id);
  if (!data) notFound();
  const { p, avain, kierrokset } = data;

  const visastaPaketissa = new Map<string, number>();
  for (const k of kierrokset) for (const q of k.kysymykset) visastaPaketissa.set(q.quiz_id, (visastaPaketissa.get(q.quiz_id) ?? 0) + 1);
  const paketissa = new Set(kierrokset.flatMap((k) => k.kysymykset.map((q) => q.question_id)));
  const kohdeKierros = kierrokset.find((k) => k.id === h.kierros) ?? kierrokset[kierrokset.length - 1];
  const tulokset = await haeKysymyksia(admin, site.id, { visa: h.visa, kokoelma: h.kokoelma, tagi: h.tagi, teksti: h.teksti });

  const kentta = (nimi: keyof typeof p, otsikko: string, ph?: string) => (
    <div className="grid gap-1">
      <label className="text-xs text-muted-foreground" htmlFor={`f-${nimi}`}>{otsikko}</label>
      <Input id={`f-${nimi}`} name={nimi} defaultValue={(p[nimi] as string | number | null) ?? ""} placeholder={ph} />
    </div>
  );

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/visapaketit" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Visapaketit</Link>
            <h1 className="text-2xl font-semibold">{p.otsikko}</h1>
            <p className="text-sm text-muted-foreground">{p.status === "published" ? "Julkaistu" : "Luonnos"} · {p.slug}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={esikatseluUrl({ ...p, avain })} target="_blank" rel="noopener noreferrer"><Eye className="mr-1 h-4 w-4" />Esikatsele</a>
            </Button>
            <form action={asetaJulkaisu.bind(null, p.id, p.status !== "published")}>
              <Button type="submit" size="sm" variant={p.status === "published" ? "outline" : "default"}>
                {p.status === "published" ? <><EyeOff className="mr-1 h-4 w-4" />Piilota</> : <><Upload className="mr-1 h-4 w-4" />Julkaise</>}
              </Button>
            </form>
          </div>
        </div>

        <form action={tallennaPaketti.bind(null, p.id)} className="grid gap-4 rounded-md border p-4 md:grid-cols-3">
          {kentta("otsikko", "Otsikko")}
          {kentta("slug", "Osoite (slug)")}
          {kentta("teema", "Teema (kortin kicker; = kokoelman nimi linkittää kokoelmasivulta)", "Juhlat")}
          {kentta("seo_title", "Hakuotsikko", "Joulun tietovisa – 40 kysymystä vastauksineen")}
          <div className="grid gap-1 md:col-span-2">
            <label className="text-xs text-muted-foreground" htmlFor="f-seo_description">Hakukuvaus</label>
            <Input id="f-seo_description" name="seo_description" defaultValue={p.seo_description ?? ""} />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="f-kohderyhma">Kohderyhmä</label>
            <select id="f-kohderyhma" name="kohderyhma" defaultValue={p.kohderyhma} className="h-9 rounded-md border bg-background px-3 text-sm">
              <option value="aikuiset">Aikuiset</option><option value="lapset">Lapset</option><option value="molemmat">Molemmat (valitsin)</option>
            </select>
          </div>
          {kentta("kausi_alku", "Kausi alkaa (KK-PP)", "11-01")}
          {kentta("kausi_loppu", "Kausi päättyy (KK-PP)", "12-26")}
          {kentta("kesto_min", "Kesto (min)", "45")}
          {kentta("sarja", "Sarja", "pubivisa")}
          {kentta("painos_nimi", "Painoksen nimi", "Loka–joulukuu 2026")}
          {kentta("jarjestys", "Järjestys landingilla")}
          {kentta("hero_image", "Herokuva (oma kopio /20/…, n. 1200 px, ≤ 120 kt)")}
          {kentta("hero_alt", "Herokuvan alt-teksti")}
          {kentta("aksentti", "Aksenttiväri (#RRGGBB)", "#E2483D")}
          <div className="md:col-span-3"><Button type="submit" size="sm">Tallenna</Button></div>
        </form>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Kierrokset</h2>
          {kierrokset.map((k, ki) => (
            <div key={k.id} className="space-y-3 rounded-md border p-4">
              <div className="flex flex-wrap items-end gap-2">
                <form action={tallennaKierros.bind(null, p.id, k.id)} className="flex flex-wrap items-end gap-2">
                  <span className="pb-2 text-sm font-semibold">{k.nro}.</span>
                  <Input name="nimi" defaultValue={k.nimi} className="w-64" aria-label="Kierroksen nimi" />
                  <select name="kohderyhma" defaultValue={k.kohderyhma} className="h-9 rounded-md border bg-background px-3 text-sm" aria-label="Kohderyhmä">
                    <option value="aikuiset">Aikuiset</option><option value="lapset">Lapset</option>
                  </select>
                  <Button type="submit" size="sm" variant="outline">Tallenna</Button>
                </form>
                <form action={siirraKierros.bind(null, p.id, k.id, -1)}><Button type="submit" size="sm" variant="ghost" disabled={ki === 0} aria-label="Siirrä ylös"><ArrowUp className="h-4 w-4" /></Button></form>
                <form action={siirraKierros.bind(null, p.id, k.id, 1)}><Button type="submit" size="sm" variant="ghost" disabled={ki === kierrokset.length - 1} aria-label="Siirrä alas"><ArrowDown className="h-4 w-4" /></Button></form>
                <form action={poistaKierros.bind(null, p.id, k.id)}><Button type="submit" size="sm" variant="ghost" aria-label="Poista kierros"><Trash2 className="h-4 w-4" /></Button></form>
                <span className="pb-2 text-xs text-muted-foreground">{k.kysymykset.length} kysymystä</span>
              </div>
              <ol className="space-y-1">
                {k.kysymykset.map((q, qi) => {
                  const liikaa = k.kohderyhma !== "lapset" && (visastaPaketissa.get(q.quiz_id) ?? 0) > VUOTORAJA;
                  return (
                    <li key={q.question_id} className="flex items-start gap-2 rounded px-2 py-1 text-sm hover:bg-muted/50">
                      <span className="w-6 shrink-0 text-muted-foreground">{qi + 1}.</span>
                      <div className="min-w-0 flex-1">
                        <div>{q.question_text} <span className="font-medium text-emerald-700">→ {q.oikea}</span></div>
                        <div className="text-xs text-muted-foreground">
                          {q.visa} · visasta paketissa {visastaPaketissa.get(q.quiz_id)}
                          {q.visa_status !== "published" && <span className="ml-2 inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3 w-3" />visa ei julkaistu</span>}
                          {liikaa && <span className="ml-2 inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3 w-3" />yli {VUOTORAJA} samasta visasta</span>}
                        </div>
                      </div>
                      <form action={siirraKysymys.bind(null, p.id, k.id, q.question_id, -1)}><Button type="submit" size="sm" variant="ghost" disabled={qi === 0} aria-label="Ylös"><ArrowUp className="h-3.5 w-3.5" /></Button></form>
                      <form action={siirraKysymys.bind(null, p.id, k.id, q.question_id, 1)}><Button type="submit" size="sm" variant="ghost" disabled={qi === k.kysymykset.length - 1} aria-label="Alas"><ArrowDown className="h-3.5 w-3.5" /></Button></form>
                      <form action={poistaKysymys.bind(null, p.id, k.id, q.question_id)}><Button type="submit" size="sm" variant="ghost" aria-label="Poista"><Trash2 className="h-3.5 w-3.5" /></Button></form>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
          <form action={lisaaKierros.bind(null, p.id)} className="flex flex-wrap items-end gap-2">
            <Input name="nimi" placeholder="Uuden kierroksen nimi" className="w-64" aria-label="Uuden kierroksen nimi" />
            <select name="kohderyhma" defaultValue="aikuiset" className="h-9 rounded-md border bg-background px-3 text-sm" aria-label="Kohderyhmä">
              <option value="aikuiset">Aikuiset</option><option value="lapset">Lapset</option>
            </select>
            <Button type="submit" size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" />Lisää kierros</Button>
          </form>
        </section>

        {kierrokset.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Lisää kysymyksiä</h2>
            <form className="flex flex-wrap items-end gap-2" method="get">
              <Input name="visa" defaultValue={h.visa} placeholder="Visan nimi" className="w-48" aria-label="Visan nimi" />
              <Input name="kokoelma" defaultValue={h.kokoelma} placeholder="Kokoelma (juhlat)" className="w-40" aria-label="Kokoelma" />
              <Input name="tagi" defaultValue={h.tagi} placeholder="Tagi (joulu)" className="w-36" aria-label="section_tags-tagi" />
              <Input name="teksti" defaultValue={h.teksti} placeholder="Kysymyksen teksti" className="w-48" aria-label="Kysymyksen teksti" />
              <select name="kierros" defaultValue={kohdeKierros?.id} className="h-9 rounded-md border bg-background px-3 text-sm" aria-label="Kohdekierros">
                {kierrokset.map((k) => <option key={k.id} value={k.id}>{k.nro}. {k.nimi}</option>)}
              </select>
              <Button type="submit" size="sm">Hae</Button>
            </form>
            {tulokset.length > 0 && kohdeKierros && (
              <ul className="divide-y rounded-md border">
                {tulokset.map((r) => {
                  const n = visastaPaketissa.get(r.quiz_id) ?? 0;
                  const varoita = kohdeKierros.kohderyhma !== "lapset" && n >= VUOTORAJA;
                  return (
                    <li key={r.id} className="flex items-start gap-3 px-3 py-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <div>{r.question_text} <span className="font-medium text-emerald-700">→ {r.oikea}</span></div>
                        <div className="text-xs text-muted-foreground">
                          {r.visa}{r.target_age && r.target_age !== "kaikki" ? ` · ${r.target_age} v` : ""} · visasta paketissa {n}
                          {varoita && <span className="ml-2 inline-flex items-center gap-1 text-amber-700"><AlertTriangle className="h-3 w-3" />jo {n} samasta visasta</span>}
                        </div>
                      </div>
                      {paketissa.has(r.id) ? (
                        <span className="text-xs text-muted-foreground">paketissa</span>
                      ) : (
                        <form action={lisaaKysymys.bind(null, p.id, kohdeKierros.id, r.id)}>
                          <Button type="submit" size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />{kohdeKierros.nro}.</Button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}
      </main>
    </>
  );
}
