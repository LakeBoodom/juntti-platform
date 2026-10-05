"use client";
// LAITA JÄRJESTYKSEEN — pelinäkymä. Sama mekaniikka ja komponentit kuin Ikäjärjestyksessä
// (ReorderableChainList → RevealSequencer + pisteet samalla sivulla), mutta kohteet ja
// suunta tulevat pakasta. Vaiheet: aloitus → järjestäminen → paljastus.
// Toistonesto kuten Ikäjärjestyksessä: edellisen kierroksen id:t sessionStorageen.

import { useMemo, useState } from "react";
import { haeJarjestysKierros } from "@/lib/jarjesta/kierros";
import {
  kokoelmaanTeksti,
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
import { TkGameNav } from "@/components/tn20/TkGameNav";

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
  muut,
}: {
  pakka: Pakka;
  muut: { href: string; otsikko: string }[];
}) {
  const [round, setRound] = useState<JarjestysKohde[] | null>(null);
  const [order, setOrder] = useState<JarjestysKohde[]>([]);
  const [phase, setPhase] = useState<Phase>("start");
  const [notice, setNotice] = useState<string | null>(null);
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
      <main className="tk-page tk-page--start">
        <TkGameNav />
        <div className="tk-picker tk-jarj-cq" style={lwTyyli}>
          <div className="tk-picker-handle" aria-hidden="true" />
          <h1 className="tk-picker-title tk-jarj-title">
            <span className="tk-jarj-eyebrow">Laita järjestykseen:</span>{" "}
            {iso(pakka.otsikko)}
          </h1>
          <p className="tk-picker-desc">{pakka.kuvaus}</p>
          <p className="tk-jarj-rajaus">{pakka.rajaus}</p>
          <SuuntaindikaattoriBadge
            label={pakka.suunta.toUpperCase()}
            className="tk-picker-direction"
          />
          <button
            type="button"
            className="tk-btn-primary tk-picker-start"
            onClick={aloita}
            disabled={phase === "loading"}
          >
            {phase === "loading" ? "Arvotaan…" : "Aloita kierros"}
          </button>
          {notice && (
            <p className="tk-loading" role="alert">
              {notice}
            </p>
          )}
        </div>
        <section className="tk-info" aria-labelledby="tk-info-h">
          <h2 id="tk-info-h">Näin pelaat</h2>
          <ol>
            <li>
              <b>Järjestä {pakka.pick} korttia</b> –{" "}
              {pakka.suunta.toLowerCase()}. Raahaa korttia tai napauta kahta
              korttia vaihtaaksesi niiden paikat.
            </li>
            <li>
              <b>Paljasta järjestys.</b> Näet jokaisen oikean arvon ja sen,
              mitkä kortit osuivat oikealle paikalle.
            </li>
            <li>
              <b>Pisteet:</b> oikea paikka 10 p, yhden sijan päässä 5 p.
              Jos kahdella kortilla on sama arvo, kumpi tahansa järjestys on
              oikein.
            </li>
          </ol>
          {muut.length > 0 && (
            <>
              <h2 className="tk-jarj-muut-h">Muut järjestyspelit</h2>
              <ul className="tk-jarj-muut">
                {muut.map((m) => (
                  <li key={m.href}>
                    <a href={m.href}>{iso(m.otsikko)}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    );
  }

  const summaryProps = {
    newRoundLabel: `Arvo ${pakka.pick} uutta`,
    collectionHref: `/kokoelma/${pakka.collection.slug}`,
    collectionLabel: kokoelmaanTeksti(pakka.collection.nimi),
  };

  if (phase === "revealing" && scoreResult) {
    return (
      <main className="tk-page">
        <TkGameNav />
        <RevealSequencer
          items={revealItems}
          result={scoreResult}
          onNewRound={aloita}
          summaryProps={summaryProps}
        />
        <p className="tk-jarj-lahde">
          {PISTEOHJE}
          {lahteet.length > 0 ? ` · Lähde: ${lahteet.join(", ")}` : ""}
        </p>
      </main>
    );
  }

  return (
    <main className="tk-page">
      <TkGameNav />
      <header className="tk-order-head tk-jarj-cq" style={lwTyyli}>
        <SuuntaindikaattoriBadge label={pakka.suunta.toUpperCase()} />
        <h1 className="tk-order-title tk-jarj-title">{iso(pakka.otsikko)}</h1>
        <p className="tk-order-desc">
          Raahaa tai napauta korteista järjestääksesi ne. Kun järjestys tuntuu
          oikealta, paljasta tulos.
        </p>
      </header>
      <ReorderableChainList items={order} onReorder={setOrder} />
      <button
        type="button"
        className="tk-btn-primary tk-order-cta"
        onClick={() => setPhase("revealing")}
      >
        Paljasta järjestys
      </button>
    </main>
  );
}
