"use server";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { SynttaritDayEditor } from "./day-editor";

export const dynamic = "force-dynamic";

export default async function SynttaritPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;

  // Default to today (Finland time)
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const selectedDate = sp.date ?? todayStr;

  const [month, day] = selectedDate.split("-").slice(1).map(Number);

  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const admin = getSupabaseAdmin();

  // Fetch celebrities born on this month+day (any year)
  const { data: celebrities, error } = await admin
    .from("celebrities")
    .select(
      "id, name, birth_date, death_date, role, bio_short, image_url, priority, is_hero, platform, site_id"
    )
    .eq("platform", "synttarit")
    .order("priority", { ascending: true })
    .order("name", { ascending: true });

  // Filter by month+day in JS (Supabase doesn't support extract in eq)
  const filtered = (celebrities ?? []).filter((c) => {
    const [, m, d] = c.birth_date.split("-").map(Number);
    return m === month && d === day;
  });

  // Fetch vote counts for today
  const { data: voteCounts } = await admin
    .from("celebrity_vote_counts")
    .select("*")
    .in(
      "celebrity_id",
      filtered.map((c) => c.id)
    )
    .eq("vote_date", todayStr);

  const votesByIdAndType = Object.fromEntries(
    (voteCounts ?? []).map((v) => [`${v.celebrity_id}:${v.question_type}`, v])
  );

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Synttärit</h1>
          <p className="text-sm text-muted-foreground">
            Valitse päivä ja aseta julkkisten prioriteetti kyseiselle päivälle.
            Hero-asema = iso kortti etusivulla. Lista = pieni rivi. Piilotettu =
            ei näy.
          </p>
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
