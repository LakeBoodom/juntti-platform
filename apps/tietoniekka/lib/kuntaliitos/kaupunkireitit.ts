// KAUPUNGIN REITTI — Kuntaliitos-reitti, joka alkaa kaupunkisivun kaupungista (Heikki 8.11.2026).
// Kaupunkisivulla on kortti "Mikkelistä Vantaalle" → /peli/kuntaliitos?reitti=kaupunki-mikkeli (hero, sitten lauta).
// Sama siemen toimii jaossa, jakokuvassa (/og/reitti/kuntaliitos?reitti=kaupunki-<slug>) ja kaverivertailussa.
// Reitit on valittu arvotuista ehdokkaista (mahdollisimman suora reitti tunnettuun kaupunkiin, maalit vaihtelevat);
// otsikot on taivutettu käsin. Moottori tarkistaa jokaisen reitin (rajat + tasan yksi oikea järjestys,
// lib/reittipeli/moottori.ts reittiAlueista); virheellinen reitti → kaupunkisivu jättää kortin pois.
// Maarianhamina puuttuu: Ahvenanmaalta ei ole maarajareittiä. Tavallinen moduuli: kelpaa myös selaimeen.

export type KaupunginReitti = { otsikko: string; reitti: string[] };

export const KAUPUNKIREITIT: Record<string, KaupunginReitti> = {
  // Espoo → Vantaa → Sipoo → Porvoo → Loviisa → Kouvola → Luumäki → Lappeenranta
  espoo: { otsikko: "Espoosta Lappeenrantaan", reitti: ["049", "092", "753", "638", "434", "286", "441", "405"] },
  // Hämeenlinna → Asikkala → Heinola → Mäntyharju → Mikkeli → Juva → Sulkava → Savonlinna
  hameenlinna: { otsikko: "Hämeenlinnasta Savonlinnaan", reitti: ["109", "016", "111", "507", "491", "178", "768", "740"] },
  // Hanko → Raasepori → Lohja → Vihti → Hyvinkää → Mäntsälä → Orimattila → Lahti
  hanko: { otsikko: "Hangosta Lahteen", reitti: ["078", "710", "444", "927", "106", "505", "560", "398"] },
  // Helsinki → Espoo → Vihti → Lohja → Salo → Paimio → Kaarina → Turku
  helsinki: { otsikko: "Helsingistä Turkuun", reitti: ["091", "049", "927", "444", "734", "577", "202", "853"] },
  // Hyvinkää → Loppi → Tammela → Jokioinen → Humppila → Punkalaidun → Sastamala → Pori
  hyvinkaa: { otsikko: "Hyvinkäältä Poriin", reitti: ["106", "433", "834", "169", "103", "619", "790", "609"] },
  // Imatra → Lappeenranta → Miehikkälä → Hamina → Kotka → Pyhtää → Loviisa → Porvoo
  imatra: { otsikko: "Imatralta Porvooseen", reitti: ["153", "405", "489", "075", "285", "624", "434", "638"] },
  // Järvenpää → Tuusula → Nurmijärvi → Vihti → Siuntio → Inkoo → Raasepori → Hanko
  jarvenpaa: { otsikko: "Järvenpäästä Hankoon", reitti: ["186", "858", "543", "927", "755", "149", "710", "078"] },
  // Joensuu → Lieksa → Kuhmo → Hyrynsalmi → Puolanka → Pudasjärvi → Ranua → Rovaniemi
  joensuu: { otsikko: "Joensuusta Rovaniemelle", reitti: ["167", "422", "290", "105", "620", "615", "683", "698"] },
  // Jyväskylä → Uurainen → Saarijärvi → Karstula → Kyyjärvi → Perho → Halsua → Kokkola
  jyvaskyla: { otsikko: "Jyväskylästä Kokkolaan", reitti: ["179", "892", "729", "226", "312", "584", "074", "272"] },
  // Kajaani → Vaala → Muhos → Oulu → Ii → Simo → Keminmaa → Tornio
  kajaani: { otsikko: "Kajaanista Tornioon", reitti: ["205", "785", "494", "564", "139", "751", "241", "851"] },
  // Kirkkonummi → Espoo → Vantaa → Sipoo → Porvoo → Loviisa → Pyhtää → Kotka
  kirkkonummi: { otsikko: "Kirkkonummelta Kotkaan", reitti: ["257", "049", "092", "753", "638", "434", "624", "285"] },
  // Kokkola → Toholampi → Sievi → Haapajärvi → Pyhäjärvi → Kiuruvesi → Iisalmi → Kuopio
  kokkola: { otsikko: "Kokkolasta Kuopioon", reitti: ["272", "849", "746", "069", "626", "263", "140", "297"] },
  // Kotka → Hamina → Miehikkälä → Lappeenranta → Ruokolahti → Savonlinna → Rääkkylä → Joensuu
  kotka: { otsikko: "Kotkasta Joensuuhun", reitti: ["285", "075", "489", "405", "700", "740", "707", "167"] },
  // Kouvola → Iitti → Orimattila → Mäntsälä → Hyvinkää → Vihti → Lohja → Salo
  kouvola: { otsikko: "Kouvolasta Saloon", reitti: ["286", "142", "560", "505", "106", "927", "444", "734"] },
  // Kuopio → Suonenjoki → Pieksämäki → Kangasniemi → Joutsa → Hartola → Heinola → Lahti
  kuopio: { otsikko: "Kuopiosta Lahteen", reitti: ["297", "778", "593", "213", "172", "081", "111", "398"] },
  // Lahti → Hollola → Hämeenlinna → Valkeakoski → Lempäälä → Vesilahti → Sastamala → Pori
  lahti: { otsikko: "Lahdesta Poriin", reitti: ["398", "098", "109", "908", "418", "922", "790", "609"] },
  // Lappeenranta → Luumäki → Kouvola → Heinola → Sysmä → Kuhmoinen → Orivesi → Tampere
  lappeenranta: { otsikko: "Lappeenrannasta Tampereelle", reitti: ["405", "441", "286", "111", "781", "291", "562", "837"] },
  // Lohja → Tammela → Urjala → Vesilahti → Nokia → Ylöjärvi → Kihniö → Seinäjoki
  lohja: { otsikko: "Lohjalta Seinäjoelle", reitti: ["444", "834", "887", "922", "536", "980", "250", "743"] },
  // Mikkeli → Mäntyharju → Heinola → Lahti → Orimattila → Mäntsälä → Tuusula → Vantaa
  mikkeli: { otsikko: "Mikkelistä Vantaalle", reitti: ["491", "507", "111", "398", "560", "505", "858", "092"] },
  // Naantali → Masku → Mynämäki → Pöytyä → Loimaa → Humppila → Urjala → Hämeenlinna
  naantali: { otsikko: "Naantalista Hämeenlinnaan", reitti: ["529", "481", "503", "636", "430", "103", "887", "109"] },
  // Nurmijärvi → Hyvinkää → Mäntsälä → Orimattila → Lahti → Heinola → Mäntyharju → Mikkeli
  nurmijarvi: { otsikko: "Nurmijärveltä Mikkeliin", reitti: ["543", "106", "505", "560", "398", "111", "507", "491"] },
  // Oulu → Ii → Simo → Tervola → Rovaniemi → Sodankylä → Inari → Utsjoki
  oulu: { otsikko: "Oulusta Utsjoelle", reitti: ["564", "139", "751", "845", "698", "758", "148", "890"] },
  // Pori → Ulvila → Harjavalta → Eura → Mynämäki → Masku → Raisio → Turku
  pori: { otsikko: "Porista Turkuun", reitti: ["609", "886", "079", "050", "503", "481", "680", "853"] },
  // Porvoo → Loviisa → Kouvola → Mäntyharju → Mikkeli → Pieksämäki → Suonenjoki → Kuopio
  porvoo: { otsikko: "Porvoosta Kuopioon", reitti: ["638", "434", "286", "507", "491", "593", "778", "297"] },
  // Rauma → Eura → Pöytyä → Marttila → Salo → Lohja → Siuntio → Kirkkonummi
  rauma: { otsikko: "Raumalta Kirkkonummelle", reitti: ["684", "050", "636", "480", "734", "444", "755", "257"] },
  // Rovaniemi → Ranua → Pudasjärvi → Puolanka → Ristijärvi → Sotkamo → Rautavaara → Kuopio
  rovaniemi: { otsikko: "Rovaniemeltä Kuopioon", reitti: ["698", "683", "615", "620", "697", "765", "687", "297"] },
  // Salo → Somero → Jokioinen → Humppila → Urjala → Vesilahti → Pirkkala → Tampere
  salo: { otsikko: "Salosta Tampereelle", reitti: ["734", "761", "169", "103", "887", "922", "604", "837"] },
  // Savonlinna → Liperi → Polvijärvi → Juuka → Nurmes → Kuhmo → Suomussalmi → Kuusamo
  savonlinna: { otsikko: "Savonlinnasta Kuusamoon", reitti: ["740", "426", "607", "176", "541", "290", "777", "305"] },
  // Seinäjoki → Virrat → Ruovesi → Orivesi → Kuhmoinen → Sysmä → Heinola → Kouvola
  seinajoki: { otsikko: "Seinäjoelta Kouvolaan", reitti: ["743", "936", "702", "562", "291", "781", "111", "286"] },
  // Tampere → Pirkkala → Vesilahti → Urjala → Humppila → Jokioinen → Somero → Lohja
  tampere: { otsikko: "Tampereelta Lohjalle", reitti: ["837", "604", "922", "887", "103", "169", "761", "444"] },
  // Turku → Kaarina → Paimio → Salo → Lohja → Vihti → Nurmijärvi → Tuusula
  turku: { otsikko: "Turusta Tuusulaan", reitti: ["853", "202", "577", "734", "444", "927", "543", "858"] },
  // Tuusula → Mäntsälä → Orimattila → Iitti → Kouvola → Luumäki → Lappeenranta → Imatra
  tuusula: { otsikko: "Tuusulasta Imatralle", reitti: ["858", "505", "560", "142", "286", "441", "405", "153"] },
  // Vaasa → Isokyrö → Seinäjoki → Alavus → Ähtäri → Multia → Petäjävesi → Jyväskylä
  vaasa: { otsikko: "Vaasasta Jyväskylään", reitti: ["905", "152", "743", "010", "989", "495", "592", "179"] },
  // Vantaa → Tuusula → Hyvinkää → Hausjärvi → Hämeenlinna → Pälkäne → Kangasala → Tampere
  vantaa: { otsikko: "Vantaalta Tampereelle", reitti: ["092", "858", "106", "086", "109", "635", "211", "837"] },
};

const SIEMEN = /^kaupunki-([a-z]+)$/;
export const kaupunginSiemen = (slug: string) => `kaupunki-${slug}`;
/** ?reitti=kaupunki-mikkeli → kaupungin reitti, muuten null. */
export const kaupunginReittiSiemenesta = (siemen: string | null) => {
  const slug = siemen ? SIEMEN.exec(siemen)?.[1] : null;
  return slug ? KAUPUNKIREITIT[slug] ?? null : null;
};
