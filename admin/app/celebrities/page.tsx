import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite, listSites } from "@/lib/sites";
import { Nav } from "@/components/nav";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableHeader } from "@/components/sortable-header";
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

export default async function CelebritiesPage({ searchParams }: { searchParams: Promise<{ sort?: string; dir?: string }> }) {
  const sp = await searchParams;
  const sortKey = sp.sort ?? "birthday";
  const sortDir = sp.dir === "desc" ? "desc" : "asc";
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const site = await getCurrentSite();
  const sites = await listSites();
  const admin = getSupabaseAdmin();
  const { data: rawData, error } = await admin
    .from("celebrities")
    .select(
      "id, name, birth_date, death_date, role, bio_short, image_url, platform, trivia_quiz_id, site_id",
    )
    .eq("site_id", site.id)
    .order("name", { ascending: true });

  // Järjestä valitun sarakkeen mukaan
  const data = rawData
    ? [...rawData].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "name") {
          cmp = a.name.localeCompare(b.name, "fi");
        } else if (sortKey === "birth_date") {
          cmp = a.birth_date.localeCompare(b.birth_date);
        } else if (sortKey === "role") {
          cmp = a.role.localeCompare(b.role, "fi");
        } else {
          // default: seuraavan synttärin mukaan
          cmp = daysUntilNextBirthday(a.birth_date) - daysUntilNextBirthday(b.birth_date);
        }
        return sortDir === "desc" ? -cmp : cmp;
      })
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
          <NewCelebrityButton sites={sites} defaultSiteId={site.id} />
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
                  <SortableHeader column="name">Nimi</SortableHeader>
                  <SortableHeader column="birth_date">Syntynyt</SortableHeader>
                  <SortableHeader column="role">Rooli</SortableHeader>
                  <TableHead>Alusta</TableHead>
                  <TableHead>Visa</TableHead>
                  <TableHead className="text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <CelebrityRow sites={sites} defaultSiteId={site.id}
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
