// ETUSIVU v5 — data (brief "Etusivun uusi rakenne", hyväksytty 28.10.2026; design Tietoniekka_Etusivu_v5).
// Jokainen osio renderöityy configista tai kannasta: ei kovakoodattuja päivämääriä, laskureita eikä visojen nimiä.
// Osiot: 1 Päivän pelit · 2 Tiesitkö? · 3 Pelaa aiheittain · 4 Valitse peli · 5 Promo 1 · 6 Laura ja Mikko ·
// 7 Promo 2 · 8 Lapsille · 9 Visapaketit.
import { getSupabase, SITE_SLUG } from "@/lib/supabase";
import { helsinginPaiva } from "@/lib/aika";
import { visaHref } from "@/lib/visaHref";
import { getPaivanVisaKortti } from "@/lib/paivanVisaKortti";
import { muotoileSankari, type SankariRivi } from "@/lib/paivanSankari";
import { getSiteStats } from "@/lib/siteStats";
import { KOKOELMA_KORTIT } from "@/lib/kokoelmat/rekisteri";
import { visanKorttikuva } from "@/lib/kokoelmat/visanKorttikuva";
import { ETUSIVU_RYHMAT, ETUSIVUN_PELIMUODOT, nakyyEtusivulla, ryhmanNimi } from "@/lib/pelimuodot";
import { JUONTAJIEN_SUOSITUKSET, PROMO2_OOTKO, VISAPAKETIT } from "@/lib/etusivu";
import { JUHLAT_KOKOELMA, pvm, juhlaKalenteri, paavisa, paiviaValissa, vpLyhyt, type Esiintyma } from "@/lib/juhlat";
import { LAPSET_SIVU, lapsetNakyvissa } from "@/lib/lapset/data";
import { COLLECTION_LABEL } from "@/lib/visanKokoelma";

const VIIKONPAIVAT = ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"];
const VP_LYHYT = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];
/** Promo 1: countdown-tila, kun seuraavaan juhlaan on enintään tämän verran päiviä. */
const COUNTDOWN_PAIVAA = 14;
/** Luonnoskoukut (Koukku.luonnos) näkyvät vain esikatselussa, kunnes Heikki hyväksyy ne (etusivu v7, 30.10.2026). */
const TUOTANTO = process.env.VERCEL_ENV === "production";
/** Aihetiilien 16:10-rajaus (CD etusivu v7 1h, 30.10.2026). Puuttuva → rekisterin pos tai keskitetty. */
const AIHE_POS: Record<string, string> = {
  elokuvat: "50% 40%", historia: "50% 55%", jalkapallo: "50% 40%", juhlat: "55% 50%", jaakiekko: "50% 35%",
  kulttuuri: "50% 40%", luonto: "50% 50%", matkakohteet: "50% 50%", musiikki: "78% 28%", kaupungit: "50% 50%",
  tiede: "50% 50%", "tunnetut-henkilot": "50% 28%", tv: "50% 35%", urheilu: "50% 50%", vaalit: "50% 40%",
};

type Kortti = {
  id: string; slug: string | null; custom_slug: string | null; title: string; display_title: string | null;
  collection: string | null; play_count: number | null; published_at: string | null; game_mode?: string | null;
  teaser?: string | null; description?: string | null; hero_image?: string | null; hero_focal_x?: number | null; hero_focal_y?: number | null;
};

export type EtusivuData = Awaited<ReturnType<typeof haeEtusivu>>;

const nimi = (k: Kortti) => k.display_title ?? k.title;
const kokoelmaNimi = (c: string | null) => (c ? KOKOELMA_KORTIT.find((k) => k.slug === c)?.nimi ?? COLLECTION_LABEL[c] ?? null : null);
/** Tiesitkö?-korostukseen kelpaamattomat sanat. */
const HEIKOT = new Set(["mukaan", "aikana", "lisäksi", "jälkeen", "kanssa", "mikä", "mitä", "miksi", "missä", "mistä", "millä", "sitä", "siitä"]);
/** Juontajan sitaatti (Heikki 28.10.): teaserin tai kuvauksen ensimmäinen virke, enintään SITAATTI_MAX merkkiä. */
const SITAATTI_MAX = 110;
function sitaatti(k: Kortti): string | null {
  const lahde = (k.teaser?.trim() || k.description?.trim() || "").replace(/\s+/g, " ");
  if (!lahde) return null;
  const virke = lahde.split(/(?<=[.!?…])\s+(?=[A-ZÅÄÖ0-9"”«])/u)[0].trim();
  if (virke.length <= SITAATTI_MAX) return virke;
  const katkaistu = virke.slice(0, SITAATTI_MAX - 1);
  return `${katkaistu.slice(0, katkaistu.lastIndexOf(" ")).replace(/[,;:–-]+$/, "")}…`;
}
/** Deterministinen valinta siemenestä (sama kaikille samana päivänä/viikkona). */
const poimi = <T,>(lista: T[], n: number): T | null => (lista.length ? lista[((n % lista.length) + lista.length) % lista.length] : null);

export async function haeEtusivu(opts: {
  sankariPaiva?: string | null;
  pvMalli?: { headline: string | null; text: string | null } | null;
  /** Esikatselu: uuden Päivän visan kentät (nro, Tänään-chip, rytmirivi) mallidatalla. */
  pvUusi?: boolean;
} = {}) {
  const sb = getSupabase();
  if (!sb) return null;
  const today = helsinginPaiva();
  const paivaNro = Math.floor(Date.UTC(today.vuosi, today.kk - 1, today.pv) / 864e5);
  const viikkoNro = Math.floor((paivaNro + 3) / 7); // maanantaista alkava viikko
  const vp = new Date(Date.UTC(today.vuosi, today.kk - 1, today.pv)).getUTCDay();

  const [cardsRes, siteRes, stats] = await Promise.all([
    sb.from("quiz_cards" as never).select("*"),
    sb.from("sites").select("id").eq("slug", SITE_SLUG).maybeSingle(),
    getSiteStats(),
  ]);
  const cards = (cardsRes.data ?? []) as unknown as Kortti[];
  const siteId = (siteRes.data as { id: string } | null)?.id ?? null;

  /* ── 1 Päivän pelit ── Linjaus (Heikki 29.10.): tähän osioon ei koskaan Tulossa-kortteja, vain pelattavat päiväpelit.
     Tulossa-sääntö koskee vain Valitse peli -osiota (4). */
  type PvRivi = { quiz_id: string; intro_headline: string | null; intro_text: string | null };
  let pv: PvRivi | null = null;
  let sankariRivi: SankariRivi | null = null;
  if (siteId) {
    const [pvRes, sRes] = await Promise.all([
      sb.rpc("paivan_visa_tanaan" as never, { p_site: siteId } as never),
      sb.rpc("paivan_sankari" as never, { p_site: siteId, p_date: opts.sankariPaiva ?? today.iso } as never),
    ]);
    pv = ((pvRes.data ?? []) as PvRivi[])[0] ?? null;
    sankariRivi = ((sRes.data ?? []) as SankariRivi[])[0] ?? null;
  }
  const visa = pv?.quiz_id
    ? await getPaivanVisaKortti(sb, {
        quizId: pv.quiz_id, iso: today.iso, uusiMalli: opts.pvUusi,
        // Ajankohtaisuusteksti (toimituksen koukku) näkyy aina, kun se on kirjoitettu (Heikki 28.10.).
        intro: opts.pvMalli ?? { headline: pv.intro_headline, text: pv.intro_text },
        questionCount: (cards.find((c) => c.id === pv!.quiz_id) as { question_count?: number | null } | undefined)?.question_count ?? null,
      })
    : null;
  /* v7 (30.10.): Päivän visa on kuvakortti — visan kansikuva (kokoelman korttikuva tai hero_image kohdepisteineen). */
  const pvKortti = visa ? cards.find((c) => c.id === visa.quizId) : undefined;
  const pvKuva = pvKortti ? visanKorttikuva(pvKortti) : { kuva: null };
  const visaKuvalla = visa ? { ...visa, kuva: pvKuva.kuva, kuvaPos: pvKuva.kuvaPos } : null;
  const sankari = sankariRivi ? muotoileSankari(sankariRivi) : null;
  /* Kolmas paikka on kiinteästi Mikä maa? (päivitys 29.10.: ei pelimuotojen rotaatiota).
     Päivän peleissä näytetään vain pelattavaa (Heikki 29.10. ilta): Tulossa-kortti ei vie
     etusivun arvokkainta tilaa — Tulossa-sääntö pätee vain Valitse peli -osiossa. */
  const mmConf = ETUSIVUN_PELIMUODOT.find((p) => p.slug === "mika-maa");
  const mikaMaa = mmConf && mmConf.tila === "pelattava" && nakyyEtusivulla(mmConf, today.iso) ? mmConf : null;

  /* ── 2 Tiesitkö? ── questions.hook-pooli, päiväsiemen. Sarakkeen puuttuminen (migraatio ajamatta) → ei osiota.
     Ajankohtaisuus (Heikki 30.10.2026, v7): Juhlat-kokoelman koukut eivät tule kiertoon lainkaan — juhlat nostaa
     juhlabanneri (Promo 1) lähimmän juhlan koukulla, eikä Tiesitkö saa toistaa samaa juhlaa. AVOIN: kalenteri-
     tapahtumien (±7 pv, esim. talviaika) koukut vaativat oman sisältölähteen. */
  let tiesitko: { kysymys: string; korostus: string; kicker: string; href: string; kuva: string | null; kuvaPos?: string } | null = null;
  {
    const { data, error } = await sb
      .from("questions")
      .select("id, question_text, quiz_id")
      .eq("hook" as never, true as never)
      .order("id")
      .limit(500);
    const rivit = !error ? ((data ?? []) as Array<{ id: string; question_text: string; quiz_id: string }>) : [];
    const julkaistut = rivit.filter((r) => cards.some((c) => c.id === r.quiz_id && c.collection !== JUHLAT_KOKOELMA));
    const r = poimi(julkaistut, paivaNro);
    const k = r ? cards.find((c) => c.id === r.quiz_id)! : null;
    if (r && k) {
      const teksti = r.question_text.trim();
      // Korostus: viimeinen sisältösana (ei "mukaan", "on", "se"…) ilman välimerkkejä.
      const sanat = teksti.split(/\s+/).map((w) => w.replace(/^[”"«(]+|[?.,!:;”"»)]+$/g, ""));
      const korostus = [...sanat].reverse().find((w) => w.length >= 4 && !HEIKOT.has(w.toLowerCase())) ?? sanat[sanat.length - 1];
      // Visalla ei omaa kuvaa (esim. historian visat) → kokoelman korttikuva.
      const kk = visanKorttikuva(k).kuva ? visanKorttikuva(k) : { kuva: KOKOELMA_KORTIT.find((x) => x.slug === k.collection)?.img ?? null, kuvaPos: undefined };
      tiesitko = {
        kysymys: teksti, korostus,
        kicker: [kokoelmaNimi(k.collection), nimi(k)].filter(Boolean).join(" · "),
        href: visaHref(k), kuva: kk.kuva, kuvaPos: kk.kuvaPos,
      };
    }
  }

  /* ── 3 Pelaa aiheittain ── kokoelmarekisteri (avoimet, ei Kuvavisoja — ne ovat pelimuoto), suomen aakkosjärjestyksessä
     (Heikki 29.10.; vain tässä osiossa — rekisterin oma järjestys navigaatiossa ja Kokoelmat-sivulla ennallaan). */
  const aiheet = KOKOELMA_KORTIT.filter((k) => k.avoin !== false && k.slug !== "kuvavisat").map((k) => ({
    slug: k.slug, nimi: k.nimi, href: k.href, kuva: k.img, kuvaPos: AIHE_POS[k.slug] ?? k.pos,
  })).sort((a, b) => a.nimi.localeCompare(b.nimi, "fi"));

  /* ── 4 Valitse peli ── */
  const visat = `${stats.quizzesFloor}+`;
  const ryhmat = ETUSIVU_RYHMAT.map((g) => {
    const kortit = ETUSIVUN_PELIMUODOT.filter((p) => p.ryhma === g.avain && nakyyEtusivulla(p, today.iso)).map((p) => ({
      ...p, etusivu_rivi: p.etusivu_rivi.replace("{visat}", visat),
    }));
    return { ...g, nimi: ryhmanNimi(kortit, g.nimi), kortit };
  }).filter((g) => g.kortit.some((k) => k.tila === "pelattava"));
  const pelimuotoja = ryhmat.reduce((n, g) => n + g.kortit.length, 0);

  /* ── 5 Promo 1 ── countdown (lähin juhla ≤ 14 pv, jolla on julkaistu visa) tai rotaatio */
  const tanaanPv = pvm(today.vuosi, today.kk, today.pv);
  const juhlaVisat = new Set(cards.filter((c) => c.collection === JUHLAT_KOKOELMA && c.slug).map((c) => c.slug!));
  const lahin: Esiintyma | undefined = juhlaKalenteri(tanaanPv, juhlaVisat).find((j) => j.julkaistut.length > 0);
  /* v7 (30.10.): countdown-tila on juhlabanneri — juhlan koukku (kysymys visasta, korostus, alarivi) ja "Selvitä vastaus".
     Koukku vain, jos sen visa on julkaistu; luonnoskoukku vain esikatselussa. Ilman koukkua otsikkona visan nimi. */
  type Juhlabanneri = {
    tila: "countdown"; kicker: string; juhla: string; pvm: string; aksentti: string; paivia: number; yksikko: string;
    otsikko: string; korostus: string | null; ala: string | null; cta: string; href: string; kuva: string | null; kuvaPos?: string;
  };
  let promo1:
    | Juhlabanneri
    | { tila: "rotaatio"; kicker: string; otsikko: string; href: string; kuva: string | null; kuvaPos?: string }
    | null = null;
  if (lahin) {
    const paivia = Math.max(0, paiviaValissa(lahin.alku + (lahin.kohde ?? 0) * 864e5, tanaanPv));
    if (paivia <= COUNTDOWN_PAIVAA) {
      const kk = lahin.koukku && juhlaVisat.has(lahin.koukku.visa) && !(TUOTANTO && lahin.koukku.luonnos) ? lahin.koukku : null;
      const k = cards.find((c) => c.slug === (kk?.visa ?? paavisa(lahin)));
      if (k) promo1 = {
        tila: "countdown", kicker: `Juhlat · ${lahin.nimi}`, juhla: lahin.nimi, pvm: vpLyhyt(lahin.alku).toLowerCase(),
        aksentti: lahin.accent, paivia,
        yksikko: paivia === 0 ? (lahin.tervehdys ?? `${lahin.nimi} tänään`) : `${paivia === 1 ? "päivä" : "päivää"} ${lahin.ill}`,
        otsikko: kk?.kysymys ?? nimi(k), korostus: kk?.korostus ?? null, ala: kk?.ala?.trim() || null,
        cta: kk ? "Selvitä vastaus" : "Pelaa", href: visaHref(k),
        kuva: kk?.kuva ?? lahin.kuva ?? visanKorttikuva(k).kuva,
      };
    }
  }
  if (!promo1) {
    // Rotaatiopooli: admin-promot (etusivu_promot, paino) + pelatuimmat + uusimmat visat. Henkilö- ja juhlavisat pois.
    const pooli = cards.filter((c) => c.collection && c.collection !== "tunnetut-henkilot" && c.collection !== JUHLAT_KOKOELMA && c.game_mode !== "mega");
    const pelatuimmat = [...pooli].sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0)).slice(0, 5);
    const uusimmat = [...pooli].filter((c) => c.published_at).sort((a, b) => (b.published_at! > a.published_at! ? 1 : -1)).slice(0, 5);
    const ehdokkaat: Array<{ kicker: string; otsikko: string; href: string; kuva: string | null; kuvaPos?: string }> = [];
    for (const k of [...pelatuimmat, ...uusimmat]) {
      if (ehdokkaat.some((e) => e.href === visaHref(k))) continue;
      const kk = visanKorttikuva(k);
      if (!kk.kuva) continue;
      ehdokkaat.push({ kicker: kokoelmaNimi(k.collection) ?? "Visa", otsikko: nimi(k), href: visaHref(k), kuva: kk.kuva, kuvaPos: kk.kuvaPos });
    }
    const { data: promot } = await sb
      .from("etusivu_promot" as never)
      .select("kicker, otsikko, href, kuva, alku, loppu, paino, paikka")
      .eq("paikka" as never, "promo1" as never);
    for (const p of (promot ?? []) as Array<{ kicker: string | null; otsikko: string; href: string; kuva: string | null; alku: string | null; loppu: string | null; paino: number }>) {
      if ((p.alku && p.alku > today.iso) || (p.loppu && p.loppu < today.iso)) continue;
      for (let i = 0; i < Math.max(1, p.paino); i++) ehdokkaat.push({ kicker: p.kicker ?? "Tietoniekka", otsikko: p.otsikko, href: p.href, kuva: p.kuva });
    }
    const valittu = poimi(ehdokkaat, paivaNro);
    if (valittu) promo1 = { tila: "rotaatio", ...valittu };
  }

  /* ── 6 Laura ja Mikko suosittelevat ── viikoittain juontajan kokoelmista; sitaatti yksi virke (teaser, muuten kuvaus) */
  const juontajat = JUONTAJIEN_SUOSITUKSET.map((j, i) => {
    const ehd = cards
      .filter((c) => c.collection && (j.kokoelmat as readonly string[]).includes(c.collection) && sitaatti(c) && c.game_mode !== "mega")
      .sort((a, b) => (a.id < b.id ? -1 : 1));
    const k = poimi(ehd, viikkoNro + i * 7);
    return k ? { key: j.key, nimi: j.nimi, kuva: j.kuva, aksentti: j.aksentti, visa: nimi(k), teaser: sitaatti(k)!, href: visaHref(k) } : null;
  }).filter((x): x is NonNullable<typeof x> => !!x);

  /* ── 9 Visapaketit ── Tulossa-sääntö; julkaistu paketti näkyy kautensa loppuun (loppu). */
  const paketit = VISAPAKETIT.filter((p) => {
    if (p.tila === "pelattava") return p.julkaisu <= today.iso && (!p.loppu || today.iso <= p.loppu);
    const ero = (Date.parse(p.julkaisu) - Date.parse(today.iso)) / 864e5;
    return ero >= 0 && ero <= 35;
  });

  return {
    today,
    paivanPelit: {
      pvm: { pitka: `${VIIKONPAIVAT[vp]} ${today.pv}.${today.kk}.`, lyhyt: `${VP_LYHYT[vp]} ${today.pv}.${today.kk}.` },
      visa: visaKuvalla,
      mikaMaa,
      sankari,
    },
    tiesitko,
    aiheet: { kicker: `${visat} visaa · ${aiheet.length} kokoelmaa`, tiilet: aiheet },
    pelit: { kicker: `${pelimuotoja} pelimuotoa`, ryhmat },
    promo1,
    juontajat,
    promo2: PROMO2_OOTKO.nakyvissa ? PROMO2_OOTKO : null,
    lapset: lapsetNakyvissa() ? { href: LAPSET_SIVU } : null,
    paketit,
  };
}
