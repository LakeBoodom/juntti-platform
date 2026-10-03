"use client";
// Henkilöhakemisto (erä B3, design 3d/3e): välilehdet A–Ö · Ryhmät · Synttärit ja nimihaku.
// Kaikki kolme paneelia ovat palvelimen HTML:ssä (piilotetut `hidden`-attribuutilla), joten
// hakukone näkee jokaisen henkilön, ryhmän ja kuukauden linkin ilman JavaScriptiä.
import { useEffect, useMemo, useState } from "react";
import HenkiloRivi from "@/components/tn20/hub/HenkiloRivi";

export type AzRivi = { href: string; name: string; meta: string; image_url: string | null; kirjain: string; haku: string };
export type RyhmaKortti = { nimi: string; href: string; n: number; lajit: Array<{ nimi: string; href: string; n: number }> };
export type KuukausiKortti = { nimi: string; href: string; n: number };

type Tab = "az" | "ryhmat" | "synttarit";
const TABS: Array<{ k: Tab; nimi: string }> = [
  { k: "az", nimi: "A–Ö" },
  { k: "ryhmat", nimi: "Ryhmät" },
  { k: "synttarit", nimi: "Synttärit" },
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function Hakemisto({
  rivit,
  ryhmat,
  kuukaudet,
  tanaan,
}: {
  rivit: AzRivi[];
  ryhmat: RyhmaKortti[];
  kuukaudet: KuukausiKortti[];
  tanaan: { otsikko: string; rivit: AzRivi[] };
}) {
  const [tab, setTab] = useState<Tab>("az");
  const [haku, setHaku] = useState("");

  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (h === "ryhmat" || h === "synttarit") setTab(h);
  }, []);

  const valitse = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", t === "az" ? window.location.pathname : `#${t}`);
  };

  const q = norm(haku.trim());
  const naytettavat = useMemo(() => (q ? rivit.filter((r) => r.haku.includes(q)) : rivit), [q, rivit]);
  const kirjaimet = useMemo(() => {
    const m = new Map<string, AzRivi[]>();
    for (const r of naytettavat) m.set(r.kirjain, [...(m.get(r.kirjain) ?? []), r]);
    return [...m.entries()];
  }, [naytettavat]);

  return (
    <div className="hk">
      <label className="hk-haku">
        <span className="sr-only">Hae nimellä</span>
        <input
          type="search"
          placeholder="Hae nimellä…"
          value={haku}
          onChange={(e) => {
            setHaku(e.target.value);
            if (tab !== "az") setTab("az");
          }}
        />
      </label>
      <div className="hk-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.k} type="button" role="tab" aria-selected={tab === t.k} className={tab === t.k ? "on" : ""} onClick={() => valitse(t.k)}>
            {t.nimi}
          </button>
        ))}
      </div>

      <section hidden={tab !== "az"} aria-label="Henkilöt A–Ö" className="hk-az">
        <div className="hk-az-lista">
          {kirjaimet.map(([k, rr]) => (
            <div key={k} id={`k-${k}`} className="hk-kirjain">
              <h2 className="hk-kirjain-otsikko">{k}</h2>
              {rr.map((r) => (
                <HenkiloRivi key={r.href} r={r} />
              ))}
            </div>
          ))}
          {!naytettavat.length && <p className="hk-tyhja">Ei osumia haulla ”{haku}”.</p>}
        </div>
        {!q && (
          <nav className="hk-indeksi" aria-label="Kirjaimet">
            {kirjaimet.map(([k]) => (
              <a key={k} href={`#k-${k}`}>
                {k}
              </a>
            ))}
          </nav>
        )}
      </section>

      <section hidden={tab !== "ryhmat"} aria-label="Ryhmät" className="hk-ryhmat">
        {ryhmat.map((g) => (
          <div key={g.href} className="hk-ryhma">
            <a className="hk-ryhma-head" href={g.href}>
              <span className="hk-ryhma-nimi">{g.nimi}</span>
              <span className="hk-ryhma-n">
                {g.n} <span aria-hidden="true">›</span>
              </span>
            </a>
            {g.lajit.length > 1 && (
              <div className="hk-chipit">
                {g.lajit.map((l) => (
                  <a key={l.href} className="hk-chip" href={l.href}>
                    {l.nimi} <span>{l.n}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      <section hidden={tab !== "synttarit"} aria-label="Synttärit" className="hk-synttarit">
        {tanaan.rivit.length > 0 && (
          <div className="hk-tanaan">
            <h2 className="hub-h3">{tanaan.otsikko}</h2>
            {tanaan.rivit.map((r) => (
              <HenkiloRivi key={r.href} r={r} />
            ))}
          </div>
        )}
        <div className="hk-kuukaudet">
          {kuukaudet.map((m) => (
            <a key={m.href} className="hk-kuukausi" href={m.href}>
              <span>{m.nimi}</span>
              <span className="hk-ryhma-n">
                {m.n} <span aria-hidden="true">›</span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
