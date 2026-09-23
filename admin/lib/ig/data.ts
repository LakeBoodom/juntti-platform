// Instagram-kuvien data: Päivän visa ja Päivän synttärit tietylle päivälle.
// Samat lähteet kuin sivuston etusivulla: schedule_rules (Päivän visa + intro)
// ja paivan_sankari() (synttärit, sama valintalogiikka kuin etusivun Päivän sankari).

import sharp from "sharp";
import { getSupabaseAdmin } from "@juntti/db";
import { kokoelmaNimi, onUrheilu } from "@/lib/kokoelmat";

const SIVUSTO = "https://tietoniekka.fi";

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

/** Rajaa kuvan täsmälleen w × h -kokoon kuten CSS:n object-fit: cover +
    object-position fx% fy% ja palauttaa data-URL:n. Suurennettaessa terävöitetään kevyesti. */
export async function rajaa(k: Kuva, w: number, h: number): Promise<string> {
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
  const out = await kuva.jpeg({ quality: 90 }).toBuffer();
  return `data:image/jpeg;base64,${out.toString("base64")}`;
}

/** Kuvakaistale (1080 × 300–360): enintään 1,5× suurennos → väh. 720 px leveä. */
export const kelpaaKaistaleeksi = (k: Kuva | null) => !!k && suurennos(k, 1080, 360) <= MAX_SUURENNOS;
/** Koko pinnan kuva (V-C, S-A: 1080 × 1350): väh. 720 × 900 px. */
export const kelpaaKokoPinnaksi = (k: Kuva | null) => !!k && suurennos(k, 1080, 1350) <= MAX_SUURENNOS;

/** Toimituksen korvaava kuva tai uusi rajaus (ig_julkaisut.kentat.kuva). */
export async function korvaaKuva<T extends { kuva: Kuva | null }>(d: T, korvaava?: { url: string; fx: number; fy: number } | null): Promise<T> {
  if (!korvaava?.url) return d;
  const k = await lataaKuva(kuvaOsoite(korvaava.url), korvaava.fx, korvaava.fy);
  return k ? { ...d, kuva: k } : d;
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

/** Mikä tahansa visa annetulle päivälle — omat julkaisut ja kampanjat. */
export async function haeVisa(
  quizId: string,
  paiva: string,
  o: { introOtsikko?: string | null; introTeksti?: string | null; oma?: boolean; otsake?: string | null; lataaKuvat?: boolean } = {},
): Promise<VisaData | null> {
  const sb = getSupabaseAdmin();
  const [{ data: q }, { count }] = await Promise.all([
    sb
      .from("quizzes")
      .select("id, title, display_title, slug, custom_slug, category, collection, hero_image, image_url, hero_focal_x, hero_focal_y")
      .eq("id", quizId)
      .maybeSingle(),
    sb.from("questions").select("id", { count: "exact", head: true }).eq("quiz_id", quizId),
  ]);
  const visa = q as unknown as Visa | null;
  if (!visa) return null;

  const fx = visa.hero_focal_x ?? 50;
  const fy = visa.hero_focal_y ?? 40;
  const kuvaUrl = visa.hero_image ?? visa.image_url;
  const oma = !!o.oma;
  return {
    paiva,
    quizId: visa.id,
    slug: visa.custom_slug ?? visa.slug,
    nimi: (visa.display_title ?? visa.title).trim(),
    kokoelma: kokoelmaNimi(visa),
    urheilu: onUrheilu(visa),
    henkilovisa: visa.collection === "tunnetut-henkilot",
    kysymyksia: count ?? 10,
    introOtsikko: o.introOtsikko?.trim() || null,
    introTeksti: o.introTeksti?.trim() || null,
    kuva: o.lataaKuvat === false ? null : await lataaKuva(kuvaUrl, fx, fy),
    oma,
    tunniste: oma ? (o.otsake?.trim() || "Visa").toLocaleUpperCase("fi-FI") : "PÄIVÄN VISA",
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
  if (rivi.quiz_id) {
    const { data: q } = await sb.from("quizzes").select("title, display_title").eq("id", rivi.quiz_id).maybeSingle();
    const v = q as unknown as { title: string; display_title: string | null } | null;
    visaNimi = v ? (v.display_title ?? v.title) : rivi.quiz_title;
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
    visaNimi,
  };
}

/** Pyöreät vuodet samalla säännöllä kuin sivuston Päivän sankari (lib/paivanSankari.ts). */
export const onPyorea = (ika: number) => ika >= 40 && ika <= 100 && ika % 10 === 0;
