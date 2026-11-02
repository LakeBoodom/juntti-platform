"use client";
// TIETOKETJU: IKÄJÄRJESTYS — pelinäkymän tilakone. Osa C (31.10.2026): Järjestä-hubin pakka
// /peli/jarjesta/ikajarjestys-<aihe>; aihe tulee pakasta (ei aihevalintaa), paluu hubiin.
// Vaiheet: aloitus (pelikehys K2) → järjestäminen (Korjausrivi) → tulos (RevealSequencer, samalla sivulla) → arvo uudet.
// CD "Järjestä yhtenäinen UX" (Heikki 2.11.2026): Korjaa rivi → Tarkista rivi → Seuraava rivi.
//
// "Sama henkilö ei toistu peräkkäisillä kierroksilla" (tehtävänanto kohta 5):
// kevyt client-puolen sessionStorage-tila muistaa edellisen kierroksen
// henkilö-id:t ja antaa ne getChainRoundille poissuljettavaksi. Ei pysyvää
// tallennusta pelaajan järjestyksestä — sessionStorage tyhjenee välilehden
// sulkeutuessa eikä mitään kirjoiteta kantaan pelin aikana.

import { pelijakoteksti } from "@/lib/korttinimi";
import { useMemo, useState } from "react";
import { getChainRound } from "@/lib/ikajarjestys";
import {
  DEFAULT_DIRECTION,
  ROUND_SIZE,
  formatBirthDate,
  sortForDirection,
  type ChainPerson,
} from "@/lib/ikajarjestysConstants";
import { vuosiTaiPaiva } from "@/lib/jarjesta/rivi";
import { RevealSequencer, type RevealItem } from "@/components/tn20/RevealSequencer";
import { calculateChainScore } from "@/components/tn20/ChainResultSummary";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import PeliAloitus from "@/components/tn20/pelikehys/PeliAloitus";
import Korjausrivi from "@/components/tn20/jarjesta/Korjausrivi";
import RiviJatko from "@/components/tn20/jarjesta/RiviJatko";
import { kirjaaPelimuotoPeli } from "@/lib/pelimuotoPelit";
import { HUB, aloitaHref, seuraavaPakka, type IkaPakka } from "@/lib/jarjesta/hub";

const PELI = "Ikäjärjestys";

const LAST_SEEN_KEY = "tk-ikajarjestys-viimeksi-nahdyt";

function readLastSeen(): string[] {
  try {
    const raw = sessionStorage.getItem(LAST_SEEN_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeLastSeen(ids: string[]) {
  try {
    sessionStorage.setItem(LAST_SEEN_KEY, JSON.stringify(ids));
  } catch {
    // sessionStorage voi olla estetty (yksityinen selaus) — toistoneston puute ei kaada peliä.
  }
}

type Phase = "start" | "loading" | "ordering" | "revealing";

export default function IkajarjestysClient({
  pakka,
  initialRound,
  kasvot = [],
}: {
  pakka: IkaPakka;
  initialRound: ChainPerson[] | null;
  /** Aloituksen kasvoketju (P3, 21.10.2026): enintään 8 kuvallista henkilöä syntymäjärjestyksessä. */
  kasvot?: Array<{ id: string; name: string; kuva: string }>;
}) {
  const category = pakka.kategoria;
  const [round, setRound] = useState<ChainPerson[] | null>(initialRound);
  // HUOM (korjattu hydraatiovirhe): getChainRound palauttaa henkilöt jo
  // satunnaisessa järjestyksessä (arpoo poolin ennen valintaa palvelimella),
  // joten näyttöjärjestystä EI saa arpoa uudelleen täällä renderissä —
  // Math.random() lazy useState-initializerissa antaa eri tuloksen SSR:ssä
  // ja hydraatiossa, mikä aiheutti "Minified React error #418" -virheen
  // JOKAISELLA latauksella kun initialRound oli asetettu (promo-CTA:n
  // ?autostart=1 -linkiltä). Käytä palvelimen palauttamaa järjestystä sellaisenaan.
  const [order, setOrder] = useState<ChainPerson[]>(() => initialRound ?? []);
  const [phase, setPhase] = useState<Phase>(initialRound && initialRound.length > 0 ? "ordering" : "start");
  const [emptyNotice, setEmptyNotice] = useState<string | null>(null);
  const [partialRoundNotice, setPartialRoundNotice] = useState<string | null>(null);
  const [uusiKesken, setUusiKesken] = useState(false);

  // Henkilösivun nosto voi sisältää ulkomaisia henkilöitä → silloin ei "Tunnetut suomalaiset".
  const nimi = round?.some((h) => h.suomalainen === false) ? "Tunnetut henkilöt" : pakka.nimi;

  const correctOrder = useMemo(() => (round ? sortForDirection(round, DEFAULT_DIRECTION) : []), [round]);

  /* Jako (K4 v2, 25.10.2026): sama kierros linkkinä (?henkilot=, sama kuin henkilösivun nosto), tulos linkkiin
     (?tulos=n-total), jotta Facebookin og-kuvaus kertoo tuloksen. Tulosvaihe piirretään vain selaimessa. */
  const jakoTiedot = () => ({
    url: `${location.origin}${pakka.href}?henkilot=${(round ?? []).map((p) => p.id).join(",")}&rivi=1&tulos=${scoreResult?.correctCount ?? 0}-${scoreResult?.totalCount ?? 0}`,
    teksti: pelijakoteksti(`${PELI}: ${nimi}`, `${scoreResult?.correctCount ?? 0}/${scoreResult?.totalCount ?? 0} oikealla paikalla`, !!scoreResult && scoreResult.correctCount === scoreResult.totalCount),
  });

  async function startRound() {
    /* Tuloksesta "Uusi kierros": tulos pysyy näkyvissä, kunnes uusi rivi on arvottu. */
    if (phase === "start") setPhase("loading");
    else setUusiKesken(true);
    setEmptyNotice(null);
    setPartialRoundNotice(null);
    const lastSeen = readLastSeen();
    const next = await getChainRound(category, lastSeen);
    setUusiKesken(false);
    setRound(next);
    setOrder(next); // jo satunnaisessa järjestyksessä, ks. huomio yllä
    if (next.length > 0) {
      writeLastSeen(next.map((p) => p.id));
      // Pieni kategoria voi palauttaa alle ROUND_SIZE henkilöä (ks. JULKAISUTEKSTI
      // "Kierroksen koko") — kierros pelataan silti loppuun, mutta pelaajalle
      // kerrotaan ettei tällä kertaa saatu täyttä kierrosta.
      if (next.length < ROUND_SIZE) {
        setPartialRoundNotice(`Tästä kategoriasta löytyi vain ${next.length} henkilöä tällä kierroksella.`);
      }
      setPhase("ordering");
    } else {
      setEmptyNotice("Kierroksen arvonta ei onnistunut juuri nyt. Yritä hetken päästä uudelleen.");
      setPhase("start");
    }
  }

  const revealItems: RevealItem[] = useMemo(() => {
    if (!round) return [];
    const correctIndexById = new Map(correctOrder.map((p, i) => [p.id, i]));
    const arvot = vuosiTaiPaiva(order.map((p) => formatBirthDate(p.birthDate)));
    return order.map((person, i) => ({
      id: person.id,
      name: person.name,
      image_url: person.image_url,
      placedPosition: i + 1,
      correctPosition: (correctIndexById.get(person.id) ?? i) + 1,
      valueLabel: arvot[i],
    }));
  }, [order, round, correctOrder]);

  // Pisteitä ei näytetä (CD 3e), mutta ne kirjataan tilastoihin kuten ennen.
  const scoreResult = useMemo(() => (round ? calculateChainScore(order, correctOrder) : null), [order, round, correctOrder]);

  if (phase === "start" || phase === "loading") {
    return (
      <PeliKehys iho="tumma">
        <Pelipalkki iho="tumma" peli={HUB.nimi} muunnelma={nimi} koti={HUB} />
        <main>
          {/* K2 (pelikehys, 20.10.2026): h1 → lause → kasvoketju → Aloita. Osa C: ei aihevalintaa eikä ohjeita. */}
          <PeliAloitus
            otsikko={PELI}
            lause="Aseta kahdeksan tunnettua henkilöä syntymävuoden mukaan vanhimmasta nuorimpaan."
            valinta={
              kasvot.length >= 5 ? (
                <figure className="ika-kasvot">
                  <ol aria-label="Esimerkki: tunnettuja henkilöitä syntymävuoden mukaan">
                    {kasvot.map((h) => (
                      <li key={h.id}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={h.kuva} alt={h.name} title={h.name} width={44} height={44} />
                      </li>
                    ))}
                  </ol>
                  <figcaption>
                    <span>Vanhin</span>
                    <i aria-hidden="true" />
                    <span>Nuorin</span>
                  </figcaption>
                </figure>
              ) : undefined
            }
            toiminto={
              <button type="button" className="pk-nappi" disabled={phase === "loading"} onClick={() => startRound()}>
                {phase === "loading" ? "Arvotaan…" : "Aloita kierros"}
              </button>
            }
            alarivi={
              emptyNotice ? (
                <span role="alert">{emptyNotice}</span>
              ) : phase === "loading" ? (
                <span role="status">Arvotaan kierrosta…</span>
              ) : undefined
            }
            ohjeet={[]}
          />
        </main>
      </PeliKehys>
    );
  }

  if (phase === "revealing" && scoreResult) {
    return (
      <PeliKehys iho="tumma">
        <Pelipalkki iho="tumma" peli={HUB.nimi} koti={HUB} pelissa paluuNuoli />
        <main>
          <RevealSequencer
            items={revealItems}
            jatko={
              <RiviJatko
                seuraava={aloitaHref(seuraavaPakka(pakka.slug))}
                uusi={{ teksti: "Uusi kierros", onClick: () => startRound(), kesken: uusiKesken }}
                jako={{ ...jakoTiedot(), natiiviOtsikko: PELI }}
              />
            }
          />
        </main>
      </PeliKehys>
    );
  }

  // phase === "ordering"
  return (
    <PeliKehys iho="tumma">
      <Pelipalkki iho="tumma" peli={HUB.nimi} koti={HUB} pelissa paluuNuoli />
      <Korjausrivi
        lause={pakka.pelilause}
        ylin="Vanhin"
        alin="Nuorin"
        items={order}
        onReorder={setOrder}
        huomautus={partialRoundNotice ? <p className="tk-loading" role="status">{partialRoundNotice}</p> : undefined}
        onTarkista={() => {
          /* Pelikerta tilastoihin (pelimuoto_pelit) tarkistushetkellä: järjestys on silloin lopullinen. */
          if (scoreResult) void kirjaaPelimuotoPeli({ pelimuoto: "ikajarjestys", avain: category || "kaikki", oikein: scoreResult.correctCount, yhteensa: scoreResult.totalCount, pisteet: scoreResult.score });
          setPhase("revealing");
        }}
      />
    </PeliKehys>
  );
}
