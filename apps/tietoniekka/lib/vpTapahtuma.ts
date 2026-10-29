// Visapakettien pilotin mittaus (quiz_pack_events, ei henkilötietoja). Selaimessa: session_id on sama
// satunnainen tn_session_id kuin pelikerroissa. RLS sallii vain lisäyksen julkaistuun pakettiin, joten
// luonnoksen esikatselusta ei synny rivejä.
import { getSupabase } from "./supabase";

export type VpTapahtuma = "nayta" | "ruutu_aloitus" | "ruutu_loppu" | "tulosta" | "vastaus_auki" | "pelaa" | "vetaja_aloitus" | "vetaja_loppu";

function istunto(): string | null {
  try {
    let id = localStorage.getItem("tn_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("tn_session_id", id);
    }
    return id;
  } catch {
    return null;
  }
}

export function kirjaaVp(packId: string, tapahtuma: VpTapahtuma): void {
  const sb = getSupabase();
  if (!sb) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void (sb as any).from("quiz_pack_events").insert({ pack_id: packId, tapahtuma, session_id: istunto() }).then(() => {});
}
