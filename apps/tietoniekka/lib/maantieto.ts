// MAANTIETO — flagship-teemakokoelma (CD:n design + Heikin kuvat 15.8.2026).
// Kolmas flagship kulttuurin ja luonnon rinnalle: visakohtaiset kuvat
// (public/20/maantieto/<slug>.webp) landingissa, etusivun korteissa ja
// pelinäkymässä. Visa ilman kuvaa toimii silti: maantietoImg palauttaa null
// → SVG-motiivi / kokoelman herokuva.
// Kokoelma-arvo kannassa on edelleen 'matkakohteet' (URL sailyy) — nimi
// näkyvissä on "Maantieto", hero-copy CD:n "Maailman ääriltä kotia kohti".

export const MAANTIETO_HERO = "/20/maantieto/hero-landing.webp";
export const MAANTIETO_LM = "/20/maantieto/laura-mikko.webp";

/** Visat joilla on oma kuva — tiedostonimi on visan slug. */
const IMG_SLUGS = new Set([
  "hurjimmat-myrskyt-suomessa",
  "kanariansaaret-tiedatko-tarpeeksi",
  "maailman-korkeimmat-rakennukset-visa",
  "maailman-korkeimmat-vuoret-visa",
  "maailman-kuumimmat-kolkat",
  "maailman-kylmimmat-kolkat",
  "maailman-pisimmat-joet",
  "maailman-sateisimmat-kolkat",
  "maailman-suurimmat-jarvet",
  "maailman-suurimmat-kaupungit",
  "maailman-suurimmat-saaret",
  "maailman-syrjaisimmat-paikat",
  "new-york-big-apple",
  "pohjoisin-ja-etelaisin",
  "rooma-ikuinen-kaupunki",
  "sisilia-valimeren-helmi",
  "suomen-majakat",
  "tallinna-tietovisa",
  "tiedatko-lontoosta-kaiken",
  "valimeren-saaret-visa-tunnetko-saaristot",
]);

export function maantietoImg(slug: string | null | undefined): string | null {
  return slug && IMG_SLUGS.has(slug) ? `/20/maantieto/${slug}.webp` : null;
}

/** CD:n korttikuvaukset (design 15.8.2026) — näyttökopy, ei kanta-teasereita. */
export const MAANTIETO_DESC: Record<string, string> = {
  "maailman-syrjaisimmat-paikat": "Kaukaisimmat kolkat, joihin harva pääsee — löydätkö ne kartalta?",
  "valimeren-saaret-visa-tunnetko-saaristot": "Kuinka hyvin tunnet auringon ja meren saaristot?",
  "maailman-kylmimmat-kolkat": "Pakkasennätykset ja paikat, joissa ihminen silti asuu.",
  "pohjoisin-ja-etelaisin": "Korkein, syvin, kuivin ja tuulisin — kaikki yhdessä visassa.",
  "maailman-kuumimmat-kolkat": "Lämpöennätykset autiomaista ja alavista laaksoista.",
  "maailman-sateisimmat-kolkat": "Paikat, joissa sade ei tunnu loppuvan koskaan.",
  "maailman-korkeimmat-vuoret-visa": "Kahdeksantuhantiset ja se, missä ne oikeasti sijaitsevat.",
  "maailman-pisimmat-joet": "Mistä mihin — ja kumpi on lopulta pidempi?",
  "maailman-suurimmat-jarvet": "Sisämeriä, kraatereita ja kutistuvia altaita.",
  "maailman-suurimmat-saaret": "Mannerten reunoilta valtamerten keskelle.",
  "maailman-suurimmat-kaupungit": "Metropolit, väkiluvut ja nopeimmin kasvavat jättiläiset.",
  "maailman-korkeimmat-rakennukset-visa": "Pilvenpiirtäjien kärki ja niiden kotikaupungit.",
  "rooma-ikuinen-kaupunki": "Ikuinen kaupunki.",
  "new-york-big-apple": "Tiedätkö Big Applen salat?",
  "tiedatko-lontoosta-kaiken": "Kuinka hyvin tunnet Lontoon?",
  "tallinna-tietovisa": "Naapurikaupunki, jonka luulet tuntevasi.",
  "sisilia-valimeren-helmi": "Välimeren helmi.",
  "suomen-majakat": "Kuinka hyvin tunnet niiden taustat ja tarinat?",
  "hurjimmat-myrskyt-suomessa": "Nimetyt myrskyt ja niiden jäljet rannikolla.",
  "kanariansaaret-tiedatko-tarpeeksi": "Jos olet käynyt, todista tietämyksesi. Seitsemän saarta, joista jokainen on oma maailmansa.",
};

/** Kuratointi CD:n mukaan (Heikin vaihdettavissa). */
export const MAANTIETO_CURATED = {
  /** Hero-CTA "Aloita maailmanmatka" -kohde. */
  cta: "maailman-syrjaisimmat-paikat",
  /** Tietoniekan poiminnat (3 vaakakorttia). */
  poiminnat: [
    "maailman-syrjaisimmat-paikat",
    "valimeren-saaret-visa-tunnetko-saaristot",
    "maailman-kylmimmat-kolkat",
  ],
  /** Lauran ja Mikon poiminta. */
  lm: "kanariansaaret-tiedatko-tarpeeksi",
};

/** Pelaa myös nämä -ruudukon järjestys (CD:n design). Poiminnat ja L&M-visa
    eivät toistu ruudukossa; listalta puuttuvat (uudet) visat tulevat perään. */
export const MAANTIETO_GRID_ORDER = [
  "pohjoisin-ja-etelaisin",
  "maailman-kuumimmat-kolkat",
  "maailman-sateisimmat-kolkat",
  "maailman-korkeimmat-vuoret-visa",
  "maailman-pisimmat-joet",
  "maailman-suurimmat-jarvet",
  "maailman-suurimmat-saaret",
  "maailman-suurimmat-kaupungit",
  "maailman-korkeimmat-rakennukset-visa",
  "rooma-ikuinen-kaupunki",
  "new-york-big-apple",
  "tiedatko-lontoosta-kaiken",
  "tallinna-tietovisa",
  "sisilia-valimeren-helmi",
  "suomen-majakat",
  "hurjimmat-myrskyt-suomessa",
];
