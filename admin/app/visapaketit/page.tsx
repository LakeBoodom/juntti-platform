// VISAPAKETIT — lista ja julkaisu (toteutusbrief 28.10.2026, V-D). Paketin sisältö on viittauksia julkaistujen
// visojen kysymyksiin; jos visa palautetaan luonnokseksi, sen kysymykset putoavat julkaistusta paketista →
// varoitus listassa. Esikatselu: tietoniekan pakettisivu ?esikatselu=<avain> näyttää myös luonnoksen.
import Link from "next/link";
import { AlertTriangle, Eye, EyeOff, Plus, Upload } from "lucide-react";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { asetaJulkaisu, luoPaketti } from "./actions";
import { esikatseluUrl, haePakettienTila } from "./data";

export const dynamic = "force-dynamic";

export default async function VisapaketitPage() {
  const sb = await supabaseFromCookies();
  const { data: { user } } = await sb.auth.getUser();
  const site = await getCurrentSite();
  const paketit = await haePakettienTila(getSupabaseAdmin(), site.id);

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Visapaketit</h1>
          <p className="text-sm text-muted-foreground">
            Valmiit visat visan vetäjälle: pakettisivu, televisionäkymä ja tuloste. Kysymykset ovat viittauksia julkaistuihin visoihin.
          </p>
        </div>

        <form action={luoPaketti} className="flex flex-wrap items-end gap-2 rounded-md border p-4">
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="uusi-otsikko">Otsikko</label>
            <Input id="uusi-otsikko" name="otsikko" placeholder="Joulun tietovisa" required className="w-64" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground" htmlFor="uusi-slug">Osoite (slug)</label>
            <Input id="uusi-slug" name="slug" placeholder="joulu" required className="w-56" />
          </div>
          <Button type="submit" size="sm"><Plus className="mr-1 h-4 w-4" />Uusi paketti</Button>
        </form>

        {paketit.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">Ei vielä yhtään pakettia.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paketti</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kausi</TableHead>
                  <TableHead className="text-right">Kierrokset</TableHead>
                  <TableHead className="text-right">Kysymykset</TableHead>
                  <TableHead className="text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paketit.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link href={`/visapaketit/${p.id}`} className="hover:underline">{p.otsikko}</Link>
                      {p.sarja && <span className="ml-2 text-xs text-muted-foreground">{p.sarja} · {p.painos_nimi}</span>}
                      <div className="text-xs text-muted-foreground">{p.slug}</div>
                      {p.luonnosKysymyksia > 0 && (
                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {p.luonnosKysymyksia} kysymystä luonnosvisoista – eivät näy julkaistussa paketissa
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={p.status === "published" ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700" : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"}>
                        {p.status === "published" ? "Julkaistu" : "Luonnos"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{p.kausi_alku ? `${p.kausi_alku} – ${p.kausi_loppu}` : "ajaton"}</TableCell>
                    <TableCell className="text-right">{p.kierroksia}</TableCell>
                    <TableCell className="text-right">{p.kysymyksia}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <a href={esikatseluUrl(p)} target="_blank" rel="noopener noreferrer"><Eye className="mr-1 h-4 w-4" />Esikatsele</a>
                        </Button>
                        <form action={asetaJulkaisu.bind(null, p.id, p.status !== "published")}>
                          <Button type="submit" size="sm" variant={p.status === "published" ? "outline" : "default"}>
                            {p.status === "published" ? <><EyeOff className="mr-1 h-4 w-4" />Piilota</> : <><Upload className="mr-1 h-4 w-4" />Julkaise</>}
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  );
}
