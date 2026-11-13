// MEGAT — lista + Koosta Mega (Heikki hyväksyi ehdotuksen 3.8.2026)
import Link from "next/link";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { getCurrentSite } from "@/lib/sites";
import { Nav } from "@/components/nav";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { ComposerForm } from "./composer-form";

export const dynamic = "force-dynamic";

export default async function MegatPage() {
  const sb = await supabaseFromCookies();
  const { data: { user } } = await sb.auth.getUser();
  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();

  const { data } = await admin
    .from("quizzes")
    .select("id, title, status, created_at" as never)
    .eq("site_id", site.id)
    .eq("game_mode" as never, "mega" as never)
    .order("created_at", { ascending: false });
  const megas = (data ?? []) as unknown as Array<{
    id: string; title: string; status: string; created_at: string;
  }>;

  // Pelikerrat quiz_plays-taulusta (admin_visa_tilastot), kuten Visat-listalla; quizzes.play_count ei päivity.
  const { data: tilastot } = await admin.rpc("admin_visa_tilastot" as never, { p_site: site.id } as never);
  const pelit = new Map(
    ((tilastot ?? []) as unknown as Array<{ quiz_id: string; pelit: number }>).map((t) => [t.quiz_id, Number(t.pelit)]),
  );

  // Kysymysmäärät per Mega + pelattavat (Heikki 13.11.2026): linkki on pelattava, kun sen kysymyksen lähdevisa on
  // julkaistu (tai kuvavisa aktiivinen). Jos lähdevisa palautetaan luonnokseksi, julkinen sivu näyttää vähemmän kysymyksiä
  // kuin megaan on linkitetty → varoitus tällä sivulla.
  const counts = new Map<string, number>();
  const pelattavat = new Map<string, number>();
  if (megas.length > 0) {
    const { data: links } = await admin
      .from("mega_questions" as never)
      .select("mega_quiz_id, question_id, kuvavisa_id" as never)
      .in("mega_quiz_id" as never, megas.map((m) => m.id) as never[]);
    const rivit = (links ?? []) as unknown as Array<{ mega_quiz_id: string; question_id: string | null; kuvavisa_id: string | null }>;
    const erissa = async <T,>(taulu: string, sarakkeet: string, idt: string[]): Promise<T[]> => {
      const out: T[] = [];
      for (let i = 0; i < idt.length; i += 200) {
        const { data: d } = await admin.from(taulu as never).select(sarakkeet as never).in("id" as never, idt.slice(i, i + 200) as never[]);
        out.push(...((d ?? []) as unknown as T[]));
      }
      return out;
    };
    const kysymykset = await erissa<{ id: string; quiz_id: string }>("questions", "id, quiz_id", [...new Set(rivit.flatMap((l) => (l.question_id ? [l.question_id] : [])))]);
    const lahteet = await erissa<{ id: string; status: string }>("quizzes", "id, status", [...new Set(kysymykset.map((k) => k.quiz_id))]);
    const kuvat = await erissa<{ id: string; active: boolean }>("kuvavisas", "id, active", [...new Set(rivit.flatMap((l) => (l.kuvavisa_id ? [l.kuvavisa_id] : [])))]);
    const julkaistu = new Set(lahteet.filter((q) => q.status === "published").map((q) => q.id));
    const kysymysOk = new Set(kysymykset.filter((k) => julkaistu.has(k.quiz_id)).map((k) => k.id));
    const kuvaOk = new Set(kuvat.filter((k) => k.active).map((k) => k.id));
    for (const l of rivit) {
      counts.set(l.mega_quiz_id, (counts.get(l.mega_quiz_id) ?? 0) + 1);
      const ok = l.question_id ? kysymysOk.has(l.question_id) : l.kuvavisa_id ? kuvaOk.has(l.kuvavisa_id) : false;
      if (ok) pelattavat.set(l.mega_quiz_id, (pelattavat.get(l.mega_quiz_id) ?? 0) + 1);
    }
  }
  const vajaat = megas.filter((m) => (pelattavat.get(m.id) ?? 0) < (counts.get(m.id) ?? 0));

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Megavisat</h1>
            <p className="text-sm text-muted-foreground">
              Mega on viittauskooste: kysymykset linkitetään julkaistuista visoista, ei kopioida.
              Automaatti ehdottaa — sinä katselmoit ja lukitset. Site: <strong>{site.name}</strong>
            </p>
          </div>
        </div>

        {vajaat.length > 0 && (
          <div className="flex gap-3 rounded-md border border-red-600/40 bg-red-600/10 p-4 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">
                {vajaat.length === 1 ? "Yhdessä megassa" : `${vajaat.length} megassa`} on kysymyksiä, jotka eivät näy pelaajille.
              </p>
              <p className="mt-1">
                Kysymyksen lähdevisa on palautettu luonnokseksi (tai kuvavisa poistettu käytöstä), joten julkinen sivu näyttää
                vähemmän kysymyksiä kuin megaan on linkitetty:{" "}
                {vajaat.map((m, i) => (
                  <span key={m.id}>
                    {i > 0 && ", "}
                    <Link href={`/megat/${m.id}`} className="underline">{m.title}</Link> {pelattavat.get(m.id) ?? 0}/{counts.get(m.id) ?? 0}
                  </span>
                ))}
                . Vaihda kysymykset julkaistuista visoista tai julkaise lähdevisa.
              </p>
            </div>
          </div>
        )}

        <ComposerForm />

        {megas.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            Ei vielä yhtään Megaa. Koosta ensimmäinen yllä.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nimi</TableHead>
                  <TableHead>Kysymyksiä</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Pelatut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {megas.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <Link href={`/megat/${m.id}`} className="hover:underline">
                        <span className="mr-2 inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700">MEGA</span>
                        {m.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {(pelattavat.get(m.id) ?? 0) < (counts.get(m.id) ?? 0) ? (
                        <span className="inline-flex items-center gap-1 text-red-700" title="Pelattavat / linkitetyt: osa lähdevisoista on luonnoksia">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {pelattavat.get(m.id) ?? 0}/{counts.get(m.id) ?? 0}
                        </span>
                      ) : (
                        counts.get(m.id) ?? 0
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={
                        m.status === "published"
                          ? "inline-flex items-center rounded-full border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-xs text-green-700"
                          : "inline-flex items-center rounded-full border border-yellow-600/30 bg-yellow-600/10 px-2 py-0.5 text-xs text-yellow-700"
                      }>
                        {m.status === "published" ? "Julkaistu" : "Draft"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{pelit.get(m.id) ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Draft-Megat näkyvät 2.0-previewssä osoitteessa /2-0/peli?mega=&lt;slug&gt;. Julkaistu Mega
          näkyisi myös nykyisen sivuston listauksissa — pidä draftina 2.0-julkaisuun asti.
        </p>
      </main>
    </>
  );
}
