// PELIKERRAT KUVA-, ÄÄNI- JA JÄRJESTYSPELEISTÄ (pelimuoto_pelit, migraatio 20261126; Heikki 28.10.2026).
// Näillä peleillä ei ole quizzes-riviä, joten tulos kirjataan yhteiseen tauluun lähdekenttineen
// (lisaaPelirivi → entry, referrer_host, landing_path). Best-effort: epäonnistuminen ei näy pelaajalle.
import { getSupabase } from "@/lib/supabase";
import { lisaaPelirivi } from "@/lib/seuranta";

export type PelimuotoPeli = "kuvavisa" | "aanivisa" | "jarjesta" | "jarjesta_oma" | "ikajarjestys";

/** Sama selaimen satunnaistunniste kuin visapelin quiz_plays-tallennuksessa. */
function istunto(): string {
  try {
    let id = localStorage.getItem("tn_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("tn_session_id", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

export async function kirjaaPelimuotoPeli(r: {
  pelimuoto: PelimuotoPeli;
  /** kortisto, äänivisan ryhmä, pakan slug, laatuattribuutti tai kategoria */
  avain: string;
  taso?: string | null;
  oikein: number;
  yhteensa: number;
  pisteet?: number | null;
}) {
  if (!r.avain || r.yhteensa <= 0) return;
  try {
    const sb = getSupabase();
    if (!sb) return;
    await lisaaPelirivi(sb, "pelimuoto_pelit", {
      pelimuoto: r.pelimuoto, avain: r.avain.slice(0, 80), taso: r.taso?.slice(0, 60) ?? null,
      oikein: r.oikein, yhteensa: r.yhteensa, pisteet: r.pisteet ?? null, session_id: istunto(),
    });
  } catch {
    // tilasto jää saamatta — peli jatkuu normaalisti
  }
}
