// TV & SUORATOISTO — kuvat. Sivu on 19.10.2026 alkaen kokoelmarungolla (lib/kokoelmat/tv.ts); vanhan
// sivun kuratointi (TV_FEATURED, TV_SECTIONS) siirtyi osioiksi ja quizzes.section_tags-tageiksi.
// Alkuperäinen: CD "TN TV ja Suoratoisto -teemasivu" 19.8.2026, design_handoff_tv_suoratoisto/README.md.
// Rakenteellisesti Elokuvat-sivun (lib/elokuvat.ts) sisarus, kolme
// tarkoituksellista eroa (README "Erot Elokuvat-sivuun"):
//  1. Ruudukkokortissa on koukkuteksti (hook) nimen alla + tummempi scrim.
//  2. Navigaatio on pudotusvalikkopohjainen — hoidettu globaalilla TopBarilla.
//  3. Poimitut visat TOISTUVAT aihepiireissä (Heikin päätös 19.8.2026) —
//     toistuvilla korteilla eri koukku poiminnassa ja ruudukossa.
// Koukkutekstit ovat referenssistä sanasta sanaan. Kolme CD:n kirjoittamaa
// koukkua (HIMYM, Velipuolikuu, Ketonen & Myllyrinne) hyväksytty 19.8.2026;
// kaikki tekstit hiotaan vielä copy/SEO-ajossa.
// Jokaisella 41 visalla on kuva public/20/tv/<slug>.webp (Heikin alkuperäisistä
// PNG:istä; Simpsonit-GIF stillinä, Heikin päätös 19.8.2026 — ei animaatiota).
// Uusi visa ilman kuvaa/koukkua toimii silti: kortti saa typografisen
// fallback-pohjan ja koukkurivi jää pois (README "Reunatapaukset").

export const TV_HERO = "/20/tv/hero.webp";
/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "breaking-bad-visa-tunnetko-rikosdraaman",
  "diili-sa-saat-potkut-visa",
  "erikoisjoukot-visa",
  "farmi-suomi-pehtoorin-pillin-tahdissa-visa",
  "frendit-visa-tunnetko-jengin",
  "game-of-thrones-visa-tunnetko-valtaistuinpelin",
  "greys-anatomy-leikkaussali-kutsuu",
  "how-i-met-your-mother-visa",
  "kauniit-ja-rohkeat-forresterien-maailma",
  "ketonen-ja-myllyrinne-visa",
  "koko-suomi-leipoo-visa-uunit-kuumina",
  "kotikatu-visa-muistatko-kotimaisen-klassikon",
  "kummeli-visa",
  "luottomies-visa",
  "maajussille-morsian-sydan-maaseudulla-visa",
  "masked-singer-suomi-visa-naamion-takana",
  "metsolat-ysarin-sukusaaga",
  "money-heist-suuri-keikka",
  "muumilaakson-tarinoita-visa",
  "pasila-aseman-sekopaat",
  "petolliset-tietovisa",
  "putous-visa-tunnetko-sketsisuosikin",
  "salkkarit-salatut-elamat-tietovisa",
  "seinfeld-visa-tunnetko-komediaklassikon",
  "selviytyjat-suomi-viidakon-lait-visa",
  "simpsonit-visa-tunnetko-springfieldin-perheen",
  "solsidan-visa-tunnetko-hittikomedian",
  "sorjonen-visa-kotimainen-rikossarja",
  "squid-game-tietovisa",
  "stranger-things-tosifanin-koetinkivi",
  "succession-visa-tunnetko-valtataistelun",
  "syke-sairaalan-sankarit",
  "tankki-tayteen-huoltamoklassikko-visa",
  "tanssii-tahtien-kanssa-visa-parketin-tahdet",
  "ted-lasso-tiedatko-sarjasta-kaiken",
  "temptation-island-suomi-viettelysten-saarella-visa",
  "big-bang-theory-visa",
  "the-crown-visa-tunnetko-kuninkaallisen-sarjan",
  "tohtori-house-visa",
  "the-office-usa-visa-tunnetko-dunder-mifflinin-porukan",
  "the-sopranos-perheen-sisapiiri",
  "uusi-paiva-virtauksen-vaen-visa",
  "vain-elamaa-tietovisa",
  "velipuolikuu-tietovisa",
]);

export function tvImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/tv/${slug}.webp` : null;
}
