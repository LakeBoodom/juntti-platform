// "PELAA SEURAAVAKSI" -PILOTTI: ehdotusfunktio (palvelin). Toteutusbrief 8.11.2026 §1, säännöt §2–3.
// Pilotti 9.11.2026 (Heikki): kaikki urheilu = collection 'urheilu' ja urheilijoiden henkilövisat (celebrities.laji).
//
// Paikat ja portaat (ensimmäinen porras, joka tuottaa ehdokkaita, täyttää ensin; satunnaisuus vain portaan sisällä):
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

function peliEhdokas(p0: Pelimuoto, laji: Laji, porras: string): Ehdokas {
  const p = viikonKuvat(p0);
  return {
    tyyppi: "peli",
    id: p.slug,
    nimi: p.nimi,
    href: p.href,
    kuva: p.kuva?.src ?? null,
    sovitus: p.kuva?.contain ? "contain" : undefined,
    merkki: PELIN_MERKKI[p.ikoni] ?? "Peli",
    rivi: p.kuvaus,
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
  const visat = (await haeUrheiluvisat(sb)).filter((v) => v.id !== l.id);
  const laji = visanLaji({ ...l, henkilonLaji: l.henkilonLaji });
  const aiheet = visanAiheet(laji, l);
  const tarkat = aiheet.filter((a) => !a.laaja);
  const laajat = aiheet.filter((a) => a.laaja);
  const paikat = new Set(l.paikkakunnat ?? []);

  const lajin = visat.filter((v) => v.laji.avain === laji.avain);
  const omat = lajin.filter((v) => !v.henkilo);
  const lajinHenkilot = lajin.filter((v) => v.henkilo);
  const muut = visat.filter((v) => v.laji.avain !== laji.avain && !v.henkilo);

  const kaytetty = new Set<string>([l.id]);

  /* p1 Syvemmälle — 10 ehdokasta, joista p1 saa parittomat ja p2 parilliset, jos lajilla ei ole peliä
     ("p1:n seuraava ehdokas", brief §1.1). Tarkka aihe nimetään portaaseen raporttia varten. */
  const p1Portaat: Array<[string, Visa[]]> = [
    ["p1.aihe", omat.filter((v) => tarkat.length > 0 && jaettu(tarkat, v.aiheet))],
    ["p1.kaupunki", omat.filter((v) => (v.paikkakunnat ?? []).some((p) => paikat.has(p)))],
    ["p1.sarja", omat.filter((v) => laajat.length > 0 && jaettu(laajat, v.aiheet))],
    ["p1.laji", omat],
    /* Lajit, joilla on vain henkilövisoja (talviurheilu, yleisurheilu …): syvemmälle = saman lajin henkilöt. */
    ["p1.lajin-henkilo", omat.length ? [] : lajinHenkilot.filter((v) => tarkat.length > 0 && jaettu(tarkat, v.aiheet))],
    ["p1.lajin-henkilot", omat.length ? [] : lajinHenkilot],
    ["p1.urheilu", laji === YLEINEN ? omat : muut],
  ];

  /* p2 Toinen peli: lajin pelimuodot, aiheen peli ensin (Tappara → Järjestä: Tapparan pisteet, kun pakka julkaistaan). */
  const pelit = PELIMUODOT.filter((p) => p.tila === "pelattava" && (p.serves.includes(laji.avain) || p.serves.includes("urheilu")));
  const aiheenPeli = (p: Pelimuoto) => aiheet.some((a) => a.re.test(p.nimi));
  const pelitJarj = [...pelit.filter(aiheenPeli), ...pelit.filter((p) => !aiheenPeli(p))];

  let p1: Ehdokas[];
  let p2: Ehdokas[];
  if (pelitJarj.length) {
    p1 = keraa(p1Portaat, kaytetty, N).map(([por, v]) => visaEhdokas(v, por === "p1.aihe" ? `${por}:${aiheNimi(tarkat, v)}` : por));
    p2 = pelitJarj.slice(0, N).map((p) => peliEhdokas(p, laji, aiheenPeli(p) ? "p2.aiheen-peli" : "p2.lajin-peli"));
  } else {
    const kaikki = keraa(p1Portaat, kaytetty, N * 2).map(([por, v]) => visaEhdokas(v, por === "p1.aihe" ? `${por}:${aiheNimi(tarkat, v)}` : por));
    p1 = kaikki.filter((_, i) => i % 2 === 0);
    p2 = kaikki.filter((_, i) => i % 2 === 1).map((e) => ({ ...e, porras: `p2.ei-pelia>${e.porras}` }));
  }

  /* p3 Laajemmalle */
  /* Henkilön jälkeen saman lajin henkilö, jolla yhteinen aihe; seuran tai tapahtuman jälkeen henkilö, jonka nimessä on
     lähteen aihe (Tappara → "Patrik Laine – Tapparasta NHL:n maalintekijäksi"). Kumpikin on sama ehto: yhteinen tarkka aihe. */
  const p3Portaat: Array<[string, Visa[]]> = [
    ["p3.henkilo-aihe", lajinHenkilot.filter((v) => tarkat.length > 0 && jaettu(tarkat, v.aiheet))],
    ["p3.lajin-henkilo", lajinHenkilot],
    ["p3.laji", omat],
    ["p3.urheilu", muut],
  ];
  const p3 = keraa(p3Portaat, kaytetty, N).map(([por, v]) => visaEhdokas(v, por === "p3.henkilo-aihe" ? `${por}:${aiheNimi(tarkat, v)}` : por));

  return { pilotti: "urheilu", p1, p2, p3, lajiLinkki: laji.hub, lahde: l.slug ?? l.id };
}
