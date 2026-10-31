"use client";
// LAITA JÄRJESTYKSEEN — pelinäkymä. Sama mekaniikka ja komponentit kuin Ikäjärjestyksessä
// (ReorderableChainList → RevealSequencer + pisteet samalla sivulla), mutta kohteet ja
// suunta tulevat pakasta. Vaiheet: aloitus → järjestäminen → paljastus.
// Toistonesto kuten Ikäjärjestyksessä: edellisen kierroksen id:t sessionStorageen.
// Osa C (31.10.2026): Järjestä-hubin pakka — paluu hubiin, ei ohjeita eikä Muut järjestyspelit -osiota,
// hubista tultaessa (?aloita=1) ensimmäinen kierros tulee valmiina palvelimelta, tuloksessa Seuraava pakka.

import { pelijakoteksti } from "@/lib/korttinimi";
import { jarjestaTaso } from "@/lib/pelitasot";
import { useEffect, useMemo, useState } from "react";
import { haeJarjestysKierros } from "@/lib/jarjesta/kierros";
import {
  oikeaJarjestys,
  type JarjestysKohde,
  type Pakka,
} from "@/lib/jarjesta/pakat";
import { arvioi, arvoLisat, pisteet, PISTEOHJE } from "@/lib/jarjesta/pisteytys";
import { ReorderableChainList } from "@/components/tn20/ReorderableChainList";
import { SuuntaindikaattoriBadge } from "@/components/tn20/SuuntaindikaattoriBadge";
import {
  RevealSequencer,
  type RevealItem,
} from "@/components/tn20/RevealSequencer";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import PeliAloitus from "@/components/tn20/pelikehys/PeliAloitus";
import PeliTulos from "@/components/tn20/pelikehys/PeliTulos";
import { kirjaaPelimuotoPeli } from "@/lib/pelimuotoPelit";
import { HUB, HUB_HREF } from "@/lib/jarjesta/hub";
import SeuraavaPakka from "@/components/tn20/jarjesta/SeuraavaPakka";

const PELI = "Järjestä";

type Phase = "start" | "loading" | "ordering" | "revealing";

const iso = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const avain = (slug: string) => `tk-jarjesta-${slug}`;

function lueEdelliset(slug: string): string[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(avain(slug)) ?? "[]");
    return Array.isArray(v)
      ? v.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function tallennaEdelliset(slug: string, ids: string[]) {
  try {
    sessionStorage.setItem(avain(slug), JSON.stringify(ids));
  } catch {
    // estetty sessionStorage (yksityinen selaus) ei kaada peliä
  }
}

export default function JarjestaClient({
  pakka,
  initialRound = null,
}: {
  pakka: Pakka;
  /** Hubista (?aloita=1): palvelimella arvottu ensimmäinen kierros, jo sekoitettuna. */
  initialRound?: JarjestysKohde[] | null;
}) {
  const alussa = !!initialRound && initialRound.length >= 3;
  const [round, setRound] = useState<JarjestysKohde[] | null>(alussa ? initialRound : null);
  const [order, setOrder] = useState<JarjestysKohde[]>(alussa ? initialRound! : []);
  const [phase, setPhase] = useState<Phase>(alussa ? "ordering" : "start");
  const [notice, setNotice] = useState<string | null>(null);
  // Osa C: paluu Järjestä-hubiin (ei kokoelmaan).
  const koti = HUB;
  // Palvelimen arpoma ensimmäinen kierros toistonestoon kuten clientillä arvottu.
  useEffect(() => {
    if (alussa) tallennaEdelliset(pakka.slug, initialRound!.map((k) => k.id));
  }, [alussa, initialRound, pakka.slug]);
  // KORTTISÄÄNTÖ: otsikko on uppercase eikä sanoja katkaista → koko pisimmän sanan mukaan (CSS).
  const lwTyyli = {
    "--tk-lw": Math.max(...pakka.otsikko.split(/\s+/).map((w) => w.length), 8),
  } as React.CSSProperties;

  const correctOrder = useMemo(
    () => (round ? oikeaJarjestys(round, pakka.direction) : []),
    [round, pakka.direction],
  );
  // Pisteytys 10/5 + tasatulokset, sama kuin henkilösivun laadullisissa pakoissa.
  const arviot = useMemo(
    () => (round ? arvioi(order, correctOrder) : []),
    [order, round, correctOrder],
  );
  const scoreResult = useMemo(
    () => (round ? pisteet(arviot) : null),
    [arviot, round],
  );

  /* Jako (K4 v2, 25.10.2026): Jakoalue-komponentti; tulos linkkiin (?tulos=n-total) jotta kaveri saa saman kierroksen
     ja Facebookin og-kuvaus kertoo tuloksen; tasonimi kuten tulosnäkymässä. Tulosvaihe piirretään vain selaimessa. */
  const jakoTiedot = () => ({
    url: `${location.origin}${location.pathname}?tulos=${scoreResult?.correctCount ?? 0}-${scoreResult?.totalCount ?? 0}`,
    teksti: pelijakoteksti(`${PELI}: ${pakka.kortti.otsikko}`, `${scoreResult?.correctCount ?? 0}/${scoreResult?.totalCount ?? 0} oikein`, !!scoreResult && scoreResult.correctCount === scoreResult.totalCount, scoreResult ? jarjestaTaso(scoreResult.correctCount, scoreResult.totalCount, pakka.collection.slug) : null),
  });

  async function aloita() {
    setPhase("loading");
    setNotice(null);
    const next = await haeJarjestysKierros(
      pakka.slug,
      lueEdelliset(pakka.slug),
    );
    if (next.length < 3) {
      setNotice(
        "Kierroksen arvonta ei onnistunut juuri nyt. Yritä hetken päästä uudelleen.",
      );
      setPhase("start");
      return;
    }
    tallennaEdelliset(
      pakka.slug,
      next.map((k) => k.id),
    );
    setRound(next);
    setOrder(next); // palvelin palauttaa jo sekoitetussa järjestyksessä
    setPhase("ordering");
    window.scrollTo({ top: 0 });
  }

  const revealItems: RevealItem[] = useMemo(
    () =>
      order.map((k, i) => {
        const a = arviot[i];
        const lisat = a ? arvoLisat(a) : "";
        return {
          id: k.id,
          name: k.name,
          role: k.role,
          image_url: k.image_url,
          hideThumb: k.hideThumb,
          placedPosition: i + 1,
          correctPosition: !a || a.oikein ? i + 1 : a.lahin + 1,
          // Väärin sijoitetuille myös oikea sija → pelaaja näkee oikean järjestyksen arvoineen (brief §2).
          valueLabel: lisat ? `${k.valueLabel} · ${lisat}` : k.valueLabel,
        };
      }),
    [order, arviot],
  );

  const lahteet = useMemo(
    () => [
      ...new Set(
        (round ?? []).map((k) => k.lahde).filter((x): x is string => !!x),
      ),
    ],
    [round],
  );

  if (phase === "start" || phase === "loading") {
    return (
      <PeliKehys iho="tumma">
        <Pelipalkki iho="tumma" peli={PELI} muunnelma={pakka.kortti.otsikko} koti={koti} />
        <main>
          {/* K2 (pelikehys, 20.10.2026): h1 → lause → suunta → Aloita → ohjeet avattavina. */}
          <PeliAloitus
            otsikko={iso(pakka.otsikko)}
            lause={pakka.kuvaus}
            valinta={<SuuntaindikaattoriBadge label={pakka.suunta.toUpperCase()} className="tk-picker-direction" />}
            toiminto={
              <button type="button" className="pk-nappi" onClick={aloita} disabled={phase === "loading"}>
                {phase === "loading" ? "Arvotaan…" : "Aloita kierros"}
              </button>
            }
            alarivi={notice ? <span role="alert">{notice}</span> : pakka.rajaus}
            ohjeet={[]}
          />
        </main>
      </PeliKehys>
    );
  }

  if (phase === "revealing" && scoreResult) {
    return (
      <PeliKehys iho="tumma">
        <Pelipalkki iho="tumma" peli={PELI} muunnelma={pakka.kortti.otsikko} koti={koti} />
        <main className="tk-page">
          <RevealSequencer
            items={revealItems}
            tulos={
              /* K4 v2 (pelimuotojen kehys 25.10.2026): tulos → jako → seuraava peli → toissijaiset linkit. */
              <PeliTulos
                luku={`${scoreResult.correctCount}/${scoreResult.totalCount}`}
                yksikko="oikein"
                tasonimi={jarjestaTaso(scoreResult.correctCount, scoreResult.totalCount, pakka.collection.slug)}
                lause={`${scoreResult.score} pistettä. Pisin oikea ketju: ${scoreResult.longestCorrectChain}.`}
                jako={{ ...jakoTiedot(), natiiviOtsikko: PELI }}
                toiminnot={[{ teksti: "Pelaa uusi kierros", onClick: aloita }, { teksti: "Kaikki pakat", href: HUB_HREF }]}
                seuraavat={[]}
                seuraavaOsio={<SeuraavaPakka slug={pakka.slug} />}
              />
            }
          />
          <p className="tk-jarj-lahde">
            {PISTEOHJE}
            {lahteet.length > 0 ? ` · Lähde: ${lahteet.join(", ")}` : ""}
          </p>
        </main>
      </PeliKehys>
    );
  }

  return (
    <PeliKehys iho="tumma">
      <Pelipalkki iho="tumma" peli={PELI} muunnelma={pakka.kortti.otsikko} koti={koti} tila={`${order.length} korttia`} pelissa />
      <main className="tk-page">
        <header className="tk-order-head tk-jarj-cq" style={lwTyyli}>
          <SuuntaindikaattoriBadge label={pakka.suunta.toUpperCase()} />
          <h1 className="tk-order-title tk-jarj-title">{iso(pakka.otsikko)}</h1>
          <p className="tk-order-desc">
            Raahaa tai napauta korteista järjestääksesi ne. Kun järjestys tuntuu oikealta, paljasta tulos.
          </p>
        </header>
        <ReorderableChainList items={order} onReorder={setOrder} />
        <button type="button" className="tk-btn-primary tk-order-cta" onClick={() => {
            /* Pelikerta tilastoihin (pelimuoto_pelit) tarkistushetkellä: järjestys on silloin lopullinen. */
            if (scoreResult) void kirjaaPelimuotoPeli({ pelimuoto: "jarjesta", avain: pakka.slug, oikein: scoreResult.correctCount, yhteensa: scoreResult.totalCount, pisteet: scoreResult.score });
            setPhase("revealing");
          }}>
          Paljasta järjestys
        </button>
      </main>
    </PeliKehys>
  );
}
