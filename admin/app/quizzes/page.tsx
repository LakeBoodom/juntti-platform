import Link from "next/link";
import { Plus } from "lucide-react";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { QuizList, type ListaVisa } from "./quiz-list";

export const dynamic = "force-dynamic";

// Visalista (uudistettu 21.9.2026): haku, tila- ja kokoelmasuodatus ja järjestys
// tapahtuvat selaimessa (QuizList), joten tämä sivu vain hakee kaiken kerran.
// Poistettu: Sävy (vain AI-generoinnin ohje, näkyy muokkaussivulla), Alusta (aina
// tietoniekka) ja Nosto (featured_in_category — Tietoniekka 2.0 ei lue sitä).
// Pelatut luki quizzes.play_count-kenttää, jota mikään ei päivitä; nyt pelikerrat
// lasketaan quiz_plays-taulusta (admin_visa_tilastot).

type Rivi = {
  id: string; title: string; slug: string | null; custom_slug: string | null;
  collection: string | null; category: string | null; difficulty: string | null;
  status: string; created_at: string; updated_at: string | null; published_at: string | null;
};

type Tilasto = {
  quiz_id: string; pelit: number; pelit_30pv: number; peukku_ylos: number; peukku_alas: number;
};

export default async function QuizzesPage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();

  /* PostgREST palauttaa enintään 1000 riviä kerralla — haetaan erissä, ettei
     lista katkea hiljaa kun visoja on enemmän. */
  const rivit: Rivi[] = [];
  let virhe: string | null = null;
  for (let alku = 0; ; alku += 1000) {
    const { data, error } = await admin
      .from("quizzes")
      .select("id, title, slug, custom_slug, collection, category, difficulty, status, created_at, updated_at, published_at")
      .eq("site_id", site.id)
      .order("created_at", { ascending: false })
      .range(alku, alku + 999);
    if (error) { virhe = error.message; break; }
    rivit.push(...((data ?? []) as unknown as Rivi[]));
    if (!data || data.length < 1000) break;
  }

  const { data: tilastot } = await admin.rpc("admin_visa_tilastot" as never, { p_site: site.id } as never);
  const tilastoMap = new Map(
    ((tilastot ?? []) as unknown as Tilasto[]).map((t) => [t.quiz_id, t]),
  );

  const visat: ListaVisa[] = rivit.map((r) => {
    const t = tilastoMap.get(r.id);
    return {
      id: r.id,
      title: r.title,
      slug: r.custom_slug ?? r.slug,
      collection: r.collection,
      category: r.category,
      difficulty: r.difficulty,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at ?? r.created_at,
      pelit: Number(t?.pelit ?? 0),
      pelit30: Number(t?.pelit_30pv ?? 0),
      ylos: Number(t?.peukku_ylos ?? 0),
      alas: Number(t?.peukku_alas ?? 0),
    };
  });

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Visat</h1>
            <p className="text-sm text-muted-foreground">
              Kaikki luonnokset ja julkaistut visat. Site: <strong>{site.name}</strong>.
            </p>
          </div>
          <Link href="/quizzes/new">
            <Button>
              <Plus /> Luo AI:lla
            </Button>
          </Link>
        </div>

        {virhe ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Lataus epäonnistui: {virhe}
          </div>
        ) : visat.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ei yhtään visaa. Generoi ensimmäinen yllä olevasta napista.
          </div>
        ) : (
          <QuizList visat={visat} />
        )}
      </main>
    </>
  );
}
