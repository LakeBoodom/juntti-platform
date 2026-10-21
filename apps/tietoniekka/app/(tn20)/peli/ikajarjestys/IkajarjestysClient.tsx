"use client";
// TIETOKETJU: IKÄJÄRJESTYS — pelinäkymän tilakone.
// Vaiheet: aloitus (pelikehys K2) → järjestäminen (ReorderableChainList)
// → paljastus (RevealSequencer, sisältää nyt myös pisteet+jatkonapit samalla
// sivulla, ks. RevealSequencer-kommentti "LIVE-QA-LÖYDÖS 2") → arvo uudet.
// Erillinen kolmas "tulos"-vaihe on poistettu 2026-09-16 Heikin pyynnöstä.
//
// "Sama henkilö ei toistu peräkkäisillä kierroksilla" (tehtävänanto kohta 5):
// kevyt client-puolen sessionStorage-tila muistaa edellisen kierroksen
// henkilö-id:t ja antaa ne getChainRoundille poissuljettavaksi. Ei pysyvää
// tallennusta pelaajan järjestyksestä — sessionStorage tyhjenee välilehden
// sulkeutuessa eikä mitään kirjoiteta kantaan pelin aikana.

import { useMemo, useState, type CSSProperties } from "react";
import { getChainRound } from "@/lib/ikajarjestys";
import {
  DEFAULT_DIRECTION,
  ROUND_SIZE,
  formatBirthDate,
  sortForDirection,
  type ChainPerson,
} from "@/lib/ikajarjestysConstants";
import { ReorderableChainList } from "@/components/tn20/ReorderableChainList";
import { SuuntaindikaattoriBadge } from "@/components/tn20/SuuntaindikaattoriBadge";
import { RevealSequencer, type RevealItem } from "@/components/tn20/RevealSequencer";
import { calculateChainScore } from "@/components/tn20/ChainResultSummary";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import PeliAloitus from "@/components/tn20/pelikehys/PeliAloitus";
import PeliTulos from "@/components/tn20/pelikehys/PeliTulos";
import { seuraavatPelit } from "@/lib/pelimuodot";
import { CHAIN_CATEGORIES } from "@/lib/personCategories";
import { RYHMAT } from "@/lib/henkiloRyhmat";

// Pelikehys K1 (20.10.2026): paluu kotikokoelmaan Tunnetut henkilöt.
const KOTI = { href: "/kokoelma/tunnetut-henkilot", nimi: "Tunnetut henkilöt" };
const PELI = "Ikäjärjestys";
/** K2-valinnassa ryhmien lyhyet nimet, jotta kahdeksan vaihtoehtoa mahtuu 390 × 844:ään napin kanssa. */
const LYHYT = new Map<string, string>([["kaikki", "Kaikki"], ...RYHMAT.map((r) => [r.key as string, r.lyhyt] as [string, string])]);
const VARI = new Map<string, string>(RYHMAT.map((r) => [r.key as string, r.vari]));

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
  initialCategory,
  initialRound,
  kasvot = [],
}: {
  initialCategory: string;
  initialRound: ChainPerson[] | null;
  /** Aloituksen kasvoketju (P3, 21.10.2026): enintään 10 kuvallista henkilöä syntymäjärjestyksessä. */
  kasvot?: Array<{ id: string; name: string; kuva: string }>;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [pickerCategory, setPickerCategory] = useState(initialCategory);
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
  const [jaettu, setJaettu] = useState(false);

  const correctOrder = useMemo(() => (round ? sortForDirection(round, DEFAULT_DIRECTION) : []), [round]);

  /** Haasta kaveri: sama kymmenikkö linkkinä (?henkilot=, sama kuin henkilösivun nosto). */
  async function haasta() {
    if (!round || !scoreResult) return;
    const url = `${location.origin}/peli/ikajarjestys?henkilot=${round.map((p) => p.id).join(",")}`;
    const teksti = `Sain ${scoreResult.correctCount}/${scoreResult.totalCount} oikein Ikäjärjestyksessä. Pystytkö parempaan?`;
    try {
      if (navigator.share) await navigator.share({ title: PELI, text: teksti, url });
      else await navigator.clipboard.writeText(`${teksti} ${url}`);
      setJaettu(true);
    } catch {
      // jako peruttu
    }
  }

  async function startRound(chosenCategory: string) {
    setJaettu(false);
    setPhase("loading");
    setEmptyNotice(null);
    setPartialRoundNotice(null);
    const lastSeen = readLastSeen();
    const next = await getChainRound(chosenCategory, lastSeen);
    setCategory(chosenCategory);
    setRound(next);
    setOrder(next); // jo satunnaisessa järjestyksessä, ks. huomio yllä
    if (next.length > 0) {
      writeLastSeen(next.map((p) => p.id));
      // Pieni kategoria voi palauttaa alle ROUND_SIZE henkilöä (ks. JULKAISUTEKSTI
      // "Kierroksen koko") — kierros pelataan silti loppuun, mutta pelaajalle
      // kerrotaan ettei tällä kertaa saatu täyttä kymmenikköä, koska muu UI
      // (otsikko, "Arvo 10 uutta") muuten implikoi aina täyttä kierrosta.
      if (next.length < ROUND_SIZE) {
        setPartialRoundNotice(`Tästä kategoriasta löytyi vain ${next.length} henkilöä tällä kierroksella.`);
      }
      setPhase("ordering");
    } else {
      setEmptyNotice("Tästä kategoriasta ei löytynyt tarpeeksi pelattavia henkilöitä juuri nyt. Kokeile toista kategoriaa.");
      setPhase("start");
    }
  }

  const revealItems: RevealItem[] = useMemo(() => {
    if (!round) return [];
    const correctIndexById = new Map(correctOrder.map((p, i) => [p.id, i]));
    return order.map((person, i) => ({
      id: person.id,
      name: person.name,
      role: person.role,
      image_url: person.image_url,
      placedPosition: i + 1,
      correctPosition: (correctIndexById.get(person.id) ?? i) + 1,
      birthDateLabel: formatBirthDate(person.birthDate),
    }));
  }, [order, round, correctOrder]);

  // Pisteet lasketaan suoraan renderissä (ei enää erillisen "paljastus valmis"
  // -callbackin varassa) — RevealSequencer näyttää tuloksen korttilistan alla
  // heti kun kaikki on paljastettu, samalla sivulla (ks. RevealSequencer-kommentti).
  const scoreResult = useMemo(() => (round ? calculateChainScore(order, correctOrder) : null), [order, round, correctOrder]);

  if (phase === "start" || phase === "loading") {
    const aihe = LYHYT.get(pickerCategory) ?? "Kaikki";
    return (
      <PeliKehys iho="tumma">
        <Pelipalkki iho="tumma" peli={PELI} koti={KOTI} />
        <main>
          {/* K2 (pelikehys, 20.10.2026): h1 → lause → aihe → Aloita → ohjeet avattavina. */}
          <PeliAloitus
            otsikko={PELI}
            lause="Aseta kymmenen tunnettua suomalaista syntymävuoden mukaan vanhimmasta nuorimpaan."
            valinta={
              <>
              {kasvot.length >= 5 && (
                <figure className="ika-kasvot">
                  <ol aria-label="Esimerkki: tunnettuja suomalaisia syntymävuoden mukaan">
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
              )}
              <fieldset className="pk-valinta">
                <legend>Valitse aihe</legend>
                <div className="pk-vaihtoehdot">
                  {CHAIN_CATEGORIES.map((c) => (
                    <label key={c.key} className="pk-vaihtoehto" style={VARI.has(c.key) ? ({ "--va": VARI.get(c.key) } as CSSProperties) : undefined}>
                      <input type="radio" name="ika-aihe" value={c.key} checked={pickerCategory === c.key} onChange={() => setPickerCategory(c.key)} />
                      <span className="pk-vaihtoehto-piste" aria-hidden="true" />
                      {LYHYT.get(c.key) ?? c.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              </>
            }
            toiminto={
              <button type="button" className="pk-nappi" disabled={phase === "loading"} onClick={() => startRound(pickerCategory)}>
                {phase === "loading" ? "Arvotaan…" : `Aloita · ${aihe}`}
              </button>
            }
            alarivi={
              emptyNotice ? (
                <span role="alert">{emptyNotice}</span>
              ) : phase === "loading" ? (
                <span role="status">Arvotaan kierrosta…</span>
              ) : undefined
            }
            ohjeet={[
              {
                otsikko: "Näin pelaat",
                sisalto: (
                  <>
                    <ol>
                      <li><b>Valitse aihe</b> – tai pelaa kaikilla henkilöillä.</li>
                      <li><b>Järjestä kymmenen henkilöä</b> syntymävuoden mukaan vanhimmasta nuorimpaan – raahaa tai napauta kahta korttia vaihtaaksesi niiden paikat.</li>
                      <li><b>Paljasta järjestys.</b> Oikeat paikat paljastuvat yksi kerrallaan, ja näet jokaisen syntymäajan.</li>
                    </ol>
                    <p>
                      Henkilöt ovat <a href={KOTI.href}>tunnettujen henkilöiden</a> joukosta – jokaisesta on myös oma tietovisansa.
                    </p>
                  </>
                ),
              },
            ]}
          />
        </main>
      </PeliKehys>
    );
  }

  if (phase === "revealing" && scoreResult) {
    return (
      <PeliKehys iho="tumma">
        <Pelipalkki iho="tumma" peli={PELI} koti={KOTI} />
        <main className="tk-page">
          <RevealSequencer
            items={revealItems}
            tulos={
              /* K4 (pelikehys, 20.10.2026): tulos → Pelaa uusi → Haasta kaveri → seuraava peli. */
              <PeliTulos
                eyebrow={`${PELI} · ${LYHYT.get(category) ?? "Kaikki"}`}
                iso={`${scoreResult.correctCount}/${scoreResult.totalCount} oikein`}
                ala={`${scoreResult.score} pistettä · pisin oikea ketju ${scoreResult.longestCorrectChain}`}
                paatoiminto={
                  <button type="button" className="pk-nappi" onClick={() => startRound(category)}>
                    Pelaa uusi kierros
                  </button>
                }
                harjoitus={
                  <button
                    type="button"
                    className="pk-linkki"
                    onClick={() => {
                      setPickerCategory(category);
                      setPhase("start");
                    }}
                  >
                    Vaihda aihetta
                  </button>
                }
                haasta={
                  <button type="button" className="pk-haasta" onClick={haasta}>
                    {jaettu ? "Haaste jaettu" : "Haasta kaveri"}
                  </button>
                }
                seuraavat={seuraavatPelit("ikajarjestys", "tunnetut-henkilot")}
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
      <Pelipalkki iho="tumma" peli={PELI} koti={KOTI} tila={`${order.length} henkilöä`} pelissa />
      <main className="tk-page">
        <header className="tk-order-head">
          <SuuntaindikaattoriBadge direction={DEFAULT_DIRECTION} />
          <h1 className="tk-order-title">{PELI}</h1>
          <p className="tk-order-desc">
            Raahaa tai napauta korteista järjestääksesi ne. Kun järjestys tuntuu oikealta, paljasta tulos.
          </p>
          {partialRoundNotice && (
            <p className="tk-loading" role="status">
              {partialRoundNotice}
            </p>
          )}
        </header>
        <ReorderableChainList items={order} onReorder={setOrder} />
        <button type="button" className="tk-btn-primary tk-order-cta" onClick={() => setPhase("revealing")}>
          Paljasta järjestys
        </button>
      </main>
    </PeliKehys>
  );
}
