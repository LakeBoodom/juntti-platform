"use client";
// Tulosteen Tulosta-nappi: window.print(). Mittaus kerran per sivunlataus, myös selaimen omasta tulostuksesta.
import { useEffect, useRef } from "react";
import { kirjaaVp } from "@/lib/vpTapahtuma";

export default function TulostaNappi({ packId, mittaa }: { packId: string; mittaa: boolean }) {
  const kirjattu = useRef(false);
  useEffect(() => {
    const kirjaa = () => {
      if (kirjattu.current || !mittaa) return;
      kirjattu.current = true;
      kirjaaVp(packId, "tulosta");
    };
    window.addEventListener("beforeprint", kirjaa);
    return () => window.removeEventListener("beforeprint", kirjaa);
  }, [packId, mittaa]);
  return (
    <button type="button" className="tn-cta-lime tn-vp-cta" onClick={() => window.print()}>
      Tulosta
    </button>
  );
}
