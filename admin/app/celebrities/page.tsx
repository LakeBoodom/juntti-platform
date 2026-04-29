import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
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

/** Päivää seuraavaan synttäriin tästä päivästä (0 = tänään, 365 = eilen) */
function daysUntilNextBirthday(birthDate: string): number {
  const today = new Date();
  const todayMd = today.getMonth() * 31 + today.getDate(); // karkea järjestyksenmukainen luku
  const [, m, d] = birthDate.split("-").map((p) => parseInt(p, 10));
  const bdMd = (m - 1) * 31 + d;
  const diff = bdMd - todayMd;
  return diff >= 0 ? diff : diff + 372; // pyöräytä vuoden ympäri
}

export const dynamic = "force-dynamic";

export default async function CelebritiesPage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();
  const { data: rawData, error } = await admin
    .from("celebrities")
    .select(
      "id, name, birth_date, death_date, role, bio_short, image_url, platform, trivia_quiz_id, site_id",
    )
    .eq("site_id", site.id)
    .order("name", { ascending: true });

  // Järjestä seuraavan synttärin mukaan (tulevat ensin, sitten myöhemmin)
  const data = rawData
    ? [...rawData].sort(
        (a, b) => daysUntilNextBirthday(a.birth_date) - daysUntilNextBirthday(b.birth_date),
      )
    : null;

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
              tulos kuin laajassa aiheessa. Site: <strong>{site.name}</strong>
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
                  <TableHead className="w-14"></TableHead>
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
