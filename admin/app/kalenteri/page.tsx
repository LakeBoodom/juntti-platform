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
import {
  resolveCalendarDay,
  type RawQuizRow,
  type RawCelebrityRow,
  type RawCountdownRow,
  type RawCountdownQuizRow,
  type RawScheduleRuleRow,
  type CalendarDay,
} from "@/lib/content-calendar";
import { CalendarRow } from "./calendar-row";

export const dynamic = "force-dynamic";

const DEFAULT_DAYS_AHEAD = 30;
const MAX_DAYS_AHEAD = 365;
const PRESETS = [14, 30, 60, 90, 180, 365] as const;

export default async function KalenteriPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const sp = await searchParams;
  const requested = Number(sp.days);
  const DAYS_AHEAD =
    Number.isFinite(requested) && requested > 0
      ? Math.min(MAX_DAYS_AHEAD, Math.max(7, Math.floor(requested)))
      : DEFAULT_DAYS_AHEAD;

  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fromIso = today.toISOString().slice(0, 10);
  const to = new Date(today);
  to.setDate(to.getDate() + DAYS_AHEAD - 1);
  const toIso = to.toISOString().slice(0, 10);

  // Hae kaikki tarvittava data KERRAN koko aikavälille — ei N+1 kyselyitä.
  const [quizzesRes, celebsRes, countdownsRes, countdownQuizzesRes, rulesRes, postsRes] =
    await Promise.all([
      admin.from("quizzes").select("id, title, category, status").eq("site_id", site.id),
      admin
        .from("celebrities")
        .select("id, name, role, image_url, birth_date, death_date, priority, platform")
        .in("platform", ["synttarit", "both"]),
      admin
        .from("countdowns")
        .select("id, name, month, day, starts_on, ends_on, image_url, emoji, tag")
        .eq("site_id", site.id),
      admin.from("countdown_quizzes").select("countdown_id, quiz_id, sort_order"),
      admin
        .from("schedule_rules")
        .select("content_type, content_id, strategy, scheduled_date, active")
        .eq("site_id", site.id)
        .eq("content_type", "quiz")
        .eq("strategy", "date")
        .gte("scheduled_date", fromIso)
        .lte("scheduled_date", toIso),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any)
        .from("social_posts")
        .select("id, target_date, platform, status")
        .eq("site_id", site.id)
        .gte("target_date", fromIso)
        .lte("target_date", toIso),
    ]);

  const inputs = {
    quizzes: (quizzesRes.data ?? []) as RawQuizRow[],
    celebrities: (celebsRes.data ?? []) as RawCelebrityRow[],
    countdowns: (countdownsRes.data ?? []) as RawCountdownRow[],
    countdownQuizzes: (countdownQuizzesRes.data ?? []) as RawCountdownQuizRow[],
    scheduleRules: (rulesRes.data ?? []) as RawScheduleRuleRow[],
  };

  type SocialPostSummary = { id: string; target_date: string; platform: string; status: string };
  const posts = (postsRes.data ?? []) as SocialPostSummary[];
  const postsByDate = new Map<string, SocialPostSummary[]>();
  for (const p of posts) {
    const arr = postsByDate.get(p.target_date) ?? [];
    arr.push(p);
    postsByDate.set(p.target_date, arr);
  }

  const days: CalendarDay[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push(resolveCalendarDay(site.id, iso, inputs));
  }

  const daysWithContent = days.filter(
    (d) => d.quiz || d.celebrity || d.countdown,
  ).length;

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Sisältökalenteri</h1>
          <p className="text-sm text-muted-foreground">
            Näyttää mikä visa, synttärisankari ja tapahtuma on live minäkin
            päivänä — ja antaa luoda AI-avusteiset some-postausluonnokset
            kullekin päivälle. Site: <strong>{site.name}</strong>.{" "}
            <span className="font-medium">
              {daysWithContent} / {DAYS_AHEAD} päivää joissa sisältöä
            </span>
            .
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
                <TableHead className="w-[110px]">Päivä</TableHead>
                <TableHead>Visa</TableHead>
                <TableHead>Synttärisankari</TableHead>
                <TableHead>Tapahtuma</TableHead>
                <TableHead className="w-[140px]">Some</TableHead>
                <TableHead className="text-right">Toiminnot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {days.map((d) => (
                <CalendarRow
                  key={d.date}
                  day={d}
                  siteId={site.id}
                  posts={postsByDate.get(d.date) ?? []}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          Vinkki: luonnokset päätetään lopullisesti{" "}
          <a href="/somepostaukset" className="underline">
            Some-sivulla
          </a>
          , jossa copyn voi vielä muokata ja ajastaa julkaisuun.
        </p>
      </main>
    </>
  );
}
