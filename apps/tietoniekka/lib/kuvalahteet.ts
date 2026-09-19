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
  kokoelma: "musiikki" | "kaupungit" | "tiede";
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

  // ─── Kaupungit (12.9.2026) ───
  { slug: "espoo", kokoelma: "kaupungit", kuvaus: "Hanasaari ja Espoon saaristo ilmasta", tiedosto: "Hanasaari, Espoo 2019-10-05.jpg", tekija: "Joneikifi", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2019" },
  { slug: "hameenlinna", kokoelma: "kaupungit", kuvaus: "Hämeen linna", tiedosto: "Häme Castle (23499025921).jpg", tekija: "দেবর্ষি রায় (Debarshi Ray)", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2015" },
  { slug: "helsinki", kokoelma: "kaupungit", kuvaus: "Senaatintori, Helsinki", tiedosto: "Helsinki Senate Square Terrace East 2020-07-01.jpg", tekija: "JoAlanen", lisenssi: "CC0", lisenssiUrl: "https://creativecommons.org/publicdomain/zero/1.0/", vuosi: "2020" },
  { slug: "joensuu", kokoelma: "kaupungit", kuvaus: "Pielisjoen ranta, Joensuu", tiedosto: "East bank of Pielisjoki-river in Joensuu.jpg", tekija: "Zache", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2006" },
  { slug: "jyvaskyla", kokoelma: "kaupungit", kuvaus: "Jyväskylän satama", tiedosto: "Jyväskylä harbour.jpg", tekija: "Roland Struwe", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2008" },
  { slug: "kouvola", kokoelma: "kaupungit", kuvaus: "Pyhän Ristin kirkko, Kouvola", tiedosto: "Kouvolan pyhän ristin kirkko.jpg", tekija: "Motopark", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },
  { slug: "kuopio", kokoelma: "kaupungit", kuvaus: "Kuopion keskusta Puijolta", tiedosto: "Kuopio-center-from-Puijo.jpg", tekija: "Tumi-1983", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "2011" },
  { slug: "lahti", kokoelma: "kaupungit", kuvaus: "Salpausselän hyppyrimäet, Lahti", tiedosto: "Lahti skijumps.jpg", tekija: "sdbj", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2005" },
  { slug: "lappeenranta", kokoelma: "kaupungit", kuvaus: "Lappeenrannan satama", tiedosto: "Lappeenranta harbour.JPG", tekija: "MKFI", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "2011" },
  { slug: "mikkeli", kokoelma: "kaupungit", kuvaus: "Mikkelin keskusta Naisvuorelta", tiedosto: "Mikkelin keskusta Naisvuorelta.JPG", tekija: "MKFI", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "2011" },
  { slug: "oulu", kokoelma: "kaupungit", kuvaus: "Oulun toriranta", tiedosto: "Oulun-torinranta.jpg", tekija: "Tumi-1983", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2010" },
  { slug: "pori", kokoelma: "kaupungit", kuvaus: "Keski-Porin kirkko", tiedosto: "Keski Porin kirkko.jpg", tekija: "Silenzio", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "2006" },
  { slug: "porvoo", kokoelma: "kaupungit", kuvaus: "Porvoon vanhat rantamakasiinit", tiedosto: "Old Porvoo riverside.jpg", tekija: "kallerna", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2010" },
  { slug: "rovaniemi", kokoelma: "kaupungit", kuvaus: "Jätkänkynttiläsilta, Rovaniemi", tiedosto: "Rovaniemi Lumberjack’s Candle Bridge.jpg", tekija: "themadpenguin", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2012" },
  { slug: "salo", kokoelma: "kaupungit", kuvaus: "Salon kaupungintalo", tiedosto: "Salon kaupungintalo.jpg", tekija: "Motopark", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2011" },
  { slug: "seinajoki", kokoelma: "kaupungit", kuvaus: "Aalto-keskus ja Lakeuden Ristin kellotorni, Seinäjoki", tiedosto: "Seinäjoki 2023.jpg", tekija: "Zache", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "2023" },
  { slug: "tampere", kokoelma: "kaupungit", kuvaus: "Tampereen keskusta Näsinneulasta", tiedosto: "Tampere center from Näsinneula.jpg", tekija: "Leo-setä", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2011" },
  { slug: "turku", kokoelma: "kaupungit", kuvaus: "Turun tuomiokirkko ja Aurajoki", tiedosto: "Kirjastosilta, Aurajoki ja Turun tuomiokirkko, kuvattuna Itäiseltä Rantakadulta, Turku, 8.12.2013.jpg", tekija: "Markus Rantala (Makele-90)", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },
  { slug: "vaasa", kokoelma: "kaupungit", kuvaus: "Vaasan kirkko ja keskusta vesitornista", tiedosto: "Vaasa Church from water tower.jpg", tekija: "Roland Struwe", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2008" },
  { slug: "vantaa", kokoelma: "kaupungit", kuvaus: "Tiedekeskus Heureka, Vantaa", tiedosto: "Heureka.jpg", tekija: "Danila Talikov", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },

  // ─── Tiede ja teknologia (19.9.2026) ───
  { slug: "matka-planeetoilta-kuun-kraattereihin", kokoelma: "tiede", kuvaus: "Saturnus ja sen renkaat, Cassini-luotain", tiedosto: "Saturn, its rings, and a few of its moons.jpg", tekija: "NASA/JPL/Space Science Institute", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "2009" },
  { slug: "laaketieteen-lapimurrot-visa", kokoelma: "tiede", kuvaus: "Wilhelm Röntgenin ensimmäinen lääketieteellinen röntgenkuva", tiedosto: "First medical X-ray by Wilhelm Röntgen of his wife Anna Bertha Ludwig's hand - 18951222.jpg", tekija: "Wilhelm Röntgen", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1895" },
  { slug: "neroja-omenoita-ja-yllattavia-kaanteita", kokoelma: "tiede", kuvaus: "Isaac Newtonin muotokuva, Godfrey Kneller 1702", tiedosto: "Sir Isaac Newton by Sir Godfrey Kneller, Bt.jpg", tekija: "Godfrey Kneller", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1702" },
  { slug: "elava-planeetta-liikkuu-jalkojesi-alla", kokoelma: "tiede", kuvaus: "Laavasuihkuja, Kapoho, Kilauea 1960", tiedosto: "Kapoho lava fountains (1).jpg", tekija: "Hawaii Volcanoes National Park (USGS)", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1960" },
  { slug: "saa-ja-ilmakeha-taivaan-pikkuprintti", kokoelma: "tiede", kuvaus: "Wilson Bentleyn lumikidevalokuva", tiedosto: "Wilson A. Bentley snowflake, 1890.jpg", tekija: "Wilson Bentley", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1890" },
  { slug: "evoluutio-ja-biodiversiteetti-visa", kokoelma: "tiede", kuvaus: "Charles Darwinin valokuva, n. 1854", tiedosto: "Charles Darwin seated crop.jpg", tekija: "Maull & Fox", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1854" },
  { slug: "kasvit-ja-sienet-ansoja-kauppoja-jattilaisia", kokoelma: "tiede", kuvaus: "Kärpäsloukku, tuntokarvat näkyvissä", tiedosto: "Venus Flytrap showing trigger hairs.jpg", tekija: "Noah Elhardt", lisenssi: "CC BY-SA 2.5", lisenssiUrl: CC("by-sa/2.5"), vuosi: "2005" },
  { slug: "elainten-supervoimat-aistit-ja-ennatykset", kokoelma: "tiede", kuvaus: "Gepardi jahdin jälkeen, Phinda-luonnonpuisto", tiedosto: "Cheetah (Acinonyx jubatus) female after chase.jpg", tekija: "Charles J. Sharp", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2014" },
  { slug: "arkijarki-vastaan-matematiikka", kokoelma: "tiede", kuvaus: "Nautiluksen kuoren poikkileikkaus, Fibonacci-spiraali", tiedosto: "NautilusCutawayLogarithmicSpiral.jpg", tekija: "Chris 73", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2004" },
  { slug: "kadonneen-ajan-jattilaiset", kokoelma: "tiede", kuvaus: "T. rex -luuranko SUE, Field Museum Chicago", tiedosto: "SUE Trex Real Bones.jpg", tekija: "Evolutionnumber9", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2020" },
  { slug: "nerokkaita-oivalluksia-ja-onnekkaita-sattumia", kokoelma: "tiede", kuvaus: "Vanha hehkulamppu, orava-häkki-hehkulanka", tiedosto: "Vintage edison light bulb.jpg", tekija: "Filip Mishevski", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2013" },
  { slug: "mikroskooppinen-maailma-nakymaton-elama", kokoelma: "tiede", kuvaus: "Vibrio vulnificus -bakteeri, värjätty SEM-kuva", tiedosto: "Flagellated Vibrio Vulnificus Bacterium - Colorized Scanning Electron Micrograph (SEM) - cdc.gov - 1576 x 1080.jpg", tekija: "CDC / Janice Haney Carr", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "2005" },
  { slug: "arjen-fysiikka-salamoista-sireeneihin", kokoelma: "tiede", kuvaus: "Ukkosmyrsky, Pritzerbe, Saksa", tiedosto: "Lightning Pritzerbe 01 (MK).jpg", tekija: "Mathias Krumbholz", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2010" },
  { slug: "kemia-ja-alkuaineet-visa", kokoelma: "tiede", kuvaus: "Alkuaineiden liekkivärjäys", tiedosto: "MultiColor Flame.jpg", tekija: "Raquelaa54", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "2017" },
  { slug: "teknologian-ensimmaiset-hetket-visa", kokoelma: "tiede", kuvaus: "Western Electric -pöytäpuhelin (candlestick)", tiedosto: "Western Electric Bullnose Candlestick Telephone (53993129386).jpg", tekija: "Ethan Long", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2024" },
  { slug: "mista-olet-tehty-oikeasti-genetiikka", kokoelma: "tiede", kuvaus: "DNA-kaksoiskierre, emäsparit", tiedosto: "Blausen 0321 DNA 1.png", tekija: "BruceBlaus / Blausen Medical", lisenssi: "CC BY 3.0", lisenssiUrl: CC("by/3.0"), vuosi: "2013" },
  { slug: "meret-ja-merentutkimus-visa", kokoelma: "tiede", kuvaus: "Värikäs koralliriutta", tiedosto: "Colorful Corals.jpg", tekija: "Unitarywheat", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2025" },
  { slug: "kehosi-katketyt-kummallisuudet", kokoelma: "tiede", kuvaus: "Ihmissydämen anatominen malli", tiedosto: "Human heart model.jpg", tekija: "Alaa Najjar", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2017" },
  { slug: "paan-sisalla-tapahtuu-enemman-kuin-huomaat", kokoelma: "tiede", kuvaus: "Aivorunko ja pikkuaivot, preparoitu näyte", tiedosto: "Brain stem and cerebellum.jpg", tekija: "Dexteriov", lisenssi: "Public domain (CC0)", lisenssiUrl: "", vuosi: "2024" },
];

/** Commons-tiedostosivun osoite — lisenssiehtojen vaatima linkki lähteeseen. */
export function commonsUrl(tiedosto: string): string {
  return "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(tiedosto.replace(/ /g, "_"));
}

/** Onko kokoelmassa vapaasti lisensoituja valokuvia (→ näytetäänkö krediitti)? */
export function kokoelmanKuvalahteet(kokoelma: Kuvalahde["kokoelma"]): Kuvalahde[] {
  return KUVALAHTEET.filter((k) => k.kokoelma === kokoelma);
}
