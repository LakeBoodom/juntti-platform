import Link from "next/link";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { getDiggaaSite } from "@/lib/diggaa";
import { DuelSection, type DuelRow } from "./duel-section";
import { KnockoutSection, type KnockoutRow } from "./knockout-section";
import { SwipeSection, type DeckRow } from "./swipe-section";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function DiggaaContentPage() {
  const sbUser = await supabaseFromCookies();
  const {
    data: { user },
  } = await sbUser.auth.getUser();

  const site = await getDiggaaSite();
  const sb = getSupabaseAdmin() as any;

  const [duels, knockouts, decks] = await Promise.all([
    sb
      .from("diggaa_polls")
      .select("id, category, question, option_a, option_b, created_at")
      .eq("site_id", site.id)
      .order("created_at", { ascending: false }),
    sb
      .from("diggaa_knockouts")
      .select(
        "id, category, question, created_at, diggaa_knockout_options ( id, position, label, label_genitive )",
      )
      .eq("site_id", site.id)
      .order("created_at", { ascending: false }),
    sb
      .from("diggaa_decks")
      .select(
        "id, title, category, created_at, diggaa_swipe_cards ( id, position, card_type, kicker, title, subtitle, emblem )",
      )
      .eq("site_id", site.id)
      .order("created_at", { ascending: false }),
  ]);

  const knockoutRows: KnockoutRow[] = (knockouts.data ?? []).map((k: any) => ({
    ...k,
    diggaa_knockout_options: (k.diggaa_knockout_options ?? []).sort(
      (a: any, b: any) => a.position - b.position,
    ),
  }));
  const deckRows: DeckRow[] = (decks.data ?? []).map((d: any) => ({
    ...d,
    diggaa_swipe_cards: (d.diggaa_swipe_cards ?? []).sort(
      (a: any, b: any) => a.position - b.position,
    ),
  }));

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Diggaa · Sisällöt</h1>
            <p className="text-sm text-muted-foreground">
              Sisältö ja julkaisu ovat erillään: luo sisältö täällä, ajasta se{" "}
              <Link href="/diggaa/ajastus" className="underline">
                Ajastuksessa
              </Link>
              .
            </p>
          </div>
          <Link href="/diggaa" className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
            Kojelauta
          </Link>
        </div>

        <DuelSection rows={(duels.data ?? []) as DuelRow[]} />
        <KnockoutSection rows={knockoutRows} />
        <SwipeSection rows={deckRows} />
      </main>
    </>
  );
}
