"use server";

// Päivän visa -adminin tallennukset (toteutusohje 19.9.2026, luvut 3 ja 8).
// Ihmisen tallennus asettaa aina auto_filled = false ("toimitettu").
// Kannassa kovat rajat (80 / 240 merkkiä); samat rajat tarkistetaan tässä,
// jotta virhe näkyy suomeksi eikä kantavirheenä.

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";
import { INTRO_OTSIKKO_MAX, INTRO_TEKSTI_MAX } from "@/lib/paivan-visa-yhteiset";

type Tulos = { ok: true; ruleId: string } | { ok: false; error: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

function tyhjaksiNull(s: string | null | undefined): string | null {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  return t ? t : null;
}

export async function tallennaPaiva(input: {
  siteId: string;
  paiva: string;
  quizId: string;
  introOtsikko: string | null;
  introTeksti: string | null;
  lahdeUrl: string | null;
  muistiinpano: string | null;
}): Promise<Tulos> {
  if (!input.siteId || !ISO.test(input.paiva) || !input.quizId) {
    return { ok: false, error: "Päivä tai visa puuttuu." };
  }
  const intro_headline = tyhjaksiNull(input.introOtsikko);
  const intro_text = tyhjaksiNull(input.introTeksti);
  const intro_source_url = tyhjaksiNull(input.lahdeUrl);
  // Muistiinpanossa rivinvaihdot saavat jäädä.
  const editorial_note = (input.muistiinpano ?? "").trim() || null;

  if (intro_headline && intro_headline.length > INTRO_OTSIKKO_MAX)
    return { ok: false, error: `Intron otsikko on yli ${INTRO_OTSIKKO_MAX} merkkiä.` };
  if (intro_text && intro_text.length > INTRO_TEKSTI_MAX)
    return { ok: false, error: `Intron teksti on yli ${INTRO_TEKSTI_MAX} merkkiä.` };
  if (intro_headline && !intro_text)
    return { ok: false, error: "Pelkkä otsikko ei näy etusivulla — lisää myös intron teksti (tai poista otsikko)." };
  if (intro_source_url && !/^https?:\/\/\S+$/i.test(intro_source_url))
    return { ok: false, error: "Lähde-URL:n pitää alkaa http:// tai https://." };

  const sb = getSupabaseAdmin();
  const kentat = {
    content_id: input.quizId,
    intro_headline,
    intro_text,
    intro_source_url,
    editorial_note,
    auto_filled: false,
    active: true,
  };

  const { data: olemassa } = await sb
    .from("schedule_rules")
    .select("id")
    .eq("site_id", input.siteId)
    .eq("content_type", "quiz")
    .eq("scheduled_date", input.paiva)
    .eq("active", true)
    .maybeSingle();

  let ruleId: string;
  if (olemassa) {
    const { error } = await sb.from("schedule_rules").update(kentat as never).eq("id", olemassa.id);
    if (error) return { ok: false, error: error.message };
    ruleId = olemassa.id;
  } else {
    const { data, error } = await sb
      .from("schedule_rules")
      .insert({
        site_id: input.siteId,
        content_type: "quiz",
        strategy: "date",
        scheduled_date: input.paiva,
        weight: 1,
        ...kentat,
      } as never)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    ruleId = (data as { id: string }).id;
  }

  revalidatePath("/paivan-visa");
  revalidatePath(`/paivan-visa/${input.paiva}`);
  return { ok: true, ruleId };
}

/** Poistaa päivän rivin. Automaattitäyttö valitsee päivälle visan uudelleen
    (yöajo 7 päivää eteenpäin tai viimeistään etusivun ensimmäinen lataus). */
export async function poistaPaiva(siteId: string, paiva: string): Promise<{ ok: boolean; error?: string }> {
  if (!siteId || !ISO.test(paiva)) return { ok: false, error: "Päivä puuttuu." };
  const sb = getSupabaseAdmin();
  const { error } = await sb
    .from("schedule_rules")
    .delete()
    .eq("site_id", siteId)
    .eq("content_type", "quiz")
    .eq("strategy", "date")
    .eq("scheduled_date", paiva);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/paivan-visa");
  revalidatePath(`/paivan-visa/${paiva}`);
  return { ok: true };
}
