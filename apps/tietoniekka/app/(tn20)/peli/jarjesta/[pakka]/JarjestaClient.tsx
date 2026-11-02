"use client";
// LAITA JÄRJESTYKSEEN — pelinäkymä. Sama lauta ja tulos kuin Ikäjärjestyksessä (Korjausrivi → RevealSequencer),
// mutta kohteet ja suunta tulevat pakasta. Vaiheet: aloitus → järjestäminen → paljastus.
// Toistonesto kuten Ikäjärjestyksessä: edellisen kierroksen id:t sessionStorageen.
// Osa C (31.10.2026): Järjestä-hubin pakka; hubista tultaessa (?aloita=1) ensimmäinen kierros tulee valmiina palvelimelta.
// CD "Järjestä yhtenäinen UX" (Heikki 2.11.2026): yksi rivi paluulinkkinä, Korjaa rivi → Tarkista rivi → Seuraava rivi.

import { pelijakoteksti } from "@/lib/korttinimi";
import { useEffect, useMemo, useState } from "react";
import { haeJarjestysKierros } from "@/lib/jarjesta/kierros";
import {
  oikeaJarjestys,
  type JarjestysKohde,
  type Pakka,
} from "@/lib/jarjesta/pakat";
import { arvioi, pisteet } from "@/lib/jarjesta/pisteytys";
import { vuosiTaiPaiva } from "@/lib/jarjesta/rivi";
import { SuuntaindikaattoriBadge } from "@/components/tn20/SuuntaindikaattoriBadge";
import {
  RevealSequencer,
  type RevealItem,
} from "@/components/tn20/RevealSequencer";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import PeliAloitus from "@/components/tn20/pelikehys/PeliAloitus";
import Korjausrivi from "@/components/tn20/jarjesta/Korjausrivi";
import RiviJatko from "@/components/tn20/jarjesta/RiviJatko";
import { kirjaaPelimuotoPeli } from "@/lib/pelimuotoPelit";
import { HUB, aloitaHref, seuraavaPakka } from "@/lib/jarjesta/hub";

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
  const [uusiKesken, setUusiKesken] = useState(false);
  // Osa C: paluu Järjestä-hubiin (ei kokoelmaan).
  const koti = HUB;
  // Palvelimen arpoma ensimmäinen kierros toistonestoon kuten clientillä arvottu.
  useEffect(() => {
    if (alussa) tallennaEdelliset(pakka.slug, initialRound!.map((k) => k.id));
  }, [alussa, initialRound, pakka.slug]);
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
     ja Facebookin og-kuvaus kertoo tuloksen. Tulosvaihe piirretään vain selaimessa. */
  const jakoTiedot = () => ({
    url: `${location.origin}${location.pathname}?kohteet=${(round ?? []).map((k) => k.id).join(",")}&tulos=${scoreResult?.correctCount ?? 0}-${scoreResult?.totalCount ?? 0}`,
    teksti: pelijakoteksti(`${PELI}: ${pakka.kortti.otsikko}`, `${scoreResult?.correctCount ?? 0}/${scoreResult?.totalCount ?? 0} oikealla paikalla`, !!scoreResult && scoreResult.correctCount === scoreResult.totalCount),
  });

  async function aloita() {
    /* Tuloksesta "Uusi kierros": tulos pysyy näkyvissä, kunnes uusi rivi on arvottu. */
    if (phase === "start") setPhase("loading");
    else setUusiKesken(true);
    setNotice(null);
    const next = await haeJarjestysKierros(
      pakka.slug,
      lueEdelliset(pakka.slug),
    );
    setUusiKesken(false);
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

  const revealItems: RevealItem[] = useMemo(() => {
    const arvot = vuosiTaiPaiva(order.map((k) => k.valueLabel));
    return order.map((k, i) => {
      const a = arviot[i];
      return {
        id: k.id,
        name: k.name,
        image_url: k.image_url,
        hideThumb: k.hideThumb,
        tunnus: k.tunnus,
        placedPosition: i + 1,
        correctPosition: !a || a.oikein ? i + 1 : a.lahin + 1,
        valueLabel: arvot[i],
      };
    });
  }, [order, arviot]);

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
        <Pelipalkki iho="tumma" peli={PELI} koti={koti} pelissa paluuNuoli />
        <main>
          <RevealSequencer
            items={revealItems}
            jatko={
              <RiviJatko
                seuraava={aloitaHref(seuraavaPakka(pakka.slug))}
                uusi={{ teksti: "Uusi kierros", onClick: aloita, kesken: uusiKesken }}
                jako={{ ...jakoTiedot(), natiiviOtsikko: PELI }}
              />
            }
            alaviite={lahteet.length > 0 ? `Lähde: ${lahteet.join(", ")}` : null}
          />
        </main>
      </PeliKehys>
    );
  }

  return (
    <PeliKehys iho="tumma">
      <Pelipalkki iho="tumma" peli={PELI} koti={koti} pelissa paluuNuoli />
      <Korjausrivi
        lause={pakka.pelilause}
        ylin={pakka.ylin}
        alin={pakka.alin}
        items={order}
        onReorder={setOrder}
        onTarkista={() => {
          /* Pelikerta tilastoihin (pelimuoto_pelit) tarkistushetkellä: järjestys on silloin lopullinen. */
          if (scoreResult) void kirjaaPelimuotoPeli({ pelimuoto: "jarjesta", avain: pakka.slug, oikein: scoreResult.correctCount, yhteensa: scoreResult.totalCount, pisteet: scoreResult.score });
          setPhase("revealing");
        }}
      />
    </PeliKehys>
  );
}
