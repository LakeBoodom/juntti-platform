// Instagram-pohjien tiedot (kierrokset 4–5) ilman piirtokoodia — käytössä myös adminin
// selainkomponenteissa (julkaisukortti), jotka eivät voi tuoda sharpia tai fontteja.

/* ── Tunnukset ───────────────────────────────────────────────────────── */

export type Pohja =
  | "4a" | "4b" | "4d" | "4f" | "4g" | "4l" | "4m" | "4n" | "4o" | "4p" | "4q"
  | "4h" | "4i" | "4j" | "4r"
  | "5a" | "5b" | "5d" | "5n"
  | "5f" | "5h" | "5i" | "5m";

/** Kierroksen 5 henkilökortit: kasvot ovat kortin kuva. Käyvät sekä synttäreihin
    että henkilövisan omaan julkaisuun minä päivänä tahansa (design D). */
export const HENKILOPOHJAT: Pohja[] = ["5f", "5h", "5i", "5m"];
export const onHenkilopohja = (p: string) => (HENKILOPOHJAT as string[]).includes(p);

/** Visajulkaisun pohjat (Päivän visa, omat ja kampanjat) */
// Kierros 5 (Heikin valinta 24.9.2026): 5a–5b korvaavat 4c:n ja 5d 4e:n; henkilökortit
// 5f/5h/5i/5m korvaavat 4h:n ja 4r:n synttäreissä. 4r ja 4h jäävät kuvattomille henkilöille.
export const VISA_POHJAT: Pohja[] = ["4a", "4g", "4b", "5a", "5b", "4d", "5d", "4f", "4l", "4m", "4n", "4o", "5n", "4p", "4q", ...HENKILOPOHJAT];
/** Synttärijulkaisun pohjat */
export const SYNT_POHJAT: Pohja[] = [...HENKILOPOHJAT, "4r", "4h", "4i", "4j"];

/** Kierrossa automaattisesti; muut valitaan käsin, koska ne vaativat toimituksellisen
    harkinnan (4d nostalgia: visan pitää oikeasti käsitellä vanhaa; 4j: henkilön
    tuotannosta oikea visa; 4i: henkilökuva ja kuvaajatieto). */
// Heikin valinta 23.9.2026 ensimmäisten korttien perusteella: kierrossa vahvimmat —
// oikea visakysymys, useampi kysymys, peitetty vastaus, juontajat eri mieltä ja
// identiteettikuva. Muut (4b, 4g, 4n, 4p, 4q) valitaan käsin.
// 24.9.: mukaan kierroksen 5 aihekortit 5a, 5b, 5d ja 5n (5n vasta, kun ympäristökuva on
// ladattu). Synttäreiden pohja määräytyy henkilön kuvasta (suunnitelma.ts: henkilonPohja).
export const AUTO_VISA: Pohja[] = ["4a", "4f", "4l", "4m", "4o", "5a", "5b", "5d", "5n"];

export const POHJA_NIMET: Record<string, string> = {
  "4a": "Identiteetti · kuva",
  "4g": "Identiteetti · kuva kehyksessä",
  "4b": "Uteliaisuus · ilman kuvaa",
  "4d": "Nostalgia",
  "4f": "Oikea visakysymys",
  "4l": "Useampi kysymys",
  "4m": "Kysymys + peitetty vastaus",
  "4n": "Mikko haastaa",
  "4o": "Juontajat eri mieltä",
  "4p": "Juontaja yllättyy",
  "4q": "Juontaja miettii",
  "4h": "Synttäri → visa",
  "4r": "Juontajat onnittelevat",
  "4i": "Synttäri · muisto kommenttiin",
  "4j": "Synttäri · tuotanto on koukku",
  "5a": "Pistemäärähaaste · koko pinnan kuva",
  "5b": "Pistemäärähaaste · kuva kehyksessä",
  "5d": "Haasta kaveri · kuvakaista",
  "5n": "Juontajat ympäristössä · eri mieltä",
  "5f": "Henkilökortti · koko pinnan kuva",
  "5h": "Henkilökortti · muistopäivä",
  "5i": "Henkilökortti · heikko kuva",
  "5m": "Henkilökortti · paperi, ei syyriviä",
  // Kierroksen 2 pohjat — vain julkaistujen historiaa varten
  "V-A": "Tapahtuma edellä (kierros 2)",
  "V-B": "Haaste edellä (kierros 2)",
  "V-C": "Kuva edellä (kierros 2)",
  "V-D": "Typografia edellä (kierros 2)",
  "V-E": "Karuselli (kierros 2)",
  "S-A": "Henkilökuva edellä (kierros 2)",
  "S-B": "Nimi edellä (kierros 2)",
  "S-C": "Ikä edellä (kierros 2)",
  "S-D": "Visayhteys edellä (kierros 2)",
};

/** Kiertoa varten: saman perheen kortti ei tule kahtena päivänä peräkkäin. */
export const PERHE: Record<Pohja, "kuva" | "teksti" | "kysymys" | "juontaja" | "synttari"> = {
  "4a": "kuva", "4g": "kuva", "4d": "kuva",
  "4b": "teksti",
  "4f": "kysymys", "4l": "kysymys", "4m": "kysymys",
  "4n": "juontaja", "4o": "juontaja", "4p": "juontaja", "4q": "juontaja",
  "4h": "synttari", "4r": "synttari", "4i": "synttari", "4j": "synttari",
  "5a": "kuva", "5b": "kuva", "5d": "kuva", "5n": "juontaja",
  "5f": "synttari", "5h": "synttari", "5i": "synttari", "5m": "synttari",
};

/** Designin motiivi (kierros 3–4) — tekoälyluonnoksen ohje ja adminin selite. */
export const MOTIIVI: Record<Pohja, string> = {
  "4a": "identiteetti", "4g": "identiteetti", "4n": "identiteetti",
  "4b": "uteliaisuus", "4m": "uteliaisuus", "4p": "uteliaisuus",
  "4d": "nostalgia",
  "4f": "osallistuminen", "4l": "osallistuminen", "4o": "osallistuminen", "4q": "osallistuminen",
  "4h": "synttari", "4r": "synttari", "4i": "muisto", "4j": "synttari",
  "5a": "tulos", "5b": "tulos", "5d": "sosiaalinen", "5n": "osallistuminen",
  "5f": "henkilo", "5h": "henkilo", "5i": "henkilo", "5m": "henkilo",
};

/** Koukun [hakasulkeissa] oleva aihe piirretään korostelaatikkoon (kierros 5). */
export const AIHELAATIKKO: Pohja[] = ["5a", "5b", "5d"];

/** Kortit, jotka ohjaavat kommentteihin eivätkä sivustolle. */
export const KOMMENTTIPOHJAT: Pohja[] = ["4f", "4o", "4q", "4i", "5n"];

/** CTA-vaihtoehdot motiivin mukaan (design 4k: "valitaan motiivin listasta"). */
export const CTA_EHDOTUKSET: Record<Pohja, string[]> = {
  "4a": ["Testaa fanitasosi", "Todista se", "Näytä mitä osaat"],
  "4g": ["Näytä mitä osaat", "Testaa fanitasosi", "Todista se"],
  "4b": ["Testaa tietosi", "Selvitä tietosi", "Kokeile itse"],
  "4d": ["Testaa muistisi", "Katso, muistatko", "Palaa ajassa"],
  "4f": ["Vastaa kommenttiin", "Kerro vastauksesi"],
  "4l": ["Pelaa koko visa", "Testaa loput", "Pelaa kaikki"],
  "4m": ["Pelaa ja selvitä", "Selvitä vastaus", "Tarkista visassa"],
  "4n": ["Todista toisin", "Näytä Mikolle", "Todista se"],
  "4o": ["Laura vai Mikko?", "Kumman puolella olet?"],
  "4p": ["Pelaa ja selvitä", "Yllätytkö sinäkin?"],
  "4q": ["Auta Mikkoa", "Auta Lauraa", "Vastaa kommenttiin"],
  "4h": ["Näytä mitä osaat", "Testaa tietosi", "Selvitä tasosi"],
  "4r": ["Näytä mitä osaat", "Testaa tietosi", "Kerro kommentissa"],
  "4i": ["Kerro kommentissa"],
  "4j": ["Selvitä tuloksesi", "Testaa tietosi"],
  "5a": ["Tavoittele täysiä", "Kokeile täysiä", "Hae täydet"],
  "5b": ["Tavoittele täysiä", "Kokeile täysiä", "Hae täydet"],
  "5d": ["Haasta kaveri", "Kutsu kaveri", "Kumpi voittaa?"],
  "5n": ["Laura vai Mikko?", "Kumman puolella olet?"],
  "5f": ["Testaa tietosi", "Näytä mitä osaat", "Selvitä tasosi"],
  "5h": ["Testaa tietosi", "Muistatko hänet?"],
  "5i": ["Testaa tietosi", "Näytä mitä osaat", "Selvitä tasosi"],
  "5m": ["Testaa tietosi", "Näytä mitä osaat"],
};

/** Kentät, joita pohja käyttää — adminin lomake näyttää vain nämä. */
export type Kentta = "aihe" | "koukku" | "palkinto" | "syy";
export const POHJAN_KENTAT: Record<Pohja, Kentta[]> = {
  "4a": ["koukku", "palkinto"],
  "4g": ["koukku"],
  "4b": ["aihe", "koukku", "palkinto"],
  "4d": ["koukku"],
  "4f": ["aihe", "koukku"],
  "4l": ["aihe", "koukku"],
  "4m": ["aihe", "palkinto"],
  "4n": ["koukku"],
  "4o": ["koukku"],
  "4p": ["koukku"],
  "4q": ["koukku"],
  "4h": ["koukku", "palkinto"],
  "4r": ["koukku"],
  "4i": ["koukku"],
  "4j": ["koukku", "palkinto"],
  "5a": ["aihe", "koukku"],
  "5b": ["aihe", "koukku"],
  "5d": ["aihe", "koukku", "palkinto"],
  "5n": ["koukku"],
  "5f": ["koukku", "syy"],
  "5h": ["koukku", "syy"],
  "5i": ["koukku", "syy"],
  "5m": ["koukku", "syy"],
};

export const KYSYMYSPOHJAT: Pohja[] = ["4f", "4l", "4m", "4o", "4p", "4q", "5n"];
export const kysymyksiaPohjalle = (p: Pohja) => (p === "4l" ? 3 : KYSYMYSPOHJAT.includes(p) ? 1 : 0);

/** Pohjat, joiden koukku luonnostellaan tekoälyllä. Muissa koukku on kiinteä oletus
    ("Tiedätkö ilman apua?", "Tämä yllätti Lauran." …), jota toimitus voi muokata. */
export const TEKOALY_KOUKKU: Pohja[] = ["4a", "4b", "4d", "4g", "4h", "4j", "4n", "4r", "5a", "5b", "5d", ...HENKILOPOHJAT];
/** Pohjat, joiden palkintorivi luonnostellaan tekoälyllä. */
export const TEKOALY_PALKINTO: Pohja[] = ["4a", "4b", "4h", "4j"];

/** Identiteettikortit lupaavat tason ("Visa kertoo, mille tasolle yllät") →
    visalla pitää olla fanitasot tulosruudussa. */
export const LUPAA_TASON: Pohja[] = ["4a", "4g", "4n"];

/** Pohjan oletustekstit, kun kenttä on tyhjä (samat kuin piirrossa) — lomakkeen paikkamerkit. */
export const OLETUSTEKSTIT: Record<Pohja, { koukku?: string; palkinto?: string; cta: string }> = {
  "4a": { cta: "Testaa fanitasosi" },
  "4g": { cta: "Näytä mitä osaat" },
  "4b": { cta: "Testaa tietosi" },
  "4d": { cta: "Testaa muistisi" },
  "4f": { koukku: "Tiedätkö ilman apua?", cta: "Vastaa kommenttiin" },
  "4l": { koukku: "Montako näistä tiedät?", cta: "Pelaa koko visa" },
  "4m": { palkinto: "Tämä kysymys on mukana visassa.", cta: "Pelaa ja selvitä" },
  "4n": { cta: "Todista toisin" },
  "4o": { koukku: "Kumpi on oikeassa?", cta: "Laura vai Mikko?" },
  "4p": { koukku: "Tämä yllätti Lauran. / …juontajat.", cta: "Pelaa ja selvitä" },
  "4q": { koukku: "Tiedätkö sinä?", cta: "Auta Mikkoa / Lauraa" },
  "4h": { koukku: "Kuinka hyvin tunnet hänet?", cta: "Näytä mitä osaat" },
  "4r": { koukku: "Kuinka hyvin tunnet hänet?", cta: "Näytä mitä osaat" },
  "4i": { koukku: "Mikä on ensimmäinen muistosi hänestä?", cta: "Kerro kommentissa" },
  "4j": { cta: "Selvitä tuloksesi" },
  "5a": { koukku: "Saatko [Salkkareista] täydet?", cta: "Tavoittele täysiä" },
  "5b": { koukku: "Saatko [Salkkareista] täydet?", cta: "Tavoittele täysiä" },
  "5d": { koukku: "Kumpi teistä tietää enemmän [Formula 1:stä]?", palkinto: "Merkitse se kaveri.", cta: "Haasta kaveri" },
  "5n": { koukku: "Kumpi on oikeassa?", cta: "Laura vai Mikko?" },
  "5f": { koukku: "Kuinka hyvin tunnet hänet?", cta: "Testaa tietosi" },
  "5h": { koukku: "Kuinka hyvin tunnet hänet?", cta: "Testaa tietosi" },
  "5i": { koukku: "Kuinka hyvin tunnet hänet?", cta: "Testaa tietosi" },
  "5m": { koukku: "Kuinka hyvin tunnet hänet?", cta: "Testaa tietosi" },
};

/** Käsin valittavat (eivät ole kierrossa) — lomakkeen selite. */
export const KASIN: Pohja[] = ["4b", "4d", "4g", "4i", "4j", "4n", "4p", "4q"];
