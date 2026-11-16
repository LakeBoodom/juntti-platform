"use client";
// V1:n ainoa lime-pilleri ja sen selite (Heikki 19.10.2026). Palvelin renderöi suosituimman (ensikävijä); selain
// vaihtaa palaavalle pelaajalle seuraavaan pelaamattomaan. Pelaajan tieto tulee anonyymista pelihistoriasta
// (localStorage tn_played_quizzes, sama kuin pelinäkymä), ei metapelistä — näkyy myös ilman METAPELI_ENABLED-lippua.
//
// B3b (UI-mikrotekstit 27.10., toteutettu 15.11.2026): napissa kiinteä "Aloita visa →" (sama kuin visan aloitussivulla),
// ei visan nimeä. Napin vieressä (mobiilissa alla) kaksi riviä: selite ja visan koko näyttönimi lihavoituna.
// Koko alue on yksi linkki samaan visaan. Selite ei kerro päivitysrytmiä (hub-linja 13.11.2026).
//   ensikävijä          → "Kokeile tätä" + päivän nosto (14.11.2026)
//   palaava (pelannut)  → "Seuraavaksi tämä" + seuraava pelaamaton (sivun järjestyksessä)
//   cta: "arvo"         → "Kokeile tätä" + satunnainen pelaamaton
//   asetuksen ctaSelite → ensikävijän selite (Juhlat: "Lähin juhla: …" + lähimmän juhlan visa)
import { useEffect, useState } from "react";

type Visa = { id: string; nimi: string; href: string };

const SELITE = { seuraava: "Seuraavaksi tämä", arvo: "Kokeile tätä" } as const;

export default function RunkoHeroCta({ suosituin, jarjestys, tila, selite: oletusSelite }: { suosituin: Visa; jarjestys: Visa[]; tila: "suosituin" | "seuraava" | "arvo"; selite?: string }) {
  const [kohde, setKohde] = useState(suosituin);
  const [selite, setSelite] = useState<string>(tila === "arvo" ? SELITE.arvo : oletusSelite ?? SELITE.arvo);
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
      /* 14.11.2026: seuraava pelaamaton päivän nostosta eteenpäin (ei aina sivun ensimmäisestä), muuten palaava
         pelaaja näkisi aina saman alun visan. Jos päivän nosto on pelaamatta, se pysyy. */
      const i0 = Math.max(0, jarjestys.findIndex((v) => v.id === suosituin.id));
      const kierto = [...jarjestys.slice(i0), ...jarjestys.slice(0, i0)].filter((v) => !ps.has(v.id));
      setKohde(kierto[0] ?? pelaamattomat[0]);
      setSelite(SELITE.seuraava);
    }
  }, [jarjestys, suosituin, tila]);
  return (
    <a className="rk-cta-ryhma" href={kohde.href}>
      <span className="rk-cta tn-cta-lime">Aloita visa <span aria-hidden="true">→</span></span>
      <span className="rk-cta-kohde">
        <span className="rk-cta-selite">{selite}</span>
        <b className="rk-cta-nimi">{kohde.nimi}</b>
      </span>
    </a>
  );
}
