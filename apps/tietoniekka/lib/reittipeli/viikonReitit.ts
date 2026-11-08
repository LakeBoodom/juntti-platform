// VIIKON REITTI — reittipelien hero (CD "Reittipelit intro v0.2", kierros 3; Heikki 1.11.2026).
// Heron reitti pysyy samana koko viikon (ma 00.00 – su 24.00 Suomen aikaa), joten otsikon taivutukset
// ("Portugalista Viroon") on kirjoitettu ja tarkistettu käsin eikä kantaan tarvita sijamuotoja.
// Reitit on valittu arvotuista ehdokkaista: tunnetut päätepisteet, vaihtelevat alueet. Moottori
// tarkistaa jokaisen reitin (rajat + tasan yksi oikea järjestys, moottori.ts reittiAlueista).
// Kun lista loppuu, hero arpoo viikon reitin siemenellä ja otsikko on perusmuodossa.
// Lisää uudet viikot listan loppuun (alkaa = maanantai). Tavallinen moduuli: kelpaa myös selaimeen.

import { kaupunginReittiSiemenesta } from "@/lib/kuntaliitos/kaupunkireitit";

export type ViikonReitti = { alkaa: string; otsikko: string; reitti: string[] };

export const VIIKON_REITIT: Record<"rajanaapurit" | "kuntaliitos" | "osavaltiot", ViikonReitti[]> = {
  rajanaapurit: [
    // Kanada → Yhdysvallat → Meksiko → Guatemala → Honduras → Nicaragua → Costa Rica → Panama
    { alkaa: "2026-10-26", otsikko: "Kanadasta Panamaan", reitti: ["CAN", "USA", "MEX", "GTM", "HND", "NIC", "CRI", "PAN"] },
    // Portugali → Espanja → Ranska → Saksa → Puola → Liettua → Latvia → Viro
    { alkaa: "2026-11-02", otsikko: "Portugalista Viroon", reitti: ["PRT", "ESP", "FRA", "DEU", "POL", "LTU", "LVA", "EST"] },
    // Egypti → Israel → Jordania → Irak → Turkki → Georgia → Venäjä → Kiina
    { alkaa: "2026-11-09", otsikko: "Egyptistä Kiinaan", reitti: ["EGY", "ISR", "JOR", "IRQ", "TUR", "GEO", "RUS", "CHN"] },
    // Etiopia → Kenia → Tansania → Mosambik → Zimbabwe → Botswana → Namibia → Angola
    { alkaa: "2026-11-16", otsikko: "Etiopiasta Angolaan", reitti: ["ETH", "KEN", "TZA", "MOZ", "ZWE", "BWA", "NAM", "AGO"] },
    // Ruotsi → Suomi → Venäjä → Ukraina → Unkari → Serbia → Pohjois-Makedonia → Kreikka
    { alkaa: "2026-11-23", otsikko: "Ruotsista Kreikkaan", reitti: ["SWE", "FIN", "RUS", "UKR", "HUN", "SRB", "MKD", "GRC"] },
    // Thaimaa → Kambodža → Vietnam → Kiina → Pakistan → Iran → Turkki → Syyria
    { alkaa: "2026-11-30", otsikko: "Thaimaasta Syyriaan", reitti: ["THA", "KHM", "VNM", "CHN", "PAK", "IRN", "TUR", "SYR"] },
    // Chile → Peru → Kolumbia → Panama → Costa Rica → Nicaragua → Honduras → Guatemala
    { alkaa: "2026-12-07", otsikko: "Chilestä Guatemalaan", reitti: ["CHL", "PER", "COL", "PAN", "CRI", "NIC", "HND", "GTM"] },
    // Belgia → Saksa → Puola → Ukraina → Unkari → Serbia → Bulgaria → Turkki
    { alkaa: "2026-12-14", otsikko: "Belgiasta Turkkiin", reitti: ["BEL", "DEU", "POL", "UKR", "HUN", "SRB", "BGR", "TUR"] },
    // Tanska → Saksa → Tšekki → Slovakia → Ukraina → Venäjä → Suomi → Ruotsi
    { alkaa: "2026-12-21", otsikko: "Tanskasta Ruotsiin", reitti: ["DNK", "DEU", "CZE", "SVK", "UKR", "RUS", "FIN", "SWE"] },
    // Kamerun → Nigeria → Niger → Libya → Sudan → Etiopia → Kenia → Tansania
    { alkaa: "2026-12-28", otsikko: "Kamerunista Tansaniaan", reitti: ["CMR", "NGA", "NER", "LBY", "SDN", "ETH", "KEN", "TZA"] },
    // Kambodža → Laos → Myanmar → Intia → Pakistan → Iran → Turkki → Georgia
    { alkaa: "2027-01-04", otsikko: "Kambodžasta Georgiaan", reitti: ["KHM", "LAO", "MMR", "IND", "PAK", "IRN", "TUR", "GEO"] },
    // Meksiko → Guatemala → Honduras → Nicaragua → Costa Rica → Panama → Kolumbia → Brasilia
    { alkaa: "2027-01-11", otsikko: "Meksikosta Brasiliaan", reitti: ["MEX", "GTM", "HND", "NIC", "CRI", "PAN", "COL", "BRA"] },
    // Latvia → Liettua → Puola → Tšekki → Itävalta → Italia → Ranska → Espanja
    { alkaa: "2027-01-18", otsikko: "Latviasta Espanjaan", reitti: ["LVA", "LTU", "POL", "CZE", "AUT", "ITA", "FRA", "ESP"] },
    // Mosambik → Etelä-Afrikka → Namibia → Angola → Kongon demokraattinen tasavalta → Uganda → Kenia → Somalia
    { alkaa: "2027-01-25", otsikko: "Mosambikista Somaliaan", reitti: ["MOZ", "ZAF", "NAM", "AGO", "COD", "UGA", "KEN", "SOM"] },
    // Norja → Venäjä → Georgia → Turkki → Iran → Pakistan → Intia → Myanmar
    { alkaa: "2027-02-01", otsikko: "Norjasta Myanmariin", reitti: ["NOR", "RUS", "GEO", "TUR", "IRN", "PAK", "IND", "MMR"] },
    // Albania → Kreikka → Bulgaria → Serbia → Unkari → Slovenia → Italia → Ranska
    { alkaa: "2027-02-08", otsikko: "Albaniasta Ranskaan", reitti: ["ALB", "GRC", "BGR", "SRB", "HUN", "SVN", "ITA", "FRA"] },
    // Kazakstan → Kiina → Pakistan → Iran → Turkki → Syyria → Jordania → Saudi-Arabia
    { alkaa: "2027-02-15", otsikko: "Kazakstanista Saudi-Arabiaan", reitti: ["KAZ", "CHN", "PAK", "IRN", "TUR", "SYR", "JOR", "SAU"] },
    // Uruguay → Argentiina → Chile → Peru → Kolumbia → Panama → Costa Rica → Nicaragua
    { alkaa: "2027-02-22", otsikko: "Uruguaysta Nicaraguaan", reitti: ["URY", "ARG", "CHL", "PER", "COL", "PAN", "CRI", "NIC"] },
    // Ukraina → Slovakia → Tšekki → Saksa → Ranska → Italia → Slovenia → Kroatia
    { alkaa: "2027-03-01", otsikko: "Ukrainasta Kroatiaan", reitti: ["UKR", "SVK", "CZE", "DEU", "FRA", "ITA", "SVN", "HRV"] },
    // Etelä-Afrikka → Namibia → Angola → Kongon tasavalta → Kamerun → Nigeria → Niger → Algeria
    { alkaa: "2027-03-08", otsikko: "Etelä-Afrikasta Algeriaan", reitti: ["ZAF", "NAM", "AGO", "COG", "CMR", "NGA", "NER", "DZA"] },
    // Malesia → Thaimaa → Kambodža → Vietnam → Kiina → Venäjä → Georgia → Turkki
    { alkaa: "2027-03-15", otsikko: "Malesiasta Turkkiin", reitti: ["MYS", "THA", "KHM", "VNM", "CHN", "RUS", "GEO", "TUR"] },
    // Italia → Sveitsi → Saksa → Tšekki → Slovakia → Ukraina → Romania → Serbia
    { alkaa: "2027-03-22", otsikko: "Italiasta Serbiaan", reitti: ["ITA", "CHE", "DEU", "CZE", "SVK", "UKR", "ROU", "SRB"] },
    // Venezuela → Kolumbia → Panama → Costa Rica → Nicaragua → Honduras → Guatemala → Meksiko
    { alkaa: "2027-03-29", otsikko: "Venezuelasta Meksikoon", reitti: ["VEN", "COL", "PAN", "CRI", "NIC", "HND", "GTM", "MEX"] },
    // Suomi → Venäjä → Georgia → Armenia → Iran → Afganistan → Tadžikistan → Kirgisia
    { alkaa: "2027-04-05", otsikko: "Suomesta Kirgisiaan", reitti: ["FIN", "RUS", "GEO", "ARM", "IRN", "AFG", "TJK", "KGZ"] },
    // Namibia → Angola → Kongon demokraattinen tasavalta → Tansania → Kenia → Etiopia → Sudan → Libya
    { alkaa: "2027-04-12", otsikko: "Namibiasta Libyaan", reitti: ["NAM", "AGO", "COD", "TZA", "KEN", "ETH", "SDN", "LBY"] },
    // Tšekki → Slovakia → Unkari → Slovenia → Italia → Ranska → Espanja → Portugali
    { alkaa: "2027-04-19", otsikko: "Tšekistä Portugaliin", reitti: ["CZE", "SVK", "HUN", "SVN", "ITA", "FRA", "ESP", "PRT"] },
    // Israel → Syyria → Turkki → Iran → Pakistan → Intia → Myanmar → Laos
    { alkaa: "2027-04-26", otsikko: "Israelista Laosiin", reitti: ["ISR", "SYR", "TUR", "IRN", "PAK", "IND", "MMR", "LAO"] },
  ],
  kuntaliitos: [
    // Tornio → Ylitornio → Pello → Kolari → Muonio → Enontekiö → Inari → Utsjoki
    { alkaa: "2026-10-26", otsikko: "Torniosta Utsjoelle", reitti: ["851", "976", "854", "273", "498", "047", "148", "890"] },
    // Hanko → Raasepori → Lohja → Siuntio → Kirkkonummi → Espoo → Vantaa → Sipoo
    { alkaa: "2026-11-02", otsikko: "Hangosta Sipooseen", reitti: ["078", "710", "444", "755", "257", "049", "092", "753"] },
    // Imatra → Lappeenranta → Luumäki → Savitaipale → Puumala → Sulkava → Savonlinna → Parikkala
    { alkaa: "2026-11-09", otsikko: "Imatralta Parikkalaan", reitti: ["153", "405", "441", "739", "623", "768", "740", "580"] },
    // Kauhajoki → Kurikka → Seinäjoki → Virrat → Ähtäri → Alajärvi → Lappajärvi → Evijärvi
    { alkaa: "2026-11-16", otsikko: "Kauhajoelta Evijärvelle", reitti: ["232", "301", "743", "936", "989", "005", "403", "052"] },
    // Laitila → Mynämäki → Pöytyä → Aura → Turku → Kaarina → Paimio → Salo
    { alkaa: "2026-11-23", otsikko: "Laitilasta Saloon", reitti: ["400", "503", "636", "019", "853", "202", "577", "734"] },
    // Kajaani → Sotkamo → Ristijärvi → Hyrynsalmi → Suomussalmi → Kuusamo → Posio → Rovaniemi
    { alkaa: "2026-11-30", otsikko: "Kajaanista Rovaniemelle", reitti: ["205", "765", "697", "105", "777", "305", "614", "698"] },
    // Kihniö → Parkano → Ikaalinen → Hämeenkyrö → Nokia → Pirkkala → Lempäälä → Akaa
    { alkaa: "2026-12-07", otsikko: "Kihniöstä Akaaseen", reitti: ["250", "581", "143", "108", "536", "604", "418", "020"] },
    // Närpiö → Maalahti → Vaasa → Vöyri → Uusikaarlepyy → Pedersören kunta → Luoto → Kokkola
    { alkaa: "2026-12-14", otsikko: "Närpiöstä Kokkolaan", reitti: ["545", "475", "905", "946", "893", "599", "440", "272"] },
    // Ylitornio → Pello → Kolari → Muonio → Enontekiö → Inari → Sodankylä → Savukoski
    { alkaa: "2026-12-21", otsikko: "Ylitorniolta Savukoskelle", reitti: ["976", "854", "273", "498", "047", "148", "758", "742"] },
    // Porvoo → Askola → Mäntsälä → Tuusula → Vantaa → Espoo → Kirkkonummi → Siuntio
    { alkaa: "2026-12-28", otsikko: "Porvoosta Siuntioon", reitti: ["638", "018", "505", "858", "092", "049", "257", "755"] },
    // Kuhmo → Suomussalmi → Puolanka → Paltamo → Kajaani → Sonkajärvi → Iisalmi → Kuopio
    { alkaa: "2027-01-04", otsikko: "Kuhmosta Kuopioon", reitti: ["290", "777", "620", "578", "205", "762", "140", "297"] },
    // Huittinen → Säkylä → Eura → Harjavalta → Ulvila → Pori → Kankaanpää → Ikaalinen
    { alkaa: "2027-01-11", otsikko: "Huittisista Ikaalisiin", reitti: ["102", "783", "050", "079", "886", "609", "214", "143"] },
    // Hankasalmi → Konnevesi → Äänekoski → Saarijärvi → Multia → Keuruu → Jämsä → Jyväskylä
    { alkaa: "2027-01-18", otsikko: "Hankasalmelta Jyväskylään", reitti: ["077", "275", "992", "729", "495", "249", "182", "179"] },
    // Kärkölä → Hollola → Lahti → Heinola → Sysmä → Padasjoki → Kangasala → Tampere
    { alkaa: "2027-01-25", otsikko: "Kärkölästä Tampereelle", reitti: ["316", "098", "398", "111", "781", "576", "211", "837"] },
    // Kitee → Tohmajärvi → Joensuu → Liperi → Polvijärvi → Juuka → Nurmes → Sotkamo
    { alkaa: "2027-02-01", otsikko: "Kiteeltä Sotkamoon", reitti: ["260", "848", "167", "426", "607", "176", "541", "765"] },
    // Ii → Oulu → Liminka → Siikajoki → Raahe → Haapavesi → Ylivieska → Kalajoki
    { alkaa: "2027-02-08", otsikko: "Iistä Kalajoelle", reitti: ["139", "564", "425", "748", "678", "071", "977", "208"] },
    // Miehikkälä → Hamina → Kotka → Pyhtää → Loviisa → Porvoo → Sipoo → Helsinki
    { alkaa: "2027-02-15", otsikko: "Miehikkälästä Helsinkiin", reitti: ["489", "075", "285", "624", "434", "638", "753", "091"] },
    // Ähtäri → Alavus → Kuortane → Lapua → Kauhava → Isokyrö → Vaasa → Mustasaari
    { alkaa: "2027-02-22", otsikko: "Ähtäristä Mustasaareen", reitti: ["989", "010", "300", "408", "233", "152", "905", "499"] },
    // Pielavesi → Kuopio → Leppävirta → Varkaus → Savonlinna → Sulkava → Juva → Mikkeli
    { alkaa: "2027-03-01", otsikko: "Pielavedeltä Mikkeliin", reitti: ["595", "297", "420", "915", "740", "768", "178", "491"] },
    // Humppila → Forssa → Tammela → Loppi → Janakkala → Hausjärvi → Hollola → Lahti
    { alkaa: "2027-03-08", otsikko: "Humppilasta Lahteen", reitti: ["103", "061", "834", "433", "165", "086", "098", "398"] },
    // Rauma → Eura → Kokemäki → Ulvila → Pori → Kankaanpää → Karvia → Kurikka
    { alkaa: "2027-03-15", otsikko: "Raumalta Kurikkaan", reitti: ["684", "050", "271", "886", "609", "214", "230", "301"] },
    // Posio → Rovaniemi → Ylitornio → Tornio → Keminmaa → Simo → Ii → Oulu
    { alkaa: "2027-03-22", otsikko: "Posiolta Ouluun", reitti: ["614", "698", "976", "851", "241", "751", "139", "564"] },
    // Kemiönsaari → Salo → Paimio → Kaarina → Turku → Raisio → Masku → Nousiainen
    { alkaa: "2027-03-29", otsikko: "Kemiönsaarelta Nousiaisiin", reitti: ["322", "734", "577", "202", "853", "680", "481", "538"] },
    // Kannus → Kokkola → Kaustinen → Veteli → Perho → Alajärvi → Alavus → Seinäjoki
    { alkaa: "2027-04-05", otsikko: "Kannuksesta Seinäjoelle", reitti: ["217", "272", "236", "924", "584", "005", "010", "743"] },
    // Luumäki → Savitaipale → Taipalsaari → Ruokolahti → Parikkala → Kitee → Tohmajärvi → Joensuu
    { alkaa: "2027-04-12", otsikko: "Luumäeltä Joensuuhun", reitti: ["441", "739", "831", "700", "580", "260", "848", "167"] },
    // Kokemäki → Ulvila → Pori → Kankaanpää → Ikaalinen → Ylöjärvi → Nokia → Pirkkala
    { alkaa: "2027-04-19", otsikko: "Kokemäeltä Pirkkalaan", reitti: ["271", "886", "609", "214", "143", "980", "536", "604"] },
    // Kirkkonummi → Vihti → Nurmijärvi → Tuusula → Mäntsälä → Pornainen → Porvoo → Loviisa
    { alkaa: "2027-04-26", otsikko: "Kirkkonummelta Loviisaan", reitti: ["257", "927", "543", "858", "505", "611", "638", "434"] },
  ],
  // Rajanaapurit: Yhdysvallat (CD-handoff 1.11.2026). Elatiivi + illatiivi kuten Kotus: Tennesseehen, Mainesta.
  osavaltiot: [
    // Kalifornia – Arizona – Uusi-Meksiko – Texas – Louisiana – Mississippi – Alabama – Florida
    { alkaa: "2026-10-26", otsikko: "Kaliforniasta Floridaan", reitti: ["CA", "AZ", "NM", "TX", "LA", "MS", "AL", "FL"] },
    // New York – Pennsylvania – Länsi-Virginia – Virginia – Tennessee – Mississippi – Louisiana – Texas
    { alkaa: "2026-11-02", otsikko: "New Yorkista Texasiin", reitti: ["NY", "PA", "WV", "VA", "TN", "MS", "LA", "TX"] },
    // Washington – Oregon – Kalifornia – Arizona – Uusi-Meksiko – Oklahoma – Missouri – Tennessee
    { alkaa: "2026-11-09", otsikko: "Washingtonista Tennesseehen", reitti: ["WA", "OR", "CA", "AZ", "NM", "OK", "MO", "TN"] },
    // Michigan – Wisconsin – Iowa – Etelä-Dakota – Montana – Idaho – Nevada – Arizona
    { alkaa: "2026-11-16", otsikko: "Michiganista Arizonaan", reitti: ["MI", "WI", "IA", "SD", "MT", "ID", "NV", "AZ"] },
    // Louisiana – Mississippi – Alabama – Georgia – Pohjois-Carolina – Virginia – Länsi-Virginia – Ohio
    { alkaa: "2026-11-23", otsikko: "Louisianasta Ohioon", reitti: ["LA", "MS", "AL", "GA", "NC", "VA", "WV", "OH"] },
    // Montana – Etelä-Dakota – Iowa – Illinois – Kentucky – Tennessee – Arkansas – Texas
    { alkaa: "2026-11-30", otsikko: "Montanasta Texasiin", reitti: ["MT", "SD", "IA", "IL", "KY", "TN", "AR", "TX"] },
    // Utah – Arizona – Uusi-Meksiko – Texas – Arkansas – Mississippi – Alabama – Florida
    { alkaa: "2026-12-07", otsikko: "Utahista Floridaan", reitti: ["UT", "AZ", "NM", "TX", "AR", "MS", "AL", "FL"] },
    // Minnesota – Etelä-Dakota – Nebraska – Colorado – Uusi-Meksiko – Arizona – Kalifornia – Oregon
    { alkaa: "2026-12-14", otsikko: "Minnesotasta Oregoniin", reitti: ["MN", "SD", "NE", "CO", "NM", "AZ", "CA", "OR"] },
    // Maine – New Hampshire – Massachusetts – New York – Pennsylvania – Länsi-Virginia – Virginia – Pohjois-Carolina
    { alkaa: "2026-12-21", otsikko: "Mainesta Pohjois-Carolinaan", reitti: ["ME", "NH", "MA", "NY", "PA", "WV", "VA", "NC"] },
    // Nevada – Idaho – Montana – Pohjois-Dakota – Minnesota – Wisconsin – Michigan – Ohio
    { alkaa: "2026-12-28", otsikko: "Nevadasta Ohioon", reitti: ["NV", "ID", "MT", "ND", "MN", "WI", "MI", "OH"] },
    // Georgia – Alabama – Mississippi – Arkansas – Oklahoma – Uusi-Meksiko – Arizona – Utah
    { alkaa: "2027-01-04", otsikko: "Georgiasta Utahiin", reitti: ["GA", "AL", "MS", "AR", "OK", "NM", "AZ", "UT"] },
    // Pennsylvania – Ohio – Indiana – Illinois – Iowa – Minnesota – Pohjois-Dakota – Montana
    { alkaa: "2027-01-11", otsikko: "Pennsylvaniasta Montanaan", reitti: ["PA", "OH", "IN", "IL", "IA", "MN", "ND", "MT"] },
    // Kalifornia – Nevada – Utah – Wyoming – Nebraska – Missouri – Arkansas – Louisiana
    { alkaa: "2027-01-18", otsikko: "Kaliforniasta Louisianaan", reitti: ["CA", "NV", "UT", "WY", "NE", "MO", "AR", "LA"] },
    // Virginia – Länsi-Virginia – Ohio – Indiana – Illinois – Missouri – Kansas – Colorado
    { alkaa: "2027-01-25", otsikko: "Virginiasta Coloradoon", reitti: ["VA", "WV", "OH", "IN", "IL", "MO", "KS", "CO"] },
    // Texas – Uusi-Meksiko – Arizona – Utah – Idaho – Montana – Pohjois-Dakota – Minnesota
    { alkaa: "2027-02-01", otsikko: "Texasista Minnesotaan", reitti: ["TX", "NM", "AZ", "UT", "ID", "MT", "ND", "MN"] },
    // Florida – Alabama – Tennessee – Virginia – Maryland – Pennsylvania – Ohio – Michigan
    { alkaa: "2027-02-08", otsikko: "Floridasta Michiganiin", reitti: ["FL", "AL", "TN", "VA", "MD", "PA", "OH", "MI"] },
    // Oregon – Idaho – Wyoming – Etelä-Dakota – Iowa – Missouri – Oklahoma – Texas
    { alkaa: "2027-02-15", otsikko: "Oregonista Texasiin", reitti: ["OR", "ID", "WY", "SD", "IA", "MO", "OK", "TX"] },
    // Pohjois-Carolina – Georgia – Alabama – Mississippi – Louisiana – Texas – Oklahoma – Colorado
    { alkaa: "2027-02-22", otsikko: "Pohjois-Carolinasta Coloradoon", reitti: ["NC", "GA", "AL", "MS", "LA", "TX", "OK", "CO"] },
    // Washington – Oregon – Nevada – Utah – Wyoming – Montana – Pohjois-Dakota – Minnesota
    { alkaa: "2027-03-01", otsikko: "Washingtonista Minnesotaan", reitti: ["WA", "OR", "NV", "UT", "WY", "MT", "ND", "MN"] },
    // New York – Pennsylvania – Maryland – Virginia – Kentucky – Missouri – Nebraska – Colorado
    { alkaa: "2027-03-08", otsikko: "New Yorkista Coloradoon", reitti: ["NY", "PA", "MD", "VA", "KY", "MO", "NE", "CO"] },
    // Arizona – Uusi-Meksiko – Oklahoma – Arkansas – Tennessee – Virginia – Länsi-Virginia – Pennsylvania
    { alkaa: "2027-03-15", otsikko: "Arizonasta Pennsylvaniaan", reitti: ["AZ", "NM", "OK", "AR", "TN", "VA", "WV", "PA"] },
    // Tennessee – Missouri – Nebraska – Etelä-Dakota – Montana – Idaho – Nevada – Kalifornia
    { alkaa: "2027-03-22", otsikko: "Tennesseestä Kaliforniaan", reitti: ["TN", "MO", "NE", "SD", "MT", "ID", "NV", "CA"] },
    // Ohio – Michigan – Wisconsin – Iowa – Etelä-Dakota – Montana – Idaho – Washington
    { alkaa: "2027-03-29", otsikko: "Ohiosta Washingtoniin", reitti: ["OH", "MI", "WI", "IA", "SD", "MT", "ID", "WA"] },
    // Georgia – Pohjois-Carolina – Virginia – Kentucky – Indiana – Michigan – Wisconsin – Minnesota
    { alkaa: "2027-04-05", otsikko: "Georgiasta Minnesotaan", reitti: ["GA", "NC", "VA", "KY", "IN", "MI", "WI", "MN"] },
    // Nevada – Idaho – Montana – Etelä-Dakota – Iowa – Missouri – Kentucky – Virginia
    { alkaa: "2027-04-12", otsikko: "Nevadasta Virginiaan", reitti: ["NV", "ID", "MT", "SD", "IA", "MO", "KY", "VA"] },
    // Indiana – Illinois – Wisconsin – Minnesota – Pohjois-Dakota – Montana – Idaho – Oregon
    { alkaa: "2027-04-19", otsikko: "Indianasta Oregoniin", reitti: ["IN", "IL", "WI", "MN", "ND", "MT", "ID", "OR"] },
    // Alabama – Mississippi – Arkansas – Missouri – Iowa – Minnesota – Pohjois-Dakota – Montana
    { alkaa: "2027-04-26", otsikko: "Alabamasta Montanaan", reitti: ["AL", "MS", "AR", "MO", "IA", "MN", "ND", "MT"] },
  ],
};

const PAIVA_MS = 86_400_000;
const isoPaiva = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Viikon maanantai (YYYY-MM-DD) Suomen kalenteripäivästä. */
export function maanantai(paivaIso: string): string {
  const ms = Date.parse(`${paivaIso}T00:00:00Z`);
  return isoPaiva(ms - ((new Date(ms).getUTCDay() + 6) % 7) * PAIVA_MS);
}

/** "2.–8.11." tai "30.11.–6.12." */
export function viikonAikavali(alkaa: string): string {
  const a = new Date(`${alkaa}T00:00:00Z`);
  const l = new Date(a.getTime() + 6 * PAIVA_MS);
  const pv = (d: Date) => d.getUTCDate(), kk = (d: Date) => d.getUTCMonth() + 1;
  return kk(a) === kk(l) ? `${pv(a)}.–${pv(l)}.${kk(l)}.` : `${pv(a)}.${kk(a)}.–${pv(l)}.${kk(l)}.`;
}

/** Haastelinkin siemen viikon reitille: ?reitti=viikko-2026-11-02 */
export const viikonSiemen = (alkaa: string) => `viikko-${alkaa}`;
const SIEMEN = /^viikko-(\d{4}-\d{2}-\d{2})$/;
export const viikkoSiemenesta = (siemen: string | null) => (siemen ? SIEMEN.exec(siemen)?.[1] ?? null : null);

export const viikonReitti = (peli: keyof typeof VIIKON_REITIT, alkaa: string) => VIIKON_REITIT[peli].find((v) => v.alkaa === alkaa) ?? null;

/** Käsin otsikoitu kiinteä reitti siemenestä: viikko-YYYY-MM-DD (viikon reitti) tai kuntaliitoksen
    kaupunki-<slug> (kaupunkisivun reitti, lib/kuntaliitos/kaupunkireitit.ts). Muuten null = arvottu reitti. */
export function kiinteaReitti(peli: keyof typeof VIIKON_REITIT, siemen: string | null): { otsikko: string; reitti: string[] } | null {
  const viikko = viikkoSiemenesta(siemen);
  if (viikko) return viikonReitti(peli, viikko);
  return peli === "kuntaliitos" ? kaupunginReittiSiemenesta(siemen) : null;
}

/** Sivun reitti (palvelimella): viikon reitti heroineen, kun ei pyydettyä reittiä eikä ryhmää;
    ?reitti=viikko-… on jaettu viikon reitti (suoraan laudalle); kaupunkisivun reitti (?reitti=kaupunki-…)
    alkaa herosta kuten viikon reitti, koska sinne tullaan kaupunkisivun kortista; muuten arvonta kuten ennen. */
export function sivunReitti<R>(
  peli: keyof typeof VIIKON_REITIT,
  p: { paivaIso: string; pyydetty: string | null; ryhma: string | null },
  f: { arvo: (siemen: string, ryhma: string | null) => R | null; alueista: (ids: string[], siemen: string) => R | null },
) {
  const kuluva = maanantai(p.paivaIso);
  const jaettu = viikkoSiemenesta(p.pyydetty);
  if (jaettu || (!p.pyydetty && !p.ryhma)) {
    const alkaa = jaettu ?? kuluva;
    const siemen = viikonSiemen(alkaa);
    const v = viikonReitti(peli, alkaa);
    return { reitti: (v && f.alueista(v.reitti, siemen)) || f.arvo(siemen, null), siemen, otsikko: v?.otsikko ?? null, intro: !jaettu, kuluva };
  }
  const kiintea = kiinteaReitti(peli, p.pyydetty);
  if (kiintea && p.pyydetty) {
    const r = f.alueista(kiintea.reitti, p.pyydetty);
    if (r) return { reitti: r, siemen: p.pyydetty, otsikko: kiintea.otsikko, intro: true, kuluva };
  }
  const siemen = p.pyydetty ?? p.paivaIso;
  return { reitti: f.arvo(siemen, p.ryhma), siemen, otsikko: null, intro: false, kuluva };
}
