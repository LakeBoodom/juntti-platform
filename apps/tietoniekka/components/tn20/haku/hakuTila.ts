"use client";
// Sivuston haku (Heikki 16.11.2026): yksi hakuikkuna koko sivustolla (HakuDialogi TopBarissa). Avaajat: yläpalkin
// suurennuslasi ja etusivun hakukenttä. Avaus renderöidään synkronisesti (flushSync) ja kenttä fokusoidaan samassa
// kosketuksessa, jotta iPhonen näppäimistö aukeaa heti.
import { flushSync } from "react-dom";
import type { HakuKohde } from "@/lib/hakuMoottori";

type Tila = { auki: boolean; alku: string; avaaja: HTMLElement | null };
let tila: Tila = { auki: false, alku: "", avaaja: null };
const kuuntelijat = new Set<() => void>();
const ilmoita = () => kuuntelijat.forEach((f) => f());

export const HAKU_KENTTA_ID = "tn-haku-q";

export function tilaa(f: () => void) {
  kuuntelijat.add(f);
  return () => kuuntelijat.delete(f);
}
export const hakuTila = () => tila;

export function avaaHaku(alku = "") {
  const avaaja = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  tila = { auki: true, alku, avaaja };
  flushSync(ilmoita);
  const k = document.getElementById(HAKU_KENTTA_ID) as HTMLInputElement | null;
  k?.focus();
  k?.setSelectionRange(k.value.length, k.value.length);
  void lataaIndeksi();
}

export function suljeHaku() {
  const avaaja = tila.avaaja;
  tila = { auki: false, alku: "", avaaja: null };
  ilmoita();
  avaaja?.focus?.();
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
