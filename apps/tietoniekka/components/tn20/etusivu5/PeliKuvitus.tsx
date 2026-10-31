// Etusivu — pelikorttien kuvitukset (CD "TN Etusivu mobiili v8", Heikki 30.10.2026): valokuvan sijaan pieni näkymä pelistä.
// Koostettu 242 × 151 px:n kehykseen (mobiilikortti); leveämmässä kortissa kehys keskitetään ja tausta täyttää reunat.
// Kaikki kuvat omia kopioita (UI-laatusääntö 6): kuntavaakunat ja liput Supabase-storagessa, muut public/20/.
// Reittipelit (Rajanaapurit, Kuntaliitos, Vaalipiiriketju): CD v11 — Lähtö, Maali ja irtopalat, ks. Reitti().
// Koriste: aria-hidden (kortin nimi ja kuvaus kertovat pelin). Järjestyspeleissä ei näytetä oikeaa järjestystä.

import type { ReactNode } from "react";

const STORAGE = "https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka";
const VAAKUNA = `${STORAGE}/kuntavaakunat`;

/** Pelit, joilla on kuvitus (slug → kuvitus). Muut pelikortit käyttävät valokuvaa. */
export const KUVITETUT = new Set(["kuvavisat", "aanivisat", "kuntaliitos", "rajanaapurit", "vaalipiiriketju", "mika-maa", "ikajarjestys", "laita-jarjestykseen"]);

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
 *  asetettu pala ja tyhjä paikka, alla kaksi irtopalaa — vasenta raahataan paikalleen, oikea on harhautin.
 *  Rajanaapuruudet tarkistettu kannasta (kuntien_rajat, vaalipiirien_rajat): harhautin ei rajaudu edelliseen palaan. */
function Reitti({ luokka, lahto, toka, maali, oikea, harhautin }: { luokka: string; lahto: Pala; toka: Pala; maali: Pala; oikea: Pala; harhautin: Pala }) {
  const solmu = (p: Pala | null, paa?: "Lähtö" | "Maali") => (
    <span className="tn-pk-solmu">
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
          {solmu(maali, "Maali")}
        </span>
        <span className="tn-pk-irrot">
          <span className="tn-pk-irto" data-veto="">{oikea.pieniKuva}<b>{oikea.nimi}</b></span>
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

export default function PeliKuvitus({ slug }: { slug: string }) {
  switch (slug) {
    case "kuntaliitos":
      /* Kotka–Kouvola–[Mäntyharju]–Mikkeli; Hamina rajautuu Kouvolaan mutta ei Mikkeliin. */
      return (
        <Reitti luokka="tn-pk--kunta" lahto={vaakuna("285", "Kotka")} toka={vaakuna("286", "Kouvola")} maali={vaakuna("491", "Mikkeli")}
          oikea={vaakuna("507", "Mäntyharju")} harhautin={vaakuna("075", "Hamina")} />
      );
    case "rajanaapurit":
      /* Viro–Latvia–[Liettua]–Puola; Saksa rajautuu Puolaan mutta ei Latviaan. */
      return (
        <Reitti luokka="tn-pk--raja" lahto={maa("Viro", ["#0072CE", "#000000", "#FFFFFF"])} toka={maa("Latvia", [["#9E3039", 2], ["#FFFFFF", 1], ["#9E3039", 2]])}
          maali={maa("Puola", ["#FFFFFF", "#DC143C"])} oikea={maa("Liettua", ["#FDB913", "#006A44", "#C1272D"])} harhautin={maa("Saksa", ["#000000", "#DD0000", "#FFCE00"])} />
      );
    case "vaalipiiriketju":
      /* Istuvat kansanedustajat vaalipiirinsä kasvoina: Halla-aho (Helsinki) → Purra (Uusimaa) → [Grahn-Laasonen (Häme)]
         → Pauli Kiuru (Pirkanmaa); harhautin Krista Kiuru (Satakunta), joka ei rajaudu Uuteenmaahan. */
      return (
        <Reitti luokka="tn-pk--vaali"
          lahto={edustaja("Helsinki", "jussi-halla-aho-9-5-2023-072081")} toka={edustaja("Uusimaa", "riikka-purra-2026-cropped-da8106")}
          maali={edustaja("Pirkanmaa", "pauli-kiuru-2018-aa3698")} oikea={edustaja("Häme", "sanni-grahn-laasonen-01-cropped-8a0766")}
          harhautin={edustaja("Satakunta", "krista-kiuru-2019-cropped-be2bd6")} />
      );
    case "kuvavisat":
      return (
        <span className="tn-pk tn-pk--kuva" aria-hidden="true">
          <span className="tn-pk-kehys tn-pk-pino">
            <span className="tn-pk-kehysk tn-pk-kehysk--vasen"><img src={`${STORAGE}/liput/1788498032278-lo2sup.webp`} alt="" /></span>
            <span className="tn-pk-kehysk tn-pk-kehysk--keski"><img src={`${VAAKUNA}/285.png`} alt="" /><span className="tn-pk-merkki">?</span></span>
            <span className="tn-pk-kehysk tn-pk-kehysk--oikea"><img src="/20/luonto/k/merikotka-visa.webp" alt="" /></span>
          </span>
        </span>
      );
    case "ikajarjestys":
      /* Lähes samanikäiset, järjestys ei itsestään selvä (Heikki 30.10.): Stubb 1.4.1968, Häkkinen 28.9.1968,
         Selänne 3.7.1970. Näytetään sekoitettuna (Selänne, Stubb, Häkkinen) — ei valmiiksi oikein. */
      return (
        <span className="tn-pk tn-pk--ika" aria-hidden="true">
          <span className="tn-pk-kehys tn-pk-sarake">
            <span className="tn-pk-otsake">Vanhin → nuorin</span>
            <span className="tn-pk-henkilot">
              <span className="tn-pk-henkilo"><img src="/20/henkilot/k/teemu-selanne-on-the-ice-november-2010-8f51e8.webp" alt="" /><i>1</i></span>
              <span className="tn-pk-nuoli">›</span>
              <span className="tn-pk-henkilo"><img src="/20/henkilot/k/alexander-stubb-in-2026-03-26-3n8a4037-cropped-23a9b2.webp" alt="" /><i>2</i></span>
              <span className="tn-pk-nuoli">›</span>
              <span className="tn-pk-henkilo tn-pk-henkilo--auki"><img src="/20/henkilot/k/mika-hakkinen-champions-for-charity-2016-07-27-37084f.webp" alt="" /><i>?</i></span>
            </span>
          </span>
        </span>
      );
    case "laita-jarjestykseen":
      /* Tunturit väärässä järjestyksessä (oikea: Halti, Saana, Pallas); yhtään riviä ei ole numeroitu. */
      return (
        <span className="tn-pk tn-pk--jarj" aria-hidden="true">
          <span className="tn-pk-kehys tn-pk-lista">
            <span className="tn-pk-otsake">Korkein → matalin</span>
            {["Pallas", "Saana", "Halti"].map((t, i) => (
              <span key={t} className="tn-pk-lista-rivi" data-nosto={i === 1 || undefined}><i>?</i><b>{t}</b><span>⋮⋮</span></span>
            ))}
          </span>
        </span>
      );
    case "aanivisat":
      return (
        <span className="tn-pk tn-pk--aani" aria-hidden="true">
          <span className="tn-pk-kehys">
            <img className="tn-pk-aani-kuva" src="/20/aanivisat/hero/suomen_linnut-levea-1200.webp" alt="" />
            <span className="tn-pk-kupla" style={{ left: 143, top: 110, width: 52 }}>Kraa</span>
            <span className="tn-pk-kupla" style={{ left: 136, top: 18, width: 58 }}>Kukkuu</span>
            <span className="tn-pk-soitin" style={{ left: 217, top: 32 }}><i /><b /><b /><b /></span>
          </span>
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
