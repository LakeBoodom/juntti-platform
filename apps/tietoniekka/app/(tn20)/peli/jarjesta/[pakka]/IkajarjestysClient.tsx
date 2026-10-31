"use client";
// TIETOKETJU: IKÄJÄRJESTYS — pelinäkymän tilakone. Osa C (31.10.2026): Järjestä-hubin pakka
// /peli/jarjesta/ikajarjestys-<aihe>; aihe tulee pakasta (ei aihevalintaa), paluu hubiin, tuloksessa Seuraava pakka.
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

import { pelijakoteksti } from "@/lib/korttinimi";
import { ikajarjestysTaso } from "@/lib/pelitasot";
import { useMemo, useState } from "react";
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
import { kirjaaPelimuotoPeli } from "@/lib/pelimuotoPelit";
import { HUB, HUB_HREF, type IkaPakka } from "@/lib/jarjesta/hub";
import SeuraavaPakka from "@/components/tn20/jarjesta/SeuraavaPakka";

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
  /** Aloituksen kasvoketju (P3, 21.10.2026): enintään 10 kuvallista henkilöä syntymäjärjestyksessä. */
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

  const correctOrder = useMemo(() => (round ? sortForDirection(round, DEFAULT_DIRECTION) : []), [round]);

  /** Haasta kaveri: sama kymmenikkö linkkinä (?henkilot=, sama kuin henkilösivun nosto). */
  /* Jako (K4 v2, 25.10.2026): Jakoalue-komponentti; tulos linkkiin (?tulos=n-total) jotta kaveri saa saman kierroksen
     ja Facebookin og-kuvaus kertoo tuloksen; tasonimi kuten tulosnäkymässä. Tulosvaihe piirretään vain selaimessa. */
  const jakoTiedot = () => ({
    url: `${location.origin}${pakka.href}?henkilot=${(round ?? []).map((p) => p.id).join(",")}&tulos=${scoreResult?.correctCount ?? 0}-${scoreResult?.totalCount ?? 0}`,
    teksti: pelijakoteksti(`${PELI}: ${pakka.nimi}`, `${scoreResult?.correctCount ?? 0}/${scoreResult?.totalCount ?? 0} oikein`, !!scoreResult && scoreResult.correctCount === scoreResult.totalCount, scoreResult ? ikajarjestysTaso(scoreResult.correctCount, scoreResult.totalCount) : null),
  });

  async function startRound() {
    setPhase("loading");
    setEmptyNotice(null);
    setPartialRoundNotice(null);
    const lastSeen = readLastSeen();
    const next = await getChainRound(category, lastSeen);
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
      setEmptyNotice("Kierroksen arvonta ei onnistunut juuri nyt. Yritä hetken päästä uudelleen.");
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
    return (
      <PeliKehys iho="tumma">
        <Pelipalkki iho="tumma" peli={HUB.nimi} muunnelma={pakka.nimi} koti={HUB} />
        <main>
          {/* K2 (pelikehys, 20.10.2026): h1 → lause → kasvoketju → Aloita. Osa C: ei aihevalintaa eikä ohjeita. */}
          <PeliAloitus
            otsikko={PELI}
            lause="Aseta kymmenen tunnettua henkilöä syntymävuoden mukaan vanhimmasta nuorimpaan."
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
        <Pelipalkki iho="tumma" peli={HUB.nimi} muunnelma={pakka.nimi} koti={HUB} />
        <main className="tk-page">
          <RevealSequencer
            items={revealItems}
            tulos={
              /* K4 v2 (pelimuotojen kehys 25.10.2026): tulos → jako → seuraava peli → toissijaiset linkit. */
              <PeliTulos
                luku={`${scoreResult.correctCount}/${scoreResult.totalCount}`}
                yksikko="oikein"
                tasonimi={ikajarjestysTaso(scoreResult.correctCount, scoreResult.totalCount)}
                lause={`${scoreResult.score} pistettä. Pisin oikea ketju: ${scoreResult.longestCorrectChain}.`}
                jako={{ ...jakoTiedot(), natiiviOtsikko: PELI }}
                toiminnot={[{ teksti: "Pelaa uusi kierros", onClick: () => startRound() }, { teksti: "Kaikki pakat", href: HUB_HREF }]}
                seuraavat={[]}
                seuraavaOsio={<SeuraavaPakka slug={pakka.slug} />}
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
      <Pelipalkki iho="tumma" peli={HUB.nimi} muunnelma={pakka.nimi} koti={HUB} tila={`${order.length} henkilöä`} pelissa />
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
        <button type="button" className="tk-btn-primary tk-order-cta" onClick={() => {
            /* Pelikerta tilastoihin (pelimuoto_pelit) tarkistushetkellä: järjestys on silloin lopullinen. */
            if (scoreResult) void kirjaaPelimuotoPeli({ pelimuoto: "ikajarjestys", avain: category || "kaikki", oikein: scoreResult.correctCount, yhteensa: scoreResult.totalCount, pisteet: scoreResult.score });
            setPhase("revealing");
          }}>
          Paljasta järjestys
        </button>
      </main>
    </PeliKehys>
  );
}
