"use client";
// KORTTIKOKEILUN MITTAUS (henkilösivun visakortti, Heikki 11.11.2026): kumpi versio näytettiin ("kysymys" = visan oikea
// kysymys, "otsikko" = "Kuinka hyvin tunnet …?") ja klikattiinko. Näyttö kerran sivulatausta kohden, kun kortti on
// vähintään puoliksi näkyvissä; klikkaus keepalivella. Taulu kortti_kokeilut (migraatio 20261206_kortti_kokeilut):
// selain kirjoittaa, ei lue. Ei henkilötietoja eikä istuntotunnistetta. Pelikerta näkyy lisäksi quiz_plays.entry-
// kentässä ("henkilosivu:kysymys" / "henkilosivu:otsikko", data-tn-entry). Best-effort: virheet niellään.
import { useEffect, useRef } from "react";

export type KorttiKokeilu = { versio: string; sivu: string };

function laheta(k: KorttiKokeilu, tapahtuma: "naytto" | "klikkaus") {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    void fetch(`${url}/rest/v1/kortti_kokeilut`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" },
      body: JSON.stringify({ kokeilu: "henkilosivu-kysymys", versio: k.versio.slice(0, 40), tapahtuma, sivu: k.sivu.slice(0, 160) }),
    }).catch(() => {});
  } catch {
    /* mittaus ei saa koskaan rikkoa sivua */
  }
}

/** Palauttaa ref:n kortin <a>-elementille; ilman kokeilua ei tee mitään. */
export function useKorttiKokeilu(k: KorttiKokeilu | undefined) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !k) return;
    let nahty = false;
    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver(
        (e) => {
          if (nahty || !e.some((x) => x.isIntersecting && x.intersectionRatio >= 0.5)) return;
          nahty = true;
          io?.disconnect();
          laheta(k, "naytto");
        },
        { threshold: [0.5] },
      );
      io.observe(el);
    } catch {
      /* ei IntersectionObserveria → ei näyttökirjausta */
    }
    const klikkaus = () => laheta(k, "klikkaus");
    el.addEventListener("click", klikkaus);
    return () => {
      io?.disconnect();
      el.removeEventListener("click", klikkaus);
    };
  }, [k?.versio, k?.sivu]); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}
