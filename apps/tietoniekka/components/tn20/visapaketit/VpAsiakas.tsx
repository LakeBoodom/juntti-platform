"use client";
// Pakettisivun selainosa: Aikuiset/Lapset-valitsin (molemmat tasot ovat HTML:ssä, valitsin vaihtaa näkyvän
// ja ?taso-parametrin, jotta vetäjä voi jakaa linkin), sekä pilotin mittaus (nayta, vastaus_auki, pelaa).
// Ilman JavaScriptiä valitsimen linkit toimivat sellaisinaan (?taso=lapset renderöidään palvelimella).
import { useEffect } from "react";
import { kirjaaVp } from "@/lib/vpTapahtuma";
import type { Taso } from "@/lib/visapaketit";

export default function VpAsiakas({ packId, mittaa }: { packId: string; mittaa: boolean }) {
  useEffect(() => {
    const juuri = document.querySelector<HTMLElement>("[data-vp]");
    if (!juuri) return;
    if (mittaa) kirjaaVp(packId, "nayta");

    const avatut = new Set<string>();
    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement;
      if (!(d instanceof HTMLDetailsElement) || !d.open || !d.dataset.q || avatut.has(d.dataset.q)) return;
      avatut.add(d.dataset.q);
      if (mittaa) kirjaaVp(packId, "vastaus_auki");
    };
    juuri.addEventListener("toggle", onToggle, true);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (!a) return;
      const taso = a.dataset.vpTaso as Taso | undefined;
      if (taso) {
        e.preventDefault();
        valitse(juuri, taso);
        return;
      }
      if (a.dataset.vpPelaa !== undefined && mittaa) kirjaaVp(packId, "pelaa");
    };
    juuri.addEventListener("click", onClick);
    return () => {
      juuri.removeEventListener("toggle", onToggle, true);
      juuri.removeEventListener("click", onClick);
    };
  }, [packId, mittaa]);
  return null;
}

/** Näytä valitun tason kierrokset, päivitä valitsin, televisio- ja tulostelinkit sekä osoiterivi. */
function valitse(juuri: HTMLElement, taso: Taso) {
  juuri.querySelectorAll<HTMLElement>("[data-vp-kierrokset]").forEach((el) => { el.hidden = el.dataset.vpKierrokset !== taso; });
  juuri.querySelectorAll<HTMLAnchorElement>("a[data-vp-taso]").forEach((a) => {
    if (a.dataset.vpTaso === taso) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
  juuri.querySelectorAll<HTMLAnchorElement>("a[data-vp-tasolinkki]").forEach((a) => {
    const u = new URL(a.href);
    if (taso === "lapset") u.searchParams.set("taso", "lapset");
    else u.searchParams.delete("taso");
    a.href = u.pathname + u.search;
  });
  const u = new URL(location.href);
  if (taso === "lapset") u.searchParams.set("taso", "lapset");
  else u.searchParams.delete("taso");
  history.replaceState(history.state, "", u.pathname + u.search + u.hash);
}
