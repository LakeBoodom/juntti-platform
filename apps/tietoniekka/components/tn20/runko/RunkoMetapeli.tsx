"use client";
// V2 OMA EDISTYMINEN + pelattu-tilat (runko §2). Kaikki on METAPELI_ENABLED-lipun takana
// (oletus pois). Kun lippu on pois, komponentti ei piirrä mitään eikä jätä aukkoa: V3 nousee heron alle,
// korttien ✓-merkit ja osioiden "x/n pelattu" eivät näy. Esikatselussa ?metapeli=1 näyttää päällä-tilan.
//
// Paikat rakennettu valmiiksi metapelin teknistä toteutusta varten. Nyt eteneminen lasketaan pelatuista
// visoista (tn_played_quizzes); porrassääntö "vähintään 7/10 ensiyrityksellä" vaatii pisteytyksen.
import { useEffect, useState } from "react";

const PORTAAT = [3, 10, 25];

export default function RunkoMetapeli({
  paalla,
  esikatselu,
  mastery,
  ikoni,
  visaIdt,
}: {
  paalla: boolean;
  esikatselu: boolean;
  mastery: string;
  ikoni: string;
  visaIdt: string[];
}) {
  const [tila, setTila] = useState<{ pelattu: number } | null>(null);

  useEffect(() => {
    const kaytossa = paalla || (esikatselu && new URLSearchParams(window.location.search).get("metapeli") === "1");
    if (!kaytossa) return;
    let pelatut: string[] = [];
    try {
      pelatut = JSON.parse(window.localStorage.getItem("tn_played_quizzes") ?? "[]") as string[];
    } catch {}
    const ps = new Set(pelatut);
    const juuri = document.querySelector<HTMLElement>("[data-runko]");
    juuri?.setAttribute("data-metapeli", "");
    document.querySelectorAll<HTMLElement>("[data-visa-id]").forEach((el) => {
      el.toggleAttribute("data-pelattu", ps.has(el.dataset.visaId ?? ""));
    });
    /* Osioiden ja chippien määrät: "3/14" ja "14 visaa · 3/14 pelattu". */
    document.querySelectorAll<HTMLElement>("section[data-osio]").forEach((osio) => {
      const idt = new Set([...osio.querySelectorAll<HTMLElement>("[data-visa-id]")].map((e) => e.dataset.visaId));
      const p = [...idt].filter((id) => id && ps.has(id)).length;
      const n = idt.size;
      osio.querySelectorAll<HTMLElement>(".rk-osio-maara").forEach((m) => (m.textContent = `${n} visaa · ${p}/${n} pelattu`));
      const chip = document.querySelector<HTMLElement>(`.rk-chip[data-osio="${osio.dataset.osio}"] span`);
      if (chip) chip.textContent = `${p}/${n}`;
    });
    setTila({ pelattu: visaIdt.filter((id) => ps.has(id)).length });
  }, [paalla, esikatselu, visaIdt]);

  if (!tila) return null;
  const porras = PORTAAT.findIndex((p) => tila.pelattu < p);
  const tavoite = porras === -1 ? PORTAAT[PORTAAT.length - 1] : PORTAAT[porras];
  const edellinen = porras <= 0 ? 0 : PORTAAT[porras - 1];
  const osuus = porras === -1 ? 1 : (tila.pelattu - edellinen) / (tavoite - edellinen);
  const roomalainen = ["I", "II", "III"][porras === -1 ? 2 : porras];
  return (
    <div className="rk-v2" data-tila={tila.pelattu === 0 ? "uusi" : "kesken"}>
      <span className="rk-v2-merkki" data-ikoni={ikoni} aria-hidden="true">
        {mastery.charAt(0)}
      </span>
      <span className="rk-v2-teksti">
        <span className="rk-v2-nimi">
          {mastery} {roomalainen}
        </span>
        <span className="rk-v2-ala">
          {tila.pelattu === 0
            ? `Pelaa ${tavoite} visaa tästä kokoelmasta ja ansaitse ensimmäinen merkki.`
            : `${Math.min(tila.pelattu, tavoite)}/${tavoite} visaa portaaseen ${roomalainen}`}
        </span>
        <span className="rk-v2-palkki" aria-hidden="true">
          <i style={{ transform: `scaleX(${Math.max(0, Math.min(1, osuus))})` }} />
        </span>
      </span>
    </div>
  );
}
