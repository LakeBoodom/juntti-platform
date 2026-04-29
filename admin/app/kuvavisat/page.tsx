import Link from "next/link";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { getCurrentSite } from "@/lib/sites";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewKuvavisaButton } from "./new-button";
import { KuvavisaRow } from "./kuvavisa-row";
import type { KuvavisaType } from "./actions";

export const dynamic = "force-dynamic";

const TYPES: { slug: KuvavisaType; label: string }[] = [
  { slug: "liput",        label: "Liput" },
  { slug: "paikkakunnat", label: "Paikkakunnat" },
  { slug: "logot",        label: "Logot" },
  { slug: "vaakunat",     label: "Vaakunat" },
];

export default async function KuvavisatPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const site = await getCurrentSite();
  const sp = await searchParams;
  const activeType = (TYPES.find((t) => t.slug === sp.type)?.slug ?? "liput") as KuvavisaType;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("kuvavisas")
    .select("*")
    .eq("site_id", site.id)
    .eq("type", activeType)
    .order("created_at", { ascending: false });

  // Counts per type — näytetään tab-numerona
  const { data: counts } = await admin
    .from("kuvavisas")
    .select("type")
    .eq("site_id", site.id);
  const countMap: Record<string, number> = {};
  for (const r of counts ?? []) {
    countMap[r.type] = (countMap[r.type] ?? 0) + 1;
  }

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Kuvavisat</h1>
            <p className="text-sm text-muted-foreground">
              Yksittäisiä kuva-kysymys -kombinaatioita. Pelinäkymä koostaa N kpl per
              tyyppi sessiossa. Site: <strong>{site.name}</strong>.
            </p>
          </div>
          <NewKuvavisaButton
            siteId={site.id}
            siteSlug={site.slug}
            defaultType={activeType}
          />
        </div>

        {/* Tab-rivi */}
        <div className="flex gap-1 border-b">
          {TYPES.map((t) => {
            const isActive = t.slug === activeType;
            const count = countMap[t.slug] ?? 0;
            return (
              <Link
                key={t.slug}
                href={`/kuvavisat?type=${t.slug}`}
                className={
                  "border-b-2 px-4 py-2 text-sm font-medium transition-colors " +
                  (isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                {t.label}{" "}
                <span className="ml-1 text-xs text-muted-foreground">({count})</span>
              </Link>
            );
          })}
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Lataus epäonnistui: {error.message}
          </div>
        ) : !data?.length ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ei yhtään {activeType}-kuvavisaa. Lisää ensimmäinen yllä olevasta napista.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kuva</TableHead>
                  <TableHead>Kysymys / oikea</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Tila</TableHead>
                  <TableHead className="text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <KuvavisaRow
                    key={row.id}
                    row={row as never}
                    siteId={site.id}
                    siteSlug={site.slug}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  );
}
