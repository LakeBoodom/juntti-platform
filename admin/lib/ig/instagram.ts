// Instagram API (Instagram Business Login): yhdistäminen, tokenin uusiminen ja julkaisu.
//
// Meta-sovellus "Tietoniekka_julkaisu", käyttötapaus "Manage messaging & content on
// Instagram" → API setup with Instagram login. Sovelluksen tunnus ei ole salainen;
// salaisuus on Vercelin ympäristömuuttujassa IG_APP_SECRET.
//
// Kulku: /api/ig/yhdista → instagram.com/oauth/authorize → /api/ig/yhdista/paluu
//   → lyhytikäinen token → pitkäikäinen (60 pv) → ig_yhteys. Ajastin uusii tokenin,
//   kun sitä on jäljellä alle 20 päivää.
// Julkaisu: kuva JPEG:nä julkisesta osoitteesta (Instagram hakee sen itse) → media-
//   kontti → odotetaan tila FINISHED → media_publish. Karusellissa ensin jokainen
//   kuva omana konttinaan (is_carousel_item), sitten CAROUSEL-kontti.

import { getSupabaseAdmin } from "@juntti/db";

export const IG_APP_ID = process.env.IG_APP_ID ?? "1817414619269454";
export const PALUU_URL = "https://juntti-admin.vercel.app/api/ig/yhdista/paluu";
const GRAPH = "https://graph.instagram.com";

export const OIKEUDET = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
];

export const salaisuusAsetettu = () => !!process.env.IG_APP_SECRET?.trim();

function salaisuus(): string {
  const s = process.env.IG_APP_SECRET?.trim();
  if (!s) throw new Error("IG_APP_SECRET puuttuu Vercelin ympäristömuuttujista.");
  return s;
}

export function valtuutusOsoite(state: string): string {
  const p = new URLSearchParams({
    client_id: IG_APP_ID,
    redirect_uri: PALUU_URL,
    response_type: "code",
    scope: OIKEUDET.join(","),
    state,
    enable_fb_login: "0",
    force_reauth: "true",
  });
  return `https://www.instagram.com/oauth/authorize?${p.toString()}`;
}

type IgVirhe = { error?: { message?: string; type?: string; code?: number; error_user_msg?: string }; error_message?: string };

async function lue<T>(r: Response, mita: string): Promise<T> {
  const teksti = await r.text();
  let json: unknown = null;
  try { json = JSON.parse(teksti); } catch { /* ei JSON */ }
  if (!r.ok) {
    const v = json as IgVirhe | null;
    const syy = v?.error?.error_user_msg ?? v?.error?.message ?? v?.error_message ?? teksti.slice(0, 200);
    throw new Error(`${mita}: ${syy}`);
  }
  return json as T;
}

/* ── Yhdistäminen ────────────────────────────────────────────────────── */

export type Yhteys = {
  site_id: string;
  ig_user_id: string;
  kayttajanimi: string | null;
  access_token: string;
  token_vanhenee: string;
  oikeudet: string | null;
};

export async function yhdistaKoodilla(siteId: string, code: string): Promise<Yhteys> {
  // 1. Koodi → lyhytikäinen token (1 h)
  const lyhyt = await lue<{ access_token?: string; user_id?: number | string; permissions?: string | string[]; data?: Array<{ access_token: string; user_id: number | string; permissions: string }> }>(
    await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: IG_APP_ID,
        client_secret: salaisuus(),
        grant_type: "authorization_code",
        redirect_uri: PALUU_URL,
        code,
      }),
    }),
    "Koodin vaihto",
  );
  const l = lyhyt.data?.[0] ?? lyhyt;
  if (!l.access_token) throw new Error("Koodin vaihto: vastauksessa ei ollut tokenia.");

  // 2. Pitkäikäinen token (60 pv)
  const pitka = await lue<{ access_token: string; expires_in: number }>(
    await fetch(`${GRAPH}/access_token?${new URLSearchParams({ grant_type: "ig_exchange_token", client_secret: salaisuus(), access_token: l.access_token })}`),
    "Pitkäikäinen token",
  );

  // 3. Profiili: user_id on ammattilaistilin tunnus, jolla julkaistaan
  const me = await lue<{ id: string; user_id?: string; username?: string }>(
    await fetch(`${GRAPH}/me?${new URLSearchParams({ fields: "user_id,username", access_token: pitka.access_token })}`),
    "Profiilin haku",
  );

  const yhteys: Yhteys = {
    site_id: siteId,
    ig_user_id: String(me.user_id ?? me.id),
    kayttajanimi: me.username ?? null,
    access_token: pitka.access_token,
    token_vanhenee: new Date(Date.now() + (pitka.expires_in ?? 5184000) * 1000).toISOString(),
    oikeudet: Array.isArray(l.permissions) ? l.permissions.join(",") : (l.permissions ?? null),
  };
  const { error } = await getSupabaseAdmin()
    .from("ig_yhteys" as never)
    .upsert({ ...yhteys, yhdistetty_at: new Date().toISOString(), paivitetty_at: new Date().toISOString() } as never, { onConflict: "site_id" });
  if (error) throw new Error(`Yhteyden tallennus: ${error.message}`);
  return yhteys;
}

export async function haeYhteys(siteId: string): Promise<Yhteys | null> {
  const { data } = await getSupabaseAdmin()
    .from("ig_yhteys" as never)
    .select("site_id, ig_user_id, kayttajanimi, access_token, token_vanhenee, oikeudet")
    .eq("site_id", siteId)
    .maybeSingle();
  return (data as unknown as Yhteys | null) ?? null;
}

/** Uusii pitkäikäisen tokenin, jos sitä on jäljellä alle 20 päivää (token on
    uusittavissa, kun se on vähintään vuorokauden vanha eikä vanhentunut). */
export async function uusiTokenTarvittaessa(y: Yhteys): Promise<Yhteys> {
  const jaljella = new Date(y.token_vanhenee).getTime() - Date.now();
  if (jaljella > 20 * 24 * 3600 * 1000 || jaljella <= 0) return y;
  const r = await lue<{ access_token: string; expires_in: number }>(
    await fetch(`${GRAPH}/refresh_access_token?${new URLSearchParams({ grant_type: "ig_refresh_token", access_token: y.access_token })}`),
    "Tokenin uusiminen",
  );
  const uusi = { ...y, access_token: r.access_token, token_vanhenee: new Date(Date.now() + r.expires_in * 1000).toISOString() };
  await getSupabaseAdmin()
    .from("ig_yhteys" as never)
    .update({ access_token: uusi.access_token, token_vanhenee: uusi.token_vanhenee, paivitetty_at: new Date().toISOString() } as never)
    .eq("site_id", y.site_id);
  return uusi;
}

/* ── Julkaisu ────────────────────────────────────────────────────────── */

async function post<T>(y: Yhteys, polku: string, params: Record<string, string>, mita: string): Promise<T> {
  return lue<T>(
    await fetch(`${GRAPH}/${polku}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${y.access_token}` },
      body: new URLSearchParams(params),
      signal: AbortSignal.timeout(30000),
    }),
    mita,
  );
}

async function get<T>(y: Yhteys, polku: string, params: Record<string, string>, mita: string): Promise<T> {
  return lue<T>(
    await fetch(`${GRAPH}/${polku}?${new URLSearchParams(params)}`, {
      headers: { Authorization: `Bearer ${y.access_token}` },
      signal: AbortSignal.timeout(15000),
    }),
    mita,
  );
}

async function odotaValmis(y: Yhteys, kontti: string) {
  for (let i = 0; i < 20; i++) {
    const s = await get<{ status_code?: string; status?: string }>(y, kontti, { fields: "status_code,status" }, "Kontin tila");
    if (s.status_code === "FINISHED" || s.status_code === "PUBLISHED") return;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error(`Instagram ei hyväksynyt kuvaa (${s.status ?? s.status_code}).`);
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Instagram ei käsitellyt kuvaa ajoissa — yritä uudelleen.");
}

/** Julkaisee yhden kuvan tai karusellin (2–10 kuvaa). Palauttaa median tunnuksen ja linkin. */
export async function julkaiseInstagramiin(y: Yhteys, kuvaUrlit: string[], kuvateksti: string): Promise<{ mediaId: string; permalink: string | null }> {
  if (kuvaUrlit.length === 0) throw new Error("Ei kuvia julkaistavaksi.");
  let kontti: string;
  if (kuvaUrlit.length === 1) {
    kontti = (await post<{ id: string }>(y, `${y.ig_user_id}/media`, { image_url: kuvaUrlit[0], caption: kuvateksti }, "Kuvan lähetys")).id;
  } else {
    const lapset: string[] = [];
    for (const url of kuvaUrlit) {
      lapset.push((await post<{ id: string }>(y, `${y.ig_user_id}/media`, { image_url: url, is_carousel_item: "true" }, "Karusellikuvan lähetys")).id);
    }
    for (const l of lapset) await odotaValmis(y, l);
    kontti = (await post<{ id: string }>(y, `${y.ig_user_id}/media`, { media_type: "CAROUSEL", children: lapset.join(","), caption: kuvateksti }, "Karusellin lähetys")).id;
  }
  await odotaValmis(y, kontti);
  const media = await post<{ id: string }>(y, `${y.ig_user_id}/media_publish`, { creation_id: kontti }, "Julkaisu");
  let permalink: string | null = null;
  try {
    permalink = (await get<{ permalink?: string }>(y, media.id, { fields: "permalink" }, "Linkki")).permalink ?? null;
  } catch { /* linkki ei ole välttämätön */ }
  return { mediaId: media.id, permalink };
}

/* ── Luvut (insights) ────────────────────────────────────────────────── */

export type Tilastot = Partial<Record<
  "reach" | "views" | "likes" | "comments" | "saved" | "shares" | "total_interactions" | "follows" | "profile_visits",
  number
>>;

/* Instagram hylkää koko pyynnön, jos yksikin mittari ei sovi mediatyypille tai
   API-versiolle (esim. views tuli 2025, impressions poistui). Kokeillaan siksi
   ensin laajaa joukkoa ja sitten suppeampia. */
const MITTARIJOUKOT = [
  ["reach", "views", "likes", "comments", "saved", "shares", "total_interactions", "follows", "profile_visits"],
  ["reach", "views", "likes", "comments", "saved", "shares", "total_interactions"],
  ["reach", "likes", "comments", "saved", "shares"],
  ["reach", "likes", "comments", "saved"],
];

type InsightVastaus = { data?: Array<{ name: string; values?: Array<{ value: number }>; total_value?: { value: number } }> };

export async function haeMediaTilastot(y: Yhteys, mediaId: string): Promise<Tilastot> {
  let viimeisin: unknown = null;
  for (const joukko of MITTARIJOUKOT) {
    try {
      const r = await get<InsightVastaus>(y, `${mediaId}/insights`, { metric: joukko.join(",") }, "Luvut");
      const t: Tilastot = {};
      for (const m of r.data ?? []) {
        const v = m.total_value?.value ?? m.values?.[0]?.value;
        if (typeof v === "number") t[m.name as keyof Tilastot] = v;
      }
      return t;
    } catch (e) {
      viimeisin = e;
    }
  }
  throw viimeisin instanceof Error ? viimeisin : new Error("Lukujen haku epäonnistui.");
}

export async function haeTilinTiedot(y: Yhteys): Promise<{ seuraajia: number | null; julkaisuja: number | null }> {
  const r = await get<{ followers_count?: number; media_count?: number }>(y, "me", { fields: "followers_count,media_count" }, "Tilin tiedot");
  return { seuraajia: r.followers_count ?? null, julkaisuja: r.media_count ?? null };
}
