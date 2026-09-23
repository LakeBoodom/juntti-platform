/* eslint-disable @next/next/no-img-element */
// Instagram-pohjat (Claude Design "TN Instagram-pohjat", kierros 2 — A/B-testisarja).
// Mitat, värit ja fonttikoot ovat designin speksistä. Poikkeamat on merkitty
// kommentilla "POIKKEAMA" ja syy kerrottu.
//
// Piirto: next/og (Satori) — vain flexbox, kiinteät pikselit. Kaikki isot
// otsikot sovitetaan mittaamalla (fontit.ts: sovita) ja rivit piirretään
// valmiiksi rivitettyinä, jotta Satori ei voi katkaista sanaa keskeltä
// (KORTTISÄÄNTÖ). Designin mockupissa osa otsikoista leikkautui suurimmalla
// koolla (esim. "SUOMALAISET", "HELSINGIN") — porrastus korjaa sen.

import type { ReactElement } from "react";
import { leveys, sovita, type lataaFontit } from "./fontit";
import {
  kelpaaKaistaleeksi,
  kelpaaKokoPinnaksi,
  lyhytPaiva,
  onPyorea,
  paivaTeksti,
  rajaa,
  type SynttariData,
  type VisaData,
} from "./data";

export const W = 1080;
export const H = 1350;
const SISA = 952; // 1080 − 2 × 64

type Mitat = Awaited<ReturnType<typeof lataaFontit>>["mitat"];

/** Kuvan rajaaja. Tarkistustilassa (esteiden laskenta 14 päivälle kerralla)
    kuvia ei rajata, vaan palautetaan tyhjä paikkamerkki. */
type Kuvaksi = (k: Parameters<typeof rajaa>[0], w: number, h: number) => Promise<string>;
const RAJAA: Kuvaksi = (k, w, h) => rajaa(k, w, h);
const EI_KUVAA: Kuvaksi = async () => "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

export type Pohja = "V-A" | "V-B" | "V-C" | "V-D" | "V-E" | "S-A" | "S-B" | "S-C" | "S-D";
export type VdVari = "lime" | "valkoinen" | "mintti";

/** Toimitetut tekstit, joita kannassa ei valmiiksi ole (ig_julkaisut.kentat). */
export type Kentat = {
  /** V-B: haaste, esim. "Montako suomalaista F1-kuljettajaa muistat ulkoa?" */
  haaste?: string;
  /** V-B: haasteen alle, oletus "Vastaa kommenttiin ennen kuin pelaat…" */
  haasteAla?: string;
  /** V-E: karusellin koukku ja sen alarivi */
  koukku?: string;
  koukkuAla?: string;
  /** V-E: 2–3 sisältökenttää ({otsikko, teksti}) */
  sisalto?: Array<{ otsikko: string; teksti: string }>;
  /** S-D: iso kysymysrivi, esim. "Entä muut suomalaiset Formula 1:ssä?" */
  kysymys?: string;
  /** S-A: kuvaajan nimi ja lisenssi (kuvatekstiin) — ilman tätä S-A ei ole julkaistavissa */
  kuvaaja?: string;
};

export type Piirros = {
  /** Karusellissa useampi ruutu, muuten yksi */
  ruudut: ReactElement[];
  /** Syyt, miksi pohja ei ole julkaisukelpoinen tällä sisällöllä */
  esteet: string[];
  /** Huomiot, jotka eivät estä (esim. rooli pudotettu) */
  huomiot: string[];
  onKuva: boolean;
};

/* ── Värit ───────────────────────────────────────────────────────────── */

type Aksentti = { bg: string; ink: string };
const A = {
  lime: { bg: "#B6FF3C", ink: "#131109" },
  mintti: { bg: "#2FD9A5", ink: "#0B1A14" },
  magenta: { bg: "#E85CC8", ink: "#1A0714" },
  kulta: { bg: "#E8A320", ink: "#131109" },
  sininen: { bg: "#4C9AFF", ink: "#06121F" },
  amber: { bg: "#C9A96A", ink: "#161005" },
  oranssi: { bg: "#FF5C3D", ink: "#1A0804" },
  muisto: { bg: "#7FB2D9", ink: "#0A1622" },
} satisfies Record<string, Aksentti>;

/** Kokoelman aksentti (design 1a: urheilu lime, luonto mintti, TV magenta, henkilöt amber).
    Jääkiekko sininen, jotta peräkkäiset urheilupäivät erottuvat värinkin puolesta. */
export function aksentti(kokoelma: string): Aksentti {
  switch (kokoelma) {
    case "Urheilu":
      return A.lime;
    case "Jääkiekko":
      return A.sininen;
    case "Luonto":
    case "Tiede & teknologia":
    case "Maantieto":
      return A.mintti;
    case "TV & suoratoisto":
    case "Musiikki":
      return A.magenta;
    case "Elokuvat":
      return A.oranssi;
    case "Tunnetut henkilöt":
      return A.amber;
    default:
      return A.kulta;
  }
}

const VD_VARIT: Record<VdVari, { bg: string; ink: string; heikko: string }> = {
  lime: { bg: "#B6FF3C", ink: "#131109", heikko: "#2C3B0C" },
  valkoinen: { bg: "#F5F0E6", ink: "#131109", heikko: "#4A4334" },
  mintti: { bg: "#2FD9A5", ink: "#131109", heikko: "#0E3B2C" },
};

/* ── Apurit ──────────────────────────────────────────────────────────── */

const isot = (s: string) => s.toLocaleUpperCase("fi-FI");

const LUKUSANAT = ["nolla", "yksi", "kaksi", "kolme", "neljä", "viisi", "kuusi", "seitsemän", "kahdeksan", "yhdeksän", "kymmenen",
  "yksitoista", "kaksitoista", "kolmetoista", "neljätoista", "viisitoista", "kuusitoista", "seitsemäntoista", "kahdeksantoista", "yhdeksäntoista", "kaksikymmentä"];
export const lukusana = (n: number) => (n >= 0 && n < LUKUSANAT.length ? LUKUSANAT[n] : String(n));
const iso1 = (s: string) => (s ? s[0].toLocaleUpperCase("fi-FI") + s.slice(1) : s);

/** Valmiiksi rivitetty otsikko: jokainen rivi omana elementtinään (ei nowrap-katkoja). */
/** POIKKEAMA: designin rivivälit .86–.92 ovat liian tiukkoja isoille kirjaimille —
    Ä:n ja Ö:n pisteet ulottuvat Archivo 900:ssa 0,885 em:n korkeuteen, jolloin ne
    osuvat edellisen rivin kirjaimiin. Isoilla kirjaimilla vähintään 0,95. */
const ISOT_LH = 0.95;

function Rivit(p: { rivit: string[]; koko: number; lh: number; style: Record<string, unknown> }) {
  const isoilla = p.rivit.every((r) => r === r.toLocaleUpperCase("fi-FI"));
  const lh = isoilla ? Math.max(p.lh, ISOT_LH) : p.lh;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {p.rivit.map((r, i) => (
        <div key={i} style={{ display: "flex", whiteSpace: "nowrap", fontSize: p.koko, lineHeight: `${Math.round(p.koko * lh)}px`, ...p.style }}>
          {r}
        </div>
      ))}
    </div>
  );
}

function Nuoli({ koko, vari }: { koko: number; vari: string }) {
  const w = Math.round(koko * 0.95);
  return (
    <svg width={w} height={Math.round(koko * 0.7)} viewBox="0 0 24 18" style={{ margin: `0 ${Math.round(koko * 0.3)}px` }}>
      <path d="M1 9h19M13 2l8 7-8 7" stroke={vari} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Logo({ yksivari, koko = 30 }: { yksivari?: string; koko?: number }) {
  return (
    <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 900, fontSize: koko, letterSpacing: koko * 0.06 }}>
      <span style={{ color: yksivari ?? "#E8A320" }}>TIETO</span>
      <span style={{ color: yksivari ?? "#FFFFFF" }}>NIEKKA</span>
    </div>
  );
}

function logonLeveys(m: Mitat, koko = 30) {
  return leveys(m, "TIETONIEKKA", "Archivo", 900, koko, 0.06);
}

/**
 * CTA-pilleri. POIKKEAMA: designissa 32 px:n "PELAA PÄIVÄN VISA → LINKKI BIOSSA"
 * rivittyi pilleriin kahdelle riville logon vieressä. Sovitetaan yhdelle riville:
 * ensin pienennetään (32 → 28), sitten lyhennetään ("PELAA → LINKKI BIOSSA").
 */
function Cta(p: {
  m: Mitat;
  verbi: string;
  lyhyt: string;
  bg: string;
  ink: string;
  maxLeveys: number;
  korkeus?: number;
  koot?: number[];
  reuna?: boolean;
  tayslev?: boolean;
}) {
  const koot = p.koot ?? [32, 30, 28];
  const loppu = "LINKKI BIOSSA";
  const pad = 34;
  const mitta = (verbi: string, k: number) =>
    leveys(p.m, isot(verbi), "Archivo", 900, k) + k * 0.95 + k * 0.6 + leveys(p.m, loppu, "Archivo", 900, k) + pad * 2;
  let valinta = { verbi: p.verbi, koko: koot[koot.length - 1] };
  let loytyi = false;
  for (const verbi of [p.verbi, p.lyhyt]) {
    for (const k of koot) {
      if (mitta(verbi, k) <= p.maxLeveys) { valinta = { verbi, koko: k }; loytyi = true; break; }
    }
    if (loytyi) break;
  }
  return (
    <div
      style={{
        height: p.korkeus ?? 76,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `0 ${pad}px`,
        borderRadius: 999,
        background: p.reuna ? "transparent" : p.bg,
        border: p.reuna ? `3px solid ${p.bg}` : "none",
        color: p.reuna ? p.bg : p.ink,
        fontFamily: "Archivo",
        fontWeight: 900,
        fontSize: valinta.koko,
        whiteSpace: "nowrap",
        ...(p.tayslev ? { width: "100%" } : {}),
      }}
    >
      <span>{isot(valinta.verbi)}</span>
      <Nuoli koko={valinta.koko} vari={p.reuna ? p.bg : p.ink} />
      <span>{loppu}</span>
    </div>
  );
}

function Alarivi(p: { m: Mitat; verbi: string; lyhyt: string; ak: Aksentti; logoVari?: string; reuna?: boolean }) {
  const logoW = logonLeveys(p.m);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Logo yksivari={p.logoVari} />
      <Cta m={p.m} verbi={p.verbi} lyhyt={p.lyhyt} bg={p.ak.bg} ink={p.ak.ink} maxLeveys={SISA - logoW - 28} reuna={p.reuna} />
    </div>
  );
}

const VISA_CTA = { verbi: "Pelaa päivän visa", lyhyt: "Pelaa" };
const SYNT_CTA = { verbi: "Testaa tietosi", lyhyt: "Testaa" };

function Kortti(p: { bg: string; children: React.ReactNode; padding?: string; column?: boolean; relative?: boolean }) {
  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        flexDirection: "column",
        justifyContent: p.column ? "flex-start" : "space-between",
        padding: p.padding ?? "64px",
        background: p.bg,
        fontFamily: "Instrument Sans",
        ...(p.relative ? { position: "relative" as const } : {}),
      }}
    >
      {p.children}
    </div>
  );
}

/* ── Päivän visa ─────────────────────────────────────────────────────── */

/** V-A "Tapahtuma edellä": päivän tapahtuma on kortin suurin viesti. */
async function vA(m: Mitat, v: VisaData, kuvaksi: Kuvaksi): Promise<Piirros> {
  const esteet: string[] = [];
  const huomiot: string[] = [];
  const ak = aksentti(v.kokoelma);
  const tapahtuma = v.introOtsikko ?? "";
  if (!tapahtuma) esteet.push("V-A vaatii päivän tapahtuman (intron otsikko).");
  if (tapahtuma.length > 60) esteet.push("Tapahtuma yli 60 merkkiä — design: toimitus kirjoittaa lyhyen version.");

  const kaistale = kelpaaKaistaleeksi(v.kuva);
  if (v.kuva && !kaistale) huomiot.push(`Kansikuva on liian pieni kaistaleeksi (${v.kuva.leveys} px) — pohja piirtyy ilman kuvaa.`);

  const otsikko = sovita(m, {
    teksti: tapahtuma || v.nimi, perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.035,
    // Design 128 → 112 → 96. Staattinen Archivo on leveämpi, ja pitkät yhdyssanat
    // ("SYYSPÄIVÄNTASAUS") vaativat vielä kaksi porrasta alaspäin.
    koot: kaistale ? [128, 112, 96, 84, 76] : [132, 128, 112, 96, 84, 76], leveys: SISA, maxRivit: kaistale ? 3 : 4,
  });
  if (tapahtuma && !otsikko.mahtuu) esteet.push(`Tapahtuma ei mahdu (enintään ${kaistale ? 3 : 4} riviä 76 px:llä) — lyhennä.`);
  const nimi = sovita(m, {
    teksti: v.nimi, perhe: "Archivo", paino: 700, koot: [56, 52, 48, 44, 40], leveys: SISA - 34, maxRivit: 2,
  });

  const kuva = kaistale && v.kuva ? await kuvaksi(v.kuva, W, 300) : null;
  const sisalto = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ height: 56, display: "flex", alignItems: "center", padding: "0 20px", background: ak.bg, color: ak.ink, fontSize: 32, fontWeight: 700, letterSpacing: 6.4 }}>TÄNÄÄN</div>
        <div style={{ fontSize: 32, fontWeight: 600, color: "#8E8676" }}>{paivaTeksti(v.paiva)}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        <Rivit rivit={otsikko.rivit} koko={otsikko.koko} lh={0.88} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.035 * otsikko.koko, color: "#FFFFFF" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 28, borderLeft: `6px solid ${ak.bg}` }}>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 4.8, color: "#8E8676" }}>PÄIVÄN VISA</div>
          <Rivit rivit={nimi.rivit} koko={nimi.koko} lh={1.05} style={{ fontFamily: "Archivo", fontWeight: 700, color: "#F5F0E6" }} />
        </div>
      </div>
      <Alarivi m={m} {...VISA_CTA} ak={ak} />
    </div>
  );
  return {
    ruudut: [
      <div key="va" style={{ width: W, height: H, display: "flex", flexDirection: "column", background: "#0E0C06", fontFamily: "Instrument Sans" }}>
        {sisalto}
        {kuva && <img src={kuva} width={W} height={300} alt="" style={{ width: W, height: 300 }} />}
      </div>,
    ],
    esteet,
    huomiot,
    onKuva: !!kuva,
  };
}

/** V-B "Kysymys edellä" — haastemuoto (faktaväitteetön, aina käytettävissä).
    Designin toinen muoto (oikea kysymys visasta + vastausvaihtoehdot) jätetään
    pois: se paljastaisi visan sisältöä ja vaatii kysymyksen valinnan. */
async function vB(m: Mitat, v: VisaData, k: Kentat, kuvaksi: Kuvaksi): Promise<Piirros> {
  const esteet: string[] = [];
  const huomiot: string[] = [];
  const ak = aksentti(v.kokoelma);
  const haaste = k.haaste?.trim() ?? "";
  if (!haaste) esteet.push("V-B vaatii haasteen (toimitettu teksti).");
  const ala = k.haasteAla?.trim() || `Vastaa kommenttiin ennen kuin pelaat. ${iso1(lukusana(v.kysymyksia))} kysymystä paljastaa, osuiko muisti.`;

  const kaistale = kelpaaKaistaleeksi(v.kuva);
  const otsikko = sovita(m, {
    teksti: haaste || "Haaste puuttuu", perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.03,
    koot: kaistale ? [88, 80, 72, 64] : [104, 88, 76, 68], leveys: SISA, maxRivit: kaistale ? 4 : 6,
  });
  if (haaste && !otsikko.mahtuu) esteet.push("Haaste ei mahdu — lyhennä (max noin 70 merkkiä).");
  if (haaste.length > 70) huomiot.push("Haaste yli 70 merkkiä (design: max 70).");

  const kuva = kaistale && v.kuva ? await kuvaksi(v.kuva, W, 360) : null;
  const alaviite = (
    <div style={{ display: "flex", flexWrap: "wrap", fontSize: 30, fontWeight: 600, color: "#7E93A8" }}>
      {v.introOtsikko ? <span>{v.introOtsikko}&nbsp;·&nbsp;</span> : null}
      <span style={{ color: "#F5F0E6" }}>{v.nimi}</span>
    </div>
  );
  const ylarivi = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 18px", borderRadius: 8, background: ak.bg, color: ak.ink, fontSize: 28, fontWeight: 700, letterSpacing: 4.5 }}>HAASTE</div>
      <div style={{ fontSize: 30, fontWeight: 600, color: "#7E93A8" }}>{paivaTeksti(v.paiva)}</div>
    </div>
  );
  const iso = <Rivit rivit={otsikko.rivit} koko={otsikko.koko} lh={0.92} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.03 * otsikko.koko, color: "#FFFFFF" }} />;

  const kortti = kuva ? (
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: "#101A26", fontFamily: "Instrument Sans" }}>
      <img src={kuva} width={W} height={360} alt="" style={{ width: W, height: 360 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px 64px" }}>
        {ylarivi}
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {iso}
          {alaviite}
        </div>
        <Alarivi m={m} {...VISA_CTA} ak={ak} />
      </div>
    </div>
  ) : (
    <Kortti bg="#101A26">
      {ylarivi}
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {iso}
        <div style={{ fontSize: 34, lineHeight: "48px", color: "#9FC4DE" }}>{ala}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {alaviite}
        <Alarivi m={m} {...VISA_CTA} ak={ak} />
      </div>
    </Kortti>
  );
  return { ruudut: [kortti], esteet, huomiot, onKuva: !!kuva };
}

/** V-C "Kuva edellä": kuva koko pinnalla, kolme riviä tekstiä. */
async function vC(m: Mitat, v: VisaData, kuvaksi: Kuvaksi): Promise<Piirros> {
  const esteet: string[] = [];
  const huomiot: string[] = [];
  const ak = aksentti(v.kokoelma);
  if (!v.kuva) esteet.push("V-C vaatii kansikuvan.");
  else if (!kelpaaKokoPinnaksi(v.kuva)) esteet.push(`Kansikuva liian pieni koko pinnalle (${v.kuva.leveys}×${v.kuva.korkeus}, tarvitaan väh. 850 px korkea).`);

  // Tapahtuma aina yhdellä rivillä (design: max 44 merkkiä) — muuten pois.
  let tapahtuma = v.introOtsikko ?? "";
  let tapahtumaKoko = 36;
  if (tapahtuma) {
    const t = sovita(m, { teksti: tapahtuma, perhe: "Instrument Sans", paino: 600, koot: [36, 32], leveys: SISA, maxRivit: 1 });
    if (t.mahtuu) tapahtumaKoko = t.koko;
    else { huomiot.push("Tapahtuma ei mahdu yhdelle riville — jätetty pois kuvasta."); tapahtuma = ""; }
  }
  const nimi = sovita(m, { teksti: v.nimi, perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.025, koot: [72, 62, 54, 48], leveys: SISA, maxRivit: 3 });
  if (!nimi.mahtuu) esteet.push("Visan nimi ei mahdu kolmelle riville 48 px:llä.");

  const kuva = v.kuva ? await kuvaksi(v.kuva, W, H) : null;
  return {
    ruudut: [
      <div key="vc" style={{ width: W, height: H, display: "flex", position: "relative", background: "#0E0C06", fontFamily: "Instrument Sans" }}>
        {kuva && <img src={kuva} width={W} height={H} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: H }} />}
        <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(14,12,6,.55) 0%, rgba(14,12,6,0) 26%, rgba(14,12,6,0) 50%, rgba(14,12,6,.95) 86%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 18px", background: ak.bg, color: ak.ink, fontSize: 30, fontWeight: 700, letterSpacing: 5.4 }}>TÄNÄÄN</div>
            <div style={{ fontSize: 30, fontWeight: 600, color: "#E4DACA" }}>{paivaTeksti(v.paiva)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {tapahtuma ? <div style={{ fontSize: tapahtumaKoko, fontWeight: 600, color: "#E4DACA", whiteSpace: "nowrap" }}>{tapahtuma}</div> : null}
            <Rivit rivit={nimi.rivit} koko={nimi.koko} lh={0.95} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.025 * nimi.koko, color: "#FFFFFF" }} />
            <div style={{ display: "flex", paddingTop: 10 }}>
              <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
                <Alarivi m={m} {...VISA_CTA} ak={ak} />
              </div>
            </div>
          </div>
        </div>
      </div>,
    ],
    esteet,
    huomiot,
    onKuva: !!kuva,
  };
}

/** V-D "Typografia edellä": kirkas käänteinen pohja, ei kuvaa. */
async function vD(m: Mitat, v: VisaData, vari: VdVari): Promise<Piirros> {
  const esteet: string[] = [];
  const c = VD_VARIT[vari];
  const nimi = sovita(m, {
    teksti: v.nimi, perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.04,
    // Design 178 → 146 → 112 → 96. "JALKAPALLOMAAJOUKKUE" ja "KUNINKAALLISET"
    // eivät mahdu staattisella Archivolla 96 px:iin → kaksi porrasta lisää.
    koot: [178, 146, 112, 96, 84, 72, 64], leveys: SISA, maxRivit: 6,
  });
  if (!nimi.mahtuu) esteet.push("Visan nimi ei mahdu 64 px:llä — pisin sana on liian pitkä.");
  const ala = v.introOtsikko ?? v.kokoelma;
  return {
    ruudut: [
      <Kortti key="vd" bg={c.bg}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 6.4, color: c.ink }}>PÄIVÄN VISA</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: c.heikko }}>{paivaTeksti(v.paiva)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          <Rivit rivit={nimi.rivit} koko={nimi.koko} lh={0.86} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.04 * nimi.koko, color: c.ink }} />
          <div style={{ width: SISA, height: 6, background: c.ink }} />
          <div style={{ fontSize: 38, fontWeight: 600, lineHeight: "50px", color: c.heikko }}>{ala}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "Archivo", fontWeight: 900, fontSize: 32, letterSpacing: 1.9, color: c.ink }}>TIETONIEKKA</div>
          <Cta m={m} {...VISA_CTA} bg={c.ink} ink={c.bg} maxLeveys={SISA - leveys(m, "TIETONIEKKA", "Archivo", 900, 32, 0.06) - 28} />
        </div>
      </Kortti>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** V-E "Karuselli": koukku → 2–3 sisältökenttää → siirtymä visaan. */
async function vE(m: Mitat, v: VisaData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const huomiot: string[] = [];
  const koukku = k.koukku?.trim() ?? "";
  const sisalto = (k.sisalto ?? []).filter((s) => s.otsikko?.trim() && s.teksti?.trim()).slice(0, 3);
  if (!koukku) esteet.push("V-E vaatii koukun (toimitettu teksti).");
  if (sisalto.length < 2) esteet.push("V-E vaatii vähintään kaksi sisältökenttää.");
  const loput = Math.max(0, v.kysymyksia - sisalto.length);

  const kouk = sovita(m, { teksti: koukku || "Koukku puuttuu", perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.03, koot: [128, 116, 96, 84, 76], leveys: SISA, maxRivit: 5 });
  if (koukku && !kouk.mahtuu) esteet.push("Koukku ei mahdu — lyhennä.");
  const kentat = sisalto.map((s) => {
    const r = sovita(m, { teksti: s.teksti, perhe: "Archivo", paino: 900, koot: [56, 48], leveys: SISA - 70, maxRivit: 2 });
    if (!r.mahtuu) esteet.push(`Sisältökenttä "${s.teksti.slice(0, 30)}…" ei mahdu kahdelle riville.`);
    return { ...s, r };
  });
  const loppuOts = sovita(m, { teksti: `Loput ${lukusana(loput)} odottavat visassa`, perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.035, koot: [128, 112, 96, 84], leveys: SISA, maxRivit: 4 });

  const pisteet = (aktiivinen: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 16, height: 16, borderRadius: 999, background: i === aktiivinen ? "#E8A320" : "#4A4334" }} />
      ))}
    </div>
  );

  const r1 = (
    <Kortti key="ve1" bg="#131109">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 18px", borderRadius: 8, background: "#E8A320", color: "#131109", fontSize: 28, fontWeight: 700, letterSpacing: 4.5 }}>PÄIVÄN VISA</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: "#8E8676" }}>{paivaTeksti(v.paiva)}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <Rivit rivit={kouk.rivit} koko={kouk.koko} lh={0.9} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.03 * kouk.koko, color: "#FFFFFF" }} />
        <div style={{ fontSize: 36, lineHeight: "50px", color: "#CFC7B6" }}>{k.koukkuAla?.trim() || "Tunnistatko? Pyyhkäise."}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        {pisteet(0)}
      </div>
    </Kortti>
  );
  const r2 = (
    <Kortti key="ve2" bg="#1A1508">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 5, color: "#E8A320" }}>{isot(v.nimi).slice(0, 44)}</div>
        <div style={{ fontSize: 30, fontWeight: 600, color: "#8E8676" }}>2 / 3</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {kentat.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 14, padding: "34px 32px", border: "3px solid #3A3122", borderRadius: 16, background: "#211B0C" }}>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4.3, color: "#8E8676" }}>{isot(s.otsikko)}</div>
            <Rivit rivit={s.r.rivit} koko={s.r.koko} lh={1} style={{ fontFamily: "Archivo", fontWeight: 900, color: "#F5F0E6" }} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 34, lineHeight: "48px", color: "#CFC7B6" }}>{loput > 0 ? `Loput ${lukusana(loput)} jäävät visaan. Pyyhkäise.` : "Pyyhkäise."}</div>
    </Kortti>
  );
  const r3 = (
    <Kortti key="ve3" bg="#E8A320">
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 6.4, color: "#131109" }}>{`PÄIVÄN VISA · ${lyhytPaiva(v.paiva)}`}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
        <Rivit rivit={loppuOts.rivit} koko={loppuOts.koko} lh={0.88} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.035 * loppuOts.koko, color: "#131109" }} />
        <div style={{ fontSize: 38, fontWeight: 600, lineHeight: "50px", color: "#3D2A05" }}>
          {v.introOtsikko ? `${v.nimi} · ${v.introOtsikko}` : v.nimi}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <Cta m={m} {...VISA_CTA} bg="#131109" ink="#E8A320" maxLeveys={SISA} korkeus={96} koot={[38, 34, 32]} tayslev />
        <div style={{ fontFamily: "Archivo", fontWeight: 900, fontSize: 32, letterSpacing: 1.9, color: "#131109" }}>TIETONIEKKA</div>
      </div>
    </Kortti>
  );
  return { ruudut: [r1, r2, r3], esteet, huomiot, onKuva: false };
}

/* ── Päivän synttärit ────────────────────────────────────────────────── */

function synttariTeksti(s: SynttariData) {
  return s.muisto ? `Olisi täyttänyt tänään ${s.ika} vuotta` : `Täyttää tänään ${s.ika} vuotta`;
}
function synttariLabel(s: SynttariData) {
  return s.muisto ? "MUISTOPÄIVÄ" : "PÄIVÄN SYNTTÄRIT";
}
const vuodet = (s: SynttariData) => (s.syntymavuosi && s.kuolinvuosi ? `${s.syntymavuosi}–${s.kuolinvuosi}` : "");

/** Ikärivi yhdelle riville: [vuodet ·] [rooli ·] ikä. Rooli pudotetaan ensin (design 2i),
    muistopäivän vuosiluvut säilyvät aina. */
function ikarivi(m: Mitat, s: SynttariData, koko: number, maxLev: number, huomiot: string[]) {
  const perus = synttariTeksti(s);
  const alku = s.muisto && vuodet(s) ? `${vuodet(s)} · ` : "";
  const pieni = `${perus.charAt(0).toLocaleLowerCase("fi-FI")}${perus.slice(1)}`;
  if (s.rooli) {
    const koe = `${alku}${s.rooli} · ${pieni}`;
    if (leveys(m, koe, "Instrument Sans", 600, koko) <= maxLev - 6) return koe;
    huomiot.push("Rooli ei mahtunut ikäriville — pudotettu.");
  }
  return alku ? `${alku}${pieni}` : perus;
}

/** S-A "Henkilökuva edellä": vaatii isokokoisen kuvan ja kuvaajan tiedon. */
async function sA(m: Mitat, s: SynttariData, k: Kentat, kuvaksi: Kuvaksi): Promise<Piirros> {
  const esteet: string[] = [];
  const huomiot: string[] = [];
  const ak = s.muisto ? A.muisto : A.amber;
  if (!s.kuva) esteet.push("S-A vaatii henkilökuvan.");
  else if (!kelpaaKokoPinnaksi(s.kuva)) esteet.push(`Henkilökuva liian pieni koko pinnalle (${s.kuva.leveys}×${s.kuva.korkeus}).`);
  if (!k.kuvaaja?.trim()) esteet.push("S-A vaatii kuvaajan nimen ja lisenssin (CC BY-SA edellyttää sitä kuvatekstiin).");
  const nimi = sovita(m, { teksti: s.nimi, perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.025, koot: [92, 76, 62], leveys: SISA, maxRivit: 2 });
  if (!nimi.mahtuu) esteet.push("Nimi ei mahdu kahdelle riville.");
  const rivi = ikarivi(m, s, 36, SISA, huomiot);
  const kuva = s.kuva ? await kuvaksi(s.kuva, W, H) : null;
  return {
    ruudut: [
      <div key="sa" style={{ width: W, height: H, display: "flex", position: "relative", background: "#131109", fontFamily: "Instrument Sans" }}>
        {kuva && <img src={kuva} width={W} height={H} alt="" style={{ position: "absolute", top: 0, left: 0, width: W, height: H }} />}
        <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", /* POIKKEAMA: design .35 → .85 yläreunassa — vaalealla kuvalla tunniste ja päivä eivät erottuneet */ backgroundImage: "linear-gradient(180deg, rgba(19,17,9,.85) 0%, rgba(19,17,9,.35) 14%, rgba(19,17,9,0) 28%, rgba(19,17,9,0) 40%, rgba(19,17,9,.92) 78%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 5.4, color: ak.bg }}>{synttariLabel(s)}</div>
            <div style={{ fontSize: 30, fontWeight: 600, color: "#E4DACA" }}>{paivaTeksti(s.paiva)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Rivit rivit={nimi.rivit} koko={nimi.koko} lh={0.94} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.025 * nimi.koko, color: "#FFFFFF" }} />
            <div style={{ fontSize: 36, fontWeight: 600, color: s.muisto ? "#CFE0EE" : "#E0C58C" }}>{rivi}</div>
            <div style={{ display: "flex", paddingTop: 12 }}>
              <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
                <Alarivi m={m} {...SYNT_CTA} ak={ak} reuna={s.muisto} />
              </div>
            </div>
          </div>
        </div>
      </div>,
    ],
    esteet,
    huomiot,
    onKuva: !!kuva,
  };
}

/** S-B "Nimi edellä": luonnonvalkoinen, ei kuvaa. Muistopäivänä tumma ja hillitty. */
async function sB(m: Mitat, s: SynttariData): Promise<Piirros> {
  const huomiot: string[] = [];
  const esteet: string[] = [];
  const bg = s.muisto ? "#101820" : "#F5F0E6";
  const ink = s.muisto ? "#EEF3F7" : "#131109";
  const heikko = s.muisto ? "#9FB6C8" : "#4A4334";
  const nimi = sovita(m, { teksti: s.nimi, perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.04, koot: [152, 124, 98, 84], leveys: SISA, maxRivit: 3 });
  if (!nimi.mahtuu) esteet.push("Nimi ei mahdu kolmelle riville 84 px:llä.");
  const rivi = ikarivi(m, s, 40, SISA, huomiot);
  return {
    ruudut: [
      <Kortti key="sb" bg={bg}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 5.4, color: s.muisto ? A.muisto.bg : ink }}>{synttariLabel(s)}</div>
          <div style={{ fontSize: 30, fontWeight: 600, color: s.muisto ? "#8FA3B3" : "#6E6757" }}>{paivaTeksti(s.paiva)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <Rivit rivit={nimi.rivit} koko={nimi.koko} lh={0.86} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.04 * nimi.koko, color: ink }} />
          <div style={{ width: SISA, height: 6, background: s.muisto ? A.muisto.bg : ink }} />
          <div style={{ fontSize: 40, fontWeight: 600, color: heikko }}>{rivi}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "Archivo", fontWeight: 900, fontSize: 32, letterSpacing: 1.9, color: ink }}>TIETONIEKKA</div>
          <Cta
            m={m}
            {...SYNT_CTA}
            bg={s.muisto ? A.muisto.bg : ink}
            ink={s.muisto ? A.muisto.ink : bg}
            reuna={s.muisto}
            maxLeveys={SISA - leveys(m, "TIETONIEKKA", "Archivo", 900, 32, 0.06) - 28}
          />
        </div>
      </Kortti>,
    ],
    esteet,
    huomiot,
    onKuva: false,
  };
}

/** S-C "Ikä edellä": vain pyöreät vuodet, ei muistopäivinä. */
async function sC(m: Mitat, s: SynttariData): Promise<Piirros> {
  const esteet: string[] = [];
  if (!onPyorea(s.ika)) esteet.push("S-C vain pyöreille vuosille (40, 50 … 100).");
  if (s.muisto) esteet.push("S-C ei käytetä muistopäivinä.");
  const nimi = sovita(m, { teksti: s.nimi, perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.025, koot: [88, 72], leveys: SISA, maxRivit: 2 });
  if (!nimi.mahtuu) esteet.push("Nimi ei mahdu kahdelle riville 72 px:llä.");
  const luku = String(s.ika);
  // 520 px kaksinumeroiselle; sata mahtuu pienempänä.
  const lukuKoko = luku.length > 2 ? 380 : 520;
  return {
    ruudut: [
      <Kortti key="sc" bg="#131109">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 5.4, color: "#E8A320" }}>PÄIVÄN SYNTTÄRIT</div>
          <div style={{ fontSize: 30, fontWeight: 600, color: "#8E8676" }}>{paivaTeksti(s.paiva)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Archivo", fontWeight: 900, fontSize: lukuKoko, lineHeight: `${Math.round(lukuKoko * 0.78)}px`, letterSpacing: -0.06 * lukuKoko, color: "#E8A320" }}>{luku}</div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 8, color: "#C9A96A", paddingTop: 10 }}>VUOTTA TÄNÄÄN</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Rivit rivit={nimi.rivit} koko={nimi.koko} lh={0.94} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.025 * nimi.koko, color: "#FFFFFF" }} />
          <div style={{ display: "flex", paddingTop: 8 }}>
            <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
              <Alarivi m={m} {...SYNT_CTA} ak={A.kulta} />
            </div>
          </div>
        </div>
      </Kortti>,
    ],
    esteet,
    huomiot: [],
    onKuva: false,
  };
}

/** S-D "Visayhteys edellä": onnittelu sivulauseena, iso kysymys vie visaan. */
async function sD(m: Mitat, s: SynttariData, k: Kentat): Promise<Piirros> {
  const esteet: string[] = [];
  const huomiot: string[] = [];
  const ak = s.muisto ? A.muisto : A.lime;
  if (!s.visaNimi) esteet.push("S-D vaatii henkilön visan.");
  const kysymys = k.kysymys?.trim() || "Kuinka hyvin tunnet hänet?";
  const ots = sovita(m, { teksti: kysymys, perhe: "Archivo", paino: 900, isot: true, valistysEm: -0.03, koot: [104, 96, 84, 72], leveys: SISA, maxRivit: 4 });
  if (!ots.mahtuu) esteet.push("Kysymys ei mahdu neljälle riville — lyhennä.");
  const johdanto = s.muisto
    ? `${s.nimi} olisi täyttänyt tänään ${s.ika} vuotta.`
    : `${s.nimi} täyttää tänään ${s.ika} vuotta.`;
  const visa = sovita(m, { teksti: s.visaNimi ?? "", perhe: "Instrument Sans", paino: 700, koot: [34, 32, 30], leveys: SISA - 34, maxRivit: 2 });
  return {
    ruudut: [
      <Kortti key="sd" bg={s.muisto ? "#0E141A" : "#0E0C06"}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 5.4, color: s.muisto ? A.muisto.bg : "#C9A96A" }}>{synttariLabel(s)}</div>
          <div style={{ fontSize: 30, fontWeight: 600, color: "#8E8676" }}>{paivaTeksti(s.paiva)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 40, fontWeight: 600, lineHeight: "50px", color: "#CFC7B6" }}>{johdanto}</div>
          <Rivit rivit={ots.rivit} koko={ots.koko} lh={0.9} style={{ fontFamily: "Archivo", fontWeight: 900, letterSpacing: -0.03 * ots.koko, color: "#FFFFFF" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 28, borderLeft: `6px solid ${ak.bg}` }}>
            <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 4.2, color: "#8E8676" }}>VISA</div>
            <Rivit rivit={visa.rivit} koko={visa.koko} lh={1.2} style={{ fontWeight: 700, color: "#F5F0E6" }} />
          </div>
        </div>
        <Alarivi m={m} {...SYNT_CTA} ak={ak} reuna={s.muisto} />
      </Kortti>,
    ],
    esteet,
    huomiot,
    onKuva: false,
  };
}

/* ── Julkinen rajapinta ──────────────────────────────────────────────── */

export const VISA_POHJAT: Pohja[] = ["V-A", "V-B", "V-C", "V-D", "V-E"];
export const SYNT_POHJAT: Pohja[] = ["S-A", "S-B", "S-C", "S-D"];

export const POHJA_NIMET: Record<Pohja, string> = {
  "V-A": "Tapahtuma edellä",
  "V-B": "Haaste edellä",
  "V-C": "Kuva edellä",
  "V-D": "Typografia edellä",
  "V-E": "Karuselli",
  "S-A": "Henkilökuva edellä",
  "S-B": "Nimi edellä",
  "S-C": "Ikä edellä",
  "S-D": "Visayhteys edellä",
};

export function tarkistaVisa(m: Mitat, pohja: Pohja, v: VisaData, k: Kentat, vari: VdVari = "lime"): Promise<Piirros> {
  return valitseVisa(m, pohja, v, k, vari, EI_KUVAA);
}

export function tarkistaSynttarit(m: Mitat, pohja: Pohja, s: SynttariData, k: Kentat): Promise<Piirros> {
  return valitseSynttarit(m, pohja, s, k, EI_KUVAA);
}

export function piirraVisa(m: Mitat, pohja: Pohja, v: VisaData, k: Kentat, vari: VdVari = "lime"): Promise<Piirros> {
  return valitseVisa(m, pohja, v, k, vari, RAJAA);
}

export function piirraSynttarit(m: Mitat, pohja: Pohja, s: SynttariData, k: Kentat): Promise<Piirros> {
  return valitseSynttarit(m, pohja, s, k, RAJAA);
}

async function valitseVisa(m: Mitat, pohja: Pohja, v: VisaData, k: Kentat, vari: VdVari, kuvaksi: Kuvaksi): Promise<Piirros> {
  switch (pohja) {
    case "V-A": return vA(m, v, kuvaksi);
    case "V-B": return vB(m, v, k, kuvaksi);
    case "V-C": return vC(m, v, kuvaksi);
    case "V-D": return vD(m, v, vari);
    case "V-E": return vE(m, v, k);
    default: throw new Error(`Ei Päivän visan pohja: ${pohja}`);
  }
}

async function valitseSynttarit(m: Mitat, pohja: Pohja, s: SynttariData, k: Kentat, kuvaksi: Kuvaksi): Promise<Piirros> {
  switch (pohja) {
    case "S-A": return sA(m, s, k, kuvaksi);
    case "S-B": return sB(m, s);
    case "S-C": return sC(m, s);
    case "S-D": return sD(m, s, k);
    default: throw new Error(`Ei synttäripohja: ${pohja}`);
  }
}
