"use client";
// Synttärikortin ikä laskee ylös kerran (Heikki 31.10.2026): esim. 53 → 63, 0,9 s, ease-emphasized.
//   · Luku on ::after-sisältöä, jonka keyframet vaihtavat (content, porrastettu): animaatio alkaa jo ensimmäisestä
//     piirrosta ilman JS:ää eikä luku välähdä. DOM:ssa on oikea ikä visuaalisesti piilotettuna (ruudunlukija, haku).
//     (@property-laskuri ei toiminut WebKitissä: animoitu kokonaisluku ei välity counter-resetiin.)
//   · Alku = ikä − 10, mutta yhtä monta numeroa kuin iässä (leveys ei muutu; tabular-nums).
//   · Jos kortti on latautuessa näkymän alapuolella (mobiili), animaatio odottaa, kunnes kortti tulee näkyviin.
//   · prefers-reduced-motion → valmis luku heti (CSS).
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

export default function IkaLaskuri({ ika }: { ika: number }) {
  const ref = useRef<HTMLElement>(null);
  const [odota, setOdota] = useState(false);
  const alku = Math.max(ika - 10, 10 ** (String(ika).length - 1));

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // näkyvissä → CSS-animaatio on jo käynnissä
    setOdota(true);
    const io = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) return;
      io.disconnect();
      setOdota(false);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Keyframet: luku n näytetään hetkestä, jolloin ease-out (kuutio) saavuttaa sen; 1 − (1 − p)^(1/3). */
  const nimi = `tn-ika-${alku}-${ika}`;
  const askeleet = Array.from({ length: ika - alku + 1 }, (_, i) => {
    const p = ika === alku ? 1 : i / (ika - alku);
    return `${(i === 0 ? 0 : (1 - Math.cbrt(1 - p)) * 100).toFixed(2)}%{content:"${alku + i}"}`;
  }).join("");
  return (
    <b ref={ref} style={{ "--ika-anim": nimi } as CSSProperties} data-odota={odota || undefined}>
      <style>{`@keyframes ${nimi}{${askeleet}}`}</style>
      <span className="tn-es-synt-vh">{ika}</span>
      <span className="tn-es-synt-luku" aria-hidden="true" data-ika={ika} data-alku={alku} />
    </b>
  );
}
