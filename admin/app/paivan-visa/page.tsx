import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { getCurrentSite } from "@/lib/sites";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DayRow } from "./day-row";

export const dynamic = "force-dynamic";

const DEFAULT_DAYS_AHEAD = 30;
const MAX_DAYS_AHEAD = 365;
const PRESETS = [14, 30, 60, 90, 180, 365] as const;

export default async function PaivanVisaPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const requested = Number(sp.days);
  const DAYS_AHEAD = Number.isFinite(requested) && requested > 0
    ? Math.min(MAX_DAYS_AHEAD, Math.max(7, Math.floor(requested)))
    : DEFAULT_DAYS_AHEAD;

  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();

  // Hae kaikki seuraavan 14 päivän date-strategia-säännöt + niiden visat
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fromIso = today.toISOString().slice(0, 10);
  const to = new Date(today);
  to.setDate(to.getDate() + DAYS_AHEAD - 1);
  const toIso = to.toISOString().slice(0, 10);

  const { data: rules } = await admin
    .from("schedule_rules")
    .select("scheduled_date, content_id, active")
    .eq("site_id", site.id)
    .eq("content_type", "quiz")
    .eq("strategy", "date")
    .gte("scheduled_date", fromIso)
    .lte("scheduled_date", toIso);

  const ruleByDate = new Map<string, string>();
  for (const r of rules ?? []) {
    if (r.active && r.scheduled_date && r.content_id) {
      ruleByDate.set(r.scheduled_date, r.content_id);
    }
  }

  // Hae kaikki sitellä näkyvät quiz-vaihtoehdot (julkaistut + draftit)
  const { data: quizzes } = await admin
    .from("quizzes")
    .select("id, title, category, status")
    .eq("site_id", site.id)
    .order("title", { ascending: true });
  const quizOptions = quizzes ?? [];

  // Map id → quiz
  const quizMap = new Map<string, { id: string; title: string; category: string; status: string }>();
  for (const q of quizOptions) quizMap.set(q.id, q);

  // Rakenna rivit
  const rows: { date: Date; iso: string; current: { id: string; title: string; category: string } | null }[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const quizId = ruleByDate.get(iso);
    const quiz = quizId ? quizMap.get(quizId) : null;
    rows.push({
      date: d,
      iso,
      current: quiz ? { id: quiz.id, title: quiz.title, category: quiz.category } : null,
    });
  }

  const filledCount = rows.filter((r) => r.current).length;

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Päivän visa</h1>
          <p className="text-sm text-muted-foreground">
            Aseta visa tietylle päivälle. Etusivulla näytetään tämän päivän
            ajastettu visa. Site: <strong>{site.name}</strong>.{" "}
            <span className="font-medium">
              {filledCount} / {DAYS_AHEAD} päivää täytetty
            </span>{" "}
            seuraavalle {DAYS_AHEAD} päivälle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Näytä:</span>
          {PRESETS.map((d) => (
            <a
              key={d}
              href={`?days=${d}`}
              className={
                DAYS_AHEAD === d
                  ? "rounded-md bg-foreground text-background px-3 py-1 text-sm font-medium"
                  : "rounded-md border px-3 py-1 text-sm hover:bg-muted"
              }
            >
              {d === 365 ? "1 vuosi" : `${d} päivää`}
            </a>
          ))}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Päivä</TableHead>
                <TableHead>Visa</TableHead>
                <TableHead className="w-[140px]">Kategoria</TableHead>
                <TableHead className="text-right">Toiminnot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <DayRow
                  key={r.iso}
                  date={r.date}
                  isoDate={r.iso}
                  siteId={site.id}
                  currentQuiz={r.current}
                  quizOptions={quizOptions}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          Vinkki: tag-pohjaiset säännöt (esim. event=&quot;vappu&quot;) hallitaan{" "}
          <a href="/schedule-rules" className="underline">
            Ajastus-sivulla
          </a>
          . Tämä näkymä näyttää vain päivämäärä-pohjaiset säännöt valitussa päiväikkunassa.
        </p>
      </main>
    </>
  );
}
