import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { SynttaritDayEditor } from "./day-editor";
import { NewSynttaritButton } from "./new-button";

export const dynamic = "force-dynamic";

export default async function SynttaritPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const selectedDate = sp.date ?? todayStr;
  const [month, day] = selectedDate.split("-").slice(1).map(Number);

  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const admin = getSupabaseAdmin();

  // Hae kaikki synttarit-julkkikset (platform = synttarit tai both)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawCelebrities } = await (admin as any)
    .from("celebrities")
    .select(
      "id, name, birth_date, death_date, role, bio_short, image_url, wikipedia_url, priority, is_hero, platform, site_id"
    )
    .in("platform", ["synttarit", "both"])
    .order("priority", { ascending: true })
    .order("name", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const celebrities = (rawCelebrities ?? []) as any[];

  // Suodata valitun päivän mukaan
  const filtered = celebrities.filter((c) => {
    const [, m, d] = c.birth_date.split("-").map(Number);
    return m === month && d === day;
  });

  // Äänestystulokset tälle päivälle
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawVoteCounts } = await (admin as any)
    .from("celebrity_vote_counts")
    .select("*")
    .in(
      "celebrity_id",
      filtered.map((c: { id: string }) => c.id)
    )
    .eq("vote_date", todayStr);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const voteCounts = (rawVoteCounts ?? []) as any[];

  const votesByIdAndType = Object.fromEntries(
    voteCounts.map((v) => [`${v.celebrity_id}:${v.question_type}`, v])
  );

  // Tilastot koko datasta
  const totalCelebrities = celebrities.length;
  const daysWithCelebrities = new Set(
    celebrities.map((c) => c.birth_date.slice(5))
  ).size;

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Synttärit</h1>
            <p className="text-sm text-muted-foreground">
              {totalCelebrities} henkilöä · {daysWithCelebrities} päivää katettu.
              Valitse päivä asettaaksesi prioriteetin.
            </p>
          </div>
          <NewSynttaritButton />
        </div>

        <SynttaritDayEditor
          selectedDate={selectedDate}
          celebrities={filtered}
          votesByIdAndType={votesByIdAndType}
        />
      </main>
    </>
  );
}
