"use client";
// Lähtötason mittaus (toteutusbrief 8.11.2026 §3): pilotin ulkopuoliset nykyiset "Pelaa seuraavaksi" -rivit
// (pelimuotojen SeuraavaPeli). Kortit merkitään data-sk-paikka-attribuutilla; lähde = sivun polku.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSeuraavaksiMittaus } from "@/lib/seuraavaksi/mittaus";

export default function SkMittari({ children, avain }: { children: ReactNode; avain: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [lahde, setLahde] = useState<string | null>(null);
  useEffect(() => setLahde(window.location.pathname), []);
  useSeuraavaksiMittaus(ref, lahde ? { pilotti: null, nakyma: "tulos", lahde } : null, `${lahde}|${avain}`);
  return <div ref={ref}>{children}</div>;
}
