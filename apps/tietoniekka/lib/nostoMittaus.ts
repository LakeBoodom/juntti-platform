// PÄIVÄN NOSTOJEN MITTAUS (toteutusohje 19.9.2026, luku 9) — selain.
// Näyttö kirjataan kerran sivulatausta kohden, kun lohko on vähintään
// puoliksi näkyvissä; klikkaus pelilinkistä. Kanta laskee päiväkohtaiset
// summat (kirjaa_nosto → paivan_nosto_tilasto). Ei henkilötietoja, ei evästeitä.
// fetch keepalive: klikkaus ehtii lähteä, vaikka sivu vaihtuu heti.

"use client";

import { useEffect, useRef } from "react";

export type NostoSlotti = "paivan_visa" | "paivan_sankari";

export function kirjaaNosto(args: {
  slotti: NostoSlotti;
  tapahtuma: "naytto" | "klikkaus";
  quizId: string;
  intro?: "A" | "B" | "C" | null;
  kategoria?: string | null;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    void fetch(`${url}/rest/v1/rpc/kirjaa_nosto`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        p_slotti: args.slotti,
        p_tapahtuma: args.tapahtuma,
        p_quiz: args.quizId,
        p_intro: args.intro ?? null,
        p_kategoria: args.kategoria ?? null,
      }),
    }).catch(() => {});
  } catch {
    /* mittaus ei saa koskaan rikkoa sivua */
  }
}

/** Kirjaa näytön kerran, kun elementti on ≥ 50 % näkyvissä. */
export function useNayttoMittaus<T extends Element>(kirjaa: () => void, pois = false) {
  const ref = useRef<T | null>(null);
  const tehty = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (pois || !el || tehty.current || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !tehty.current) {
          tehty.current = true;
          kirjaa();
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pois]);
  return ref;
}
