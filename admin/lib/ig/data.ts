// Instagram-kuvien data: Päivän visa ja Päivän synttärit tietylle päivälle.
// Samat lähteet kuin sivuston etusivulla: schedule_rules (Päivän visa + intro)
// ja paivan_sankari() (synttärit, sama valintalogiikka kuin etusivun Päivän sankari).

import sharp from "sharp";
import { getSupabaseAdmin } from "@juntti/db";
import { kokoelmaNimi, onUrheilu } from "@/lib/kokoelmat";

const SIVUSTO = "https://tietoniekka.fi";

/** Instagram-maininnat: tallennetut tilit ehdotukseksi ja kohde, jolle uusi tili muistetaan
    (henkilö, jos julkaisu koskee henkilöä; muuten visa). */
export type Tagit = {
  ehdotus: string[];
  kohde: { tyyppi: "quiz" | "celebrity"; id: string; nimi: string; tilit: string[] } | null;
};

const tilitListaksi = (x: unknown): string[] => (Array.isArray(x) ? x.filter((t): t is string => typeof t === "string" && !!t) : []);
const yhdista = (...l: string[][]) => [...new Set(l.flat())];

export type Kuva = {
  url: string;
  /** Alkuperäisen kuvan mitat (ratkaisevat, kelpaako kuva isoksi) */
  leveys: number;
  korkeus: number;
  /** Kohdistus prosentteina kuten sivuston object-position */
  fx: number;
  fy: number;
  /** Kuva JPEG:nä, pitkä sivu enintään 1600 px */
  buf: Buffer;
};

/** Visan kysymys korttia varten (4f, 4l, 4m, 4o, 4p, 4q): teksti ja vaihtoehdot
    sellaisenaan visasta — designin sääntö: kortissa ei muokata. */
export type Kysymys = {
  id: string;
  teksti: string;
  vaihtoehdot: string[];
  oikea: string;
  /** Kuvakysymys ei toimi kortilla ilman kuvaa */
  kuva: boolean;
};

export type VisaData = {
  paiva: string;
  quizId: string;
  slug: string | null;
  nimi: string;
  kokoelma: string;
  urheilu: boolean;
  henkilovisa: boolean;
  kysymyksia: number;
  introOtsikko: string | null;
  introTeksti: string | null;
  kuva: Kuva | null;
  /** Oma julkaisu (ad hoc / kampanja) — ei Päivän visa. Muuttaa tunnisteen ja CTA:n. */
  oma: boolean;
  /** Tunniste kuvan yläreunaan: "PÄIVÄN VISA" tai oman julkaisun otsake ("LUONTOVIIKKO") */
  tunniste: string;
  kysymykset: Kysymys[];
  /** Aihekohtaiset tulostasot (quizzes.fanitasot) tai null */
  fanitasot: string[] | null;
  /** Kuvan tekijä ja lisenssi Wikimediasta ("Werner100359 / CC BY-SA 3.0") */
  kuvaaja: string | null;
  /** Henkilövisan henkilö (celebrities.trivia_quiz_id) — henkilökortit 5f–5m */
  henkilo: VisanHenkilo | null;
  tagit: Tagit;
};

export type VisanHenkilo = {
  celebrityId: string;
  nimi: string;
  kuva: Kuva | null;
  kuvaaja: string | null;
  syntymavuosi: number | null;
  kuolinvuosi: number | null;
};

export type SynttariData = {
  paiva: string;
  celebrityId: string;
  quizId: string | null;
  nimi: string;
  rooli: string | null;
  ika: number;
  muisto: boolean;
  syntymavuosi: number | null;
  kuolinvuosi: number | null;
  kuva: Kuva | null;
  /** Kuvan tekijä ja lisenssi Wikimediasta — kuvatekstiin (CC BY-SA) */
  kuvaaja: string | null;
  /** Henkilön visan kysymykset (henkilö + kysymys -kortit 5p, 5q) */
  kysymykset: Kysymys[];
  tagit: Tagit;
  /** Henkilön visan kokoelma ja nimi (S-D:n visayhteys) */
  visaNimi: string | null;
};

/* ── Päivämäärät ─────────────────────────────────────────────────────── */

const VIIKONPAIVAT = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];

/** "2026-09-22" → "Tiistai 22.9." */
export function paivaTeksti(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const vp = VIIKONPAIVAT[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${vp} ${d}.${m}.`;
}

export function lyhytPaiva(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.`;
}

/* ── Kuvat ───────────────────────────────────────────────────────────── */

const kuvaVälimuisti = new Map<string, Promise<Kuva | null>>();

function absoluuttinen(u: string): string {
  return u.startsWith("http") ? u : `${SIVUSTO}${u.startsWith("/") ? "" : "/"}${u}`;
}

/** Henkilökuvat ovat kannassa Wikimedian 330 px:n pikkukuvia. Instagramiin
    kokeillaan ensin isompaa versiota, sitten alkuperäistä tiedostoa (Wikimedia
    ei skaalaa yli alkuperäisen koon) ja lopuksi kannan osoitetta sellaisenaan. */
function ehdokkaat(abs: string): string[] {
  const m = abs.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/thumb\/(.+)\/\d+px-[^/]+$/);
  if (!m) return [abs];
  return [abs.replace(/\/\d+px-([^/]+)$/, "/1280px-$1"), `${m[1]}/${m[2]}`, abs];
}

/** Wikimedia Commonsin tiedostosivu (commons.wikimedia.org/wiki/File:X.jpg) → alkuperäinen kuva. */
export function kuvaOsoite(url: string): string {
  const u = url.trim();
  const m = u.match(/^https?:\/\/commons\.(?:m\.)?wikimedia\.org\/wiki\/((?:File|Tiedosto):[^?#]+)/i);
  if (m) return `https://commons.wikimedia.org/wiki/Special:FilePath/${m[1].replace(/^(File|Tiedosto):/i, "")}`;
  return u;
}

/** Hakee kuvan ja mittaa sen. Muunnetaan JPEG:ksi (Satori ei tue WebP:tä
    luotettavasti) ja pitkä sivu rajataan 1600 px:iin. */
export function lataaKuva(url: string | null, fx = 50, fy = 40): Promise<Kuva | null> {
  if (!url) return Promise.resolve(null);
  const abs = absoluuttinen(url);
  const avain = `${abs}|${fx}|${fy}`;
  let p = kuvaVälimuisti.get(avain);
  if (!p) {
    p = (async () => {
      try {
        let alkup: Buffer | null = null;
        for (const osoite of ehdokkaat(abs)) {
          const r = await fetch(osoite, {
            headers: { "User-Agent": "TietoniekkaAdmin/1.0 (https://tietoniekka.fi)" },
            signal: AbortSignal.timeout(15000),
          });
          if (r.ok && (r.headers.get("content-type") ?? "").startsWith("image/")) {
            alkup = Buffer.from(await r.arrayBuffer());
            break;
          }
        }
        if (!alkup) return null;
        const meta = await sharp(alkup).rotate().metadata();
        const buf = await sharp(alkup)
          .rotate()
          .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 88 })
          .toBuffer();
        return { url: abs, leveys: meta.width ?? 0, korkeus: meta.height ?? 0, fx, fy, buf };
      } catch {
        return null;
      }
    })();
    kuvaVälimuisti.set(avain, p);
    // Välimuisti vain saman palvelininstanssin lyhyeen käyttöön (sama kuva monessa pohjassa).
    setTimeout(() => kuvaVälimuisti.delete(avain), 10 * 60 * 1000).unref?.();
  }
  return p;
}

/** Suurin sallittu suurennos. Instagram näyttää 1080 px:n kuvan puhelimessa noin
    1 170 laitepikselin levyisenä; 1,5× suurennettu valokuva tekstin ja liukuvärin
    alla näyttää vielä terävältä, 1,7× (640 px → 1080 px) jo selvästi pehmeältä. */
export const MAX_SUURENNOS = 1.5;

const suurennos = (k: Kuva, w: number, h: number) => Math.max(w / k.leveys, h / k.korkeus);

/* ── Kuvaaja ja lisenssi (Wikimedia) ─────────────────────────────────── */

const kuvaajaVälimuisti = new Map<string, Promise<string | null>>();

/** Wikimedia-kuvan osoitteesta tiedoston nimi ja wikin API. Muut osoitteet → null. */
function wikiTiedosto(url: string): { api: string; nimi: string } | null {
  const u = url.trim();
  let m = u.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/([a-z-]+)\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/);
  if (m) return { api: m[1] === "commons" ? "https://commons.wikimedia.org" : `https://${m[1]}.wikipedia.org`, nimi: m[2] };
  m = u.match(/^https?:\/\/commons\.(?:m\.)?wikimedia\.org\/wiki\/(?:Special:FilePath\/|(?:File|Tiedosto):)([^?#]+)/i);
  if (m) return { api: "https://commons.wikimedia.org", nimi: m[1] };
  return null;
}

const ilmanHtml = (s: string) =>
  s.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

/** Kuvan tekijä ja lisenssi Wikimedian tiedostotiedoista kuvatekstiin:
    "Werner100359 / CC BY-SA 3.0". Pitkä tekijätieto (esim. usean rivin kuvaus)
    lyhennetään ensimmäiseen osaan. null, jos kuva ei ole Wikimediasta tai tieto puuttuu. */
export function haeKuvaaja(url: string | null | undefined): Promise<string | null> {
  const t = url ? wikiTiedosto(url) : null;
  if (!t) return Promise.resolve(null);
  const avain = `${t.api}|${t.nimi}`;
  let p = kuvaajaVälimuisti.get(avain);
  if (!p) {
    p = (async () => {
      try {
        const nimi = decodeURIComponent(t.nimi).replace(/_/g, " ");
        const q = new URLSearchParams({ action: "query", titles: `File:${nimi}`, prop: "imageinfo", iiprop: "extmetadata", format: "json", formatversion: "2" });
        const r = await fetch(`${t.api}/w/api.php?${q}`, {
          headers: { "User-Agent": "TietoniekkaAdmin/1.0 (https://tietoniekka.fi)" },
          signal: AbortSignal.timeout(8000),
        });
        if (!r.ok) return null;
        const j = (await r.json()) as { query?: { pages?: Array<{ imageinfo?: Array<{ extmetadata?: Record<string, { value?: string }> }> }> } };
        const meta = j.query?.pages?.[0]?.imageinfo?.[0]?.extmetadata ?? {};
        let tekija = ilmanHtml(meta.Artist?.value ?? "").split(/[;\n]| - /)[0].trim();
        if (tekija.length > 60) tekija = `${tekija.slice(0, 57).replace(/\s+\S*$/, "")}…`;
        const lisenssi = ilmanHtml(meta.LicenseShortName?.value ?? "");
        const pd = /^public domain$/i.test(lisenssi) ? "PD" : lisenssi;
        if (!tekija && !pd) return null;
        return [tekija || "Wikimedia Commons", pd].filter(Boolean).join(" / ");
      } catch {
        return null;
      }
    })();
    kuvaajaVälimuisti.set(avain, p);
    setTimeout(() => kuvaajaVälimuisti.delete(avain), 60 * 60 * 1000).unref?.();
  }
  return p;
}

/** Rajaa kuvan täsmälleen w × h -kokoon kuten CSS:n object-fit: cover +
    object-position fx% fy% ja palauttaa data-URL:n. Suurennettaessa terävöitetään kevyesti.
    seepia 0–1: designin 4d "lämmin kuva" (CSS sepia(.25) saturate(.9)) — Satori ei tue
    CSS-suodattimia, joten sävy tehdään kuvaan valmiiksi. */
export async function rajaa(k: Kuva, w: number, h: number, o: { seepia?: number; harmaa?: boolean } = {}): Promise<string> {
  const meta = await sharp(k.buf).metadata();
  const W = meta.width ?? w;
  const H = meta.height ?? h;
  const s = Math.max(w / W, h / H);
  const rw = Math.max(w, Math.round(W * s));
  const rh = Math.max(h, Math.round(H * s));
  const left = Math.round((rw - w) * (k.fx / 100));
  const top = Math.round((rh - h) * (k.fy / 100));
  let kuva = sharp(k.buf).resize(rw, rh, { kernel: "lanczos3" }).extract({ left, top, width: w, height: h });
  if (s > 1.05) kuva = kuva.sharpen({ sigma: 0.7 });
  if (o.seepia) {
    const a = o.seepia;
    // CSS sepia(a): lineaarinen sekoitus identiteetin ja seepiamatriisin välillä
    const S = [[0.393, 0.769, 0.189], [0.349, 0.686, 0.168], [0.272, 0.534, 0.131]];
    const m = S.map((r, i) => r.map((v, j) => (1 - a) * (i === j ? 1 : 0) + a * v)) as [[number, number, number], [number, number, number], [number, number, number]];
    kuva = sharp(await kuva.toBuffer()).recomb(m).modulate({ saturation: 0.9 });
  }
  // Muistopäivän kortti (5h): harmaasävy etukäteen, koska Satori ei tue suodattimia.
  if (o.harmaa) kuva = sharp(await kuva.toBuffer()).grayscale();
  const out = await kuva.jpeg({ quality: 90 }).toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}

/** Kelpaako kuva w × h -alueelle (enintään 1,5× suurennos). */
export const kelpaa = (k: Kuva | null, w: number, h: number) => !!k && suurennos(k, w, h) <= MAX_SUURENNOS;

/** Kuvakaistale (1080 × 300–360): enintään 1,5× suurennos → väh. 720 px leveä. */
export const kelpaaKaistaleeksi = (k: Kuva | null) => !!k && suurennos(k, 1080, 360) <= MAX_SUURENNOS;
/** Koko pinnan kuva (V-C, S-A: 1080 × 1350): väh. 720 × 900 px. */
export const kelpaaKokoPinnaksi = (k: Kuva | null) => !!k && suurennos(k, 1080, 1350) <= MAX_SUURENNOS;

/** Toimituksen korvaava kuva tai uusi rajaus (ig_julkaisut.kentat.kuva). */
export async function korvaaKuva<T extends { kuva: Kuva | null; kuvaaja: string | null }>(d: T, korvaava?: { url: string; fx: number; fy: number } | null): Promise<T> {
  if (!korvaava?.url) return d;
  const osoite = kuvaOsoite(korvaava.url);
  const [k, kuvaaja] = await Promise.all([lataaKuva(osoite, korvaava.fx, korvaava.fy), haeKuvaaja(osoite)]);
  return k ? { ...d, kuva: k, kuvaaja } : d;
}

/* ── Päivän visa ─────────────────────────────────────────────────────── */

type Saanto = {
  content_id: string;
  intro_headline: string | null;
  intro_text: string | null;
};

type Visa = {
  id: string; title: string; display_title: string | null; slug: string | null; custom_slug: string | null;
  category: string | null; collection: string | null; hero_image: string | null; image_url: string | null;
  hero_focal_x: number | null; hero_focal_y: number | null;
};

export async function haePaivanVisa(siteId: string, paiva: string, lataaKuvat = true): Promise<VisaData | null> {
  const { data: s } = await getSupabaseAdmin()
    .from("schedule_rules")
    .select("content_id, intro_headline, intro_text")
    .eq("site_id", siteId)
    .eq("content_type", "quiz")
    .eq("scheduled_date", paiva)
    .eq("active", true)
    .maybeSingle();
  const saanto = s as unknown as Saanto | null;
  if (!saanto?.content_id) return null;
  return haeVisa(saanto.content_id, paiva, {
    introOtsikko: saanto.intro_headline,
    introTeksti: saanto.intro_text,
    lataaKuvat,
  });
}

/** Visan kysymykset korttia varten, teksti ja vaihtoehdot sellaisinaan. */
export async function haeKysymykset(quizId: string): Promise<Kysymys[]> {
  const { data } = await getSupabaseAdmin().from("questions").select("id, question_text, answers, image_url, sort_order").eq("quiz_id", quizId).order("sort_order");
  return ((data ?? []) as unknown as Array<{ id: string; question_text: string; answers: Array<{ text: string; is_correct: boolean }> | null; image_url: string | null }>).map((r) => {
    const vastaukset = (r.answers ?? []).filter((a) => a?.text?.trim());
    return {
      id: r.id,
      teksti: r.question_text.trim(),
      vaihtoehdot: vastaukset.slice(0, 4).map((a) => a.text.trim()),
      oikea: (vastaukset.find((a) => a.is_correct)?.text ?? "").trim(),
      kuva: !!r.image_url,
    };
  });
}

/** Mikä tahansa visa annetulle päivälle — omat julkaisut ja kampanjat. */
export async function haeVisa(
  quizId: string,
  paiva: string,
  o: { introOtsikko?: string | null; introTeksti?: string | null; oma?: boolean; otsake?: string | null; lataaKuvat?: boolean } = {},
): Promise<VisaData | null> {
  const sb = getSupabaseAdmin();
  const [{ data: q }, kys, { data: hlo }] = await Promise.all([
    sb
      .from("quizzes")
      .select("id, title, display_title, slug, custom_slug, category, collection, hero_image, image_url, hero_focal_x, hero_focal_y, fanitasot, ig_tilit")
      .eq("id", quizId)
      .maybeSingle(),
    haeKysymykset(quizId),
    sb
      .from("celebrities")
      .select("id, name, birth_date, death_date, image_url, image_focal_x, image_focal_y, ig_tilit")
      .eq("trivia_quiz_id", quizId)
      .limit(1)
      .maybeSingle(),
  ]);
  const visa = q as unknown as (Visa & { fanitasot: unknown; ig_tilit: unknown }) | null;
  if (!visa) return null;
  const kysymykset = kys;
  const count = kysymykset.length;

  // quizzes.hero_focal_* on sivuston asteikolla 0–1 (admin: "0.5"); kuvaputki käyttää prosentteja.
  const prosentti = (v: number | null, oletus: number) => (v == null ? oletus : Number(v) <= 1 ? Number(v) * 100 : Number(v));
  const fx = prosentti(visa.hero_focal_x, 50);
  const fy = prosentti(visa.hero_focal_y, 40);
  const kuvaUrl = visa.hero_image ?? visa.image_url;
  const oma = !!o.oma;
  const lataa = o.lataaKuvat !== false;
  const c = hlo as unknown as {
    id: string; name: string; birth_date: string | null; death_date: string | null;
    image_url: string | null; image_focal_x: number | null; image_focal_y: number | null; ig_tilit: unknown;
  } | null;
  const visanTilit = tilitListaksi(visa.ig_tilit);
  const henkilonTilit = c ? tilitListaksi(c.ig_tilit) : [];
  const [kuva, kuvaaja, hKuva, hKuvaaja] = await Promise.all([
    lataa ? lataaKuva(kuvaUrl, fx, fy) : null,
    lataa ? haeKuvaaja(kuvaUrl) : null,
    lataa && c ? lataaKuva(c.image_url, c.image_focal_x ?? 50, c.image_focal_y ?? 25) : null,
    lataa && c ? haeKuvaaja(c.image_url) : null,
  ]);
  return {
    paiva,
    quizId: visa.id,
    slug: visa.custom_slug ?? visa.slug,
    nimi: (visa.display_title ?? visa.title).trim(),
    kokoelma: kokoelmaNimi(visa),
    urheilu: onUrheilu(visa),
    henkilovisa: visa.collection === "tunnetut-henkilot",
    kysymyksia: count || 10,
    introOtsikko: o.introOtsikko?.trim() || null,
    introTeksti: o.introTeksti?.trim() || null,
    kuva,
    kuvaaja,
    henkilo: c
      ? {
          celebrityId: c.id,
          nimi: c.name.trim(),
          kuva: hKuva,
          kuvaaja: hKuvaaja,
          syntymavuosi: c.birth_date ? Number(c.birth_date.slice(0, 4)) : null,
          kuolinvuosi: c.death_date ? Number(c.death_date.slice(0, 4)) : null,
        }
      : null,
    tagit: {
      ehdotus: yhdista(henkilonTilit, visanTilit),
      kohde: c
        ? { tyyppi: "celebrity", id: c.id, nimi: c.name.trim(), tilit: henkilonTilit }
        : { tyyppi: "quiz", id: visa.id, nimi: (visa.display_title ?? visa.title).trim(), tilit: visanTilit },
    },
    oma,
    tunniste: oma ? (o.otsake?.trim() || "Visa").toLocaleUpperCase("fi-FI") : "PÄIVÄN VISA",
    kysymykset,
    fanitasot: Array.isArray(visa.fanitasot) && visa.fanitasot.length === 5 ? (visa.fanitasot as string[]) : null,
  };
}

/* ── Päivän synttärit ────────────────────────────────────────────────── */

type Sankari = {
  celebrity_id: string; name: string; role: string | null; birth_date: string | null; death_date: string | null;
  image_url: string | null; image_focal_x: number | null; image_focal_y: number | null;
  quiz_id: string | null; quiz_title: string | null; ika: number;
};

export async function haePaivanSynttarit(siteId: string, paiva: string, lataaKuvat = true): Promise<SynttariData | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb.rpc("paivan_sankari" as never, { p_site: siteId, p_date: paiva } as never);
  const rivi = ((data ?? []) as unknown as Sankari[])[0];
  if (!rivi) return null;

  let visaNimi: string | null = null;
  let visanTilit: string[] = [];
  const [kysymykset, { data: hlo }] = await Promise.all([
    rivi.quiz_id ? haeKysymykset(rivi.quiz_id) : Promise.resolve([]),
    sb.from("celebrities").select("ig_tilit").eq("id", rivi.celebrity_id).maybeSingle(),
  ]);
  const henkilonTilit = tilitListaksi((hlo as unknown as { ig_tilit: unknown } | null)?.ig_tilit);
  if (rivi.quiz_id) {
    const { data: q } = await sb.from("quizzes").select("title, display_title, ig_tilit").eq("id", rivi.quiz_id).maybeSingle();
    const v = q as unknown as { title: string; display_title: string | null; ig_tilit: unknown } | null;
    visaNimi = v ? (v.display_title ?? v.title) : rivi.quiz_title;
    visanTilit = tilitListaksi(v?.ig_tilit);
  }

  const fx = rivi.image_focal_x ?? 50;
  const fy = rivi.image_focal_y ?? 25;
  return {
    paiva,
    celebrityId: rivi.celebrity_id,
    quizId: rivi.quiz_id,
    nimi: rivi.name.trim(),
    rooli: rivi.role?.trim() || null,
    ika: rivi.ika,
    muisto: !!rivi.death_date,
    syntymavuosi: rivi.birth_date ? Number(rivi.birth_date.slice(0, 4)) : null,
    kuolinvuosi: rivi.death_date ? Number(rivi.death_date.slice(0, 4)) : null,
    kuva: lataaKuvat ? await lataaKuva(rivi.image_url, fx, fy) : null,
    kuvaaja: lataaKuvat ? await haeKuvaaja(rivi.image_url) : null,
    kysymykset,
    tagit: {
      ehdotus: yhdista(henkilonTilit, visanTilit),
      kohde: { tyyppi: "celebrity", id: rivi.celebrity_id, nimi: rivi.name.trim(), tilit: henkilonTilit },
    },
    visaNimi,
  };
}

/** Pyöreät vuodet samalla säännöllä kuin sivuston Päivän sankari (lib/paivanSankari.ts). */
export const onPyorea = (ika: number) => ika >= 40 && ika <= 100 && ika % 10 === 0;
