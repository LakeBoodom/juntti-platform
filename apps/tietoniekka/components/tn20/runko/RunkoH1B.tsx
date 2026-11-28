"use client";
// H1-vaihtoehto B esikatselussa (Euroviisut, CC-brief 28.11.2026): ?h1=b vaihtaa heron otsikon B-versioon, jotta Heikki
// voi verrata versioita samalla sivulla. Sivu on ISR eikä lue searchParamsia, joten vaihto tehdään selaimessa.
// Renderöidään vain esikatselussa (KokoelmaRunko), tuotannossa ei koskaan.
import { useEffect } from "react";

export default function RunkoH1B({ title, highlight, lw }: { title: string; highlight?: string; lw: number }) {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("h1") !== "b") return;
    const h = document.getElementById("rk-h1");
    if (!h) return;
    h.textContent = title;
    if (highlight) {
      const s = document.createElement("span");
      s.textContent = highlight;
      h.append(s);
    }
    h.style.setProperty("--lw", String(lw));
    h.toggleAttribute("data-lyhyt", `${title}${highlight ?? ""}`.trim().length <= 12);
  }, [title, highlight, lw]);
  return null;
}
