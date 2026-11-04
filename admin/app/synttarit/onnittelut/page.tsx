import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { RECIPIENTS, TONES } from "@/lib/synttarit";
import { SynttaritTabs } from "../tabs";
import { GreetingsTable, type GreetingRow } from "./greetings-table";

export const dynamic = "force-dynamic";

export default async function OnnittelutPage({
  searchParams,
}: {
  searchParams: Promise<{ ika?: string; savy?: string; vastaanottaja?: string }>;
}) {
  const sp = await searchParams;
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (getSupabaseAdmin() as any)
    .from("synttarit_greetings")
    .select("id, age, tone, recipient, text, sort, status")
    .order("age", { ascending: true, nullsFirst: true })
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });
  if (sp.ika === "yleinen") q = q.is("age", null);
  else if (sp.ika && /^\d+$/.test(sp.ika)) q = q.eq("age", Number(sp.ika));
  if (sp.savy && (TONES as readonly string[]).includes(sp.savy)) q = q.eq("tone", sp.savy);
  if (sp.vastaanottaja && (RECIPIENTS as readonly string[]).includes(sp.vastaanottaja))
    q = q.eq("recipient", sp.vastaanottaja);
  const { data, error } = await q;

  // Ikävalinnat suodattimeen: kaikki kannassa olevat iät.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ageRows } = await (getSupabaseAdmin() as any).from("synttarit_greetings").select("age");
  const ages = Array.from(
    new Set(((ageRows ?? []) as { age: number | null }[]).map((r) => r.age).filter((a): a is number => a !== null))
  ).sort((a, b) => a - b);

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Synttärit</h1>
          <p className="text-sm text-muted-foreground">
            Onnittelupankki. Julkaistut tekstit näkyvät onnittelusivuilla Kopioi teksti -painikkeen kanssa.
          </p>
        </div>
        <SynttaritTabs active="onnittelut" />
        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Lataus epäonnistui: {error.message}
          </div>
        ) : (
          <GreetingsTable
            rows={(data ?? []) as GreetingRow[]}
            ages={ages}
            filters={{ ika: sp.ika ?? "", savy: sp.savy ?? "", vastaanottaja: sp.vastaanottaja ?? "" }}
          />
        )}
      </main>
    </>
  );
}
