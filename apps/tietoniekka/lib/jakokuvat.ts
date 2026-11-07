// JAKOKORTTIEN HENKILÖKUVAT (Jakotekstit v4 §4, 7.11.2026): "Jakokorteissa ei käytetä henkilökuvia." Visan oma kuva on
// usein valokuva tunnetusta ihmisestä (artisti lavalla, pelaaja, poliitikko). Jakokortti käyttää silloin teemavärin
// kuviota. Lähde: lib/kuvalahteet.ts:n kuvaus-kenttä; mukana kuvat, joiden kuvauksessa on nimetty henkilö tai
// tunnistettava henkilöryhmä. Uusi henkilökuva kuvalahteisiin → lisää slug tänne.
// Tekoälykuvat (ei krediittiä) eivät esitä oikeita ihmisiä, joten ne saavat näkyä.

import { KUVALAHTEET } from "@/lib/kuvalahteet";

/** Kansiot, joiden kaikki kuvat ovat henkilökuvia (kasvokuvat). */
const KASVOKANSIOT = ["/20/henkilot/", "/20/vaalit/kasvot/", "/20/ikajarjestys/"];

/** Kuvalähteiden slugit (= visan tai pakan slug), joiden kuvassa on nimetty henkilö. Musiikin kaikki valokuvat ovat
 *  artistikuvia, joten ne tulevat kuvalähteistä suoraan. */
const HENKILOKUVAT = new Set([
  // Jääkiekko: nimetyt pelaajat, valmentajat, tuomarit ja pomot
  "sm-liiga-stadin-derby-hifk-jokerit", "ilves-tampere-keltamustat-tietovisa", "tps-turku-jaakiekko-tietovisa",
  "karpat-tietovisa-legendat", "hifk-helsinki-punavalkoiset-tietovisa", "jyp-hippoksen-hurmaa-tietovisa",
  "kalpa-niiralan-montun-kovin-tietovisa", "pelicans-kolme-kertaa-hopealla-tietovisa", "saipa-saimaan-syketta-tietovisa",
  "kiekko-espoo-tuhkasta-liigaan-tietovisa", "leijonat-mm-2011-kulta", "suomalaiset-nhl-pioneerit",
  "suomalaiset-nhl-ennatykset", "sm-liiga-maalivahtilegendat", "sm-liiga-kaikkien-aikojen-pistekuninkaat",
  "sm-liiga-valmentajadraamat-tulisielut", "sm-liiga-ulkomaalaisvahvistukset", "sm-liigan-legendaariset-pomot-visa",
  "sm-liiga-ikonisimmat-maalitykit", "sm-liiga-jaahykuninkaat-kovanaamat", "sm-liiga-tuomarilegendat",
  "leijonat-olympiakulta-2022", "nuoret-leijonat-mm-2014-kulta", "nuoret-leijonat-mm-2016-kulta",
  "nuoret-leijonat-mm-2019-kulta", "suomalaiset-nhl-kuriositeetit",
  // Historia, vaalit ja politiikka
  "suomen-itsenaistyminen-visa", "kekkosen-suomi-kylma-sota-idansuhteet", "mannerheim-visa",
  "suomen-hallitukset-ennatyksia-lempinimia-ja-kriiseja", "eduskuntaryhmat", "puolueet-ika",
  // Ikäjärjestys
  "leonardo-dicaprio", "kimi-raikkonen", "taylor-swift", "sanna-marin",
  // Kulttuuri: kirjailijat, säveltäjät, arkkitehdit
  "suomalaisen-kirjallisuuden-klassikot", "tunnetko-suomalaiset-kirjailijat", "muumit-tove-jansson-visa",
  "jean-sibelius-saveltaja-ja-kansallinen-ikoni", "alvar-aalto-tiedatko-mestarin",
  // Urheilulajit: nimetyt pelaajat
  "salibandyn-tahdet-ja-legendat", "suomen-salibandynaiset", "koripallon-suomalaislegendat",
  "lentopallon-legendat-suomessa", "aktialiiga-kasipallon-paasarja", "kasipallon-tahdet-ja-legendat",
]);

const MUSIIKKI = new Set(KUVALAHTEET.filter((l) => l.kokoelma === "musiikki").map((l) => l.slug));

/** Onko visan tai pakan kuva henkilökuva, jota jakokortti ei näytä. slug = visan slug; kuva = kuvan polku. */
export function onHenkilokuva(slug: string | null | undefined, kuva?: string | null): boolean {
  if (kuva && KASVOKANSIOT.some((k) => kuva.startsWith(k))) return true;
  return !!slug && (MUSIIKKI.has(slug) || HENKILOKUVAT.has(slug));
}
