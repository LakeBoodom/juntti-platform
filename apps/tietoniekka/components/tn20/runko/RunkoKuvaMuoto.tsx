"use client";
// B-kortin kuvan muoto (Heikki 21.10.2026): leveä B-kortti (desktop ~2,1:1, mobiili 16:9) rajasi pysty- ja
// neliökuvista vain kaistan (Juhlien 4:5-kuvitukset 37 %, Arsenal 44 %, henkilökuvat otsa–nenä). Selain lukee kuvan
// todellisen muodon ja merkitsee pystyt ja neliöt (leveys/korkeus < 1,2) → runko.css näyttää ne kortin oikeassa
// reunassa omassa mitassaan. Grafiikka (data-sovitus="contain") näytetään jo kokonaisena, eikä sitä merkitä.
import { useEffect } from "react";

const RAJA = 1.2;

export default function RunkoKuvaMuoto() {
  useEffect(() => {
    const kuvat = [...document.querySelectorAll<HTMLImageElement>(".rk-b img:not([data-sovitus='contain'])")];
    const merkitse = (i: HTMLImageElement) => {
      if (i.naturalWidth && i.naturalHeight) i.dataset.muoto = i.naturalWidth / i.naturalHeight < RAJA ? "pysty" : "vaaka";
    };
    for (const i of kuvat) {
      if (i.complete) merkitse(i);
      else i.addEventListener("load", () => merkitse(i), { once: true });
    }
  }, []);
  return null;
}
