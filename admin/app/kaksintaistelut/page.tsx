import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
import { Nav } from "@/components/nav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EntityRow } from "./entity-row";
import { NewEntityButton } from "./new-button";
import { DefRow, NewDefButton } from "./def-row";
import { Preview } from "./preview";

export const dynamic = "force-dynamic";

type Attr = {
  attr_key: string;
  num_value: number;
  display_value: string | null;
  source: string | null;
  verified_at: string | null;
};

export default async function KaksintaistelutPage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();

  const [{ data: defs }, { data: entities }] = await Promise.all([
    admin.from("duel_attribute_defs").select("*").order("theme").order("attr_key"),
    admin
      .from("duel_entities")
      .select(
        "id, name, kind, role_label, show_role, image_url, image_credit, wiki_url, status, lat, lon, name_partitive, duel_attributes(attr_key, num_value, display_value, source, verified_at)",
      )
      .order("kind")
      .order("name"),
  ]);

  const defList = defs ?? [];
  const rows = (entities ?? []) as any[];

  // --- Parimäärät per attribuutti ---
  const counts = new Map<string, number>();
  for (const e of rows) {
    if (e.status !== "published") continue;
    for (const a of (e.duel_attributes ?? []) as Attr[])
      counts.set(a.attr_key, (counts.get(a.attr_key) ?? 0) + 1);
  }
  const pairsFor = (k: string) => {
    const n = counts.get(k) ?? 0;
    return (n * (n - 1)) / 2;
  };
  const totalPairs = defList
    .filter((d: any) => d.enabled)
    .reduce((s: number, d: any) => s + pairsFor(d.attr_key), 0);

  // --- Laatuvahti ---
  const yearAgo = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
  const noImage = rows.filter((e) => e.status === "published" && !e.image_url && e.kind === "person");
  const noSource = rows.flatMap((e) =>
    ((e.duel_attributes ?? []) as Attr[])
      .filter((a) => !a.source)
      .map((a) => `${e.name} · ${a.attr_key}`),
  );
  const stale = rows.flatMap((e) =>
    ((e.duel_attributes ?? []) as Attr[])
      .filter((a) => !a.verified_at || a.verified_at < yearAgo)
      .map((a) => `${e.name} · ${a.attr_key}`),
  );
  const noAttrs = rows.filter((e) => !(e.duel_attributes ?? []).length);

  // --- Liian lähellä toisiaan olevat parit (alle 2 % ero) = epäreilu kysymys ---
  const tooClose: string[] = [];
  for (const d of defList) {
    const withAttr = rows
      .filter((e) => e.status === "published")
      .map((e) => ({
        name: e.name,
        v: ((e.duel_attributes ?? []) as Attr[]).find((a) => a.attr_key === d.attr_key)?.num_value,
      }))
      .filter((x) => x.v !== undefined) as { name: string; v: number }[];
    for (let i = 0; i < withAttr.length; i++)
      for (let j = i + 1; j < withAttr.length; j++) {
        const a = withAttr[i],
          b = withAttr[j];
        const rel = Math.abs(a.v - b.v) / Math.max(Math.abs(a.v), Math.abs(b.v), 1);
        if (rel > 0 && rel < 0.02) tooClose.push(`${d.attr_key}: ${a.name} vs ${b.name}`);
      }
  }

  const warnings: { label: string; items: string[] }[] = [
    { label: "Julkaistu henkilö ilman kuvaa", items: noImage.map((e) => e.name) },
    { label: "Entiteetti ilman yhtään attribuuttia", items: noAttrs.map((e) => e.name) },
    { label: "Attribuutti ilman lähdettä", items: noSource },
    { label: "Tarkistus yli vuoden vanha", items: stale },
    { label: "Ero alle 2 % — epäreilu pari", items: tooClose },
  ].filter((w) => w.items.length);

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Kaksintaistelut</h1>
            <p className="text-sm text-muted-foreground">
              &quot;Kumpi on vanhempi?&quot; -pelimuodon data. Kysymyksiä ei kirjoiteta
              käsin — ne lasketaan entiteeteistä ja attribuuteista. Yksi uusi
              attribuutti = kokonainen uusi kysymyssarja. Site:{" "}
              <strong>{site.name}</strong>
            </p>
          </div>
          <div className="shrink-0 rounded-md border bg-muted/30 px-4 py-3 text-center">
            <div className="text-2xl font-semibold tabular-nums">
              {totalPairs.toLocaleString("fi-FI")}
            </div>
            <div className="text-xs text-muted-foreground">valmista kysymystä</div>
          </div>
        </div>

        {/* ---------- Laatuvahti ---------- */}
        {warnings.length > 0 && (
          <section className="space-y-2 rounded-md border border-amber-300/60 bg-amber-50/60 p-4 dark:bg-amber-950/20">
            <h2 className="text-sm font-semibold">Laatuvahti</h2>
            <ul className="space-y-1 text-sm">
              {warnings.map((w) => (
                <li key={w.label}>
                  <span className="font-medium">{w.label}</span>{" "}
                  <span className="text-muted-foreground">({w.items.length})</span>
                  <span className="text-muted-foreground">
                    {" — "}
                    {w.items.slice(0, 6).join(", ")}
                    {w.items.length > 6 ? ` … +${w.items.length - 6}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------- Esikatselu ---------- */}
        <Preview defs={defList as any} entities={rows} />

        {/* ---------- Attribuutit ---------- */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Attribuutit</h2>
              <p className="text-sm text-muted-foreground">
                Kysymysteksti näytetään muodossa{" "}
                <strong>&quot;KUMPI KAUPUNKI&quot;</strong> +{" "}
                <strong>&quot;on lähempänä Helsinkiä?&quot;</strong>. Älä kirjoita
                sanaa &quot;kumpi&quot; kysymystekstiin.
              </p>
            </div>
            <NewDefButton />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avain</TableHead>
                  <TableHead>Kysymys</TableHead>
                  <TableHead>Teema</TableHead>
                  <TableHead>Voittaja</TableHead>
                  <TableHead className="text-right">Kysymyksiä</TableHead>
                  <TableHead className="text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defList.map((d: any) => (
                  <DefRow key={d.attr_key} row={d} pairs={pairsFor(d.attr_key)} />
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* ---------- Entiteetit ---------- */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Entiteetit{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({rows.length})
              </span>
            </h2>
            <NewEntityButton defs={defList as any} />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14"></TableHead>
                  <TableHead>Nimi</TableHead>
                  <TableHead>Laji</TableHead>
                  <TableHead>Attribuutit</TableHead>
                  <TableHead>Tila</TableHead>
                  <TableHead className="text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <EntityRow key={row.id} row={row} defs={defList as any} />
                ))}
                {!rows.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      Ei entiteettejä.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </>
  );
}
