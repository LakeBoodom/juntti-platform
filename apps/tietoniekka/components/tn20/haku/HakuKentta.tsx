"use client";
// Etusivun näkyvä hakukenttä (Heikki 16.11.2026): näyttää kentältä, mutta avaa saman hakuikkunan kuin yläpalkin
// suurennuslasi (yksi hakunäkymä). Ilman JavaScriptiä lomake vie /haku-sivulle.
import "./haku.css";
import { useRef } from "react";
import { HAKU_PLACEHOLDER, HakuIkoni } from "./HakuDialogi";
import { avaaHaku, lataaIndeksi, palautusKaynnissa } from "./hakuTila";

export default function HakuKentta() {
  const ref = useRef<HTMLInputElement>(null);
  const avaa = () => {
    if (palautusKaynnissa() || !ref.current) return;
    const alku = ref.current.value;
    ref.current.value = "";
    avaaHaku(alku, ref.current.getBoundingClientRect());
  };
  return (
    <form className="tn-haku-etusivu" role="search" action="/haku" method="get" data-tn-entry="etusivu:haku">
      <label htmlFor="tn-haku-etusivu-q" className="tn-haku-sr">Haku</label>
      <span className="tn-haku-kentta">
        <HakuIkoni />
        <input
          ref={ref}
          id="tn-haku-etusivu-q"
          name="q"
          type="search"
          autoComplete="off"
          placeholder={HAKU_PLACEHOLDER}
          onFocus={avaa}
          onClick={avaa}
          onInput={avaa}
          onPointerEnter={() => void lataaIndeksi().catch(() => {})}
        />
      </span>
    </form>
  );
}
