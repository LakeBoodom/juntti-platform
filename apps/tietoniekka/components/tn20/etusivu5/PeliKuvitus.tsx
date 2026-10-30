// Etusivu — pelikorttien kuvitukset (CD "TN Etusivu mobiili v8", Heikki 30.10.2026): valokuvan sijaan pieni näkymä pelistä.
// Koostettu 242 × 151 px:n kehykseen (mobiilikortti); leveämmässä kortissa kehys keskitetään ja tausta täyttää reunat.
// Kaikki kuvat omia kopioita (UI-laatusääntö 6): kuntavaakunat ja liput Supabase-storagessa, muut public/20/.
// Koriste: aria-hidden (kortin nimi ja kuvaus kertovat pelin). Järjestyspeleissä ei näytetä oikeaa järjestystä.

const STORAGE = "https://pkfsdzqwfxqczirjddue.supabase.co/storage/v1/object/public/kuvavisa-images/tietoniekka";
const VAAKUNA = `${STORAGE}/kuntavaakunat`;

/** Pelit, joilla on kuvitus (slug → kuvitus). Muut pelikortit käyttävät valokuvaa. */
export const KUVITETUT = new Set(["kuvavisat", "aanivisat", "kuntaliitos", "rajanaapurit", "vaalipiiriketju", "mika-maa", "ikajarjestys", "laita-jarjestykseen"]);

/* eslint-disable @next/next/no-img-element */
function Lippu({ raidat }: { raidat: [string, string, string] }) {
  return <span className="tn-pk-lippu">{raidat.map((c, i) => <i key={i} style={{ background: c }} />)}</span>;
}

export default function PeliKuvitus({ slug }: { slug: string }) {
  switch (slug) {
    case "kuntaliitos":
      return (
        <span className="tn-pk tn-pk--kunta" aria-hidden="true">
          <span className="tn-pk-kehys tn-pk-rivi">
            <span className="tn-pk-kortti tn-pk-kallis"><img src={`${VAAKUNA}/285.png`} alt="" /><b>Kotka</b></span>
            <span className="tn-pk-viiva" />
            <span className="tn-pk-kortti tn-pk-nosto"><img src={`${VAAKUNA}/286.png`} alt="" /><b>Kouvola</b></span>
            <span className="tn-pk-viiva tn-pk-viiva--pisteet" />
            <span className="tn-pk-tyhja">?</span>
          </span>
        </span>
      );
    case "rajanaapurit":
      return (
        <span className="tn-pk tn-pk--raja" aria-hidden="true">
          <span className="tn-pk-kehys tn-pk-rivi">
            <span className="tn-pk-kortti tn-pk-kallis"><Lippu raidat={["#C8102E", "#FFFFFF", "#C8102E"]} /><b>Itävalta</b></span>
            <span className="tn-pk-viiva" />
            <span className="tn-pk-kortti tn-pk-nosto"><Lippu raidat={["#CE2939", "#FFFFFF", "#477050"]} /><b>Unkari</b></span>
            <span className="tn-pk-viiva tn-pk-viiva--pisteet" />
            <span className="tn-pk-tyhja">?</span>
          </span>
        </span>
      );
    case "vaalipiiriketju":
      /* Oikeat istuvat kansanedustajat (Heikki 30.10.): Halla-aho (Helsinki) → Purra (Uusimaa) → ? (Häme). */
      return (
        <span className="tn-pk tn-pk--vaali" aria-hidden="true">
          <span className="tn-pk-kehys tn-pk-rivi">
            <span className="tn-pk-kortti tn-pk-kortti--kork tn-pk-kallis"><img className="tn-pk-kasvo" src="/20/henkilot/k/jussi-halla-aho-9-5-2023-072081.webp" alt="" /><b>Halla-aho</b><small>Helsinki</small></span>
            <span className="tn-pk-viiva" />
            <span className="tn-pk-kortti tn-pk-kortti--kork tn-pk-nosto"><img className="tn-pk-kasvo" src="/20/henkilot/k/riikka-purra-2026-cropped-da8106.webp" alt="" /><b>Purra</b><small>Uusimaa</small></span>
            <span className="tn-pk-viiva tn-pk-viiva--pisteet" />
            <span className="tn-pk-tyhja tn-pk-tyhja--kork">?<small>Häme</small></span>
          </span>
        </span>
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
