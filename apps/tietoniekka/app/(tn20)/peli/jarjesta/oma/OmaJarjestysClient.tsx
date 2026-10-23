"use client";
// Laadullinen järjestyspakka (brief 4.10.2026): Ikäjärjestyksen järjestämis- ja paljastuskomponentit,
// pisteytys yhteinen pakkapelien kanssa (lib/jarjesta/pisteytys.ts: 10/5, tasatulokset "tasan").
import { pelijakoteksti } from "@/lib/korttinimi";
import { useMemo, useState } from "react";
import { ReorderableChainList } from "@/components/tn20/ReorderableChainList";
import { SuuntaindikaattoriBadge } from "@/components/tn20/SuuntaindikaattoriBadge";
import { RevealSequencer, type RevealItem } from "@/components/tn20/RevealSequencer";
import { arvioi, arvoLisat, pisteet, PISTEOHJE } from "@/lib/jarjesta/pisteytys";
import Pelipalkki from "@/components/tn20/pelikehys/Pelipalkki";
import PeliKehys from "@/components/tn20/pelikehys/PeliKehys";
import PeliTulos from "@/components/tn20/pelikehys/PeliTulos";
import { seuraavatPelit } from "@/lib/pelimuodot";

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
  otsikko,
  suunta,
  direction,
  kohteet,
  tilastot,
  takaisin,
}: {
  otsikko: string;
  suunta: string;
  direction: "asc" | "desc";
  kohteet: OmaKohde[];
  tilastot: string | null;
  takaisin: { href: string; nimi: string };
}) {
  const [order, setOrder] = useState<OmaKohde[]>(kohteet);
  const [paljastettu, setPaljastettu] = useState(false);
  const [jaettu, setJaettu] = useState(false);
  const uudelleen = () => {
    setOrder(sekoita(kohteet));
    setPaljastettu(false);
    setJaettu(false);
    window.scrollTo({ top: 0 });
  };
  const oikea = useMemo(() => [...kohteet].sort((a, b) => (direction === "desc" ? b.value - a.value : a.value - b.value)), [kohteet, direction]);
  const arviot = useMemo(() => arvioi(order, oikea), [order, oikea]);

  const tulos = useMemo(() => pisteet(arviot), [arviot]);

  const revealItems: RevealItem[] = order.map((k, i) => {
    const a = arviot[i];
    const lisat = arvoLisat(a);
    return {
      id: k.id,
      name: k.name,
      role: "",
      image_url: k.image_url,
      placedPosition: i + 1,
      correctPosition: a.oikein ? i + 1 : a.lahin + 1,
      valueLabel: lisat ? `${k.valueLabel} · ${lisat}` : k.valueLabel,
    };
  });

  async function haasta() {
    /* Tulos linkkiin (?tulos=n-total), jotta Facebookin og-kuvaus kertoo sen (23.10.2026). */
    const u = new URL(location.href);
    u.searchParams.set("tulos", `${tulos.correctCount}-${tulos.totalCount}`);
    const url = u.toString();
    const teksti = pelijakoteksti(otsikko, `${tulos.correctCount}/${tulos.totalCount}`, tulos.correctCount === tulos.totalCount);
    try {
      if (navigator.share) await navigator.share({ title: PELI, text: teksti, url });
      else await navigator.clipboard.writeText(`${teksti} ${url}`);
      setJaettu(true);
    } catch {
      // jako peruttu
    }
  }

  // Pelikehys K1 (20.10.2026): paluu henkilösivulle, jolta pakka avattiin.
  if (paljastettu) {
    return (
      <PeliKehys iho="tumma">
        <Pelipalkki iho="tumma" peli={PELI} koti={takaisin} />
        <main className="tk-page">
          <RevealSequencer
            items={revealItems}
            tulos={
              /* K4 (pelikehys, 20.10.2026): tulos → Pelaa uudelleen → Haasta kaveri → seuraava peli. */
              <PeliTulos
                eyebrow={`${PELI} · ${otsikko}`}
                iso={`${tulos.correctCount}/${tulos.totalCount} oikein`}
                ala={`${tulos.score} pistettä · pisin oikea ketju ${tulos.longestCorrectChain}`}
                paatoiminto={
                  <button type="button" className="pk-nappi" onClick={uudelleen}>
                    Pelaa uudelleen
                  </button>
                }
                haasta={
                  <button type="button" className="pk-haasta" onClick={haasta}>
                    {jaettu ? "Haaste jaettu" : "Haasta kaveri"}
                  </button>
                }
                seuraavat={seuraavatPelit("", "tunnetut-henkilot")}
              />
            }
          />
          <p className="tk-jarj-lahde">
            {PISTEOHJE}{tilastot ? ` · ${tilastot}` : ""}
          </p>
        </main>
      </PeliKehys>
    );
  }

  return (
    <PeliKehys iho="tumma">
      <Pelipalkki iho="tumma" peli={PELI} koti={takaisin} tila={`${order.length} korttia`} pelissa />
      <main className="tk-page">
        <header className="tk-order-head">
          <SuuntaindikaattoriBadge label={suunta.toUpperCase()} />
          <h1 className="tk-order-title">{otsikko}</h1>
          <p className="tk-order-desc">Raahaa tai napauta korteista järjestääksesi ne. Kun järjestys tuntuu oikealta, paljasta tulos.</p>
        </header>
        <ReorderableChainList items={order} onReorder={setOrder} />
        <button type="button" className="tk-btn-primary tk-order-cta" onClick={() => setPaljastettu(true)}>
          Paljasta järjestys
        </button>
        {tilastot && <p className="tk-jarj-lahde">{tilastot}</p>}
      </main>
    </PeliKehys>
  );
}
