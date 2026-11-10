import Link from "next/link";
import { Plus } from "lucide-react";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAGE_TYPES, STATUS_LABEL, type Status } from "@/lib/synttarit";
import { SynttaritTabs } from "../tabs";

export const dynamic = "force-dynamic";

const fiPvm = (iso: string) =>
  new Date(iso).toLocaleString("fi-FI", { timeZone: "Europe/Helsinki", dateStyle: "short", timeStyle: "short" });

export default async function SisallotPage({
  searchParams,
}: {
  searchParams: Promise<{ tyyppi?: string }>;
}) {
  const sp = await searchParams;
  const activeType = PAGE_TYPES.find((t) => t.value === sp.tyyppi)?.value ?? null;

  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const admin = getSupabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from("synttarit_pages")
    .select("id, type, slug, title, status, updated_at")
    .order("updated_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.type] = (counts[r.type] ?? 0) + 1;
  const shown = activeType ? rows.filter((r) => r.type === activeType) : rows;
  const typeLabel = (v: string) => PAGE_TYPES.find((t) => t.value === v)?.label ?? v;

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Synttärit</h1>
            <p className="text-sm text-muted-foreground">
              Oppaat, merkkivuosisivut, onnittelusivut ja muut sisältösivut.
            </p>
          </div>
          <Button asChild>
            <Link href="/synttarit/sisallot/uusi">
              <Plus className="mr-1 h-4 w-4" /> Uusi sisältö
            </Link>
          </Button>
        </div>

        <SynttaritTabs active="sisallot" />

        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/synttarit/sisallot"
            className={`rounded-md border px-3 py-1 ${!activeType ? "bg-foreground text-background" : ""}`}
          >
            Kaikki ({rows.length})
          </Link>
          {PAGE_TYPES.map((t) => (
            <Link
              key={t.value}
              href={`/synttarit/sisallot?tyyppi=${t.value}`}
              className={`rounded-md border px-3 py-1 ${activeType === t.value ? "bg-foreground text-background" : ""}`}
            >
              {t.label} ({counts[t.value] ?? 0})
            </Link>
          ))}
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Lataus epäonnistui: {error.message}
          </div>
        ) : !shown.length ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ei vielä sisältöjä. Lisää ensimmäinen yllä olevasta napista.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Otsikko</TableHead>
                  <TableHead>Tyyppi</TableHead>
                  <TableHead>Tila</TableHead>
                  <TableHead>Päivitetty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link href={`/synttarit/sisallot/${r.id}`} className="font-medium hover:underline">
                        {r.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">/{r.slug}</div>
                    </TableCell>
                    <TableCell className="text-sm">{typeLabel(r.type)}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${
                          r.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABEL[r.status as Status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fiPvm(r.updated_at)}</TableCell>
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
