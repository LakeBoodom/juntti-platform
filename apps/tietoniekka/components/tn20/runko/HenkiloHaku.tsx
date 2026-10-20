"use client";
// Henkilöhaku V3:n yläpuolella (runko vaihe 3, Tunnetut henkilöt; brief §3). Hakee kaikista henkilöistä nimellä
// (myös ilman visaa) ja vie henkilösivulle; vieressä linkki A–Ö-hakemistoon. Ilman JavaScriptiä linkki toimii.
import { useId, useMemo, useState } from "react";
import type { HakuHenkilo } from "@/lib/kokoelmat/henkilot";

const norm = (s: string) => s.toLocaleLowerCase("fi").normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function HenkiloHaku({ henkilot }: { henkilot: HakuHenkilo[] }) {
  const [q, setQ] = useState("");
  const id = useId();
  const osumat = useMemo(() => {
    const n = norm(q.trim());
    if (n.length < 2) return [];
    return henkilot.filter((h) => norm(h.nimi).split(/\s+/).some((o) => o.startsWith(n)) || norm(h.nimi).startsWith(n)).slice(0, 8);
  }, [q, henkilot]);
  return (
    <div className="rk-haku">
      <div className="rk-haku-rivi">
        <label htmlFor={id} className="rk-sr">Hae henkilöä</label>
        <input
          id={id}
          type="search"
          className="rk-haku-kentta"
          placeholder="Hae henkilöä nimellä"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-controls={`${id}-tulokset`}
        />
        <a className="rk-haku-kaikki" href="/henkilot">Kaikki {henkilot.length} henkilöä A–Ö →</a>
      </div>
      <ul id={`${id}-tulokset`} className="rk-haku-tulokset" aria-live="polite">
        {osumat.map((h) => (
          <li key={h.href}><a href={h.href}>{h.nimi}</a></li>
        ))}
        {q.trim().length >= 2 && osumat.length === 0 && <li className="rk-haku-ei">Ei osumia</li>}
      </ul>
    </div>
  );
}
