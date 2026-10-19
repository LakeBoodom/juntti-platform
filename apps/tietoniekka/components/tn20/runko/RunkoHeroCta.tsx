"use client";
// V1:n ainoa lime-pilleri "Pelaa: <visan nimi>" (runko §3). Palvelin renderöi suosituimman (ensikävijä);
// selain vaihtaa palaavalle kävijälle seuraavaan pelaamattomaan (tn_played_quizzes, sama kuin pelinäkymä).
import { useEffect, useState } from "react";

type Visa = { id: string; nimi: string; href: string };

export default function RunkoHeroCta({ suosituin, jarjestys, tila }: { suosituin: Visa; jarjestys: Visa[]; tila: "suosituin" | "seuraava" | "arvo" }) {
  const [kohde, setKohde] = useState(suosituin);
  useEffect(() => {
    let pelatut: string[] = [];
    try {
      pelatut = JSON.parse(window.localStorage.getItem("tn_played_quizzes") ?? "[]") as string[];
    } catch {}
    const ps = new Set(pelatut);
    const pelaamattomat = jarjestys.filter((v) => !ps.has(v.id));
    if (!pelaamattomat.length) return;
    const palaava = jarjestys.some((v) => ps.has(v.id));
    if (tila === "arvo") setKohde(pelaamattomat[Math.floor(Math.random() * pelaamattomat.length)]);
    /* Oletus: ensikävijälle suosituin, palaavalle seuraava pelaamaton (sivun järjestyksessä). */
    else if (tila === "seuraava" || palaava) setKohde(pelaamattomat[0]);
  }, [jarjestys, suosituin, tila]);
  return (
    <a className="rk-cta tn-cta-lime" href={kohde.href}>
      Pelaa: {kohde.nimi}
    </a>
  );
}
