"use client";
// Pelien lähdeseuranta (lib/seuranta.ts): session alkutiedot ja osioklikkien kuuntelija kerran per sivulataus.
import { useEffect } from "react";
import { kirjaaSessionAlku, kuunteleOsioklikit } from "@/lib/seuranta";

export default function Seuranta() {
  useEffect(() => {
    kirjaaSessionAlku();
    return kuunteleOsioklikit();
  }, []);
  return null;
}
