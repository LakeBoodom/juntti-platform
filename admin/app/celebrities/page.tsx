import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CelebrityRow } from "./celebrity-row";
import { NewCelebrityButton } from "./new-button";

export const dynamic = "force-dynamic";

export default async function CelebritiesPage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("celebrities")
    .select(
      "id, name, birth_date, death_date, role, bio_short, image_url, platform, trivia_quiz_id",
    )
    .order("birth_date", { ascending: true });

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Julkkikset</h1>
            <p className="text-sm text-muted-foreground">
              Suomalaiset henkilöt joiden syntymäpäivänä näytetään trivia.
              "Luo visa" käyttää AI:ta henkilön kontekstilla — tarkempi
              tulos kuin laajassa aiheessa.
            </p>
          </div>
          <NewCelebrityButton />
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Lataus epäonnistui: {error.message}
          </div>
        ) : !data?.length ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ei yhtään julkkista. Lisää ensimmäinen yllä olevasta napista.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nimi</TableHead>
                  <TableHead>Syntynyt</TableHead>
                  <TableHead>Rooli</TableHead>
                  <TableHead>Alusta</TableHead>
                  <TableHead>Visa</TableHead>
                  <TableHead className="text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <CelebrityRow
                    key={row.id}
                    row={row as any}
                    hasQuiz={!!row.trivia_quiz_id}
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
