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
//  3. Kuvia on rajattu 640x360-kokoon ja skaalattu (musiikin 24.9. lisätyillä
//     visoilla myös pelinäkymän hero public/20/musiikki/hero/<slug>.webp: koko
//     kuva + saman kuvan sumennettu jatke sivuilla). Rajaus on muokkaus, joten
//     BY-SA-kuvien osalta sivu ilmoittaa muokatun kuvan olevan saatavilla
//     samalla lisenssillä (share-alike).
//  4. Uusi kuva ei mene tuotantoon ilman riviä tässä tiedostossa.

export type Kuvalahde = {
  /** Visan slug = kuvatiedoston nimi kansiossa public/20/<kokoelma>/ */
  slug: string;
  /** Kokoelma, jonka kansiossa kuva on. */
  kokoelma: "musiikki" | "kaupungit" | "jaakiekko" | "vaalit" | "historia" | "maantieto" | "luonto";
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
  /** Tehty muokkaus, jos muu kuin pelkkä rajaus (näytetään lähdesivulla). */
  muokkaus?: string;
  /** Lähdesivu, jos kuva ei ole Wikimedia Commonsista (esim. Finna); muuten linkki muodostetaan tiedostonimestä. */
  lahdeUrl?: string;
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
  { slug: "nylon-beat-visa-vuosikymmenen-hitit", kokoelma: "musiikki", kuvaus: "Nylon Beat esiintymässä Suomipop-festivaalilla, Jyväskylä 13.7.2018", tiedosto: "Nylonbeat 20180713.jpg", tekija: "Frozenmadness", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2018" },
  { slug: "pmmp-visa-rusketusraidat", kokoelma: "musiikki", kuvaus: "PMMP, Ilosaarirock 2012", tiedosto: "PMMP - Ilosaarirock 2012.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2012" },
  { slug: "post-malone-visa-tunnetko-tahden", kokoelma: "musiikki", kuvaus: "Post Malone, Chicago 2020", tiedosto: "Post Malone in Chicago 2020.jpg", tekija: "Adam Bielawski", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2020" },
  { slug: "rihanna-visa-tunnetko-tahden", kokoelma: "musiikki", kuvaus: "Rihanna, Last Girl on Earth Tour 2010", tiedosto: "Rihanna - Last Girl on Earth Tour Live At MSG.jpg", tekija: "dephisticate", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2010" },
  { slug: "robin-visa-frontside-ollie", kokoelma: "musiikki", kuvaus: "Robin Packalen, Ilosaarirock 2015", tiedosto: "Robin - Ilosaarirock 2015 01.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2015" },
  { slug: "sanni-visa-prinsessoja-astronautteja", kokoelma: "musiikki", kuvaus: "SANNI, Ilosaarirock 2016", tiedosto: "Sanni - Ilosaarirock 2016 - 06.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2016" },
  { slug: "taylor-swift-visa-tunnetko-supertahden", kokoelma: "musiikki", kuvaus: "Taylor Swift lavalla 2016", tiedosto: "Taylor Swift Performance (31592454132).jpg", tekija: "el_ave (Flickr)", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2016" },
  { slug: "ultra-bra-tietovisa", kokoelma: "musiikki", kuvaus: "Ultra Bra lavalla 1997", tiedosto: "Ultra Bra 1997.tif", tekija: "Tuomas Jääskeläinen", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "1997" },
  // Suomipop, iskelmä ja suomirock (24.9.2026) — lisenssit tarkistettu Commonsin API:sta.
  { slug: "suvi-terasniska-visa-iskelmatahti", kokoelma: "musiikki", kuvaus: "Suvi Teräsniska 2010", tiedosto: "Suviterasniska.jpg", tekija: "Motopark", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2010" },
  { slug: "katri-helena-visa-iskelmalegenda", kokoelma: "musiikki", kuvaus: "Katri Helena 1993", tiedosto: "Katri-Helena-1993.jpg", tekija: "Seppo Konstig / Eeva", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "1993" },
  { slug: "kari-tapio-visa-iskelmalegenda", kokoelma: "musiikki", kuvaus: "Kari Tapio, Helsingin musiikkimessut 2009", tiedosto: "Kari Tapio.jpg", tekija: "Soppakanuuna", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2009" },
  { slug: "kaija-koo-visa-hitit-ja-ura", kokoelma: "musiikki", kuvaus: "Kaija Koo, Rakuunarock 2013", tiedosto: "Kaija Koo - Rakuunarock 2013.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },
  { slug: "juha-tapio-visa-laulujen-tarinat", kokoelma: "musiikki", kuvaus: "Juha Tapio, Kuopio 2013", tiedosto: "Juha T.JPG", tekija: "Muumimuikkunen", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "2013" },
  { slug: "nightwish-visa-sinfoninen-metalli", kokoelma: "musiikki", kuvaus: "Floor Jansen ja Nightwish, Florida 2012", tiedosto: "Floor Jansen - Nightwish.jpg", tekija: "Luis Blanco", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2012" },
  { slug: "jenni-vartiainen-visa-hittien-takana", kokoelma: "musiikki", kuvaus: "Jenni Vartiainen, Ilosaarirock 2014", tiedosto: "Jenni Vartiainen, 2014 (cropped).jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2014" },
  { slug: "popeda-visa-manserock", kokoelma: "musiikki", kuvaus: "Popeda, Provinssirock 2013", tiedosto: "Provinssirock 20130615 - Popeda - 05.jpg", tekija: "Cecil", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },

  // ─── Kaupungit (12.9.2026) ───
  { slug: "espoo", kokoelma: "kaupungit", kuvaus: "Dipoli, Otaniemi, Espoo", tiedosto: "Dipoli11.jpg", tekija: "Halaszo", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2017" },
  { slug: "hameenlinna", kokoelma: "kaupungit", kuvaus: "Hämeen linna", tiedosto: "Häme Castle (23499025921).jpg", tekija: "দেবর্ষি রায় (Debarshi Ray)", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2015" },
  { slug: "hero", kokoelma: "vaalit", kuvaus: "Eduskuntatalo, Helsinki (Vaalit ja politiikka -kokoelman pääkuva)", tiedosto: "Eduskuntatalo Helsinki 2022-09-16 10.jpg", tekija: "Leonhard Lenz", lisenssi: "CC0", lisenssiUrl: "https://creativecommons.org/publicdomain/zero/1.0/", vuosi: "2022", muokkaus: "violetti duotone, rajaus" },
  // Eduskuntavaalivisat (Heikin valinnat 6.10.2026). Kuvat public/20/vaalit/visat/<slug>.webp (1600×900).
  { slug: "eduskuntatalo-graniittia-pylvaita-ja-salaisia-istuntoja", kokoelma: "vaalit", kuvaus: "Eduskunnan täysistuntosali", tiedosto: "Eduskunnan täysistuntosali 2022 (202311;+G71820).jpg", tekija: "Pekka Vyhtinen", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "2022" },
  { slug: "punakynasta-aaniharavaan-eduskuntavaalien-historia", kokoelma: "vaalit", kuvaus: "Ensimmäiset eduskuntavaalit 15.–16.3.1907: vaalitoimitus Jyväskylässä", tiedosto: "Eduskuntavaalit 15-16.3.1907- Vaalitoimitus - N251222 - hkm.HKMS000005-000008jk.jpg", tekija: "Tuntematon / Helsingin kaupunginmuseo", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "1907" },
  { slug: "suomen-hallitukset-ennatyksia-lempinimia-ja-kriiseja", kokoelma: "vaalit", kuvaus: "Karjalaisen II hallituksen viimeinen istunto, keskellä presidentti Kekkonen", tiedosto: "Karjalainen-II-Cabinet.jpg", tekija: "Pekka Haraste / Lehtikuva", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1971" },
  { slug: "vaalikopissa-tunnetko-suomalaisen-vaalitavan", kokoelma: "vaalit", kuvaus: "Äänestyslippu vaaliuurnaan vuoden 2019 eduskuntavaaleissa", tiedosto: "Election voting 20190414.jpg", tekija: "Santeri Viinamäki", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2019" },
  // Historian visat Vaalit ja politiikka -hubissa (Heikin valinnat 6.10.2026). Kuvat public/20/historia/<slug>.webp
  // (1600×900); muotokuvissa koko kuva + saman kuvan sumennettu jatke sivuilla.
  { slug: "suomen-presidentit-visa", kokoelma: "historia", kuvaus: "Presidentinlinna, Helsinki", tiedosto: "The Presidential Palace, Helsinki, Finland 05.jpg", tekija: "Paasikivi", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2016" },
  { slug: "suomen-itsenaistyminen-visa", kokoelma: "historia", kuvaus: "Svinhufvudin senaatti istunnossa 27.11.1917", tiedosto: "Senate1917.jpg", tekija: "Tuntematon / Museovirasto", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1917" },
  { slug: "autonomian-aika-visa", kokoelma: "historia", kuvaus: "Porvoon valtiopäivät 1809, Emanuel Thelningin maalaus", tiedosto: "Porvoon valtiopäivät 1809 by Emanuel Thelning.jpg", tekija: "Emanuel Thelning", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1812" },
  { slug: "kekkosen-suomi-kylma-sota-idansuhteet", kokoelma: "historia", kuvaus: "Presidentti Urho Kekkonen", tiedosto: "Urho-Kekkonen-1977-c.jpg", tekija: "Kuvasiskot / Museovirasto", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "1977", muokkaus: "koko kuva + sumennettu jatke sivuilla" },
  { slug: "mannerheim-visa", kokoelma: "historia", kuvaus: "Marsalkka C. G. E. Mannerheim", tiedosto: "Carl Gustaf Emil Mannerheim.png", tekija: "SA-kuva", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1940-luku", muokkaus: "koko kuva + sumennettu jatke sivuilla" },
  { slug: "suomi-1980-luvulla", kokoelma: "historia", kuvaus: "Union-huoltoasema yöllä Helsingissä", tiedosto: "Union petrol station at night in Helsinki, 1980s.jpg", tekija: "Harri Ahola / Helsingin kaupunginmuseo", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "1980-luku" },
  { slug: "etusivu-historia", kokoelma: "historia", kuvaus: "Turun linna (etusivun Historia-kortti)", tiedosto: "Turku Castle in September 2024.jpg", tekija: "Christian David", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2024" },
  // Maantieto: Suomen majakat -visa ja etusivun Maantieto-kortti (Heikki 6.10.2026, AI-kuvan tilalle).
  { slug: "suomen-majakat", kokoelma: "maantieto", kuvaus: "Bengtskärin majakka, Kemiönsaari", tiedosto: "Bengtskär lighthouse 2023.jpg", tekija: "Janne Räkköläinen", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2023" },
  // Luonto (Heikki 6.10.2026): oikeat valokuvat AI-kuvien tilalle, public/20/luonto/<slug>.webp (1600×900).
  { slug: "etusivu-luonto", kokoelma: "luonto", kuvaus: "Revontulet Saanan yllä, Kilpisjärvi (etusivun Luonto-kortti)", tiedosto: "Aurora borealis over Saana fell.jpg", tekija: "WikiLucas00", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2020" },
  { slug: "jarvien-katketyt-ihmeet-visa", kokoelma: "luonto", kuvaus: "Luosujärvi ja Ylläs, Kolari", tiedosto: "Luosujärvi lake and Ylläs fell in Kolari, Lapland, Finland, 2021 June.jpg", tekija: "Ximonic (Simo Räsänen)", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2021" },
  { slug: "tiedatko-metsosta-kaiken", kokoelma: "luonto", kuvaus: "Soidinmetso", tiedosto: "Tetrao urogallus (mating display) (26738644457).jpg", tekija: "Tero Laakso", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2018" },
  { slug: "suomen-kansallispuistot-visa", kokoelma: "luonto", kuvaus: "Kolin kansallispuisto, näkymä Pielisjärvelle", tiedosto: "Koli National Park, Finland (52159129197).jpg", tekija: "Ninara", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2022" },
  { slug: "karhu-suomen-metsien-kuningas", kokoelma: "luonto", kuvaus: "Karhu, Viiksimo, Kainuu", tiedosto: "Brown bear (Ursus arctos), Viiksimo, Kainuu region, Finland (29058988558).jpg", tekija: "Frank Vassen", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2018" },
  { slug: "kuikka-visa", kokoelma: "luonto", kuvaus: "Kuikka", tiedosto: "Gavia arctica 431603954.jpg", tekija: "Jan Ebr & Ivana Ebrová", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "2024" },
  { slug: "merikotka-visa", kokoelma: "luonto", kuvaus: "Lentävä merikotka", tiedosto: "Merikotka lentää taivaalla.jpg", tekija: "Sasuki 888", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2016" },
  { slug: "naali-tunturien-salaperainen-kettu", kokoelma: "luonto", kuvaus: "Naali talviturkissa", tiedosto: "Vulpes lagopus in Iceland.jpg", tekija: "Jonatan Pie", lisenssi: "CC0", lisenssiUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
  { slug: "suomen-hyonteiset-pienen-vaen-suuret-temput", kokoelma: "luonto", kuvaus: "Nokkosperhonen", tiedosto: "Aglais urticae LC0310.jpg", tekija: "Jörg Hempel", lisenssi: "CC BY-SA 3.0 de", lisenssiUrl: CC("by-sa/3.0/de"), vuosi: "2013" },
  { slug: "suomen-kalat-visa", kokoelma: "luonto", kuvaus: "Ahven (täytetty näyte)", tiedosto: "Perche commune perca fluviatilis Alfort.jpg", tekija: "Jebulon", lisenssi: "CC0", lisenssiUrl: "https://creativecommons.org/publicdomain/zero/1.0/", vuosi: "2001" },
  { slug: "suomen-kasvit-myrkkyja-taikaa-ja-pelastavia-jauhoja", kokoelma: "luonto", kuvaus: "Vanamo", tiedosto: "Linnaea borealis 8803.JPG", tekija: "Walter Siegmund", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0") },
  { slug: "suomen-linnut-visa", kokoelma: "luonto", kuvaus: "Kyhmyjoutsenen poikanen, Helsinki", tiedosto: "CygnusOlorJuvenile.jpg", tekija: "Thermos", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2007" },
  { slug: "suomen-marjat-visa", kokoelma: "luonto", kuvaus: "Hilla (lakka)", tiedosto: "Cloudberry (3803708355).jpg", tekija: "Randi Hausken", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2009" },
  { slug: "suomen-matelijat-ja-sammakot-selviytyjien-salaisuudet", kokoelma: "luonto", kuvaus: "Kyy", tiedosto: "Common European viper (Vipera berus) female Pieniny.jpg", tekija: "Charles J. Sharp", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2024" },
  { slug: "suomen-pollot-yon-aanettomat-mestarit", kokoelma: "luonto", kuvaus: "Lapinpöllö", tiedosto: "Bartkauz (Strix nebulosa) - Weltvogelpark Walsrode 2012-001.jpg", tekija: "Olaf Oliviero Riemer", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2012" },
  { slug: "suomen-sienet-visa", kokoelma: "luonto", kuvaus: "Kantarelli", tiedosto: "2007-07-14 Cantharellus cibarius.jpg", tekija: "Andreas Kunze", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2007" },
  { slug: "suomen-suot-visa", kokoelma: "luonto", kuvaus: "Pallastunturi ja Hanhijärven suo, Muonio", tiedosto: "Pallastunturi and Hanhijärvi in Muonio, Lapland, Finland, 2023 September.jpg", tekija: "Ximonic (Simo Räsänen)", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2023" },
  { slug: "suomen-suurpedot-visa-tunnetko-huippupedot", kokoelma: "luonto", kuvaus: "Ilveksen pentu", tiedosto: "Lynx kitten.jpg", tekija: "Bernard Landgraf", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0") },
  { slug: "itameri-visa", kokoelma: "luonto", kuvaus: "Auringonlasku Itämerellä", tiedosto: "Sunset on the Baltic Sea - Finland - panoramio (1).jpg", tekija: "Sergey Ashmarin", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0") },
  { slug: "tunturin-salainen-elama-lappi-visa", kokoelma: "luonto", kuvaus: "Saana ruskan aikaan, Kilpisjärvi", tiedosto: "Saana fell in Finnish Lapland, 2021 September.jpg", tekija: "Ninara", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2021" },
  { slug: "revontulet-tiedatko-mista-ne-tulevat", kokoelma: "luonto", kuvaus: "Revontulet Saanan yllä, Kilpisjärvi", tiedosto: "Aurora borealis over Saana fell.jpg", tekija: "WikiLucas00", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2020" },
  { slug: "saimaan-norppa", kokoelma: "luonto", kuvaus: "Saimaannorppa, Rantasalmi", tiedosto: "Pusa hispida saimensis 431602934.jpg", tekija: "Jan Ebr & Ivana Ebrová", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "2024" },
  { slug: "helsinki", kokoelma: "kaupungit", kuvaus: "Senaatintori, Helsinki", tiedosto: "Helsinki Senate Square Terrace East 2020-07-01.jpg", tekija: "JoAlanen", lisenssi: "CC0", lisenssiUrl: "https://creativecommons.org/publicdomain/zero/1.0/", vuosi: "2020" },
  { slug: "joensuu", kokoelma: "kaupungit", kuvaus: "Joensuun kaupungintalo (Eliel Saarinen)", tiedosto: "Joensuu Town Hall 1.jpg", tekija: "Tomisti", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0") },
  { slug: "jyvaskyla", kokoelma: "kaupungit", kuvaus: "Jyväskylän satama", tiedosto: "Jyväskylä harbour.jpg", tekija: "Roland Struwe", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2008" },
  { slug: "kouvola", kokoelma: "kaupungit", kuvaus: "Pyhän Ristin kirkko, Kouvola", tiedosto: "Kouvolan pyhän ristin kirkko.jpg", tekija: "Motopark", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },
  { slug: "kuopio", kokoelma: "kaupungit", kuvaus: "Kuopion kauppahalli", tiedosto: "Kuopio Market Hall (Market Square, Kuopio, Finland) Aug 25, 2026.jpg", tekija: "Lasse Keskinen", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "2026" },
  { slug: "lahti", kokoelma: "kaupungit", kuvaus: "Salpausselän hyppyrimäet, Lahti", tiedosto: "Lahti skijumps.jpg", tekija: "sdbj", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2005" },
  { slug: "lappeenranta", kokoelma: "kaupungit", kuvaus: "Lappeenrannan satama", tiedosto: "Lappeenranta harbour.JPG", tekija: "MKFI", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "2011" },
  { slug: "mikkeli", kokoelma: "kaupungit", kuvaus: "Mikkelin tuomiokirkko Hallituskadulta", tiedosto: "Hallituskatu - Mikkeli Cathedral.jpg", tekija: "Tiia Monto", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2018" },
  { slug: "oulu", kokoelma: "kaupungit", kuvaus: "Toripolliisi, Oulun kauppatori", tiedosto: "Toripolliisi 2026.jpg", tekija: "Alphaios", lisenssi: "CC0", lisenssiUrl: "https://creativecommons.org/publicdomain/zero/1.0/", vuosi: "2026" },
  { slug: "pori", kokoelma: "kaupungit", kuvaus: "Yyterin hiekkaranta, Pori", tiedosto: "Yyteri beach (45572598264).jpg", tekija: "kooikkari", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2018" },
  { slug: "porvoo", kokoelma: "kaupungit", kuvaus: "Porvoon vanhat rantamakasiinit", tiedosto: "Old Porvoo riverside.jpg", tekija: "kallerna", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2010" },
  { slug: "rovaniemi", kokoelma: "kaupungit", kuvaus: "Jätkänkynttilä-silta ja Kemijoki, Rovaniemi", tiedosto: "Jätkänkynttilä Bridge 5.jpg", tekija: "kallerna", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2022" },
  /* Jääkiekko (1.10.2026): Satakunnan derbyn visakuva, rajattu (public/20/jaakiekko/jk-derby-satakunta-2019c.webp).
     Kuvassa näkyvät molemmat joukkueet: Ässät kiittää yleisöä, Lukon pelaajat taustalla. */
  { slug: "sm-liiga-satakunnan-derby-assat-lukko", kokoelma: "jaakiekko", kuvaus: "Satakunnan derby: Ässät kiittää yleisöä, Lukko–Ässät Äijänsuolla 30.11.2019", tiedosto: "Lukko-Ässät 30-11-19 23.jpg", tekija: "kallerna", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2019" },
  /* Tampereen derbyn visakuva (1.10.2026): Nokia Arenan avausottelu Tappara–Ilves 3.12.2021, rajattu
     (public/20/jaakiekko/jk-derby-manse-2021.webp). */
  { slug: "sm-liiga-tampereen-derby-ilves-tappara", kokoelma: "jaakiekko", kuvaus: "Tampereen derby: aloitus Nokia Arenan avausottelussa Tappara–Ilves 3.12.2021", tiedosto: "Nokia Arenan avajaiset 15.jpg", tekija: "kallerna", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2021" },
  /* Stadin derbyn visakuva (1.10.2026): Jokerit–HIFK 1971, public domain (suomalainen valokuva,
     suoja-aika 50 v päättynyt). Rajattu ja skaalattu (public/20/jaakiekko/jk-derby-stadi-1971.webp). */
  { slug: "sm-liiga-stadin-derby-hifk-jokerit", kokoelma: "jaakiekko", kuvaus: "Stadin derby: Timo Sutinen (Jokerit) HIFK:ta vastaan 1971", tiedosto: "Timo Sutinen Jokerit 1971.jpg", tekija: "Heikki Wegelius", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1971" },
  /* Joukkuevisat + Jääkiekko-kokoelman seurakortit (1.10.2026), public/20/jaakiekko/jk-<seura>-kuva.webp.
     Pystykuvat (Ilves, JYP, Pelicans, Kiekko-Espoo): koko kuva + sivuille sumennettu jatke samasta kuvasta. */
  { slug: "tappara-tampere-kirvesrinnat-tietovisa", kokoelma: "jaakiekko", kuvaus: "Tappara Nokia Arenan avausottelussa 3.12.2021", tiedosto: "Nokia Arenan avajaiset 30.jpg", tekija: "kallerna", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2021" },
  { slug: "ilves-tampere-keltamustat-tietovisa", kokoelma: "jaakiekko", kuvaus: "Raimo Helminen Ilveksen vuoden 1985 retropaidassa 2008", tiedosto: "Helminen Raimo Vintage Jersey.jpg", tekija: "Saruwine", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2008", muokkaus: "rajattu, sivuille sumennettu jatke samasta kuvasta" },
  { slug: "tps-turku-jaakiekko-tietovisa", kokoelma: "jaakiekko", kuvaus: "Marko Kiprusoff, TPS 2008", tiedosto: "Kiprusoff Marko TPS.jpg", tekija: "Saruwine", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2008" },
  { slug: "karpat-tietovisa-legendat", kokoelma: "jaakiekko", kuvaus: "Juha-Pekka Haataja, Kärpät 2012", tiedosto: "Juha-Pekka Haataja 2012.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2012" , muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "hifk-helsinki-punavalkoiset-tietovisa", kokoelma: "jaakiekko", kuvaus: "Siim Liivik, HIFK 2010", tiedosto: "Siim Liivik.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2010" },
  { slug: "jokerit-helsinki-liigahistoria-tietovisa", kokoelma: "jaakiekko", kuvaus: "Jokerit juhlii pudotuspelivoittoa 2026", tiedosto: "Jokerit Heksinki.jpg", tekija: "Quintin Soloviev", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "2026" },
  { slug: "assat-isomaen-ukkoset-tietovisa", kokoelma: "jaakiekko", kuvaus: "Ässät juhlii voittoa 2023", tiedosto: "Ässät victory celebration 03-01 2023.jpg", tekija: "Kilaseell", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2023" },
  { slug: "hpk-rinkelinmaen-ritarit-tietovisa", kokoelma: "jaakiekko", kuvaus: "HPK Tampere Cupissa 2021", tiedosto: "Ilves vs HPK Tampere Cup 2021 2.jpg", tekija: "Piquito", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2021" },
  { slug: "rauman-lukko-visa", kokoelma: "jaakiekko", kuvaus: "Lukko Champions Hockey Leaguessa 2025", tiedosto: "2025-09-05 Eisbären Berlin gegen Lukko Rauma (Champions Hockey League 2025-26) by Sandro Halank–021.jpg", tekija: "Sandro Halank", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2025" , muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "jyp-hippoksen-hurmaa-tietovisa", kokoelma: "jaakiekko", kuvaus: "Sinuhe Wallinheimo, JYP 2007", tiedosto: "Wallinheimo Sinuhe JYP.jpg", tekija: "Saruwine", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2007", muokkaus: "rajattu, sivuille sumennettu jatke samasta kuvasta" },
  { slug: "kalpa-niiralan-montun-kovin-tietovisa", kokoelma: "jaakiekko", kuvaus: "Jukka Hentunen, KalPa 2011", tiedosto: "Jukka Hentunen - KalPa 2011.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2011" , muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "pelicans-kolme-kertaa-hopealla-tietovisa", kokoelma: "jaakiekko", kuvaus: "Jyri Marttinen, Pelicans 2011", tiedosto: "Marttinen Jyri Pelicans 2011 1.jpg", tekija: "Saruwine", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2011", muokkaus: "rajattu, sivuille sumennettu jatke samasta kuvasta" },
  { slug: "saipa-saimaan-syketta-tietovisa", kokoelma: "jaakiekko", kuvaus: "Miikka Salomäki, SaiPa 2026", tiedosto: "Miikka Salomäki SaiPa Hockey Player.jpg", tekija: "Alluvisuals", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "2026" },
  { slug: "kookoo-kiekko-kimpassa-tietovisa", kokoelma: "jaakiekko", kuvaus: "Kärpät–KooKoo, Oulun jäähalli 2023", tiedosto: "Kärpät vs KooKoo 20230222 02.jpg", tekija: "Estormiz", lisenssi: "CC0", lisenssiUrl: "https://creativecommons.org/publicdomain/zero/1.0/", vuosi: "2023" },
  { slug: "sport-punavalkoinen-tarina-tietovisa", kokoelma: "jaakiekko", kuvaus: "Sport–Lukko 2022", tiedosto: "Ice Hockey , Vaasan Sport vs. Rauman Lukko.jpg", tekija: "Tero Lahtinen", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2022" },
  { slug: "jukurit-sisasavolaista-sisua-tietovisa", kokoelma: "jaakiekko", kuvaus: "Jukurit–KalPa, Mikkeli 2016", tiedosto: "2016 12 24 Suomi (14).jpg", tekija: "Pruthus", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2016" },
  { slug: "kiekko-espoo-tuhkasta-liigaan-tietovisa", kokoelma: "jaakiekko", kuvaus: "Stefan Öhman, Espoo Blues 2010", tiedosto: "Stefan Öhman of the Espoo Blues - 20100302.jpg", tekija: "Vieldor", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2010", muokkaus: "rajattu, sivuille sumennettu jatke samasta kuvasta" },
  /* Leijonat- ja NHL-visat + Jääkiekko-kokoelman kortit (2.10.2026), public/20/jaakiekko/jk-{leijonat,nhl}-*-kuva.webp. */
  { slug: "leijonat-mm-1995-kulta", kokoelma: "jaakiekko", kuvaus: "MM-kultajuhlat Esplanadilla 7.5.1995", tiedosto: "Jaakiekon-MM-juhlintaa-1995.jpg", tekija: "Matti Niemi / Helsingin kaupunginmuseo", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "1995" },
  { slug: "leijonat-mm-2011-kulta", kokoelma: "jaakiekko", kuvaus: "Mikael Granlund ja Teemu Lassila MM-kultajuhlissa 2011", tiedosto: "2011 IIHF World Championship gold medal celebrations in Helsinki – Mikael Granlund.jpg", tekija: "Tuomas Puikkonen", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2011" },
  { slug: "leijonat-mm-2019-kulta", kokoelma: "jaakiekko", kuvaus: "MM-kultajuhlat Kauppatorilla 2019", tiedosto: "Torille001.jpg", tekija: "Kissa21782", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2019" },
  { slug: "leijonat-mm-2022-kulta", kokoelma: "jaakiekko", kuvaus: "MM-kultajuhlat Kauppatorilla 2022", tiedosto: "Ice hockey celebrations getting intense on the Market Square tram stop in Kaartinkaupunki, Helsinki, Finland, 2022 May.jpg", tekija: "Ximonic (Simo Räsänen)", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2022" },
  { slug: "leijonat-mm-2026-kulta", kokoelma: "jaakiekko", kuvaus: "Suomi–Iso-Britannia, MM 2026 Zürich", tiedosto: "IIHF World Championships 2026 in Zürich 23 09 15 145000.jpeg", tekija: "Albinfo", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2026" },
  { slug: "suomalaiset-nhl-pioneerit", kokoelma: "jaakiekko", kuvaus: "Suomen maajoukkueen pelaajia 1969", tiedosto: "Finland-icehockey-team-1969.jpg", tekija: "Tuntematon / Helsingin Sanomat", lisenssi: "Public domain", lisenssiUrl: "", vuosi: "1969" },
  { slug: "suomalaiset-nhl-ennatykset", kokoelma: "jaakiekko", kuvaus: "Teemu Selänne, Vancouverin olympialaiset 2010", tiedosto: "TeemuSelanne2010WinterOlympics.jpg", tekija: "s.yume", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2010", muokkaus: "rajattu, sivuille sumennettu jatke samasta kuvasta" },
  { slug: "suomalaiset-nhl-kuriositeetit", kokoelma: "jaakiekko", kuvaus: "NHL-kauden avausottelu Helsingissä 2010", tiedosto: "NHL 2010 Face Off Hurricanes @ Wild in Helsinki.jpg", tekija: "Saruwine", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2010" },
  /* Liigan yleisvisat + kokoelman kortit (2.10.2026), public/20/jaakiekko/jk-liiga-*-kuva.webp. Moberg-kuva Finnasta. */
  { slug: "sm-liiga-maalivahtilegendat", kokoelma: "jaakiekko", kuvaus: "Juuso Riksman, HIFK 2011", tiedosto: "Juuso Riksman 2011.jpg", tekija: "JimmyK", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2011", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "sm-liiga-kaikkien-aikojen-pistekuninkaat", kokoelma: "jaakiekko", kuvaus: "Raimo Helminen (Ilves) ja Eetu Holma (SaiPa) 2007", tiedosto: "Helminen Raimo (Ilves) + Holma Eetu (SaiPa).jpg", tekija: "Saruwine", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2007", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "sm-liiga-finaalidraamat", kokoelma: "jaakiekko", kuvaus: "Kanada-malja, Liigan mestaruuspokaali", tiedosto: "Kanada-malja (Liiga) 2023.jpg", tekija: "Lasse Keskinen", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2023", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "sm-liiga-valmentajadraamat-tulisielut", kokoelma: "jaakiekko", kuvaus: "Kari Jalonen 2012", tiedosto: "Kari Jalonen.JPG", tekija: "Artem Korzhimanov", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2012", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "sm-liiga-ulkomaalaisvahvistukset", kokoelma: "jaakiekko", kuvaus: "Dale McTavish, SaiPa 2010", tiedosto: "Dale McTavish 2.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2010", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "sm-liigan-legendaariset-pomot-visa", kokoelma: "jaakiekko", kuvaus: "Timo Haapaniemi, Aimo Mäkinen, Göran Stubb ja Frank Moberg 1973", tiedosto: "Timo Haapaniemi, Aimo Mäkinen, Göran Stubb ja Frank Moberg", tekija: "Tuntematon kuvaaja / Museovirasto, JOKA (HBL)", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "1973", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta", lahdeUrl: "https://www.finna.fi/Record/museovirasto.97c0abc2-b001-434b-b389-827da3c5613b" },
  { slug: "sm-liiga-ikonisimmat-maalitykit", kokoelma: "jaakiekko", kuvaus: "Vesa Viitakoski, Kärpät 2009", tiedosto: "Vesa Viitakoski 2.jpg", tekija: "Javatyk", lisenssi: "CC BY 3.0", lisenssiUrl: CC("by/3.0"), vuosi: "2009", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "sm-liiga-jaahykuninkaat-kovanaamat", kokoelma: "jaakiekko", kuvaus: "Jarkko Ruutu, Jokerit 2013", tiedosto: "Jarkko Ruutu 2013 1.jpg", tekija: "Tuomas Vitikainen", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "sm-liiga-tuomarilegendat", kokoelma: "jaakiekko", kuvaus: "Tom Laaksonen ja Jussi Terho 2007", tiedosto: "Laaksonen Tom & Terho Jussi.jpg", tekija: "Saruwine", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2007", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "leijonat-olympiakulta-2022", kokoelma: "jaakiekko", kuvaus: "Mikko Lehtonen Suomen paidassa 2017", tiedosto: "2017 C1C - FIN v KOR - Mikko Lehtonen (born 1994).jpg", tekija: "Voltmetro (Oleg Bkhambri)", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2017", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "nuoret-leijonat-mm-2014-kulta", kokoelma: "jaakiekko", kuvaus: "Karri Kivi 2019", tiedosto: "Karri Kivi.png", tekija: "Sampo Anttila", lisenssi: "CC BY 3.0", lisenssiUrl: CC("by/3.0"), vuosi: "2019", muokkaus: "pysäytyskuva videosta, pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "nuoret-leijonat-mm-2016-kulta", kokoelma: "jaakiekko", kuvaus: "Jesse Puljujärvi nuorten MM-kisoissa 2016", tiedosto: "Jesse-Puljujärvi.jpg", tekija: "Oonanur", lisenssi: "CC BY-SA 4.0", lisenssiUrl: CC("by-sa/4.0"), vuosi: "2016", muokkaus: "suurennettu, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "nuoret-leijonat-mm-2019-kulta", kokoelma: "jaakiekko", kuvaus: "Kaapo Kakko, Seattle Kraken 2025", tiedosto: "Kakko 1st 3 12 (54383609894).jpg", tekija: "Jenn G", lisenssi: "CC BY-SA 2.0", lisenssiUrl: CC("by-sa/2.0"), vuosi: "2025", muokkaus: "pienennetty, ympärillä sumennettu jatke samasta kuvasta" },
  { slug: "salo", kokoelma: "kaupungit", kuvaus: "Uskelan kirkko, Salo", tiedosto: "Uskela Church.jpg", tekija: "Vnnen", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2009" },
  { slug: "seinajoki", kokoelma: "kaupungit", kuvaus: "Aalto-keskus ja Lakeuden Ristin kellotorni, Seinäjoki", tiedosto: "Seinäjoki 2023.jpg", tekija: "Zache", lisenssi: "CC BY 4.0", lisenssiUrl: CC("by/4.0"), vuosi: "2023" },
  { slug: "tampere", kokoelma: "kaupungit", kuvaus: "Tampereen keskusta Näsinneulasta", tiedosto: "Tampere center from Näsinneula.jpg", tekija: "Leo-setä", lisenssi: "CC BY 2.0", lisenssiUrl: CC("by/2.0"), vuosi: "2011" },
  { slug: "turku", kokoelma: "kaupungit", kuvaus: "Turun tuomiokirkko ja Aurajoki", tiedosto: "Kirjastosilta, Aurajoki ja Turun tuomiokirkko, kuvattuna Itäiseltä Rantakadulta, Turku, 8.12.2013.jpg", tekija: "Markus Rantala (Makele-90)", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },
  { slug: "vaasa", kokoelma: "kaupungit", kuvaus: "Vaasan kirkko ja keskusta vesitornista", tiedosto: "Vaasa Church from water tower.jpg", tekija: "Roland Struwe", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2008" },
  { slug: "vantaa", kokoelma: "kaupungit", kuvaus: "Tiedekeskus Heureka, Vantaa", tiedosto: "Heureka.jpg", tekija: "Danila Talikov", lisenssi: "CC BY-SA 3.0", lisenssiUrl: CC("by-sa/3.0"), vuosi: "2013" },
];

/** Commons-tiedostosivun osoite — lisenssiehtojen vaatima linkki lähteeseen. */
export function commonsUrl(tiedosto: string): string {
  return "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(tiedosto.replace(/ /g, "_"));
}

/** Onko kokoelmassa vapaasti lisensoituja valokuvia (→ näytetäänkö krediitti)? */
export function kokoelmanKuvalahteet(kokoelma: Kuvalahde["kokoelma"]): Kuvalahde[] {
  return KUVALAHTEET.filter((k) => k.kokoelma === kokoelma);
}
