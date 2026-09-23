"use client";

// Bio-sivun mittaus: sivun avaus kerran latausta kohden ja visan klikkaus.

import Link from "next/link";
import { useEffect, useRef } from "react";
import { kirjaaIg } from "@/lib/igMittaus";

export function IgNaytto() {
  const tehty = useRef(false);
  useEffect(() => {
    if (tehty.current) return;
    tehty.current = true;
    kirjaaIg("bio_naytto");
  }, []);
  return null;
}

export function IgPelaa(p: { href: string; julkaisu: string | null; className?: string; children: React.ReactNode }) {
  return (
    <Link href={p.href} className={p.className} onClick={() => kirjaaIg("klikkaus", p.julkaisu)}>
      {p.children}
    </Link>
  );
}
