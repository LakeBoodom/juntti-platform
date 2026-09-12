// KUVALÄHTEET — vapaasti lisensoitujen valokuvien tekijätiedot.
//
// Tausta (12.9.2026): Tietoniekan teemakuvat ovat olleet AI-kuvituksia. Openversen
// (openverse.org) kautta haettiin vapaasti lisensoituja oikeita valokuvia; kaikki
// alla olevat ovat Wikimedia Commonsista, ja jokaisen lisenssi on varmistettu
// Commonsin omalta tiedostosivulta (Openversen lisenssitieto on koostetta, ei
// lähde — sitä ei käytetä yksin todisteena).
//
// SÄÄNNÖT, joita tämän rekisterin on noudatettava:
//  1. Sallitut lisenssit: CC0 / public domain, CC BY, CC BY-SA. EI NC- eikä
//     ND-lisenssejä — Tietoniekka on kaupallinen sivusto ja kuvia rajataan.
//  2. Jokaisesta CC BY- ja CC BY-SA -kuvasta on näytettävä tekijä, lisenssi ja
//     linkki lähteeseen. Se tehdään sivulla /kuvien-lahteet, johon viitataan
//     kokoelmasivun kuvakrediitistä ja alatunnisteesta.
//  3. Kuvia on rajattu 640x360-kokoon ja skaalattu. Rajaus on muokkaus, joten
//     BY-SA-kuvien osalta sivu ilmoittaa muokatun kuvan olevan saatavilla
//     samalla lisenssillä (share-alike).
//  4. Uusi kuva ei mene tuotantoon ilman riviä tässä tiedostossa.

export type Kuvalahde = {
  /** Visan slug = kuvatiedoston nimi kansiossa public/20/<kokoelma>/ */
  slug: string;
  /** Kokoelma, jonka kansiossa kuva on. */
  kokoelma: "musiikki";
  /** Mitä kuvassa on — näytetään lähdesivulla. */
  kuvaus: string;
  /** Tiedoston nimi Wikimedia Commonsissa (ilman File:-etuliitettä). */
  tiedosto: string;
  tekija: string;
  lisenssi: string;
  /** Tyhjä vain public domain -kuvilla. */
  lisenssiUrl: string;
  /** Kuvausvuosi, jos tiedossa. */
  vuosi?: string;
};

const CC = (t: string) => `https://creativecommons.org/licenses/${t}/`;

export const KUVALAHTEET: Kuvalahde[] = [
  { slug: "antti-tuisku-visa-peto-on-irti", kokoelma: "musiikki", kuvaus: "Antti Tuisku, Ilosaarirock 2016", tiedosto: "Antti Tuisku - Ilosaarirock 2016 - 11.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2016" },
  { slug: "apulanta-bandi-tietovisa", kokoelma: "musiikki", kuvaus: "Apulanta, Rakuuna Rock 2014", tiedosto: "Apulanta - Rakuuna Rock 2014 4.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2014" },
  { slug: "ariana-grande-visa-tunnetko-poptahden", kokoelma: "musiikki", kuvaus: "Ariana Grande lavalla 2017", tiedosto: "Ariana Grande (33141791491).jpg", tekija: "Emma", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2017" },
  { slug: "billie-eilish-visa-tunnetko-poptahden", kokoelma: "musiikki", kuvaus: "Billie Eilish, Pukkelpop 2019", tiedosto: "Billie Eilish at Pukkelpop Festival - 18 AUGUST 2019 (08) (cropped).jpg", tekija: "crommelincklars", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2019" },
  { slug: "bruno-mars-visa-tunnetko-tahden", kokoelma: "musiikki", kuvaus: "Bruno Mars, Doo-Wops-kiertue 2010", tiedosto: "Bruno Mars Doowops.jpg", tekija: "Brothers Le", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2010" },
  { slug: "bts-visa-tunnetko-kpop-ilmion", kokoelma: "musiikki", kuvaus: "BTS Valkoisessa talossa 2022", tiedosto: "BTS at the White House on May 31, 2022.jpg", tekija: "The White House", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "2022" },
  { slug: "cheek-visa-valot-sammuu", kokoelma: "musiikki", kuvaus: "Cheek, Rakuuna Rock 2014", tiedosto: "Cheek - Rakuuna Rock 2014 2.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2014" },
  { slug: "coldplay-visa-tunnetko-yhtyeen", kokoelma: "musiikki", kuvaus: "Coldplay, The Rose Bowl 2017", tiedosto: "Coldplay 2017, cropped 01.jpg", tekija: "raph_ph (Flickr)", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2017" },
  { slug: "drake-visa-tunnetko-hiphoptahden", kokoelma: "musiikki", kuvaus: "Drake lavalla 2010", tiedosto: "Drake 2010.jpg", tekija: "musicisentropy", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2010" },
  { slug: "elastinen-visa-suomirapin-pioneeri", kokoelma: "musiikki", kuvaus: "Elastinen, Summer Up 2013", tiedosto: "Elastinen at Summer Up 2013.jpg", tekija: "Tero Heino", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },
  { slug: "eminem-visa-tunnetko-rap-legendan", kokoelma: "musiikki", kuvaus: "Eminem, Washington D.C. 2014", tiedosto: "Eminem live at D.C. 2014.jpg", tekija: "DOD News Features", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2014" },
  { slug: "eppu-normaali-tietovisa", kokoelma: "musiikki", kuvaus: "Eppu Normaali, Rakuuna Rock 2014", tiedosto: "Eppu Normaali - Rakuuna Rock 2014 1.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2014" },
  { slug: "future-visa-tunnetko-trapin-tahden", kokoelma: "musiikki", kuvaus: "Future, Openair Frauenfeld 2019", tiedosto: "Future - Openair Frauenfeld 2019 05.jpg", tekija: "Frank Schwichtenberg", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2019" },
  { slug: "haloo-helsinki-visa-beibi-fani", kokoelma: "musiikki", kuvaus: "Haloo Helsinki! Niinisalossa 2011", tiedosto: "Haloo Helsinki Niinisalossa 1.jpg", tekija: "kallerna", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2011" },
  { slug: "juice-wrld-visa-tunnetko-tahden", kokoelma: "musiikki", kuvaus: "Juice WRLD, Les Ardentes 2019", tiedosto: "Juice WRLD - Les Ardentes 2019.jpg", tekija: "Lexiou WesCudi", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2019" },
  { slug: "justin-bieber-visa-tunnetko-poptahden", kokoelma: "musiikki", kuvaus: "Justin Bieber konsertissa 2010", tiedosto: "Justin Bieber in concert.jpg", tekija: "Heather Sokol", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2010" },
  { slug: "jvg-visa-haista-ikuiseen-vappuun", kokoelma: "musiikki", kuvaus: "JVG, Finnish Gaming Awards 2013", tiedosto: "JVG at FGA 2013.jpg", tekija: "Tero Heino", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },
  { slug: "kanye-west-visa-tunnetko-uudistajan", kokoelma: "musiikki", kuvaus: "Kanye West, MoMA 2011", tiedosto: "Kanye West @ MoMA.jpg", tekija: "Jason Persse", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2011" },
  { slug: "kendrick-lamar-visa-tunnetko-rap-tahden", kokoelma: "musiikki", kuvaus: "Kendrick Lamar, The DAMN. Tour 2017", tiedosto: "Kendrick Lamar- The DAMN. Tour @ TD Garden (Boston, MA) (36059988466).jpg", tekija: "Kenny Sun", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2017" },
  { slug: "lordi-hirviot-haltuun", kokoelma: "musiikki", kuvaus: "Mr. Lordi lavalla 2010", tiedosto: "MrLordi live 2010.jpg", tekija: "Rosario López", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2010" },
  { slug: "pmmp-visa-rusketusraidat", kokoelma: "musiikki", kuvaus: "PMMP, Ilosaarirock 2012", tiedosto: "PMMP - Ilosaarirock 2012.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2012" },
  { slug: "post-malone-visa-tunnetko-tahden", kokoelma: "musiikki", kuvaus: "Post Malone, Chicago 2020", tiedosto: "Post Malone in Chicago 2020.jpg", tekija: "Adam Bielawski", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2020" },
  { slug: "rihanna-visa-tunnetko-tahden", kokoelma: "musiikki", kuvaus: "Rihanna, Last Girl on Earth Tour 2010", tiedosto: "Rihanna - Last Girl on Earth Tour Live At MSG.jpg", tekija: "dephisticate", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2010" },
  { slug: "robin-visa-frontside-ollie", kokoelma: "musiikki", kuvaus: "Robin Packalen, Ilosaarirock 2015", tiedosto: "Robin - Ilosaarirock 2015 01.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2015" },
  { slug: "sanni-visa-prinsessoja-astronautteja", kokoelma: "musiikki", kuvaus: "SANNI, Ilosaarirock 2016", tiedosto: "Sanni - Ilosaarirock 2016 - 06.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2016" },
  { slug: "taylor-swift-visa-tunnetko-supertahden", kokoelma: "musiikki", kuvaus: "Taylor Swift lavalla 2016", tiedosto: "Taylor Swift Performance (31592454132).jpg", tekija: "el_ave (Flickr)", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2016" },
  { slug: "ultra-bra-tietovisa", kokoelma: "musiikki", kuvaus: "Ultra Bra lavalla 1997", tiedosto: "Ultra Bra 1997.tif", tekija: "Tuomas Jääskeläinen", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "1997" },
];

/** Commons-tiedostosivun osoite — lisenssiehtojen vaatima linkki lähteeseen. */
export function commonsUrl(tiedosto: string): string {
  return "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(tiedosto.replace(/ /g, "_"));
}

/** Onko kokoelmassa vapaasti lisensoituja valokuvia (→ näytetäänkö krediitti)? */
export function kokoelmanKuvalahteet(kokoelma: Kuvalahde["kokoelma"]): Kuvalahde[] {
  return KUVALAHTEET.filter((k) => k.kokoelma === kokoelma);
}
