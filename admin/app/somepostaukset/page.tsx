import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { getCurrentSite } from "@/lib/sites";
import { NewGeneralPostButton } from "./new-general-post-button";
import { PostList, type SocialPostRow } from "./post-list";
import { TemplatesPanel, type TemplateRow } from "./templates-panel";

export const dynamic = "force-dynamic";

export default async function SomepostauksetPage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const site = await getCurrentSite();
  const admin = getSupabaseAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawPosts, error } = await (admin as any)
    .from("social_posts")
    .select(
      "id, site_id, platform, source_type, source_id, target_date, template_id, copy_text, image_url, status, scheduled_at, posted_at, external_post_id, error_message, created_at",
    )
    .eq("site_id", site.id)
    .order("target_date", { ascending: false });

  const posts = (rawPosts ?? []) as SocialPostRow[];

  // Lähdenimet: quiz/celebrity/countdown -taulut eivät ole FK-sidottuja social_posts:iin,
  // joten haetaan erikseen per tyyppi .in('id', ids) -haulla.
  const quizIds = posts.filter((p) => p.source_type === "quiz" && p.source_id).map((p) => p.source_id!) ;
  const celebIds = posts.filter((p) => p.source_type === "celebrity" && p.source_id).map((p) => p.source_id!);
  const countdownIds = posts.filter((p) => p.source_type === "countdown" && p.source_id).map((p) => p.source_id!);

  const [quizzesRes, celebsRes, countdownsRes, templatesRes] = await Promise.all([
    quizIds.length
      ? admin.from("quizzes").select("id, title").in("id", quizIds)
      : Promise.resolve({ data: [] }),
    celebIds.length
      ? admin.from("celebrities").select("id, name").in("id", celebIds)
      : Promise.resolve({ data: [] }),
    countdownIds.length
      ? admin.from("countdowns").select("id, name").in("id", countdownIds)
      : Promise.resolve({ data: [] }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from("social_templates")
      .select("id, site_id, name, theme_key, content_scope, image_url, aspect_ratio, active, sort_order, created_at")
      .eq("site_id", site.id)
      .order("sort_order", { ascending: true }),
  ]);

  const sourceLabels = new Map<string, string>();
  for (const q of (quizzesRes.data ?? []) as { id: string; title: string }[]) {
    sourceLabels.set(`quiz:${q.id}`, q.title);
  }
  for (const c of (celebsRes.data ?? []) as { id: string; name: string }[]) {
    sourceLabels.set(`celebrity:${c.id}`, c.name);
  }
  for (const c of (countdownsRes.data ?? []) as { id: string; name: string }[]) {
    sourceLabels.set(`countdown:${c.id}`, c.name);
  }

  const templates = (templatesRes.data ?? []) as TemplateRow[];

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Some-postaukset</h1>
            <p className="text-sm text-muted-foreground">
              Katselmoi, muokkaa ja ajasta AI:n luomat some-postausluonnokset.
              Site: <strong>{site.name}</strong>.
            </p>
          </div>
          <NewGeneralPostButton siteId={site.id} />
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Lataus epäonnistui: {error.message}
          </div>
        ) : (
          <PostList posts={posts} sourceLabels={sourceLabels} />
        )}

        <TemplatesPanel siteId={site.id} templates={templates} />
      </main>
    </>
  );
}
