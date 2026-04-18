import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScheduleForm, type QuizOption } from "./schedule-form";
import { ScheduleRow } from "./schedule-row";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];
const MONTHS = [
  "tammi",
  "helmi",
  "maalis",
  "huhti",
  "touko",
  "kesä",
  "heinä",
  "elo",
  "syys",
  "loka",
  "marras",
  "joulu",
];

function formatWeekday(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default async function SchedulePage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const admin = getSupabaseAdmin();

  // Show recent past (7 days) + next 120 days so you can see what's coming up.
  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - 7);
  const to = new Date(today);
  to.setUTCDate(to.getUTCDate() + 120);
  const fromIso = from.toISOString().slice(0, 10);
  const toIso = to.toISOString().slice(0, 10);
  const todayIso = today.toISOString().slice(0, 10);

  const { data: rows } = await admin
    .from("daily_schedule")
    .select("id, date, platform, quiz_id, quizzes:quiz_id ( title, category )")
    .gte("date", fromIso)
    .lte("date", toIso)
    .order("date", { ascending: true });

  // Quiz options for the form — published quizzes only (you shouldn't schedule drafts).
  const { data: quizzes } = await admin
    .from("quizzes")
    .select("id, title, category, status")
    .eq("status", "published")
    .order("title", { ascending: true });

  const quizOptions: QuizOption[] =
    quizzes?.map((q) => ({
      id: q.id,
      title: q.title,
      category: q.category,
    })) ?? [];

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Päivän ohjelma</h1>
          <p className="text-sm text-muted-foreground">
            Ajasta visa tietylle päivälle tai ajanjaksolle. Etusivu näyttää
            ajastetun visan ensisijaisena. Ilman ajastusta nostetaan synttäri-
            visa tai satunnainen julkaistu visa.
          </p>
        </div>

        <ScheduleForm quizzes={quizOptions} />

        <div>
          <h2 className="mb-2 text-lg font-semibold">
            Tulevat ajastukset ({rows?.length ?? 0})
          </h2>

          {!rows?.length ? (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              Ei yhtään ajastusta lähitulevaisuudessa. Lisää yllä olevasta
              lomakkeesta.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Päivä</TableHead>
                    <TableHead>ISO</TableHead>
                    <TableHead>Alusta</TableHead>
                    <TableHead>Visa</TableHead>
                    <TableHead className="text-right">Poista</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r: any) => (
                    <ScheduleRow
                      key={r.id}
                      id={r.id}
                      dateIso={r.date}
                      weekdayLabel={formatWeekday(r.date)}
                      platform={r.platform}
                      quizTitle={r.quizzes?.title ?? "(visaa ei löydy)"}
                      quizCategory={r.quizzes?.category ?? ""}
                      isToday={r.date === todayIso}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
