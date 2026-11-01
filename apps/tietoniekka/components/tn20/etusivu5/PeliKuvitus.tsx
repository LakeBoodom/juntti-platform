// Etusivu — pelikorttien kuvitukset (CD "TN Etusivu mobiili v8", Heikki 30.10.2026): valokuvan sijaan pieni näkymä pelistä.
// Koostettu 242 × 151 px:n kehykseen (mobiilikortti); leveämmässä kortissa kehys keskitetään ja tausta täyttää reunat.
// Kaikki kuvat omia kopioita (UI-laatusääntö 6): kuntavaakunat ja liput Supabase-storagessa, muut public/20/.
// Reittipelit (Rajanaapurit, Kuntaliitos, Vaalipiiriketju): CD v11 — Lähtö, Maali ja irtopalat, ks. Reitti().
// Kolme kokoa (CD "TN Etusivu pelikuvitukset desktop", Heikki 31.10.2026): A mobiili 242 × 151, B keskileveä 250–439 px,
// C leveä ≥ 440 px. Kortin kuva-alue on kontti (container pk, etusivu-v5.css); kaikkien kokojen osat ovat merkinnässä ja
// CSS näyttää oikeat (data-koko="c" = vain C:ssä, data-koko="ab" = vain A:ssa ja B:ssä).
// Koriste: aria-hidden (kortin nimi ja kuvaus kertovat pelin). Järjestyspeleissä ei näytetä oikeaa järjestystä.

import type { ReactNode } from "react";

const STORAGE = "https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka";
const VAAKUNA = `${STORAGE}/kuntavaakunat`;

/** Pelit, joilla on kuvitus (slug → kuvitus). Muut pelikortit käyttävät valokuvaa. */
export const KUVITETUT = new Set(["kuvavisat", "aanivisat", "kuntaliitos", "rajanaapurit", "rajanaapurit-yhdysvallat", "vaalipiiriketju", "mika-maa", "jarjesta"]);

/** Järjestä-kortti: VÄÄRIN-kirjainten kierrot ja siirrot (sama kuin hubin otsikossa). */
const VAARIN: Array<[string, string]> = [
  ["V", "translate(0, -.05em) rotate(-7deg)"], ["Ä", "translate(.02em, .09em) rotate(6deg)"], ["Ä", "translate(-.01em, -.11em) rotate(-4deg)"],
  ["R", "translate(.03em, .06em) rotate(10deg)"], ["I", "translate(0, -.07em) rotate(-12deg)"], ["N", "translate(.05em, .11em) rotate(5deg)"],
];
/** Presidentit väärässä järjestyksessä (CD): nimi, oma kuvakopio, kallistus. */
const JARJESTA_PALAT: Array<[string, string, string]> = [
  ["Mannerheim", "/20/henkilot/k/carl-gustaf-emil-mannerheim-a511a2.webp", "rotate(-3deg)"],
  ["Ryti", "/20/henkilot/k/presidentti-risto-ryti-6c1ffc.webp", "rotate(2deg) translateY(4px)"],
  ["Kallio", "/20/vaalit/kasvot/kallio.webp", "rotate(-1.5deg) translateY(-2px)"],
  ["Koivisto", "/20/vaalit/kasvot/koivisto.webp", "rotate(3deg)"],
  ["Paasikivi", "/20/vaalit/kasvot/paasikivi.webp", "rotate(-2deg) translateY(3px)"],
  ["Kekkonen", "/20/vaalit/kasvot/kekkonen.webp", "rotate(1.5deg)"],
];

/* eslint-disable @next/next/no-img-element */
/** Lippu vaakaraidoin ylhäältä alas; paino = raidan suhteellinen korkeus (Latvia 2:1:2). */
function Lippu({ raidat, pieni }: { raidat: Array<string | [string, number]>; pieni?: boolean }) {
  return (
    <span className="tn-pk-lippu" data-pieni={pieni || undefined}>
      {raidat.map((r, i) => {
        const [c, w] = typeof r === "string" ? [r, 1] : r;
        return <i key={i} style={{ background: c, flexGrow: w }} />;
      })}
    </span>
  );
}

type Pala = { nimi: string; kuva: ReactNode; pieniKuva: ReactNode };

/** Reittipelin kuvitus (CD "TN Etusivu mobiili v11", Heikki 31.10.2026): lukittu Lähtö ja Maali, välissä yksi oikein
 *  asetettu pala ja tyhjä paikka, alla irtopalat — vasenta raahataan paikalleen, oikeanpuoleinen on harhautin.
 *  Leveä koko C (CD desktop 31.10.): kuuden palan ketju — A/B:n Maali on C:ssä asetettu pala, perään toinen tyhjä
 *  paikka ja uusi Maali, irtopaloja kolme (jatko). Rajanaapuruudet tarkistettu kannasta (kuntien_rajat,
 *  vaalipiirien_rajat): kumpikin irtopala sopii vain omaan aukkoonsa, harhautin ei kumpaankaan. */
function Reitti({ luokka, lahto, toka, maali, oikea, harhautin, jatko }: {
  luokka: string; lahto: Pala; toka: Pala; maali: Pala; oikea: Pala; harhautin: Pala; jatko: { maali: Pala; oikea: Pala };
}) {
  const solmu = (p: Pala | null, paa?: "Lähtö" | "Maali", koko?: "c", vaihto?: boolean) => (
    <span className="tn-pk-solmu" data-koko={koko} data-vaihto={vaihto || undefined}>
      <span className="tn-pk-paa" data-tyhja={!paa || undefined}>{paa}</span>
      {p ? (
        <span className="tn-pk-pala" data-lukittu={paa ? "" : undefined}>{p.kuva}<b>{p.nimi}</b></span>
      ) : (
        <span className="tn-pk-aukko">?</span>
      )}
    </span>
  );
  return (
    <span className={`tn-pk ${luokka}`} aria-hidden="true">
      <span className="tn-pk-kehys tn-pk-reitti">
        <span className="tn-pk-ketju">
          {solmu(lahto, "Lähtö")}
          <span className="tn-pk-liitos" />
          {solmu(toka)}
          <span className="tn-pk-liitos tn-pk-liitos--pisteet" />
          {solmu(null)}
          <span className="tn-pk-liitos tn-pk-liitos--pisteet" />
          {/* A/B: Maali. C: asetettu pala (Maali-merkki ja lukitusreuna piiloon). */}
          {solmu(maali, "Maali", undefined, true)}
          <span className="tn-pk-liitos tn-pk-liitos--pisteet" data-koko="c" />
          {solmu(null, undefined, "c")}
          <span className="tn-pk-liitos tn-pk-liitos--pisteet" data-koko="c" />
          {solmu(jatko.maali, "Maali", "c")}
        </span>
        <span className="tn-pk-irrot">
          <span className="tn-pk-irto" data-veto="">{oikea.pieniKuva}<b>{oikea.nimi}</b></span>
          <span className="tn-pk-irto" data-koko="c">{jatko.oikea.pieniKuva}<b>{jatko.oikea.nimi}</b></span>
          <span className="tn-pk-irto">{harhautin.pieniKuva}<b>{harhautin.nimi}</b></span>
        </span>
      </span>
    </span>
  );
}

const vaakuna = (koodi: string, nimi: string): Pala => ({
  nimi,
  kuva: <img className="tn-pk-vaakuna" src={`${VAAKUNA}/${koodi}.png`} alt="" />,
  pieniKuva: <img className="tn-pk-vaakuna tn-pk-vaakuna--pieni" src={`${VAAKUNA}/${koodi}.png`} alt="" />,
});
const maa = (nimi: string, raidat: Array<string | [string, number]>): Pala => ({
  nimi, kuva: <Lippu raidat={raidat} />, pieniKuva: <Lippu raidat={raidat} pieni />,
});
const edustaja = (piiri: string, kuva: string): Pala => ({
  nimi: piiri,
  kuva: <img className="tn-pk-kasvo" src={`/20/henkilot/k/${kuva}.webp`} alt="" />,
  pieniKuva: <img className="tn-pk-kasvo tn-pk-kasvo--pieni" src={`/20/henkilot/k/${kuva}.webp`} alt="" />,
});

function UsaPala({ k, nimi, paa, kulma }: { k: string; nimi: string; paa?: string; kulma: string }) {
  return (
    <span className="tn-pk-usa-pala" data-lukittu={paa ? "" : undefined} style={{ transform: kulma }}>
      {paa && <span className="tn-pk-usa-paa">{paa}</span>}
      <img src={`/20/rajanaapurit/liput/us-${k}.webp`} alt="" loading="lazy" />
      <b>{nimi}</b>
    </span>
  );
}

export default function PeliKuvitus({ slug }: { slug: string }) {
  switch (slug) {
    case "kuntaliitos":
      /* Kotka–Kouvola–[Mäntyharju]–Mikkeli; C jatkuu –[Juva]–Rantasalmi. Hamina rajautuu Kouvolaan mutta ei Mikkeliin
         eikä Rantasalmeen. (CD ehdotti Maaliksi Savonlinnaa, mutta Juva ei rajaudu siihen → Rantasalmi.) */
      return (
        <Reitti luokka="tn-pk--kunta" lahto={vaakuna("285", "Kotka")} toka={vaakuna("286", "Kouvola")} maali={vaakuna("491", "Mikkeli")}
          oikea={vaakuna("507", "Mäntyharju")} harhautin={vaakuna("075", "Hamina")}
          jatko={{ maali: vaakuna("681", "Rantasalmi"), oikea: vaakuna("178", "Juva") }} />
      );
    case "rajanaapurit":
      /* Viro–Latvia–[Liettua]–Puola; C jatkuu –[Slovakia]–Unkari. Saksa rajautuu Puolaan mutta ei Latviaan eikä Unkariin. */
      return (
        <Reitti luokka="tn-pk--raja" lahto={maa("Viro", ["#0072CE", "#000000", "#FFFFFF"])} toka={maa("Latvia", [["#9E3039", 2], ["#FFFFFF", 1], ["#9E3039", 2]])}
          maali={maa("Puola", ["#FFFFFF", "#DC143C"])} oikea={maa("Liettua", ["#FDB913", "#006A44", "#C1272D"])} harhautin={maa("Saksa", ["#000000", "#DD0000", "#FFCE00"])}
          jatko={{ maali: maa("Unkari", ["#CE2939", "#FFFFFF", "#477050"]), oikea: maa("Slovakia", ["#FFFFFF", "#0B4EA2", "#EE1C25"]) }} />
      );
    case "rajanaapurit-yhdysvallat":
      /* CD "Rajanaapurit Yhdysvallat etusivun bannerit" 8b: Texas → Oklahoma → ? → Iowa (ainoa välipala on Missouri, ei näytetä).
         Kartta omasta aineistosta (scripts/rajanaapurit-etusivukuva.mjs). CD:n "Teksas" → "Texas" kuten pelissä. Staattinen. */
      return (
        <span className="tn-pk tn-pk--usa" aria-hidden="true">
          <span className="tn-pk-usa-rivi">
            <UsaPala k="tx" nimi="Texas" paa="Lähtö" kulma="rotate(-2deg) translateY(4px)" />
            <span className="tn-pk-usa-liitos" />
            <UsaPala k="ok" nimi="Oklahoma" kulma="rotate(1.5deg) translateY(-4px)" />
            <span className="tn-pk-usa-liitos tn-pk-usa-liitos--pisteet" />
            <span className="tn-pk-usa-aukko">?</span>
            <span className="tn-pk-usa-liitos tn-pk-usa-liitos--pisteet" />
            <UsaPala k="ia" nimi="Iowa" paa="Maali" kulma="rotate(2deg) translateY(-2px)" />
          </span>
        </span>
      );
    case "vaalipiiriketju":
      /* Istuvat kansanedustajat vaalipiirinsä kasvoina: Halla-aho (Helsinki) → Purra (Uusimaa) → [Grahn-Laasonen (Häme)]
         → Pauli Kiuru (Pirkanmaa); C jatkuu → [Wallinheimo (Keski-Suomi)] → Tuppurainen (Oulu). Harhautin Krista Kiuru
         (Satakunta) ei rajaudu Uuteenmaahan eikä Ouluun. */
      return (
        <Reitti luokka="tn-pk--vaali"
          lahto={edustaja("Helsinki", "jussi-halla-aho-9-5-2023-072081")} toka={edustaja("Uusimaa", "riikka-purra-2026-cropped-da8106")}
          maali={edustaja("Pirkanmaa", "pauli-kiuru-2018-aa3698")} oikea={edustaja("Häme", "sanni-grahn-laasonen-01-cropped-8a0766")}
          harhautin={edustaja("Satakunta", "krista-kiuru-2019-cropped-be2bd6")}
          jatko={{ maali: edustaja("Oulu", "tytti-tuppurainen-in-helsinki-2023-cropped-5134c4"), oikea: edustaja("Keski-Suomi", "sinuhe-wallinheimo-fra-samlingspartiet-saml-i-fi-0e6c98") }} />
      );
    case "kuvavisat":
      /* A: kolmen kortin viuhka. B: kortit irti toisistaan. C: neljä korttia aihetunnisteineen (karhu = Eläimet). */
      return (
        <span className="tn-pk tn-pk--kuva" aria-hidden="true">
          <span className="tn-pk-kehys tn-pk-pino">
            <span className="tn-pk-kv"><span className="tn-pk-kehysk"><img src={`${STORAGE}/liput/1788498032278-lo2sup.webp`} alt="" /></span><span className="tn-pk-kv-nimi">Liput</span></span>
            <span className="tn-pk-kv tn-pk-kv--keski"><span className="tn-pk-kehysk"><img src={`${VAAKUNA}/285.png`} alt="" /><span className="tn-pk-merkki">?</span></span><span className="tn-pk-kv-nimi">Vaakunat</span></span>
            <span className="tn-pk-kv"><span className="tn-pk-kehysk tn-pk-kehysk--kuva"><img src="/20/luonto/k/merikotka-visa.webp" alt="" /></span><span className="tn-pk-kv-nimi">Linnut</span></span>
            <span className="tn-pk-kv" data-koko="c"><span className="tn-pk-kehysk tn-pk-kehysk--kuva"><img src="/20/luonto/k/karhu-suomen-metsien-kuningas.webp" alt="" loading="lazy" /></span><span className="tn-pk-kv-nimi">Eläimet</span></span>
          </span>
        </span>
      );
    case "jarjesta":
      /* CD "TN Etusivu Järjestä-kortti" (31.10.2026): hubin tunnus VÄÄRIN (koralli, kirjaimet sekaisin, staattinen — etusivulla
         ei toistuvaa animaatiota), kysymys ja presidentit väärässä järjestyksessä. Paloja 3 (A, B), 4 (leveä B), 5–6 (C);
         jokainen alkuosa on väärässä järjestyksessä (oikea: Kallio, Ryti, Mannerheim, Paasikivi, Kekkonen, Koivisto). */
      return (
        <span className="tn-pk tn-pk--jarjesta" aria-hidden="true">
          <span className="tn-pk-kehys tn-pk-jv">
            <span className="tn-pk-jv-otsake">
              <span className="tn-pk-vaarin">
                {VAARIN.map(([k, t], i) => <span key={i} style={{ transform: t }}>{k}</span>)}
              </span>
              <span className="tn-pk-jv-kysymys">Osaatko laittaa oikeaan järjestykseen?</span>
            </span>
            <span className="tn-pk-jv-palat">
              {JARJESTA_PALAT.map(([nimi, kuva, t], i) => (
                <span key={nimi} className="tn-pk-jv-pala" data-n={i + 1} style={{ transform: t }}>
                  <img src={kuva} alt="" loading="lazy" />
                  <b>{nimi}</b>
                </span>
              ))}
            </span>
          </span>
        </span>
      );
    case "aanivisat":
      /* Kuplat kuvan koordinaateissa (kuva 493 × 211). A/B: kuva keskitetään lintuihin. C: kuva oikeaan reunaan,
         jolloin huhkaja näkyy (Huhuu), vasemmalla iso toistonappi ja ääniaalto. */
      return (
        <span className="tn-pk tn-pk--aani" aria-hidden="true">
          <span className="tn-pk-aani-taso">
            <img className="tn-pk-aani-kuva" src="/20/aanivisat/hero/suomen_linnut-levea-1200.webp" alt="" />
            <span className="tn-pk-kupla" style={{ left: 339, top: 110, width: 52 }}>Kraa</span>
            <span className="tn-pk-kupla" style={{ left: 332, top: 18, width: 58 }}>Kukkuu</span>
            <span className="tn-pk-kupla" style={{ left: 463, top: 60, width: 48 }}>Huhuu</span>
            <span className="tn-pk-soitin" style={{ left: 413, top: 32 }}><i /><b /><b /><b /></span>
          </span>
          <span className="tn-pk-aani-iso" data-koko="c"><i />{[8, 14, 22, 12, 26, 18, 30, 16, 24, 10, 20, 28, 14, 22, 8, 16, 26, 12, 18, 10].map((h, i) => <b key={i} style={{ height: h }} />)}</span>
        </span>
      );
    case "mika-maa":
      return (
        <span className="tn-pk tn-pk--maa" aria-hidden="true">
          <span className="tn-pk-kehys tn-pk-maa">
            <span className="tn-pk-maa-kuva"><img src="/20/rajanaapurit/banneri-kartta.webp" alt="" /><b>?</b></span>
            <span className="tn-pk-vihjeet">
              <span><b>1</b>Rajana Atlantti</span>
              <span><b>2</b>Fado-musiikki</span>
              <span data-lukittu><b>3</b>Vihje lukittu</span>
            </span>
          </span>
        </span>
      );
    default:
      return null;
  }
}
