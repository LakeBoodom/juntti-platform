// PÄIVÄN SANKARI — tekstien mallipohjat (toteutusohje 19.9.2026, luku 4.2;
// Design v0.3 14b/14c). Sankari haetaan kannasta funktiolla
// paivan_sankari(site, päivä); tämä tiedosto vain muotoilee rivin tekstit.
//
// Teksti generoidaan, ei kirjoiteta. celebrities.intro_text ohittaa
// mallipohjan kokonaan (sekä työpöydällä että mobiilissa).
// Mobiiliteksti on mallipohjan oma variantti, ei katkaisu: nimi jätetään pois
// virkkeen alusta, koska se on jo otsikkorivillä.

import { pvmOsat } from "@/lib/aika";

/** paivan_sankari()-funktion rivi */
export type SankariRivi = {
  celebrity_id: string;
  name: string;
  role: string | null;
  birth_date: string;
  death_date: string | null;
  image_url: string | null;
  slug: string | null;
  intro_text: string | null;
  image_focal_x: number | string | null;
  image_focal_y: number | string | null;
  quiz_id: string;
  quiz_title: string;
  quiz_slug: string | null;
  custom_slug: string | null;
  /** Vuosia syntymästä tänään (synttärinä = täyttää) */
  ika: number;
};

export type SankariTapaus = "vakio" | "pyorea" | "muisto";

export type PaivanSankariData = {
  tapaus: SankariTapaus;
  /** Mittaus (luku 9) */
  quizId: string;
  nimi: string;
  /** Muistopäivänä elinvuodet "1937–2023", muuten null */
  elinvuodet: string | null;
  kicker: { desktop: string; mobile: string };
  teksti: { desktop: string; mobile: string };
  kuva: string | null;
  /** CSS object-position pyöreään kehykseen */
  kuvaPos: string;
  playHref: string;
};

/** Pyöreät vuodet: 40, 50, … 100 (Heikki 19.9.2026: "jo 40 vuotta alkaen";
    ohjeessa 50–90). */
export function onPyorea(ika: number): boolean {
  return ika >= 40 && ika <= 100 && ika % 10 === 0;
}

/* Kuva: celebrities.image_url sellaisenaan. Kannan Wikimedia-kuvat ovat
   330 px:n thumbeja — riittää 96 px:n pyöreään kehykseen 2×-tarkkuudella, ja
   valmis porras on Wikimedian välimuistissa. */

const pct = (v: number | string | null, oletus: number) => {
  const n = v == null || v === "" ? NaN : Number(v);
  return `${Math.round((Number.isFinite(n) ? n : oletus) * 100)}%`;
};

export function muotoileSankari(s: SankariRivi): PaivanSankariData {
  const tapaus: SankariTapaus = s.death_date ? "muisto" : onPyorea(s.ika) ? "pyorea" : "vakio";
  const oma = s.intro_text?.trim() || null;

  let kicker: PaivanSankariData["kicker"];
  let desktop: string;
  let mobile: string;
  let elinvuodet: string | null = null;

  if (tapaus === "muisto") {
    const synt = pvmOsat(s.birth_date).vuosi;
    const kuol = pvmOsat(s.death_date!).vuosi;
    elinvuodet = `${synt}–${kuol}`;
    kicker = {
      desktop: `Muistopäivä · tänään ${s.ika} vuotta syntymästä`,
      mobile: `Muistopäivä · ${s.ika} v syntymästä`,
    };
    desktop = `${s.name} (${synt}–${kuol}) syntyi tänään ${s.ika} vuotta sitten. Muistele häntä pelaamalla hänen visansa.`;
    mobile = `Syntyi tänään ${s.ika} vuotta sitten. Muistele häntä pelaamalla hänen visansa.`;
  } else if (tapaus === "pyorea") {
    kicker = {
      desktop: `Synttärit · tänään pyöreät ${s.ika} vuotta`,
      mobile: `Synttärit · pyöreät ${s.ika} v`,
    };
    desktop = `${s.name} täyttää tänään pyöreät ${s.ika} vuotta. Tietoniekka onnittelee — juhlista pelaamalla hänen visansa.`;
    mobile = `Täyttää tänään pyöreät ${s.ika} vuotta. Juhlista pelaamalla hänen visansa.`;
  } else {
    kicker = {
      desktop: `Synttärit · tänään ${s.ika} vuotta`,
      mobile: `Synttärit · tänään ${s.ika} v`,
    };
    desktop = `${s.name} täyttää tänään ${s.ika} vuotta. Tietoniekka onnittelee — juhlista pelaamalla hänen visansa.`;
    mobile = `Täyttää tänään ${s.ika} vuotta. Juhlista pelaamalla hänen visansa.`;
  }

  return {
    tapaus,
    quizId: s.quiz_id,
    nimi: s.name,
    elinvuodet,
    kicker,
    teksti: oma ? { desktop: oma, mobile: oma } : { desktop, mobile },
    kuva: s.image_url || null,
    kuvaPos: `${pct(s.image_focal_x, 0.5)} ${pct(s.image_focal_y, 0.3)}`,
    playHref: `/peli?quiz_id=${s.quiz_id}&paivan_sankari=1`,
  };
}
