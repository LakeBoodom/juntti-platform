"use client";
// KUVAVISOJEN HERON NAPPI (Heikki 13.11.2026): "Pelaa viikkovisa" → kuluvan viikon viikkovisa; jos pelaaja on jo pelannut
// sen (localStorage, lib/viikkovisa.ts lueViikkoTulos), "Katso tuloksesi" → tarkastelunäkymä. Palvelin renderöi
// pelaamattoman tilan, tulos luetaan selaimessa (sama malli kuin entisessä ViikkovisaPromossa).
import { useEffect, useState } from "react";
import { lueViikkoTulos } from "@/lib/viikkovisa";

export default function ViikkovisaCta({ avain }: { avain: string }) {
  const [pelattu, setPelattu] = useState(false);
  useEffect(() => { setPelattu(!!lueViikkoTulos(avain)); }, [avain]);
  return (
    <a className="hub-cta tn-cta-lime" href={pelattu ? "/kuvavisa/viikko?tarkastele=1" : "/kuvavisa/viikko"} data-tn-entry="kuvavisat:hero">
      {pelattu ? "Katso tuloksesi" : "Pelaa viikkovisa"} <span aria-hidden="true">→</span>
    </a>
  );
}
