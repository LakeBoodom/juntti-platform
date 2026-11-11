// "PELAA SEURAAVAKSI" -PILOTTI: ehdotusfunktio (palvelin). Toteutusbrief 8.11.2026 §1, säännöt §2–3.
// Pilotti 9.11.2026 (Heikki): kaikki urheilu = collection 'urheilu' ja urheilijoiden henkilövisat (celebrities.laji).
//
// Henkilövisan jälkeen (Heikki 11.11.2026): 1 = toinen henkilövisa (aihevisat varalla), 2 = peli, 3 = jotain muuta (päivän peli / viikon suosituin).
// Seuran ja tapahtuman jälkeen ennallaan. Paikat ja portaat (ensimmäinen porras, joka tuottaa ehdokkaita, täyttää ensin; satunnaisuus vain portaan sisällä):
//   p1 Syvemmälle (visa): saman lajin ei-henkilövisa, jolla yhteinen tarkka aihe → saman kaupungin lajin visa →
//      yhteinen laaja aihe (sarja) → mikä tahansa lajin ei-henkilövisa → lajin henkilövisat → muu urheiluvisa.
//   p2 Toinen peli (peli): lajin pelimuodot (PELIMUODOT.serves), yhteinen aihe ensin. Jos lajilla ei ole peliä,
//      paikka täytetään p1:n seuraavilla ehdokkailla (säännöt §2.4), ei yleisellä pelimuodolla.
//   p3 Laajemmalle (visa): henkilön jälkeen saman lajin henkilö, jolla yhteinen aihe → muu lajin henkilö;
//      seuran/tapahtuman jälkeen henkilö, jonka nimessä on lähteen aihe → lajin henkilö; sitten lajin muut visat.
// Lasten visat ja megavisat pois kuten lib/related.ts:ssä. Lähdevisa ei koskaan ehdokkaana.
import type { SupabaseClient } from "@supabase/supabase-js";
import { visaHref } from "@/lib/visaHref";
import { visanKorttikuva } from "@/lib/kokoelmat/visanKorttikuva";
import { henkiloKuva } from "@/lib/henkilokuvat";
import { PELIMUODOT, viikonKuvat, type Pelimuoto } from "@/lib/pelimuodot";
import { helsinginPaiva } from "@/lib/aika";
import { SITE_SLUG } from "@/lib/supabase";
import { muotoileSankari, type SankariRivi } from "@/lib/paivanSankari";
import { MM_JULKAISU, MM_NIMI, MM_SIVU } from "@/lib/vihjepeli/mikamaa";
import { URHEILULAJIT, YLEINEN, lajiAvaimella, visanAiheet, visanLaji, type Aihe, type Laji } from "./urheilu";
import type { Ehdokas, Seuraavat } from "./tyypit";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Sb = SupabaseClient<any, any, any>;

const N = 5;
const SEL = "id, slug, custom_slug, title, display_title, collection, category, genre, subcollection, paikkakunnat, hero_image, hero_focal_x, hero_focal_y, game_mode, target_age";

type Rivi = {
  id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null;
  collection: string | null; category: string | null; genre: string | null; subcollection: string | null;
  paikkakunnat: string[] | null; hero_image: string | null; hero_focal_x: number | null; hero_focal_y: number | null;
  game_mode: string | null; target_age: string | null;
};
type Visa = Rivi & { laji: Laji; aiheet: Aihe[]; henkilo: { kuva: string | null } | null };

export type Lahde = {
  id: string; slug: string | null; title: string; display_title: string | null;
  collection: string | null; category: string | null; genre: string | null; subcollection: string | null;
  paikkakunnat: string[] | null;
  /** Henkilövisan celebrities.laji. */
  henkilonLaji: string | null;
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

/** Urheilun visat: kokoelma 'urheilu' + urheilijoiden henkilövisat. Noin 250 riviä kahdella haulla. */
async function haeUrheiluvisat(sb: Sb): Promise<Visa[]> {
  const [{ data: omat }, { data: hlot }] = await Promise.all([
    sb.from("quiz_cards" as never).select(SEL).eq("collection", "urheilu").limit(600),
    sb.from("celebrities").select("trivia_quiz_id, laji, image_url").in("laji", [...URHEILULAJIT]).not("trivia_quiz_id", "is", null).limit(600),
  ]);
  const henkilot = new Map(((hlot ?? []) as Array<{ trivia_quiz_id: string; laji: string; image_url: string | null }>).map((h) => [h.trivia_quiz_id, h]));
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
    visat.push({ ...r, laji, aiheet: visanAiheet(laji, r), henkilo: { kuva: henkiloKuva(h.image_url) } });
  }
  return visat;
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
   "Tupla tai kuitti: SM-liiga"). Laita järjestykseen -pakan merkki on "Järjestä", nimi pakan aihe. Ei kuvausriviä (sääntö 9). */
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

/* ── "Jotain muuta" (Heikki 11.11.: henkilövisan paikka 3, aiheesta riippumaton) ──────────────────────────────────
   Portaat: 1) päivän peli, jota ei ole pelattu tänään: Mikä maa → Päivän visa → Päivän sankari; 2) sivuston pelatuin visa
   7 päivän ajalta, jota pelaaja ei ole pelannut (RPC suosituimmat_visat_7pv; ennen migraatiota quiz_cards.suosio_90pv).
   Pelattu tänään -tieto on selaimessa (Ehdokas.pelattu), joten palvelin antaa kaikki ja selain valitsee. */
type KorttiRivi = Rivi & { suosio_90pv?: number | null };

async function jotainMuuta(sb: Sb, kaytetty: Set<string>): Promise<Ehdokas[]> {
  const tanaan = helsinginPaiva().iso;
  const { data: site } = await sb.from("sites").select("id").eq("slug", SITE_SLUG).maybeSingle();
  const siteId = (site as { id: string } | null)?.id ?? null;
  const [pvRes, sRes, suosRes] = await Promise.all([
    siteId ? sb.rpc("paivan_visa_tanaan" as never, { p_site: siteId } as never) : Promise.resolve({ data: null }),
    siteId ? sb.rpc("paivan_sankari" as never, { p_site: siteId, p_date: tanaan } as never) : Promise.resolve({ data: null }),
    sb.rpc("suosituimmat_visat_7pv" as never, { p_n: 15 } as never),
  ]);
  const pvId = ((pvRes.data ?? []) as Array<{ quiz_id: string }>)[0]?.quiz_id ?? null;
  const sankariRivi = ((sRes.data ?? []) as SankariRivi[])[0] ?? null;
  const suosRpc = suosRes.error ? null : ((suosRes.data ?? []) as Array<{ quiz_id: string }>).map((r) => r.quiz_id);

  const idt = [...new Set([pvId, ...(suosRpc ?? [])].filter((x): x is string => !!x))];
  const [{ data: rivit }, { data: varalla }] = await Promise.all([
    idt.length ? sb.from("quiz_cards" as never).select(SEL).in("id", idt) : Promise.resolve({ data: [] }),
    /* Ennen migraatiota (tai jos RPC ei vastaa): 90 päivän suosio. */
    suosRpc ? Promise.resolve({ data: [] }) : sb.from("quiz_cards" as never).select(`${SEL}, suosio_90pv`).order("suosio_90pv", { ascending: false }).limit(20),
  ]);
  const kortit = new Map(((rivit ?? []) as KorttiRivi[]).map((r) => [r.id, r]));
  const ulos: Ehdokas[] = [];
  const lisaa = (e: Ehdokas) => {
    if (kaytetty.has(e.id)) return;
    kaytetty.add(e.id);
    ulos.push(e);
  };

  if (tanaan >= MM_JULKAISU) {
    lisaa({
      tyyppi: "peli", id: "mika-maa", nimi: MM_NIMI, href: MM_SIVU, kuva: "/20/mika-maa/tunnus.webp", kuvaPos: "50% 50%",
      merkki: "Päivän peli", kuvaton: "Päivän peli", porras: "p3.paivan-peli:mika-maa", pelattu: { tapa: "mika-maa" },
    });
  }
  const pv = pvId ? kortit.get(pvId) : null;
  if (pv && kelpaa(pv)) {
    const k = visanKorttikuva(pv);
    lisaa({
      tyyppi: "visa", id: pv.id, nimi: pv.display_title ?? pv.title, href: `${visaHref(pv)}${pv.slug ? "?" : "&"}paivan_visa=1`,
      kuva: k.kuva, kuvaPos: k.kuvaPos, merkki: "Päivän peli", kuvaton: "Päivän visa", porras: "p3.paivan-peli:paivan-visa",
      pelattu: { tapa: "paivan-visa" },
    });
  }
  if (sankariRivi) {
    const s = muotoileSankari(sankariRivi);
    lisaa({
      tyyppi: "visa", id: s.quizId, nimi: sankariRivi.quiz_title, href: s.playHref, kuva: s.kuva, kuvaPos: s.kuvaPos,
      merkki: "Päivän peli", kuvaton: "Synttärit", porras: "p3.paivan-peli:sankari", pelattu: { tapa: "tanaan" },
    });
  }
  const suositut: KorttiRivi[] = suosRpc
    ? suosRpc.map((id) => kortit.get(id)).filter((r): r is KorttiRivi => !!r)
    : ((varalla ?? []) as KorttiRivi[]);
  for (const r of suositut.filter(kelpaa)) {
    if (ulos.length >= 3 + N) break;
    const k = visanKorttikuva(r);
    lisaa({
      tyyppi: "visa", id: r.id, nimi: r.display_title ?? r.title, href: visaHref(r), kuva: k.kuva, kuvaPos: k.kuvaPos,
      merkki: "Suosittu", kuvaton: "Suosittu", porras: suosRpc ? "p3.suosituin-7pv" : "p3.suosituin-90pv",
    });
  }
  return ulos;
}

export async function haeSeuraavat(sb: Sb, l: Lahde): Promise<Seuraavat | null> {
  if (onPilotissa(l) !== "urheilu") return null;
  const visat = (await haeUrheiluvisat(sb)).filter((v) => v.id !== l.id);
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

  const kaytetty = new Set<string>([l.id]);
  const nimea = (por: string, v: Visa) => (por.endsWith(".aihe") || por.endsWith("henkilo-aihe") ? `${por}:${aiheNimi(tarkat, v)}` : por);

  /* Aihevisat (seura, NHL, Leijonat …): seuran/tapahtuman jälkeen paikka 1, henkilön jälkeen paikan 1 varaehdokkaat. */
  const aihePortaat: Array<[string, Visa[]]> = [
    ["p1.aihe", omat.filter((v) => tarkat.length > 0 && jaettu(tarkat, v.aiheet))],
    ["p1.kaupunki", omat.filter((v) => (v.paikkakunnat ?? []).some((p) => paikat.has(p)))],
    ["p1.sarja", omat.filter((v) => laajat.length > 0 && jaettu(laajat, v.aiheet))],
    ["p1.laji", omat],
    /* Lajit, joilla on vain henkilövisoja (talviurheilu, yleisurheilu …): syvemmälle = saman lajin henkilöt. */
    ["p1.lajin-henkilo", omat.length ? [] : lajinHenkilot.filter((v) => tarkat.length > 0 && jaettu(tarkat, v.aiheet))],
    ["p1.lajin-henkilot", omat.length ? [] : lajinHenkilot],
    ["p1.urheilu", laji === YLEINEN ? omat : muut],
  ];
  /* Henkilöt: saman lajin henkilö, jolla yhteinen aihe → muu lajin henkilö. */
  const henkiloPortaat = (etu: string): Array<[string, Visa[]]> => [
    [`${etu}.henkilo-aihe`, lajinHenkilot.filter((v) => tarkat.length > 0 && jaettu(tarkat, v.aiheet))],
    [`${etu}.lajin-henkilo`, lajinHenkilot],
  ];

  /* p2 Toinen peli: lajin pelimuodot, aiheen peli ensin (Tappara → Järjestä: Tapparan pisteet, kun pakka julkaistaan). */
  const pelit = PELIMUODOT.filter((p) => p.tila === "pelattava" && (p.serves.includes(laji.avain) || p.serves.includes("urheilu")));
  const aiheenPeli = (p: Pelimuoto) => aiheet.some((a) => a.re.test(p.nimi));
  const pelitJarj = [...pelit.filter(aiheenPeli), ...pelit.filter((p) => !aiheenPeli(p))];
  const peliEhdokkaat = pelitJarj.slice(0, N).map((p) => peliEhdokas(p, laji, aiheenPeli(p) ? "p2.aiheen-peli" : "p2.lajin-peli"));

  if (henkilo) {
    /* Henkilövisan jälkeen (Heikki 11.11.): 1 = toinen henkilövisa, 2 = saman aiheen peli, 3 = jotain muuta. */
    const p1Hlot = keraa(henkiloPortaat("p1"), kaytetty, 4).map(([por, v]) => visaEhdokas(v, nimea(por, v)));
    const vara = keraa(aihePortaat, kaytetty, pelitJarj.length ? 3 : N + 3).map(([por, v]) => visaEhdokas(v, nimea(`vara>${por}`, v)));
    let p1: Ehdokas[];
    let p2: Ehdokas[];
    if (pelitJarj.length) {
      p1 = [...p1Hlot, ...vara];
      p2 = peliEhdokkaat;
    } else {
      p1 = [...p1Hlot, ...vara.filter((_, i) => i % 2 === 1)];
      p2 = vara.filter((_, i) => i % 2 === 0).map((e) => ({ ...e, porras: `p2.ei-pelia>${e.porras.replace(/^vara>/, "")}` }));
    }
    const p3 = await jotainMuuta(sb, kaytetty).catch(() => [] as Ehdokas[]);
    return { pilotti: "urheilu", p1, p2, p3, lajiLinkki: laji.hub, lahde: l.slug ?? l.id };
  }

  /* Seura-, sarja- ja tapahtumavisat: 1 = aihevisa, 2 = peli (tai p1:n seuraava ehdokas), 3 = henkilö. */
  let p1: Ehdokas[];
  let p2: Ehdokas[];
  if (pelitJarj.length) {
    p1 = keraa(aihePortaat, kaytetty, N).map(([por, v]) => visaEhdokas(v, nimea(por, v)));
    p2 = peliEhdokkaat;
  } else {
    const kaikki = keraa(aihePortaat, kaytetty, N * 2).map(([por, v]) => visaEhdokas(v, nimea(por, v)));
    p1 = kaikki.filter((_, i) => i % 2 === 0);
    p2 = kaikki.filter((_, i) => i % 2 === 1).map((e) => ({ ...e, porras: `p2.ei-pelia>${e.porras}` }));
  }
  /* Henkilö, jonka nimessä on lähteen aihe (Tappara → "Patrik Laine – Tapparasta NHL:n maalintekijäksi"). */
  const p3 = keraa([...henkiloPortaat("p3"), ["p3.laji", omat], ["p3.urheilu", muut]], kaytetty, N).map(([por, v]) => visaEhdokas(v, nimea(por, v)));
  return { pilotti: "urheilu", p1, p2, p3, lajiLinkki: laji.hub, lahde: l.slug ?? l.id };
}
