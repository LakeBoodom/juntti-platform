"use client";
// "PELAA SEURAAVAKSI" -MITTAUS (toteutusbrief 8.11.2026 §3). Näyttö kerran sivulatausta kohden, kun rivi on vähintään
// puoliksi näkyvissä, ja klikkaus. Taulu seuraavaksi_tapahtumat (migraatio 20261204_seuraavaksi_tapahtumat): selain
// kirjoittaa, ei lue. Ei henkilötietoja eikä istuntotunnistetta: vain paikka, pilotti, näkymä, lähde ja ehdotus.
// Sama kirjaus kattaa pilotin ulkopuoliset nykyiset "Pelaa seuraavaksi" -rivit (pilotti = null) lähtötasoksi.
// Kaikki best-effort: fetch keepalive (klikkaus ehtii lähteä sivun vaihtuessa), virheet niellään.

import { useEffect, type RefObject } from "react";

export type SkMeta = {
  pilotti: "urheilu" | null;
  nakyma: "aloitus" | "tulos";
  /** Lähdevisan slug tai pelimuodon slug. */
  lahde: string;
};
export type SkKortti = { paikka: number; tyyppi: "visa" | "peli"; kohde: string; porras?: string | null };

type Rivi = SkMeta & SkKortti & { tapahtuma: "naytto" | "klikkaus" };

function laheta(rivit: Rivi[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !rivit.length) return;
  try {
    void fetch(`${url}/rest/v1/seuraavaksi_tapahtumat`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" },
      body: JSON.stringify(
        rivit.map((r) => ({
          tapahtuma: r.tapahtuma,
          pilotti: r.pilotti,
          nakyma: r.nakyma,
          lahde: r.lahde.slice(0, 160),
          paikka: r.paikka,
          tyyppi: r.tyyppi,
          kohde: r.kohde.slice(0, 200),
          porras: r.porras ? r.porras.slice(0, 60) : null,
        })),
      ),
    }).catch(() => {});
  } catch {
    /* mittaus ei saa koskaan rikkoa sivua */
  }
}

/** Rivin mittaus: kortit ovat rivin <a data-sk-paikka …> -linkkejä; näyttö kun rivi ≥ 50 % näkyvissä (kerran). */
export function useSeuraavaksiMittaus(ref: RefObject<HTMLElement | null>, meta: SkMeta | null, avain: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !meta) return;
    const kortit = (): Array<SkKortti & { a: HTMLAnchorElement }> =>
      Array.from(el.querySelectorAll<HTMLAnchorElement>("a[data-sk-paikka]")).map((a) => ({
        a,
        paikka: Number(a.dataset.skPaikka) || 0,
        tyyppi: a.dataset.skTyyppi === "peli" ? "peli" : "visa",
        kohde: a.getAttribute("href") ?? "",
        porras: a.dataset.skPorras ?? null,
      }));
    let nahty = false;
    let io: IntersectionObserver | null = null;
    try {
      io = new IntersectionObserver(
        (e) => {
          if (nahty || !e.some((x) => x.isIntersecting && x.intersectionRatio >= 0.5)) return;
          nahty = true;
          io?.disconnect();
          laheta(kortit().map(({ a: _a, ...k }) => ({ ...meta, ...k, tapahtuma: "naytto" })));
        },
        { threshold: [0.5] },
      );
      io.observe(el);
    } catch {
      /* ei IntersectionObserveria → ei näyttökirjausta */
    }
    const klikkaus = (ev: MouseEvent) => {
      const a = (ev.target as Element | null)?.closest?.("a[data-sk-paikka]") as HTMLAnchorElement | null;
      if (!a || !el.contains(a)) return;
      const k = kortit().find((x) => x.a === a);
      if (k) laheta([{ ...meta, paikka: k.paikka, tyyppi: k.tyyppi, kohde: k.kohde, porras: k.porras, tapahtuma: "klikkaus" }]);
    };
    el.addEventListener("click", klikkaus);
    return () => {
      io?.disconnect();
      el.removeEventListener("click", klikkaus);
    };
    // avain: valitut kortit (vaihtuvat pelatun mukaan) — mittaus kiinnittyy uudelleen, kun rivi vaihtuu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, meta?.pilotti, meta?.nakyma, meta?.lahde, avain]);
}
