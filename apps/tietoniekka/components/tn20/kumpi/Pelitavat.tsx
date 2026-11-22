"use client";
// KUMPI? 2.0 vaihe 2 — hubin Päivän Kumpi? ja Putki (Heikki 17.–22.11.2026). Samat mallit kuin Karttapeleissä ja
// Kuvavisoissa (hub-runko vaihe 3: ei nostoa): heron ainoa nappi vie päivän peliin, ja päivän peli on listan ensimmäinen
// rivi merkillä "Päivän peli". Pelattu tila luetaan selaimesta: hubi on välimuistissa tunnin, joten päivämäärä lasketaan
// selaimessa (Helsingin aika), ei palvelimella.
import { useEffect, useState } from "react";
import { RiviLinkki, type RiviKortti } from "@/components/tn20/korttirivi/KorttiRivi";
import { helsinginPaiva } from "@/lib/aika";
import { lueEnnatys, luePaivanTulos } from "@/lib/kumpi/tallennus";

function usePaivanTulos(): boolean[] | null {
  const [osumat, setOsumat] = useState<boolean[] | null>(null);
  useEffect(() => { setOsumat(luePaivanTulos(helsinginPaiva().iso)?.osumat ?? null); }, []);
  return osumat;
}

/** Heron nappi: "Pelaa Päivän Kumpi?" / pelanneelle "Katso tuloksesi". */
export function PaivanCta() {
  const pelattu = !!usePaivanTulos();
  return (
    <a className="hub-cta tn-cta-lime" href="/kumpi/paivan" data-tn-entry="kumpi:hero">
      {pelattu ? "Katso tuloksesi" : "Pelaa Päivän Kumpi?"} <span aria-hidden="true">→</span>
    </a>
  );
}

const PAIVAN_RIVI = "Kymmenen kysymystä kaikista aiheista, sama kaikille";
const PUTKI_RIVI = "Kello käy, ja yksi virhe katkaisee putken";

/** Päivän Kumpi? -rivi: pelanneelle tietorivinä päivän tulos. */
export function PaivanRivi({ eager }: { eager?: boolean }) {
  const osumat = usePaivanTulos();
  const k: RiviKortti = {
    href: "/kumpi/paivan",
    kuva: "/20/rivi/kumpi-paivan.webp",
    kuvaton: "Päivän Kumpi?",
    merkki: "Päivän peli",
    nimi: "Päivän Kumpi?",
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
    rivi: ennatys > 0 ? `Ennätyksesi ${ennatys} oikein putkeen` : PUTKI_RIVI,
  };
  return <RiviLinkki k={k} eager={eager} />;
}
