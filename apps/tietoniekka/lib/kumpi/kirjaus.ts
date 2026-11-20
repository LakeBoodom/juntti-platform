// KUMPI? 2.0 — vastausten kirjaus (A6) ja Plausible-tapahtumat (B). Selaimessa; kaikki best-effort: estetty storage,
// mainoseston tai kannan virhe ei näy pelaajalle.
import { getSupabase } from "@/lib/supabase";
import { kirjaaValmis } from "@/lib/jakoseuranta";
import type { KumpiKysymys } from "./tyypit";

export type Pelitapa = "kierros" | "paivan" | "putki";

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

export function kirjaaVastaus(q: KumpiKysymys, pelitapa: Pelitapa, valinta: 0 | 1 | null, ms: number, nro: number) {
  try {
    const sb = getSupabase();
    if (!sb) return;
    const visa = q.attr === "visa";
    // kumpi_vastaukset puuttuu generoiduista tyypeistä, kunnes packages/db/types.ts päivitetään.
    // Supabasen kysely lähtee vasta then-kutsusta (pelkkä void ei lähetä mitään).
    (sb as unknown as { from: (t: string) => { insert: (r: object) => PromiseLike<unknown> } })
      .from("kumpi_vastaukset")
      .insert({
        pelitapa,
        teema: q.teema,
        attr_key: q.attr,
        pari: q.pari.slice(0, 200),
        // Visakysymys: entity_a = kumpi_visakysymykset.id, ei entiteettipareja; valinta paikkana (valinta_ix).
        entity_a: visa ? q.pari.slice(5) : q.vaihtoehdot[0].id,
        entity_b: visa ? null : q.vaihtoehdot[1].id,
        valinta: visa || valinta === null ? null : q.vaihtoehdot[valinta].id,
        valinta_ix: valinta,
        oikein: valinta === q.oikea,
        vastausaika_ms: Math.max(0, Math.min(600000, Math.round(ms))),
        kysymys_nro: nro,
        session_id: istunto(),
      })
      .then(() => undefined, () => undefined);
  } catch {
    /* kirjaus ei saa estää peliä */
  }
}

export function plausible(tapahtuma: string, props?: Record<string, string | number>) {
  try {
    (window as unknown as { plausible?: (e: string, o?: object) => void }).plausible?.(tapahtuma, props ? { props } : undefined);
  } catch {
    /* ei Plausiblea */
  }
}

/** Kierros valmis: jakoseurannan "valmis" (jaetun linkin kierros). */
export const kirjaaKierrosValmis = () => {
  try { kirjaaValmis(); } catch { /* ohitetaan */ }
};
