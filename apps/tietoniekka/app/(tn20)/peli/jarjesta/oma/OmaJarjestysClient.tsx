"use client";
// Laadullinen järjestyspakka (brief 4.10.2026): sama lauta ja tulos kuin pakkapeleissä (Korjausrivi → RevealSequencer),
// tasatulokset lib/jarjesta/pisteytys.ts. CD "Järjestä yhtenäinen UX" (Heikki 2.11.2026).
import { tulosjakoteksti, vastahaasteteksti } from "@/lib/korttinimi";
import { jarjestaKaveri } from "@/lib/kaveri";
import { useMemo, useState } from "react";
import { RevealSequencer, type RevealItem } from "@/components/tn20/RevealSequencer";
import { arvioi, pisteet } from "@/lib/jarjesta/pisteytys";
import { vuosiTaiPaiva } from "@/lib/jarjesta/rivi";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import { SeuraavaPeli } from "@/components/tn20/pelikehys/PeliTulos";
import Korjausrivi from "@/components/tn20/jarjesta/Korjausrivi";
import RiviJatko from "@/components/tn20/jarjesta/RiviJatko";
import { seuraavatPelit } from "@/lib/pelimuodot";
import { kirjaaPelimuotoPeli } from "@/lib/pelimuotoPelit";

const PELI = "Laita järjestykseen";

export type OmaKohde = { id: string; name: string; role: string; image_url: string | null; value: number; valueLabel: string };

function sekoita<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function OmaJarjestysClient({
  attr,
  otsikko,
  ylin,
  alin,
  direction,
  kohteet,
  tilastot,
  takaisin,
  kaverinTulos = null,
}: {
  /** Laatuattribuutin avain (?a=) — pelikertatilaston avain. */
  attr: string;
  otsikko: string;
  ylin: string;
  alin: string;
  direction: "asc" | "desc";
  kohteet: OmaKohde[];
  tilastot: string | null;
  takaisin: { href: string; nimi: string };
  /** Haastetun polku: kaverin tulos samalla rivillä (?tulos=n-total); "Yritä uudelleen" pitää saman rivin. */
  kaverinTulos?: { n: number; kaikki: number } | null;
}) {
  const kaveri = kaverinTulos ? jarjestaKaveri(kaverinTulos) : null;
  const [order, setOrder] = useState<OmaKohde[]>(kohteet);
  const [paljastettu, setPaljastettu] = useState(false);
  const uudelleen = () => {
    setOrder(sekoita(kohteet));
    setPaljastettu(false);
    window.scrollTo({ top: 0 });
  };
  const oikea = useMemo(() => [...kohteet].sort((a, b) => (direction === "desc" ? b.value - a.value : a.value - b.value)), [kohteet, direction]);
  const arviot = useMemo(() => arvioi(order, oikea), [order, oikea]);

  const tulos = useMemo(() => pisteet(arviot), [arviot]);

  const arvot = vuosiTaiPaiva(order.map((k) => k.valueLabel));
  const revealItems: RevealItem[] = order.map((k, i) => {
    const a = arviot[i];
    return {
      id: k.id,
      name: k.name,
      image_url: k.image_url,
      placedPosition: i + 1,
      correctPosition: a.oikein ? i + 1 : a.lahin + 1,
      valueLabel: arvot[i],
    };
  });

  /* Jako (K4 v2, 25.10.2026): Jakoalue-komponentti; tulos linkkiin (?tulos=n-total) jotta kaveri saa saman kierroksen
     ja Facebookin og-kuvaus kertoo tuloksen. Tulosvaihe piirretään vain selaimessa. */
  const jakoTiedot = () => ({
    url: (() => { const u = new URL(location.href); u.searchParams.set("tulos", `${tulos.correctCount}-${tulos.totalCount}`); return u.toString(); })(),
    teksti: kaveri
      ? vastahaasteteksti(`${tulos.correctCount}/${tulos.totalCount}`, kaveri.lyhyt)
      : tulosjakoteksti(otsikko, `sain ${tulos.correctCount}/${tulos.totalCount} oikeille paikoille`),
  });

  // Pelikehys K1 (20.10.2026): paluu henkilösivulle, jolta pakka avattiin.
  if (paljastettu) {
    return (
      <PeliKehys iho="tumma">
        <Pelipalkki iho="tumma" peli={PELI} koti={takaisin} pelissa paluuNuoli />
        <main>
          <RevealSequencer
            items={revealItems}
            jatko={
              <RiviJatko
                uusi={{ teksti: "Yritä uudelleen", onClick: uudelleen }}
                jako={{ ...jakoTiedot(), natiiviOtsikko: PELI }}
                vertailu={kaveri ? { oma: { luku: `${tulos.correctCount}/${tulos.totalCount}`, lyhyt: `${tulos.correctCount}/${tulos.totalCount}`, arvo: tulos.correctCount }, kaveri } : null}
                lisa={<SeuraavaPeli seuraavat={seuraavatPelit("", "tunnetut-henkilot")} />}
              />
            }
            alaviite={tilastot}
          />
        </main>
      </PeliKehys>
    );
  }

  return (
    <PeliKehys iho="tumma">
      <Pelipalkki iho="tumma" peli={PELI} koti={takaisin} pelissa paluuNuoli />
      <Korjausrivi
        kaveri={kaveri}
        lause={`${otsikko}.`}
        ylin={ylin}
        alin={alin}
        items={order}
        onReorder={setOrder}
        onTarkista={() => {
          /* Pelikerta tilastoihin (pelimuoto_pelit); avain = laatuattribuutti (?a=). */
          void kirjaaPelimuotoPeli({ pelimuoto: "jarjesta_oma", avain: attr, oikein: tulos.correctCount, yhteensa: tulos.totalCount, pisteet: tulos.score });
          setPaljastettu(true);
        }}
      />
    </PeliKehys>
  );
}
