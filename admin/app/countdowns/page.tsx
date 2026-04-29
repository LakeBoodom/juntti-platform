import { supabaseFromCookies, getSupabaseAdmin } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
import { Nav } from "@/components/nav";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CountdownRow } from "./countdown-row";
import { NewCountdownButton } from "./new-button";

export const dynamic = "force-dynamic";

export default async function CountdownsPage() {
  const supabase = await supabaseFromCookies();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use admin client to read (same dataset but consistent with mutations).
  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("countdowns")
    .select("id, name, slug, day, month, object_type, platform, tag, site_id")
    .eq("site_id", site.id)
    .order("month", { ascending: true })
    .order("day", { ascending: true });

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Countdownit</h1>
            <p className="text-sm text-muted-foreground">
              Merkkipäivät ja tapahtumat kalenterissa. Näkyvät etusivulla.
            </p>
          </div>
          <NewCountdownButton siteId={site.id} />
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Lataus epäonnistui: {error.message}
          </div>
        ) : !data?.length ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ei yhtään countdownia. Lisää ensimmäinen yllä olevasta napista.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nimi</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Päivä</TableHead>
                  <TableHead>Tyyppi</TableHead>
                  <TableHead>Alusta</TableHead>
                  <TableHead className="text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <CountdownRow key={row.id} row={row} siteId={site.id} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  );
}
