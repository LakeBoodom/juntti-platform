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
import { NewRuleButton } from "./new-button";
import { RuleRow } from "./rule-row";
import type { ContentOptionsMap } from "./rule-form";
import type { ContentType } from "./actions";

export const dynamic = "force-dynamic";

export default async function ScheduleRulesPage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();

  // Hae säännöt + niiden viittaamat sisällöt erikseen per content_type
  const { data: rules, error } = await admin
    .from("schedule_rules")
    .select("id, site_id, content_type, content_id, strategy, scheduled_date, tag, weight, active, created_at")
    .eq("site_id", site.id)
    .order("created_at", { ascending: false });

  // Hae kaikki sisältö-vaihtoehdot per type — käytetään lomakkeessa selectoreina
  const [quizzes, celebs, countdowns, kuvavisas] = await Promise.all([
    admin.from("quizzes").select("id, title").eq("site_id", site.id).order("title"),
    admin.from("celebrities").select("id, name, birth_date").eq("site_id", site.id).order("name"),
    admin.from("countdowns").select("id, name").eq("site_id", site.id).order("name"),
    admin.from("kuvavisas").select("id, type, question").eq("site_id", site.id).order("created_at", { ascending: false }),
  ]);

  const contentOptions: ContentOptionsMap = {
    quiz: (quizzes.data ?? []).map((q) => ({ id: q.id, label: q.title })),
    celebrity: (celebs.data ?? []).map((c) => {
      // Näytä myös syntymäpäivä esim. "Niko Kapanen — 29.4."
      let bdShort = "";
      if (c.birth_date && /^\d{4}-\d{2}-\d{2}$/.test(c.birth_date)) {
        const [, m, d] = c.birth_date.split("-").map((p) => parseInt(p, 10));
        bdShort = ` — ${d}.${m}.`;
      }
      return { id: c.id, label: `${c.name}${bdShort}` };
    }),
    countdown: (countdowns.data ?? []).map((c) => ({ id: c.id, label: c.name })),
    kuvavisa: (kuvavisas.data ?? []).map((k) => ({
      id: k.id,
      label: `[${k.type}] ${k.question.slice(0, 50)}`,
    })),
  };

  // Map content_id → label, jotta listanäkymä näyttää sisältönimiä
  const labelLookup = new Map<string, string>();
  for (const opts of Object.values(contentOptions)) {
    for (const o of opts) labelLookup.set(o.id, o.label);
  }

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Ajastussäännöt</h1>
            <p className="text-sm text-muted-foreground">
              Mitä sisältöä näytetään milloinkin. Site: <strong>{site.name}</strong>.
              Strategiat: päivämäärä, tag, joka päivä, random-rotaatio.
            </p>
          </div>
          <NewRuleButton siteId={site.id} contentOptions={contentOptions} />
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Lataus epäonnistui: {error.message}
          </div>
        ) : !rules?.length ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ei yhtään ajastussääntöä. Lisää ensimmäinen yllä olevasta napista.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tyyppi</TableHead>
                  <TableHead>Sisältö</TableHead>
                  <TableHead>Strategia</TableHead>
                  <TableHead>Yksityiskohta</TableHead>
                  <TableHead>Tila</TableHead>
                  <TableHead className="text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((row) => (
                  <RuleRow
                    key={row.id}
                    row={row as never}
                    contentLabel={
                      labelLookup.get(row.content_id) ?? "(sisältö poistettu)"
                    }
                    contentOptions={contentOptions}
                    siteId={site.id}
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
