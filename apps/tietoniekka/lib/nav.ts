// TIETONIEKKA 2.0 — NAVIGAATION KOKOONPANO (CD:n Navigaatiokonsepti, lukittu 17.8.2026).
// Yksi lähde valikoille, mobiilin Selaa-paneelille ja /kokoelmat-indeksille.
// HUOM: Liput EI ole tässä listassa (Heikki 17.8.: lippuvisat ovat osa Kuvavisoja,
// joiden navigaatio kulkee Pelimuodot-valikon kautta). Visamäärät tulevat AINA
// kannasta (layout laskee quiz_cards-näkymästä) — ei kovakoodattuja lukuja.
// Järjestys (Heikki 31.10.2026): kokoelmat ja pelimuodot aakkosjärjestyksessä (suomen lajittelu, aakkosin()) kaikissa
// valikoissa, mobiilipaneelissa, /kokoelmat-sivulla ja alatunnisteessa — listojen kirjoitusjärjestyksellä ei ole väliä.

export type NavCollection = {
  slug: string;   // quiz_cards.collection-arvo JA hub-URL:n segmentti
  label: string;  // näkyvä nimi (matkakohteet → "Maantieto", lukittu 15.8.2026)
  color: string;  // tunnusväri — valikossa vain 9px pisteenä ja hover-reunuksena
  /** Oma osoite, jos kokoelma ei ole /kokoelma/<slug> (Lasten visat → /lapset) */
  href?: string;
};

/** Suomen aakkosjärjestys nimen mukaan (Ä ja Ö lopussa). */
export const aakkosin = <T extends { label: string }>(lista: T[]): T[] => [...lista].sort((a, b) => a.label.localeCompare(b.label, "fi"));

export const NAV_COLLECTIONS: NavCollection[] = aakkosin([
  { slug: "tv", label: "TV ja suoratoisto", color: "#FF3D9E" },
  { slug: "urheilu", label: "Urheilu", color: "#B6FF3C" },
  /* Jääkiekko ja Jalkapallo (Heikki 25.8.2026): omat teemakokoelmat, jotka
     nostetaan navigaatioon omina kohtinaan heti Urheilun perään, vaikka
     niiden visat ovat kannassa urheilu-kokoelmaa — /kokoelmat-sivu
     laskee näiden visamäärät teemasivujen visalistoista (ei collectionista). */
  { slug: "jaakiekko", label: "Jääkiekko", color: "#4FD1F5" },
  { slug: "jalkapallo", label: "Jalkapallo", color: "#35D6A0" },
  { slug: "elokuvat", label: "Elokuvat", color: "#FF5C3D" },
  { slug: "musiikki", label: "Musiikki", color: "#A855F7" },
  { slug: "matkakohteet", label: "Maantieto", color: "#46D6C8" },
  /* Suomen kaupungit (Heikki 28.8.2026): oma teemakokoelma matkapassi-
     konseptilla, vaikka visat ovat kannassa yleistieto-kokoelmaa — sama
     nosto-periaate kuin Jääkiekko/Jalkapallo. Visamäärä lasketaan
     lib/kaupungit.ts:n omasta 20 kaupungin slugilistasta (ks. kokoelmat/page.tsx). */
  { slug: "kaupungit", label: "Suomen kaupungit", color: "#E8A320" },
  { slug: "tunnetut-henkilot", label: "Tunnetut henkilöt", color: "#C9A96A" },
  { slug: "kulttuuri", label: "Kulttuuri", color: "#E8A320" },
  { slug: "historia", label: "Historia", color: "#E8A320" },
  /* Vaalit ja politiikka (Heikki 5.10.2026): eduskunta, vaalipiirit, poliitikot. Omat visat category=
     'politiikka', lisäksi ristiinlistatut historiavisat (lib/vaalit/data.ts). */
  { slug: "vaalit", label: "Vaalit ja politiikka", color: "#B4A5FF" },
  { slug: "luonto", label: "Luonto", color: "#3FBF7F" },
  /* Tiede ja teknologia (Heikki 20.9.2026): oma teemakokoelma, jonka visat ovat
     kannassa yleistieto-kokoelmaa category='tiede-teknologia' — sama
     nosto-periaate kuin Suomen kaupungeilla. Visamäärä lasketaan kategoriasta
     (ks. kokoelmat/page.tsx). */
  { slug: "tiede", label: "Tiede ja teknologia", color: "#5BE1FF" },
  /* Juhlat (Heikki 28.9.2026): vuoden juhlat ja perinteet, kannassa collection='juhlat'. */
  { slug: "juhlat", label: "Juhlat", color: "#E8A320" },
  /* Lasten visat (Heikki 11.10.2026): oma kokoelmasivu /lapset (target_age 4-7 / 8-12). */
  { slug: "lapset", label: "Lasten visat", color: "#F5BC45", href: "/lapset" },
]);

export type NavMode = {
  href: string;
  label: string;
  desc: string;   // kuvaus valikkoriville = etusivun pelikortin rivi (ETUSIVUN_PELIMUODOT.etusivu_rivi, Heikki 31.10.2026)
  color: string;
};

/* Klassista ei nosteta navigaatioon (CD:n sääntö: se on visojen oletusmuoto).
   Rakenne kestää uudet rivit sellaisenaan → Kumpi? ja Järjestä lisätään 2.5:ssä. */
export const NAV_MODES: NavMode[] = aakkosin([
  // Tupla tai kuitti (Heikki 26.9.2026): uusi pelimuoto ensimmäisenä
  { href: "/peli/tupla-tai-kuitti", label: "Tupla tai kuitti", desc: "Tuplaa pisteet tai pidä ne", color: "#E8A320" },
  // Kuntaliitos (Heikki 26.9.2026): karttapelien ensimmäinen, päivän reitti + satunnaiset
  { href: "/peli/kuntaliitos", label: "Kuntaliitos", desc: "Järjestä kunnat ketjuksi, jossa jokainen kunta rajautuu seuraavaan", color: "#159A9C" },
  // Vaalipiiriketju (Heikki 5.10.2026): Kuntaliitoksen viereen, päivän peli vaalipiireistä
  { href: "/peli/vaalipiiriketju", label: "Vaalipiiriketju", desc: "Ketjuta kansanedustajat vaalipiireittäin", color: "#B4A5FF" },
  // Ikäjärjestys (Heikki 18.10.2026): jäi vahingossa pois valikosta. Ilman autostartia → pelaaja näkee aihevalinnan.
  // Kun Järjestä-pelimuoto julkaistaan, tämä rivi korvataan "Laita järjestykseen" → /peli/jarjesta -rivillä
  // (Ikäjärjestys siirtyy pakaksi /peli/jarjesta/ikajarjestys, vanha osoite 301).
  { href: "/peli/ikajarjestys", label: "Ikäjärjestys", desc: "Järjestä tunnetut henkilöt vanhimmasta nuorimpaan", color: "#C79BFF" },
  // Rajanaapurit (Heikki 27.9.2026): Kuntaliitoksen sisarpeli valtioilla ja lipuilla
  { href: "/peli/rajanaapurit", label: "Rajanaapurit", desc: "Järjestä maat ketjuksi, jossa jokainen maa rajautuu seuraavaan", color: "#F2B233" },
  { href: "/megavisat", label: "Megavisat", desc: "Laajat teemavisat yhdellä istumalla", color: "#E8A320" },
  { href: "/kokoelma/kuvavisat", label: "Kuvavisat", desc: "Tunnista kuvista maiden liput, maakuntien vaakunat, eläimiä, lintuja ja monta muuta aihetta", color: "#4C9AFF" },
  /* Äänivisat (Heikki 11.10.2026): toistaiseksi Luonto-kokoelman äänivisasuodatin; oma sivu, kun äänivisoja tulee lisää. */
  { href: "/kokoelma/luonto?suodata=aanivisat#kaikki", label: "Äänivisat", desc: "Tunnista lintu laulusta", color: "#4ADE80" },
  /* Visapaketit (Heikki 31.10.2026): pelaamisen tapa (visailta porukalla), ei aihe → Pelimuodot-valikkoon. */
  { href: "/visapaketit", label: "Visapaketit", desc: "Valmis visailta ruudulle tai tulosteeksi", color: "#F0C020" },
]);

export const hubHref = (slug: string) => `/kokoelma/${slug}`;
/** Kokoelman osoite navigaatiossa: oma href (Lasten visat) tai /kokoelma/<slug>. */
export const navHref = (c: Pick<NavCollection, "slug" | "href">) => c.href ?? hubHref(c.slug);

/* Pelikuoren reitit: niillä on oma header (tng-top), joten sivuston TopBar ja
   alatunniste jäävät pois. /h/<koodi> on haastelinkki, joka renderöi saman
   pelisivun — B1 (18.9.2026): se puuttui listalta, ja haasteen aloitus- ja
   tulosnäkymässä näkyi kaksi yläpalkkia päällekkäin. */
export const isGameRoute = (pathname: string) =>
  // Pelikehys (vaihe 4, 20.10.2026): myös Tupla tai kuitin aihesivu on pelin K2-aloitus omalla pelipalkillaan.
  // /kuvavisa/<kortisto> (SEO-erä A6) on sama GameClient omalla palkillaan → ei toista navipalkkia (pikakorjaus 22.10.2026;
  // sivuston palkki myös vieritti sivua sivuttain WebKitissä 768 → 390 px:n koonmuutoksessa).
  // Visapaketit (28.10.2026): "/visa" ilman kauttaviivaa osui myös /visapaketit-sivuihin, joilla navigaatio kuuluu
  // näkyä. Paketin televisionäkymä, tuloste ja juontajan näkymä ovat koko ruudun näkymiä ilman sivuston palkkia ja alatunnistetta.
  (pathname.startsWith("/peli") || pathname === "/visa" || pathname.startsWith("/visa/") || pathname.startsWith("/h/") || pathname.startsWith("/kuvavisa/") ||
    /^\/visapaketti\/.+\/(ruutu|tulosta|vetaja)\/?$/.test(pathname));
