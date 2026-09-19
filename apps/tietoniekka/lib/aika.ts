// SUOMEN AIKA — kalenteripäivä Europe/Helsinki-aikavyöhykkeessä.
//
// Lisätty 19.9.2026: etusivun Päivän visa laski päivän UTC:nä
// (new Date().toISOString().slice(0, 10)), joten kortti vaihtui Suomessa
// klo 3 yöllä (kesäaika) eikä keskiyöllä, ja päivänsankarin "Tänään juhlii"
// vertasi palvelimen (Vercel = UTC) päivää. Kaikki "tänään"-logiikka, joka
// ajetaan palvelimella, käyttää tätä.

export type Paiva = { vuosi: number; kk: number; pv: number; /** "2026-09-19" */ iso: string };

export function helsinginPaiva(nyt: Date = new Date()): Paiva {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(nyt);
  const [vuosi, kk, pv] = iso.split("-").map(Number);
  return { vuosi, kk, pv, iso };
}

/** Kannan DATE-arvo ("1979-09-20") osiin ilman aikavyöhykemuunnosta —
    new Date("1979-09-20") tulkitaan UTC-keskiyöksi ja voi siirtyä päivällä. */
export function pvmOsat(isoDate: string): { vuosi: number; kk: number; pv: number } {
  const [vuosi, kk, pv] = isoDate.slice(0, 10).split("-").map(Number);
  return { vuosi, kk, pv };
}
