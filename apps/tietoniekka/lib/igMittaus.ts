// INSTAGRAM-MITTAUS — selain. Bio-sivu (tietoniekka.fi/ig) ja Instagramista
// tulleet pelit: kanta laskee päiväkohtaiset summat per julkaisu (kirjaa_ig →
// ig_mittaus). Ei henkilötietoja, ei evästeitä — kuten Päivän nostojen mittaus.
//
// Pelinäkymä tunnistaa Instagramista tulleen pelaajan osoitteen ?lahde=ig&j=<julkaisu>
// -parametreista ja muistaa julkaisun sessionStoragessa, kunnes visa on pelattu.

"use client";

export type IgTapahtuma = "bio_naytto" | "klikkaus" | "avaus" | "valmis";

export function kirjaaIg(tapahtuma: IgTapahtuma, julkaisu?: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    void fetch(`${url}/rest/v1/rpc/kirjaa_ig`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ p_tapahtuma: tapahtuma, p_julkaisu: julkaisu ?? null }),
    }).catch(() => {});
  } catch {
    /* mittaus ei saa koskaan rikkoa sivua */
  }
}

const avain = (quizId: string) => `tn_ig:${quizId}`;

/** Pelinäkymän avaus: kirjaa, jos pelaaja tuli Instagramista. */
export function igAvaus(quizId: string | null | undefined) {
  if (!quizId) return;
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get("lahde") !== "ig") return;
    const j = p.get("j") ?? "";
    if (sessionStorage.getItem(avain(quizId)) !== null) return; // sama visa jo kirjattu tässä istunnossa
    sessionStorage.setItem(avain(quizId), j);
    kirjaaIg("avaus", j || null);
  } catch {
    /* no-op */
  }
}

/** Visa pelattu loppuun: kirjaa kerran, jos visa avattiin Instagramista. */
export function igValmis(quizId: string | null | undefined) {
  if (!quizId) return;
  try {
    const j = sessionStorage.getItem(avain(quizId));
    if (j === null) return;
    sessionStorage.removeItem(avain(quizId));
    kirjaaIg("valmis", j || null);
  } catch {
    /* no-op */
  }
}
