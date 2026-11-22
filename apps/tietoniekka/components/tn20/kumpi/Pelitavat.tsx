"use client";
// KUMPI? 2.0 vaihe 2 — hubin Päivän Kumpi? ja Putki (Heikki 17.–22.11.2026): listan kaksi ensimmäistä riviä
// kultareunuksella. Heron nappi ja "Päivän peli" -merkki poistettu (Heikki 22.11.: sama promo kahdesti peräkkäin).
// Pelattu tila luetaan selaimesta: hubi on välimuistissa tunnin, joten päivämäärä lasketaan selaimessa (Helsingin aika).
import { useEffect, useState } from "react";
import { RiviLinkki, type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
import { helsinginPaiva } from "@/lib/aika";
import { lueEnnatys, luePaivanTulos } from "@/lib/kumpi/tallennus";

function usePaivanTulos(): boolean[] | null {
  const [osumat, setOsumat] = useState<boolean[] | null>(null);
  useEffect(() => { setOsumat(luePaivanTulos(helsinginPaiva().iso)?.osumat ?? null); }, []);
  return osumat;
}

const PAIVAN_RIVI = "Uudet kymmenen kysymystä päivittäin";
const PUTKI_RIVI = "Testaa, kuinka pitkän Putken saat aikaiseksi";

/** Päivän Kumpi? -rivi: pelanneelle tietorivinä päivän tulos. */
export function PaivanRivi({ eager }: { eager?: boolean }) {
  const osumat = usePaivanTulos();
  const k: RiviKortti = {
    href: "/kumpi/paivan",
    kuva: "/20/rivi/kumpi-paivan.webp",
    kuvaton: "Päivän Kumpi?",
    nimi: "Päivän Kumpi?",
    korostus: true,
    rivi: osumat ? `Tänään ${osumat.filter(Boolean).length}/${osumat.length} oikein` : PAIVAN_RIVI,
  };
  return <RiviLinkki k={k} eager={eager} />;
}

/** Putki-rivi: pelanneelle tietorivinä oma ennätys. */
export function PutkiRivi({ eager }: { eager?: boolean }) {
  const [ennatys, setEnnatys] = useState(0);
  useEffect(() => setEnnatys(lueEnnatys()), []);
  const k: RiviKortti = {
    href: "/kumpi/putki",
    kuva: "/20/rivi/kumpi-putki.webp",
    kuvaton: "Putki",
    nimi: "Putki",
    korostus: true,
    rivi: ennatys > 0 ? `Ennätyksesi ${ennatys} oikein putkeen` : PUTKI_RIVI,
  };
  return <RiviLinkki k={k} eager={eager} />;
}
