"use client";
// Pelien lähdeseuranta (lib/seuranta.ts): session alkutiedot ja osioklikkien kuuntelija kerran per sivulataus.
// Jaettujen linkkien avaus ja aloitus (lib/jakoseuranta.ts, v4 vaihe 4).
import { useEffect } from "react";
import { kirjaaSessionAlku, kuunteleOsioklikit } from "@/lib/seuranta";
import { kirjaaAvaus, kuunteleAloitus } from "@/lib/jakoseuranta";

export default function Seuranta() {
  useEffect(() => {
    kirjaaSessionAlku();
    kirjaaAvaus();
    const pois = [kuunteleOsioklikit(), kuunteleAloitus()];
    return () => pois.forEach((f) => f());
  }, []);
  return null;
}
