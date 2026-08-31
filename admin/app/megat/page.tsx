// MEGAT — lista + Koosta Mega (Heikki hyväksyi ehdotuksen 3.8.2026)
import Link from "next/link";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
import { Nav } from "@/components/nav";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ComposerForm } from "./composer-form";

export const dynamic = "force-dynamic";

export default async function MegatPage() {
  const sb = await supabaseFromCookies();
  const { data: { user } } = await sb.auth.getUser();
  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();

  const { data } = await admin
    .from("quizzes")
    .select("id, title, status, created_at, play_count" as never)
    .eq("site_id", site.id)
    .eq("game_mode" as never, "mega" as never)
    .order("created_at", { ascending: false });
  const megas = (data ?? []) as unknown as Array<{
    id: string; title: string; status: string; created_at: string; play_count: number;
  }>;

  // Kysymysmäärät per Mega
  const counts = new Map<string, number>();
  if (megas.length > 0) {
    const { data: links } = await admin
      .from("mega_questions" as never)
      .select("mega_quiz_id" as never)
      .in("mega_quiz_id" as never, megas.map((m) => m.id) as never[]);
    for (const l of (links ?? []) as unknown as Array<{ mega_quiz_id: string }>) {
      counts.set(l.mega_quiz_id, (counts.get(l.mega_quiz_id) ?? 0) + 1);
    }
  }

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Megavisat</h1>
            <p className="text-sm text-muted-foreground">
              Mega on viittauskooste: kysymykset linkitetään julkaistuista visoista, ei kopioida.
              Automaatti ehdottaa — sinä katselmoit ja lukitset. Site: <strong>{site.name}</strong>
            </p>
          </div>
        </div>

        <ComposerForm />

        {megas.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ei vielä yhtään Megaa. Koosta ensimmäinen yllä.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nimi</TableHead>
                  <TableHead>Kysymyksiä</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Pelatut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {megas.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <Link href={`/megat/${m.id}`} className="hover:underline">
                        <span className="mr-2 inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700">MEGA</span>
                        {m.title}
                      </Link>
                    </TableCell>
                    <TableCell>{counts.get(m.id) ?? 0}</TableCell>
                    <TableCell>
                      <span className={
                        m.status === "published"
                          ? "inline-flex items-center rounded-full border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-xs text-green-700"
                          : "inline-flex items-center rounded-full border border-yellow-600/30 bg-yellow-600/10 px-2 py-0.5 text-xs text-yellow-700"
                      }>
                        {m.status === "published" ? "Julkaistu" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{m.play_count ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Draft-Megat näkyvät 2.0-previewssä osoitteessa /2-0/peli?mega=&lt;slug&gt;. Julkaistu Mega
          näkyisi myös nykyisen sivuston listauksissa — pidä draftina 2.0-julkaisuun asti.
        </p>
      </main>
    </>
  );
}
