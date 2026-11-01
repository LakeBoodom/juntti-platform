"use client";
// Pakettisivun selainosa: pilotin mittaus (nayta, vastaus_auki, pelaa). Aikuiset/Lapset-valitsin on 1.11.2026 alkaen
// tavallinen linkkipari (lastenversio omassa osoitteessa /visapaketti/<slug>/lapset), joten selainlogiikkaa ei tarvita.
import { useEffect } from "react";
import { kirjaaVp } from "@/lib/vpTapahtuma";

export default function VpAsiakas({ packId, mittaa }: { packId: string; mittaa: boolean }) {
  useEffect(() => {
    const juuri = document.querySelector<HTMLElement>("[data-vp]");
    if (!juuri || !mittaa) return;
    kirjaaVp(packId, "nayta");

    const avatut = new Set<string>();
    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement;
      if (!(d instanceof HTMLDetailsElement) || !d.open || !d.dataset.q || avatut.has(d.dataset.q)) return;
      avatut.add(d.dataset.q);
      kirjaaVp(packId, "vastaus_auki");
    };
    juuri.addEventListener("toggle", onToggle, true);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (a?.dataset.vpPelaa !== undefined) kirjaaVp(packId, "pelaa");
    };
    juuri.addEventListener("click", onClick);
    return () => {
      juuri.removeEventListener("toggle", onToggle, true);
      juuri.removeEventListener("click", onClick);
    };
  }, [packId, mittaa]);
  return null;
}
