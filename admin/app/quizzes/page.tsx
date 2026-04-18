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

export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("quizzes")
    .select(
      "id, title, slug, category, difficulty, tone, platform, status, created_at, play_count",
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Visat</h1>
            <p className="text-sm text-muted-foreground">
              Kaikki draftit ja julkaistut visat. Luo uusi AI:lla.
            </p>
          </div>
          <Link href="/quizzes/new">
            <Button>
              <Plus /> Luo AI:lla
            </Button>
          </Link>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Lataus epäonnistui: {error.message}
          </div>
        ) : !data?.length ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ei yhtään visaa. Generoi ensimmäinen yllä olevasta napista.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Otsikko</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Vaikeus</TableHead>
                  <TableHead>Sävy</TableHead>
                  <TableHead>Alusta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Pelatut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/quizzes/${q.id}`}
                        className="hover:underline"
                      >
                        {q.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {q.category}
                    </TableCell>
                    <TableCell>{q.difficulty}</TableCell>
                    <TableCell>{q.tone}</TableCell>
                    <TableCell>{q.platform}</TableCell>
                    <TableCell>
                      <span
                        className={
                          q.status === "published"
                            ? "inline-flex items-center rounded-full border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-xs text-green-700"
                            : q.status === "draft"
                              ? "inline-flex items-center rounded-full border border-yellow-600/30 bg-yellow-600/10 px-2 py-0.5 text-xs text-yellow-700"
                              : "inline-flex items-center rounded-full border border-muted-foreground/30 bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        }
                      >
                        {q.status === "published"
                          ? "Julkaistu"
                          : q.status === "draft"
                            ? "Draft"
                            : "Arkistoitu"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{q.play_count}</TableCell>
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
