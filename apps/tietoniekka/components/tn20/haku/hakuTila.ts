"use client";
// Sivuston haku (Heikki 16.11.2026): yksi hakuikkuna koko sivustolla (HakuDialogi TopBarissa). Avaajat: yläpalkin
// suurennuslasi ja etusivun hakukenttä. Avaus renderöidään synkronisesti (flushSync) ja kenttä fokusoidaan samassa
// kosketuksessa, jotta iPhonen näppäimistö aukeaa heti.
import { flushSync } from "react-dom";
import type { HakuKohde } from "@/lib/hakuMoottori";

/** ankkuri = etusivun kentän sijainti: työpöydällä ikkuna avautuu kentän päälle ja tulokset sen alle (Heikki 16.11.:
 *  "se ei pysy hakulaatikon sisällä"). */
type Tila = { auki: boolean; alku: string; avaaja: HTMLElement | null; ankkuri: DOMRect | null };
let tila: Tila = { auki: false, alku: "", avaaja: null, ankkuri: null };
/* Sulkiessa fokus palaa avaajaan. Jos avaaja on etusivun kenttä, sen onFocus ei saa avata hakua uudelleen
   (korjaus 16.11.: Sulje avasi ikkunan heti uudelleen ja sivu jäi lukkoon). */
let palautetaan = false;
export const palautusKaynnissa = () => palautetaan;
const kuuntelijat = new Set<() => void>();
const ilmoita = () => kuuntelijat.forEach((f) => f());

export const HAKU_KENTTA_ID = "tn-haku-q";

export function tilaa(f: () => void) {
  kuuntelijat.add(f);
  return () => kuuntelijat.delete(f);
}
export const hakuTila = () => tila;

export function avaaHaku(alku = "", ankkuri: DOMRect | null = null) {
  if (tila.auki) return;
  const avaaja = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  tila = { auki: true, alku, avaaja, ankkuri };
  flushSync(ilmoita);
  const k = document.getElementById(HAKU_KENTTA_ID) as HTMLInputElement | null;
  k?.focus();
  k?.setSelectionRange(k.value.length, k.value.length);
  void lataaIndeksi();
}

export function suljeHaku() {
  const avaaja = tila.avaaja;
  tila = { auki: false, alku: "", avaaja: null, ankkuri: null };
  ilmoita();
  palautetaan = true;
  try {
    avaaja?.focus?.({ preventScroll: true });
  } finally {
    palautetaan = false;
  }
}

let lataus: Promise<HakuKohde[]> | null = null;
/** Indeksi ladataan kerran (ensimmäinen avaus tai osoitin avaajan päällä). Virheessä yritetään seuraavalla kerralla uudelleen. */
export function lataaIndeksi(): Promise<HakuKohde[]> {
  if (!lataus) {
    lataus = fetch("/api/haku")
      .then((r) => (r.ok ? (r.json() as Promise<HakuKohde[]>) : Promise.reject(r.status)))
      .catch((e) => {
        lataus = null;
        throw e;
      });
  }
  return lataus;
}
