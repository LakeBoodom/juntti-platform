// KOUKKUKYSYMYS (Jakotekstit v4 §4, vaihe 2): tietovisan ja megavisan esikatselukortin kysymys valitaan visan omista
// kysymyksistä palvelimella, joten sama koukku näkyy kuvassa, og:descriptionissa ja Facebookin kortissa.
// Valinta on deterministinen (käsin valitut koukut muille pelimuodoille: KasinKoukku alla, vaihe 4):
//   1) etusivun Tiesitkö?-poolin kysymys (questions.hook), 2) keskivaikea taso (3, sitten 4, 2, 5, 1),
//   3) lähimpänä visan keskikohtaa (ensimmäinen kysymys on usein lämmittely), 4) id.
// Ehdot: ≤ 75 merkkiä, 2–4 vaihtoehtoa ≤ 28 merkkiä, ei ääntä eikä kuvaa (kuvaa ei näytetä kortissa).
import { getSupabase } from "@/lib/supabase";
import { VAIHTOEHTO_MAX } from "@/lib/kysymyskortti";

export const KOUKKU_MAX = 75;

export type Koukku = { id: string; kysymys: string; vaihtoehdot: string[] };

type Rivi = {
  id: string; question_text: string; answers: unknown; audio: unknown; animal_sound: unknown; image_url: string | null;
  taso: number | null; hook: boolean | null; sort_order: number | null;
};

const TASOJARJESTYS = [3, 4, 2, 5, 1];

export function valitseKoukku(rivit: Rivi[]): Koukku | null {
  const ehdokkaat = rivit
    .map((r) => ({ r, v: Array.isArray(r.answers) ? (r.answers as Array<{ text?: unknown }>).map((a) => String(a?.text ?? "").trim()) : [] }))
    .filter(({ r, v }) => {
      const k = r.question_text?.trim() ?? "";
      return k.length > 0 && k.length <= KOUKKU_MAX && r.audio == null && r.animal_sound == null && !r.image_url
        && v.length >= 2 && v.length <= 4 && v.every((o) => o.length > 0 && o.length <= VAIHTOEHTO_MAX);
    });
  if (!ehdokkaat.length) return null;
  const jarjestykset = rivit.map((r) => r.sort_order ?? 0).sort((a, b) => a - b);
  const keski = jarjestykset[Math.floor(jarjestykset.length / 2)] ?? 0;
  const tasoArvo = (t: number | null) => (t == null ? TASOJARJESTYS.length : Math.max(0, TASOJARJESTYS.indexOf(t)));
  ehdokkaat.sort((a, b) =>
    Number(!!b.r.hook) - Number(!!a.r.hook)
    || tasoArvo(a.r.taso) - tasoArvo(b.r.taso)
    || Math.abs((a.r.sort_order ?? 0) - keski) - Math.abs((b.r.sort_order ?? 0) - keski)
    || a.r.id.localeCompare(b.r.id));
  const { r, v } = ehdokkaat[0];
  return { id: r.id, kysymys: r.question_text.trim(), vaihtoehdot: v };
}

const SARAKKEET = "id, question_text, answers, audio, animal_sound, image_url, taso, hook, sort_order";

/** Visan koukku ja kysymysmäärä. */
export async function visanKoukku(quizId: string): Promise<{ koukku: Koukku | null; maara: number }> {
  const sb = getSupabase();
  if (!sb) return { koukku: null, maara: 0 };
  const { data } = await sb.from("questions").select(SARAKKEET as "id").eq("quiz_id", quizId);
  const rivit = (data ?? []) as unknown as Rivi[];
  return { koukku: valitseKoukku(rivit), maara: rivit.length };
}

/** Megavisan koukku sen omista kysymyksistä (mega_questions → questions; kuvakysymykset ohitetaan). */
export async function megaKoukku(megaId: string): Promise<Koukku | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("mega_questions" as never).select("question_id").eq("mega_quiz_id", megaId);
  const idt = [...new Set(((data ?? []) as unknown as Array<{ question_id: string | null }>).flatMap((l) => (l.question_id ? [l.question_id] : [])))];
  const rivit: Rivi[] = [];
  for (let i = 0; i < idt.length; i += 100) {
    const { data: q } = await sb.from("questions").select(SARAKKEET as "id").in("id", idt.slice(i, i + 100));
    rivit.push(...((q ?? []) as unknown as Rivi[]));
  }
  return valitseKoukku(rivit);
}

/* KÄSIN VALITUT KOUKUT (Jakotekstit v4 §4, vaihe 4, 7.11.2026). Pelimuodoille, joilla ei ole omaa kysymyslistaa
   (Järjestä, äänivisa, Vaalipiiriketju, reittipelit), koukku kirjoitetaan pelin tietoihin:
   - vertailu (kortti A): "Kumpi tunturi on korkeampi?" + kaksi kohdetta pakan omasta datasta (luvut tarkistettu
     fact_attributes-taulusta 7.11.2026); og:descriptionissa "Kumpi tunturi on korkeampi, Ounastunturi vai Yllästunturi?"
   - tekstikoukku: pelkkä kysymys ilman vaihtoehtoja (nimikortin alarivi).
   Tuplan teemat osoittavat oman poolinsa kysymykseen id:llä (haeKysymysKoukku). */
export type KasinKoukku = { kysymys: string; vaihtoehdot?: [string, string] };

/** og:descriptionin koukku: vertailussa "Kumpi X, A vai B?", muuten kysymys sellaisenaan. */
export function koukkuTeksti(k: KasinKoukku | Koukku | null | undefined): string | null {
  if (!k) return null;
  const v = k.vaihtoehdot;
  if (v && v.length === 2 && !("id" in k)) return `${k.kysymys.replace(/\?$/, "")}, ${v[0]} vai ${v[1]}?`;
  return k.kysymys;
}

/** Yksittäinen kysymys koukuksi (Tuplan teemat); sama korttiehto kuin valitseKoukussa. */
export async function haeKysymysKoukku(id: string | null | undefined): Promise<Koukku | null> {
  if (!id) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("questions").select(SARAKKEET as "id").eq("id", id).limit(1);
  return valitseKoukku((data ?? []) as unknown as Rivi[]);
}
