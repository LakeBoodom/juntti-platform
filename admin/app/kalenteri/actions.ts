"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";
import { generateSocialCopy } from "@juntti/ai";
import {
  resolveCalendarDay,
  type RawQuizRow,
  type RawCelebrityRow,
  type RawCountdownRow,
  type RawCountdownQuizRow,
  type RawScheduleRuleRow,
} from "@/lib/content-calendar";

export type SocialPlatform = "facebook" | "instagram" | "linkedin";

const OG_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_BASE_URL ?? "http://localhost:3001";

/** Hakee aktiivisen pohjakuvan (social_templates) annetulle content_scope:lle, jos sellainen on. */
async function findTemplateImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  siteId: string,
  scope: "quiz" | "celebrity" | "countdown" | "general",
): Promise<string | null> {
  const { data } = await sb
    .from("social_templates")
    .select("image_url, content_scope, sort_order")
    .eq("site_id", siteId)
    .eq("active", true)
    .in("content_scope", [scope, "all"])
    .order("sort_order", { ascending: true });
  const rows = (data ?? []) as { image_url: string; content_scope: string }[];
  if (rows.length === 0) return null;
  // Suosi tarkkaa scope-osumaa yleisen "all" sijaan
  const exact = rows.find((r) => r.content_scope === scope);
  return (exact ?? rows[0]).image_url ?? null;
}

function buildOgUrl(path: string, params: Record<string, string | null | undefined>) {
  const url = new URL(path, OG_BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  // Palautetaan suhteellinen polku + query, jotta se toimii ympäristöstä riippumatta
  return `${url.pathname}${url.search}`;
}

/**
 * Luo some-postausluonnokset yhdelle päivälle: selvittää mikä sisältö on live
 * (visa / synttärisankari / countdown), generoi AI-copyn ja lisää social_posts-rivin
 * status='draft' per läsnäoleva lähde per valittu alusta.
 */
export async function generateSocialDraftsForDay(
  siteId: string,
  isoDate: string,
  platforms: SocialPlatform[],
): Promise<{ ok: true; created: number } | { ok: false; error: string }> {
  if (!siteId || !isoDate) return { ok: false, error: "Site tai päivämäärä puuttuu" };
  if (!platforms.length) return { ok: false, error: "Valitse vähintään yksi alusta" };

  const sb = getSupabaseAdmin();

  // Hae tarvittava data — samat lähteet kuin kalenterisivun resoluutio, mutta vain yhdelle päivälle.
  const [quizzesRes, celebsRes, countdownsRes, countdownQuizzesRes, rulesRes] =
    await Promise.all([
      sb.from("quizzes").select("id, title, category, status").eq("site_id", siteId),
      sb
        .from("celebrities")
        .select("id, name, role, image_url, birth_date, death_date, priority, platform")
        .in("platform", ["synttarit", "both"]),
      sb
        .from("countdowns")
        .select("id, name, month, day, starts_on, ends_on, image_url, emoji, tag")
        .eq("site_id", siteId),
      sb.from("countdown_quizzes").select("countdown_id, quiz_id, sort_order"),
      sb
        .from("schedule_rules")
        .select("content_type, content_id, strategy, scheduled_date, active")
        .eq("site_id", siteId)
        .eq("content_type", "quiz")
        .eq("strategy", "date")
        .eq("scheduled_date", isoDate),
    ]);

  const day = resolveCalendarDay(siteId, isoDate, {
    quizzes: (quizzesRes.data ?? []) as RawQuizRow[],
    celebrities: (celebsRes.data ?? []) as RawCelebrityRow[],
    countdowns: (countdownsRes.data ?? []) as RawCountdownRow[],
    countdownQuizzes: (countdownQuizzesRes.data ?? []) as RawCountdownQuizRow[],
    scheduleRules: (rulesRes.data ?? []) as RawScheduleRuleRow[],
  });

  if (!day.quiz && !day.celebrity && !day.countdown) {
    return { ok: false, error: "Ei sisältöä tälle päivälle — mitään ei luotu" };
  }

  let created = 0;
  const errors: string[] = [];

  // ── Visa ──
  if (day.quiz) {
    try {
      const { data: qs } = await sb
        .from("questions")
        .select("question_text")
        .eq("quiz_id", day.quiz.id)
        .order("sort_order", { ascending: true })
        .limit(1);
      const exampleQuestion = qs?.[0]?.question_text as string | undefined;

      const { copyText } = await generateSocialCopy({
        sourceType: "quiz",
        title: day.quiz.title,
        category: day.quiz.category,
        exampleQuestion,
      });

      const templateImage = await findTemplateImage(sb, siteId, "quiz");
      const imageUrl = buildOgUrl("/api/social-og/quiz", {
        title: day.quiz.title,
        category: day.quiz.category,
        question: exampleQuestion,
        size: "square",
        templateImage,
      });

      for (const platform of platforms) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (sb as any).from("social_posts").insert({
          site_id: siteId,
          platform,
          source_type: "quiz",
          source_id: day.quiz.id,
          target_date: isoDate,
          copy_text: copyText,
          image_url: imageUrl,
          status: "draft",
        });
        if (error) errors.push(`visa/${platform}: ${error.message}`);
        else created++;
      }
    } catch (e) {
      errors.push(`visa: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // ── Synttärisankari ──
  if (day.celebrity) {
    try {
      const isDeceased = !!day.celebrity.death_date;
      const { copyText } = await generateSocialCopy({
        sourceType: "celebrity",
        name: day.celebrity.name,
        role: day.celebrity.role,
        isDeceased,
      });

      const birthYear = day.celebrity.birth_date.slice(0, 4);
      const templateImage = await findTemplateImage(sb, siteId, "celebrity");
      const imageUrl = buildOgUrl("/api/social-og/celebrity", {
        name: day.celebrity.name,
        role: day.celebrity.role,
        imageUrl: day.celebrity.image_url,
        birthYear,
        isDeceased: isDeceased ? "1" : "0",
        size: "square",
        templateImage,
      });

      for (const platform of platforms) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (sb as any).from("social_posts").insert({
          site_id: siteId,
          platform,
          source_type: "celebrity",
          source_id: day.celebrity.id,
          target_date: isoDate,
          copy_text: copyText,
          image_url: imageUrl,
          status: "draft",
        });
        if (error) errors.push(`synttäri/${platform}: ${error.message}`);
        else created++;
      }
    } catch (e) {
      errors.push(`synttäri: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // ── Countdown / tapahtuma ──
  if (day.countdown) {
    try {
      const { copyText } = await generateSocialCopy({
        sourceType: "countdown",
        name: day.countdown.name,
        emoji: day.countdown.emoji ?? undefined,
      });

      const templateImage = await findTemplateImage(sb, siteId, "countdown");
      const imageUrl = buildOgUrl("/api/social-og/generic", {
        label: day.countdown.name,
        headline: day.countdown.quizTitle ?? day.countdown.name,
        size: "square",
        templateImage,
      });

      for (const platform of platforms) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (sb as any).from("social_posts").insert({
          site_id: siteId,
          platform,
          source_type: "countdown",
          source_id: day.countdown.id,
          target_date: isoDate,
          copy_text: copyText,
          image_url: imageUrl,
          status: "draft",
        });
        if (error) errors.push(`tapahtuma/${platform}: ${error.message}`);
        else created++;
      }
    } catch (e) {
      errors.push(`tapahtuma: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  revalidatePath("/kalenteri");
  revalidatePath("/somepostaukset");

  if (created === 0) {
    return { ok: false, error: errors.join("; ") || "Ei luotu yhtään postausta" };
  }
  return { ok: true, created };
}
