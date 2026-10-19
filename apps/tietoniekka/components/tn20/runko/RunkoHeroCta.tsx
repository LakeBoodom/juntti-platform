"use client";
// V1:n ainoa lime-pilleri "Pelaa: <visan nimi>" (runko §3) ja sen selite (Heikki 19.10.2026).
// Palvelin renderöi suosituimman (ensikävijä); selain vaihtaa palaavalle pelaajalle seuraavaan
// pelaamattomaan. Pelaajan tieto tulee anonyymista pelihistoriasta (localStorage tn_played_quizzes,
// sama kuin pelinäkymä), ei metapelistä — näkyy myös ilman METAPELI_ENABLED-lippua.
//   ensikävijä          → "Suosituin tässä kokoelmassa" + suosituin visa
//   palaava (pelannut)  → "Seuraavaksi sinulle" + seuraava pelaamaton (sivun järjestyksessä)
//   cta: "arvo"         → "Arvottu visa" + satunnainen pelaamaton
import { useEffect, useState } from "react";

type Visa = { id: string; nimi: string; href: string };

const SELITE = { suosituin: "Suosituin tässä kokoelmassa", seuraava: "Seuraavaksi sinulle", arvo: "Arvottu visa" } as const;

export default function RunkoHeroCta({ suosituin, jarjestys, tila }: { suosituin: Visa; jarjestys: Visa[]; tila: "suosituin" | "seuraava" | "arvo" }) {
  const [kohde, setKohde] = useState(suosituin);
  const [selite, setSelite] = useState<string>(tila === "arvo" ? SELITE.arvo : SELITE.suosituin);
  useEffect(() => {
    let pelatut: string[] = [];
    try {
      pelatut = JSON.parse(window.localStorage.getItem("tn_played_quizzes") ?? "[]") as string[];
    } catch {}
    const ps = new Set(pelatut);
    const pelaamattomat = jarjestys.filter((v) => !ps.has(v.id));
    if (!pelaamattomat.length) return;
    if (tila === "arvo") {
      setKohde(pelaamattomat[Math.floor(Math.random() * pelaamattomat.length)]);
      return;
    }
    if (jarjestys.some((v) => ps.has(v.id))) {
      setKohde(pelaamattomat[0]);
      setSelite(SELITE.seuraava);
    }
  }, [jarjestys, suosituin, tila]);
  return (
    <div className="rk-cta-ryhma">
      <span className="rk-cta-selite">{selite}</span>
      <a className="rk-cta tn-cta-lime" href={kohde.href}>
        Pelaa: {kohde.nimi}
      </a>
    </div>
  );
}
