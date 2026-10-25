"use client";
// OMA ETENEMINEN + V2 (runko §2). Osioiden ja chippien "x/n pelattu" näkyy aina (Heikki 20.10.2026), kun
// pelaaja on pelannut tästä kokoelmasta. METAPELI_ENABLED-lipun takana (oletus pois) ovat V2-rivi,
// mestaruusmerkki/tasot ja korttien ✓-merkit; lipun ollessa pois V2 ei jätä aukkoa. Esikatselussa ?metapeli=1.
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
    let pelatut: string[] = [];
    try {
      pelatut = JSON.parse(window.localStorage.getItem("tn_played_quizzes") ?? "[]") as string[];
    } catch {}
    const ps = new Set(pelatut);
    const kaytossa = paalla || (esikatselu && new URLSearchParams(window.location.search).get("metapeli") === "1");
    const kokoelmassa = visaIdt.filter((id) => ps.has(id)).length;

    /* Oma eteneminen (Heikki 20.10.2026): osiochipit, osioiden otsikot ja aikajana näyttävät pelatut AINA,
       ilman metapeli-lippua — mutta vain, jos pelaaja on pelannut tästä kokoelmasta (ensikävijä: pelkkä määrä). */
    if (kokoelmassa > 0) {
      document.querySelectorAll<HTMLElement>("section[data-osio]").forEach((osio) => {
        const idt = new Set([...osio.querySelectorAll<HTMLElement>("[data-visa-id]")].map((e) => e.dataset.visaId));
        const p = [...idt].filter((id) => id && ps.has(id)).length;
        const n = idt.size;
        osio.querySelectorAll<HTMLElement>(".rk-osio-maara").forEach((m) => (m.textContent = `${p}/${n} pelattu`));
        const chip = document.querySelector<HTMLElement>(`.rk-chip[data-osio="${osio.dataset.osio}"] span`);
        if (chip) chip.textContent = `${p}/${n}`;
        /* Aikajana ja juhlakello (V4): "x/n pelattu" ja täysi kausi teemavärillä (CD 2). */
        const aika = document.querySelector<HTMLElement>(`.rk-aika a[data-osio="${osio.dataset.osio}"]`);
        if (aika) {
          aika.querySelector(".rk-aika-maara")!.textContent = `${p}/${n} pelattu`;
          aika.dataset.taso = p === 0 ? "" : p >= n ? "taysi" : "osa";
        }
      });
    }

    /* Metapeli-lipun takana: V2-rivi, mestaruusmerkki, tasot ja korttien ✓-merkit. */
    if (!kaytossa) return;
    document.querySelector<HTMLElement>("[data-runko]")?.setAttribute("data-metapeli", "");
    document.querySelectorAll<HTMLElement>("[data-visa-id]").forEach((el) => {
      el.toggleAttribute("data-pelattu", ps.has(el.dataset.visaId ?? ""));
    });
    setTila({ pelattu: kokoelmassa });
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
