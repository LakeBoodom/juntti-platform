// "PELAA SEURAAVAKSI" -PILOTTI: ehdotusfunktio (palvelin). Toteutusbrief 8.11.2026 §1, säännöt §2–3.
// Pilotti 9.11.2026 (Heikki): kaikki urheilu = collection 'urheilu' ja urheilijoiden henkilövisat (celebrities.laji).
//
// Paikat (Heikki 11.11.2026, kierros 3):
//   p1 Lähin sama: henkilövisan jälkeen saman lajin toinen henkilö syntymävuoden läheisyyden mukaan, tasatilanteessa
//      pelatuin 30 päivän ajalta (ei arvontaa; varalla aihevisat). Seura- ja tapahtumavisan jälkeen saman lajin toinen visa:
//      yhteinen tarkka aihe → saman kaupungin lajin visa → yhteinen sarja → mikä tahansa lajin visa → muu urheiluvisa.
//   p2 Sama aihe, toinen pelimuoto: lajin pelimuodot (PELIMUODOT.serves), aiheen peli ensin. Jos pelimuotoa ei ole, saman
//      aiheen visa, joka on eri tyyppiä kuin paikan 1 ehdotus (henkilön jälkeen seura-/tapahtumavisa, seuran jälkeen henkilö).
//   p3 Tänään: lib/seuraavaksi/tanaan.ts (portaat a–e). Päivän visa ja sankari varataan paikalle 3 ennen paikkoja 1–2.
// Lasten visat ja megavisat pois kuten lib/related.ts:ssä. Lähdevisa ei koskaan ehdokkaana.
import type { SupabaseClient } from "@supabase/supabase-js";
import { visaHref } from "@/lib/visaHref";
import { visanKorttikuva } from "@/lib/kokoelmat/visanKorttikuva";
import { henkiloKuva } from "@/lib/henkilokuvat";
import { PELIMUODOT, viikonKuvat, type Pelimuoto } from "@/lib/pelimuodot";
import { helsinginPaiva } from "@/lib/aika";
import { URHEILULAJIT, YLEINEN, lajiAvaimella, visanAiheet, visanLaji, type Aihe, type Laji } from "./urheilu";
import { pelinRivi } from "./pelirivit";
import { haePaiva, tanaanEhdokkaat } from "./tanaan";
import type { Ehdokas, Seuraavat } from "./tyypit";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Sb = SupabaseClient<any, any, any>;

const N = 5;
const SEL = "id, slug, custom_slug, title, display_title, collection, category, genre, subcollection, paikkakunnat, hero_image, hero_focal_x, hero_focal_y, game_mode, target_age, suosio_90pv";

type Rivi = {
  id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null;
  collection: string | null; category: string | null; genre: string | null; subcollection: string | null;
  paikkakunnat: string[] | null; hero_image: string | null; hero_focal_x: number | null; hero_focal_y: number | null;
  game_mode: string | null; target_age: string | null; suosio_90pv: number | null;
};
type Henkilo = { kuva: string | null; syntyi: number | null; nimi: string };
type Visa = Rivi & { laji: Laji; aiheet: Aihe[]; henkilo: Henkilo | null };

export type Lahde = {
  id: string; slug: string | null; title: string; display_title: string | null;
  collection: string | null; category: string | null; genre: string | null; subcollection: string | null;
  paikkakunnat: string[] | null;
  /** Henkilövisan celebrities.laji. */
  henkilonLaji: string | null;
  /** Vain esikatselu ja paikallinen kehitys (?sk_pvm=2026-11-13): paikan 3 päivä. Tuotannossa aina null. */
  testipaiva?: string | null;
};

/** Pilotin rajaus (brief §0): ainoa paikka, joka päättää, kuuluuko visa pilottiin. Laajennus = yksi ehto lisää. */
export function onPilotissa(l: Pick<Lahde, "collection" | "henkilonLaji">): "urheilu" | null {
  if (l.collection === "urheilu") return "urheilu";
  if (l.collection === "tunnetut-henkilot" && l.henkilonLaji && URHEILULAJIT.has(l.henkilonLaji)) return "urheilu";
  return null;
}

function sekoita<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

const kelpaa = (r: Rivi) => r.game_mode !== "mega" && r.target_age !== "4-7" && r.target_age !== "8-12";

/** Urheilun visat: kokoelma 'urheilu' + urheilijoiden henkilövisat (lähde mukana; suodatetaan kutsujassa). */
async function haeUrheiluvisat(sb: Sb): Promise<Visa[]> {
  const [{ data: omat }, { data: hlot }] = await Promise.all([
    sb.from("quiz_cards" as never).select(SEL).eq("collection", "urheilu").limit(600),
    sb.from("celebrities").select("trivia_quiz_id, laji, image_url, birth_date, name").in("laji", [...URHEILULAJIT]).not("trivia_quiz_id", "is", null).limit(600),
  ]);
  type H = { trivia_quiz_id: string; laji: string; image_url: string | null; birth_date: string | null; name: string };
  const henkilot = new Map(((hlot ?? []) as H[]).map((h) => [h.trivia_quiz_id, h]));
  const { data: hRivit } = henkilot.size
    ? await sb.from("quiz_cards" as never).select(SEL).in("id", [...henkilot.keys()])
    : { data: [] };
  const visat: Visa[] = [];
  for (const r of ((omat ?? []) as Rivi[]).filter(kelpaa)) {
    const laji = visanLaji(r);
    visat.push({ ...r, laji, aiheet: visanAiheet(laji, r), henkilo: null });
  }
  for (const r of ((hRivit ?? []) as Rivi[]).filter(kelpaa)) {
    const h = henkilot.get(r.id)!;
    const laji = lajiAvaimella(h.laji);
    const syntyi = h.birth_date ? Number(h.birth_date.slice(0, 4)) : null;
    visat.push({ ...r, laji, aiheet: visanAiheet(laji, r), henkilo: { kuva: henkiloKuva(h.image_url), syntyi: Number.isFinite(syntyi) ? syntyi : null, nimi: h.name } });
  }
  return visat;
}

/** Pelikerrat 30 päivän ajalta (RPC visojen_pelit_30pv); ennen migraatiota 90 päivän suosio (quiz_cards.suosio_90pv). */
async function pelikerrat(sb: Sb, visat: Visa[]): Promise<{ kerrat: Map<string, number>; lahde: "30pv" | "90pv" }> {
  const { data, error } = visat.length
    ? await sb.rpc("visojen_pelit_30pv" as never, { p_ids: visat.map((v) => v.id) } as never)
    : { data: [], error: null };
  if (!error) return { kerrat: new Map(((data ?? []) as Array<{ quiz_id: string; pelit: number }>).map((r) => [r.quiz_id, Number(r.pelit)])), lahde: "30pv" };
  return { kerrat: new Map(visat.map((v) => [v.id, v.suosio_90pv ?? 0])), lahde: "90pv" };
}

function visaEhdokas(v: Visa, porras: string): Ehdokas {
  const kuva = v.henkilo ? { kuva: v.henkilo.kuva, kuvaPos: "50% 22%" } : visanKorttikuva(v);
  return {
    tyyppi: "visa",
    id: v.id,
    nimi: v.display_title ?? v.title,
    href: visaHref(v),
    kuva: kuva.kuva,
    kuvaPos: kuva.kuvaPos,
    merkki: "Tietovisa",
    kuvaton: v.laji.nimi,
    porras,
  };
}

const PELIN_MERKKI: Record<Pelimuoto["ikoni"], string> = {
  tupla: "Tupla tai kuitti", jarjestys: "Järjestä", ika: "Järjestä", ketju: "Karttapeli", kartta: "Karttapeli",
  kuva: "Kuvavisa", aani: "Äänivisa", kumpi: "Kumpi?",
};

/* Pelikortin nimi (Heikki 11.11.): kun lajimerkki on pelin nimi, kortissa on pelkkä variantti ("SM-liiga", ei
   "Tupla tai kuitti: SM-liiga"). Kuvausrivi kierroksella 3: mitä pelissä tehdään (lib/seuraavaksi/pelirivit.ts). */
const ETULIITE = /^(Tupla tai kuitti|Laita järjestykseen|Järjestä):\s*/;

function peliEhdokas(p0: Pelimuoto, laji: Laji, porras: string): Ehdokas {
  const p = viikonKuvat(p0);
  const merkki = PELIN_MERKKI[p.ikoni] ?? "Peli";
  return {
    tyyppi: "peli",
    id: p.slug,
    nimi: ETULIITE.test(p.nimi) && (p.ikoni === "tupla" || p.ikoni === "jarjestys") ? p.nimi.replace(ETULIITE, "") : p.nimi,
    href: p.href,
    kuva: p.kuva?.src ?? null,
    sovitus: p.kuva?.contain ? "contain" : undefined,
    merkki,
    rivi: pelinRivi(p),
    kuvaton: laji.nimi,
    porras,
  };
}

/** Kerää portaittain: jokainen porras sekoitetaan, jo käytetyt ohitetaan, kunnes n täynnä. */
function keraa<T extends { id: string }>(portaat: Array<[string, T[]]>, kaytetty: Set<string>, n: number): Array<[string, T]> {
  const ulos: Array<[string, T]> = [];
  for (const [nimi, joukko] of portaat) {
    for (const v of sekoita(joukko)) {
      if (ulos.length >= n) return ulos;
      if (kaytetty.has(v.id)) continue;
      kaytetty.add(v.id);
      ulos.push([nimi, v]);
    }
  }
  return ulos;
}

const jaettu = (a: Aihe[], b: Aihe[]) => a.some((x) => b.some((y) => y.avain === x.avain));
const aiheNimi = (lahde: Aihe[], v: Visa) => lahde.find((a) => v.aiheet.some((b) => b.avain === a.avain))?.avain ?? "";

export async function haeSeuraavat(sb: Sb, l: Lahde): Promise<Seuraavat | null> {
  if (onPilotissa(l) !== "urheilu") return null;
  const iso = l.testipaiva ?? helsinginPaiva().iso;
  const [kaikkiVisat, paiva] = await Promise.all([haeUrheiluvisat(sb), haePaiva(sb, iso, !!l.testipaiva)]);
  const lahdeVisa = kaikkiVisat.find((v) => v.id === l.id) ?? null;
  const visat = kaikkiVisat.filter((v) => v.id !== l.id);
  const laji = visanLaji({ ...l, henkilonLaji: l.henkilonLaji });
  const aiheet = visanAiheet(laji, l);
  const tarkat = aiheet.filter((a) => !a.laaja);
  const laajat = aiheet.filter((a) => a.laaja);
  const paikat = new Set(l.paikkakunnat ?? []);
  const henkilo = !!l.henkilonLaji;

  const lajin = visat.filter((v) => v.laji.avain === laji.avain);
  const omat = lajin.filter((v) => !v.henkilo);
  const lajinHenkilot = lajin.filter((v) => v.henkilo);
  const muut = visat.filter((v) => v.laji.avain !== laji.avain && !v.henkilo);

  /* Päivän visa ja sankari kuuluvat paikalle 3 (Tänään): varataan ennen paikkoja 1–2. */
  const varatut = new Set([paiva.paivanVisa?.id, paiva.sankari?.quiz_id].filter((x): x is string => !!x && x !== l.id));
  const kaytetty = new Set<string>([l.id, ...varatut]);
  const nimea = (por: string, v: Visa) => (/\.(aihe|henkilo-aihe)$/.test(por) ? `${por}:${aiheNimi(tarkat, v)}` : por);

  /* Saman lajin muut kuin henkilövisat (seura, NHL, Leijonat, tapahtumat). */
  const aihePortaat = (etu: string): Array<[string, Visa[]]> => [
    [`${etu}.aihe`, omat.filter((v) => tarkat.length > 0 && jaettu(tarkat, v.aiheet))],
    [`${etu}.kaupunki`, omat.filter((v) => (v.paikkakunnat ?? []).some((p) => paikat.has(p)))],
    [`${etu}.sarja`, omat.filter((v) => laajat.length > 0 && jaettu(laajat, v.aiheet))],
    [`${etu}.laji`, omat],
    [`${etu}.urheilu`, laji === YLEINEN ? omat : muut],
  ];
  /* Henkilöt satunnaisessa järjestyksessä portaan sisällä (seura- ja tapahtumavisan p2 ilman peliä). */
  const henkiloPortaat = (etu: string): Array<[string, Visa[]]> => [
    [`${etu}.henkilo-aihe`, lajinHenkilot.filter((v) => tarkat.length > 0 && jaettu(tarkat, v.aiheet))],
    [`${etu}.lajin-henkilo`, lajinHenkilot],
  ];

  /* p2: lajin pelimuodot, aiheen peli ensin (Tappara → Järjestä: Tapparan pisteet, kun pakka julkaistaan). */
  const pelit = PELIMUODOT.filter((p) => p.tila === "pelattava" && (p.serves.includes(laji.avain) || p.serves.includes("urheilu")));
  const aiheenPeli = (p: Pelimuoto) => aiheet.some((a) => a.re.test(p.nimi));
  const pelitJarj = [...pelit.filter(aiheenPeli), ...pelit.filter((p) => !aiheenPeli(p))];
  const peliEhdokkaat = pelitJarj.slice(0, N).map((p) => peliEhdokas(p, laji, aiheenPeli(p) ? "p2.aiheen-peli" : "p2.lajin-peli"));

  let p1: Ehdokas[];
  let p2: Ehdokas[];
  if (henkilo) {
    /* p1: saman lajin henkilöt syntymävuoden läheisyyden mukaan, tasatilanteessa pelatuin 30 pv, sitten nimi. Ei arvontaa. */
    const syntyi = lahdeVisa?.henkilo?.syntyi ?? null;
    const { kerrat, lahde: kertaLahde } = await pelikerrat(sb, lajinHenkilot);
    const ero = (v: Visa) => (syntyi != null && v.henkilo?.syntyi != null ? Math.abs(v.henkilo.syntyi - syntyi) : 999);
    const jarj = lajinHenkilot.filter((v) => !kaytetty.has(v.id)).sort((a, b) =>
      ero(a) - ero(b) || (kerrat.get(b.id) ?? 0) - (kerrat.get(a.id) ?? 0) || (a.henkilo!.nimi).localeCompare(b.henkilo!.nimi, "fi"));
    const p1Hlot = jarj.slice(0, 8).map((v) => {
      kaytetty.add(v.id);
      return visaEhdokas(v, syntyi != null && v.henkilo?.syntyi != null ? `p1.henkilo-ika:${v.henkilo.syntyi}` : `p1.henkilo-${kertaLahde}`);
    });
    /* p2: peli; ilman peliä saman aiheen seura- tai tapahtumavisa (eri tyyppiä kuin paikan 1 henkilö). */
    p2 = pelitJarj.length ? peliEhdokkaat : keraa(aihePortaat("p2"), kaytetty, N).map(([por, v]) => visaEhdokas(v, nimea(por, v)));
    const vara = keraa(aihePortaat("vara>p1"), kaytetty, 3).map(([por, v]) => visaEhdokas(v, nimea(por, v)));
    p1 = [...p1Hlot, ...vara];
  } else {
    /* Seura-, sarja- ja tapahtumavisa: p1 saman lajin toinen visa; p2 peli, ilman peliä saman aiheen henkilö. */
    p1 = keraa(aihePortaat("p1"), kaytetty, N).map(([por, v]) => visaEhdokas(v, nimea(por, v)));
    p2 = pelitJarj.length ? peliEhdokkaat : keraa(henkiloPortaat("p2"), kaytetty, N).map(([por, v]) => visaEhdokas(v, nimea(por, v)));
  }

  /* p3 Tänään: liittyy lähteeseen = urheiluvisa samasta lajista (ei yleinen urheilu) tai yhteinen aihe. */
  const urheilu = new Map(visat.map((v) => [v.id, v]));
  const liittyy = (id: string) => {
    const v = urheilu.get(id);
    if (!v) return false;
    return (laji !== YLEINEN && v.laji.avain === laji.avain) || (aiheet.length > 0 && jaettu(aiheet, v.aiheet));
  };
  const p3Kaytetty = new Set([...kaytetty].filter((id) => !varatut.has(id)));
  const p3 = await tanaanEhdokkaat(sb, paiva, { liittyy }, p3Kaytetty, N).catch(() => [] as Ehdokas[]);
  return { pilotti: "urheilu", p1, p2, p3, lajiLinkki: laji.hub, lahde: l.slug ?? l.id };
}
