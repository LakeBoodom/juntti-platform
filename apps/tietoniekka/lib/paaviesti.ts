// PÄÄVIESTI (Heikki 21.11.2026, brief "Tietoniekan uusi pääviesti"; tausta claude/PAAVIESTI_TEKSTISARJA_2026_11_21.md).
// Sivuston yleisviesti yhdestä paikasta: etusivun hero, yläpalkki, alatunniste, oletusmetadata, JSON-LD ja llms.txt.
// Tekstit ovat Heikin hyväksymiä sellaisinaan, älä muotoile uudelleen. Visamäärä vain meta descriptionissa.
import { brand } from "@/config/brand";

/** Etusivun h1:n yläotsikko (versaali CSS:llä). Sama aihepari myös alatunnisteessa. */
export const YLAOTSIKKO = "Tietovisat ja tietopelit Leijonista Linnan juhliin";
/** Etusivun h1:n koukku. */
export const KOUKKU = "Pelaa itsesi tietoniekaksi.";
/** Koukun alarivi (leipäteksti). */
export const ALARIVI = "Telkkarin ääressä tiedät aina vastauksen. Nyt kysytään sinulta.";
/** Yläpalkin tagline logon alla. */
export const TAGLINE = "Tietovisat ja tietopelit";
/** Alatunnisteen kuvausrivi. */
export const ALATUNNISTE = `${YLAOTSIKKO}. Uutta pelattavaa jatkuvasti.`;

/** Etusivun <title> (≤ 60 merkkiä). */
export const etusivunOtsikko = () => `Ilmaisia tietovisoja ja tietopelejä | ${brand.name}`;
/** Etusivun meta description (≤ 160 merkkiä myös nelinumeroisella luvulla). quizzesFloor = lib/siteStats. */
export const etusivunKuvaus = (quizzesFloor: number) =>
  `Pelaa itsesi tietoniekaksi: yli ${quizzesFloor} ilmaista tietovisaa, kuvavisaa ja karttapeliä urheilusta, musiikista, historiasta ja luonnosta.`;
/** og:title ja twitter:title. */
export const KOUKKU_OG = `Pelaa itsesi tietoniekaksi | ${brand.name}`;
/** og:description ja twitter:description. */
export const KUVAUS_OG = "Tietovisat, kuvavisat, karttapelit ja järjestyspelit Leijonista Linnan juhliin.";
/** JSON-LD (Organization, WebSite) ja llms.txt-esittely. */
export const SIVUSTO_KUVAUS = `${brand.name} on suomalainen tietovisojen ja tietopelien sivusto: klassiset visat, kuva- ja äänivisat, karttapelit ja järjestyspelit.`;
