import Link from "next/link";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import {
  getDiggaaSite,
  listPublications,
  publicationState,
  FORMAT_NAMES,
  type PublicationRow,
} from "@/lib/diggaa";
import { CleanupButton } from "./cleanup-button";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fi-FI", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function voteCount(pub: PublicationRow): Promise<number> {
  const sb = getSupabaseAdmin() as any;
  if (pub.content_type === "duel") {
    const { count } = await sb
      .from("diggaa_votes")
      .select("id", { count: "exact", head: true })
      .eq("poll_id", pub.content_id);
    return count ?? 0;
  }
  if (pub.content_type === "knockout") {
    const { count } = await sb
      .from("diggaa_knockout_sessions")
      .select("id", { count: "exact", head: true })
      .eq("knockout_id", pub.content_id);
    return count ?? 0;
  }
  // swipe_deck: äänet korttien kautta
  const { data: cards } = await sb
    .from("diggaa_swipe_cards")
    .select("id")
    .eq("deck_id", pub.content_id);
  const ids = (cards ?? []).map((c: any) => c.id);
  if (!ids.length) return 0;
  const { count } = await sb
    .from("diggaa_swipe_votes")
    .select("id", { count: "exact", head: true })
    .in("card_id", ids);
  return count ?? 0;
}

const STATE_STYLES: Record<string, string> = {
  live: "bg-green-100 text-green-800",
  tulossa: "bg-blue-100 text-blue-800",
  "päättynyt": "bg-gray-200 text-gray-600",
  luonnos: "bg-yellow-100 text-yellow-800",
  arkistoitu: "bg-gray-100 text-gray-400",
};

export default async function DiggaaDashboardPage() {
  const sbUser = await supabaseFromCookies();
  const {
    data: { user },
  } = await sbUser.auth.getUser();

  const site = await getDiggaaSite();
  const pubs = await listPublications(site.id);
  const now = new Date();

  const withState = await Promise.all(
    pubs.map(async (p) => ({
      ...p,
      state: publicationState(p, now),
      votes: await voteCount(p),
    })),
  );

  const live = withState.filter((p) => p.state === "live");
  const upcoming = withState.filter((p) => p.state === "tulossa" || p.state === "luonnos");
  const ended = withState.filter((p) => p.state === "päättynyt").slice(0, 10);

  const sections: { title: string; rows: typeof withState }[] = [
    { title: "Livenä nyt", rows: live },
    { title: "Tulossa & luonnokset", rows: upcoming },
    { title: "Päättyneet (10 viimeisintä)", rows: ended },
  ];

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Diggaa</h1>
            <p className="text-sm text-muted-foreground">
              Julkaisut päättävät mikä sisältö on livenä ja kuinka kauan äänestys on auki.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/diggaa/sisallot"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Sisällöt
            </Link>
            <Link
              href="/diggaa/ajastus"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Ajastus
            </Link>
          </div>
        </div>

        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg font-medium">{section.title}</h2>
            {section.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ei julkaisuja.</p>
            ) : (
              <div className="divide-y rounded-md border">
                {section.rows.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATE_STYLES[p.state]}`}
                    >
                      {p.state}
                    </span>
                    <span className="w-28 shrink-0 text-xs text-muted-foreground">
                      {FORMAT_NAMES[p.content_type] ?? p.content_type}
                    </span>
                    <span className="flex-1 truncate text-sm font-medium">{p.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {fmtTime(p.opens_at)} → {fmtTime(p.closes_at)}
                    </span>
                    <span className="w-20 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {p.votes.toLocaleString("fi-FI")} ääntä
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <section className="space-y-2 rounded-md border border-dashed p-4">
          <h2 className="text-sm font-medium">Työkalut</h2>
          <p className="text-xs text-muted-foreground">
            Poistaa Knockoutin synteettiset demo-sessiot (session_id &quot;demo-%&quot;). Aja ennen oikeaa julkaisua.
          </p>
          <CleanupButton />
        </section>
      </main>
    </>
  );
}
