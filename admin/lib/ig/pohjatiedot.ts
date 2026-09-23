// Instagram-pohjien tiedot (kierros 4) ilman piirtokoodia — käytössä myös adminin
// selainkomponenteissa (julkaisukortti), jotka eivät voi tuoda sharpia tai fontteja.

/* ── Tunnukset ───────────────────────────────────────────────────────── */

export type Pohja =
  | "4a" | "4b" | "4c" | "4d" | "4e" | "4f" | "4g" | "4l" | "4m" | "4n" | "4o" | "4p" | "4q"
  | "4h" | "4i" | "4j" | "4r";

/** Visajulkaisun pohjat (Päivän visa, omat ja kampanjat) */
export const VISA_POHJAT: Pohja[] = ["4a", "4g", "4b", "4c", "4d", "4e", "4f", "4l", "4m", "4n", "4o", "4p", "4q"];
/** Synttärijulkaisun pohjat */
export const SYNT_POHJAT: Pohja[] = ["4h", "4r", "4i", "4j"];

/** Kierrossa automaattisesti; muut valitaan käsin, koska ne vaativat toimituksellisen
    harkinnan (4d nostalgia: visan pitää oikeasti käsitellä vanhaa; 4j: henkilön
    tuotannosta oikea visa; 4i: henkilökuva ja kuvaajatieto). */
export const AUTO_VISA: Pohja[] = ["4a", "4g", "4b", "4c", "4e", "4f", "4l", "4m", "4n", "4o", "4p", "4q"];
export const AUTO_SYNT: Pohja[] = ["4h", "4r"];

export const POHJA_NIMET: Record<string, string> = {
  "4a": "Identiteetti · kuva",
  "4g": "Identiteetti · kuva kehyksessä",
  "4b": "Uteliaisuus · ilman kuvaa",
  "4c": "Pistemäärähaaste",
  "4d": "Nostalgia",
  "4e": "Sosiaalinen · haasta kaveri",
  "4f": "Oikea visakysymys",
  "4l": "Useampi kysymys",
  "4m": "Kysymys + peitetty vastaus",
  "4n": "Mikko haastaa",
  "4o": "Juontajat eri mieltä",
  "4p": "Laura yllättyy",
  "4q": "Mikko miettii",
  "4h": "Synttäri → visa",
  "4r": "Juontajat onnittelevat",
  "4i": "Synttäri · muisto kommenttiin",
  "4j": "Synttäri · tuotanto on koukku",
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
  "4a": "kuva", "4g": "kuva", "4e": "kuva", "4d": "kuva",
  "4b": "teksti", "4c": "teksti",
  "4f": "kysymys", "4l": "kysymys", "4m": "kysymys",
  "4n": "juontaja", "4o": "juontaja", "4p": "juontaja", "4q": "juontaja",
  "4h": "synttari", "4r": "synttari", "4i": "synttari", "4j": "synttari",
};

/** Designin motiivi (kierros 3–4) — tekoälyluonnoksen ohje ja adminin selite. */
export const MOTIIVI: Record<Pohja, string> = {
  "4a": "identiteetti", "4g": "identiteetti", "4n": "identiteetti",
  "4b": "uteliaisuus", "4m": "uteliaisuus", "4p": "uteliaisuus",
  "4c": "tulos", "4d": "nostalgia", "4e": "sosiaalinen",
  "4f": "osallistuminen", "4l": "osallistuminen", "4o": "osallistuminen", "4q": "osallistuminen",
  "4h": "synttari", "4r": "synttari", "4i": "muisto", "4j": "synttari",
};

/** Kortit, jotka ohjaavat kommentteihin eivätkä sivustolle. */
export const KOMMENTTIPOHJAT: Pohja[] = ["4f", "4o", "4q", "4i"];

/** CTA-vaihtoehdot motiivin mukaan (design 4k: "valitaan motiivin listasta"). */
export const CTA_EHDOTUKSET: Record<Pohja, string[]> = {
  "4a": ["Testaa fanitasosi", "Todista se", "Näytä mitä osaat"],
  "4g": ["Näytä mitä osaat", "Testaa fanitasosi", "Todista se"],
  "4b": ["Testaa tietosi", "Selvitä tietosi", "Kokeile itse"],
  "4c": ["Tavoittele täysiä", "Kokeile täysiä", "Hae täydet"],
  "4d": ["Testaa muistisi", "Katso, muistatko", "Palaa ajassa"],
  "4e": ["Haasta kaveri", "Kutsu kaveri", "Kumpi voittaa?"],
  "4f": ["Vastaa kommenttiin", "Kerro vastauksesi"],
  "4l": ["Pelaa koko visa", "Testaa loput", "Pelaa kaikki"],
  "4m": ["Pelaa ja selvitä", "Selvitä vastaus", "Tarkista visassa"],
  "4n": ["Todista toisin", "Näytä Mikolle", "Todista se"],
  "4o": ["Laura vai Mikko?", "Kumman puolella olet?"],
  "4p": ["Pelaa ja selvitä", "Yllätytkö sinäkin?"],
  "4q": ["Auta Mikkoa", "Vastaa kommenttiin"],
  "4h": ["Näytä mitä osaat", "Testaa tietosi", "Selvitä tasosi"],
  "4r": ["Näytä mitä osaat", "Testaa tietosi", "Kerro kommentissa"],
  "4i": ["Kerro kommentissa"],
  "4j": ["Selvitä tuloksesi", "Testaa tietosi"],
};

/** Kentät, joita pohja käyttää — adminin lomake näyttää vain nämä. */
export const POHJAN_KENTAT: Record<Pohja, Array<"aihe" | "koukku" | "palkinto">> = {
  "4a": ["koukku", "palkinto"],
  "4g": ["koukku"],
  "4b": ["aihe", "koukku", "palkinto"],
  "4c": ["aihe", "koukku", "palkinto"],
  "4d": ["koukku"],
  "4e": ["aihe", "koukku", "palkinto"],
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
};

export const KYSYMYSPOHJAT: Pohja[] = ["4f", "4l", "4m", "4o", "4p", "4q"];
export const kysymyksiaPohjalle = (p: Pohja) => (p === "4l" ? 3 : KYSYMYSPOHJAT.includes(p) ? 1 : 0);

/** Pohjat, joiden koukku luonnostellaan tekoälyllä. Muissa koukku on kiinteä oletus
    ("Tiedätkö ilman apua?", "Tämä yllätti Lauran." …), jota toimitus voi muokata. */
export const TEKOALY_KOUKKU: Pohja[] = ["4a", "4b", "4d", "4g", "4h", "4j", "4n", "4r"];
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
  "4c": { koukku: "Saatko täydet?", palkinto: "Montako saat oikein ilman apua?", cta: "Tavoittele täysiä" },
  "4d": { cta: "Testaa muistisi" },
  "4e": { koukku: "Kumpi teistä tietää enemmän?", palkinto: "Merkitse se kaveri.", cta: "Haasta kaveri" },
  "4f": { koukku: "Tiedätkö ilman apua?", cta: "Vastaa kommenttiin" },
  "4l": { koukku: "Montako näistä tiedät?", cta: "Pelaa koko visa" },
  "4m": { palkinto: "Tämä kysymys on mukana visassa.", cta: "Pelaa ja selvitä" },
  "4n": { cta: "Todista toisin" },
  "4o": { koukku: "Kumpi on oikeassa?", cta: "Laura vai Mikko?" },
  "4p": { koukku: "Tämä yllätti Lauran.", cta: "Pelaa ja selvitä" },
  "4q": { koukku: "Tiedätkö sinä?", cta: "Auta Mikkoa" },
  "4h": { koukku: "Kuinka hyvin tunnet hänet?", cta: "Näytä mitä osaat" },
  "4r": { koukku: "Kuinka hyvin tunnet hänet?", cta: "Näytä mitä osaat" },
  "4i": { koukku: "Mikä on ensimmäinen muistosi hänestä?", cta: "Kerro kommentissa" },
  "4j": { cta: "Selvitä tuloksesi" },
};

/** Käsin valittavat (eivät ole kierrossa) — lomakkeen selite. */
export const KASIN: Pohja[] = ["4d", "4i", "4j"];
