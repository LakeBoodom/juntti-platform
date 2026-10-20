"use client";
// Luonnon "Valitse pelimuoto" -osion Äänivisa-kortti (Luonto v3.0 + äänivisadesign 2c, brief §4):
// sonogrammiteema, "Kuuntele näyte" soittaa viikon 1. äänen ilman nimeä, ryhmän nimi, "Viikon 41 äänet"
// ja "Tuloksesi 7/10" (laitteen tallenne), PELAA. Kortti on linkki; näytenappi on linkin päällä omana
// painikkeenaan (ei sisäkkäisiä interaktiivisia elementtejä).
import { useEffect, useState } from "react";
import { lueTulos, type AaniRyhma } from "@/lib/aanivisat";
import { useNayte } from "./useNayte";

export type KorttiNayte = {
  ryhma: AaniRyhma;
  otsikko: string;
  kuvaus: string;
  href: string;
  vuosi: number;
  viikko: number;
  audio: string;
  sono: string;
  jakso: number;
  tauko: number;
};

export function NaytePainike({ soi, toggle, teksti = "Kuuntele näyte", luokka = "tnl3-nayte" }: { soi: boolean; toggle: () => void; teksti?: string; luokka?: string }) {
  return (
    <button type="button" className={luokka} onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }} aria-pressed={soi}>
      <span className={`${luokka}-pallo`} aria-hidden="true">
        {soi ? (
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="#0F0D07" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="14" height="14" style={{ marginLeft: 2 }}><path d="M7 4.5v15l12.5-7.5z" fill="#0F0D07" /></svg>
        )}
      </span>
      {soi ? "Pysäytä" : teksti}
    </button>
  );
}

export function SonoPyyhinta({ sono, p, soi }: { sono: string; p: number; soi: boolean }) {
  return (
    <span className="tnl3-sono" data-soi={soi || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="tnl3-sono-pohja" src={sono} alt="" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="tnl3-sono-vari" src={sono} alt="" draggable={false} style={{ clipPath: `inset(0 ${100 - p * 100}% 0 0)` }} />
      {soi && <span className="tnl3-sono-kohta" style={{ left: `${p * 100}%` }} />}
    </span>
  );
}

export default function AaniKortti({ k }: { k: KorttiNayte }) {
  const { soi, p, toggle, soitettu } = useNayte(k.audio, k.jakso, k.tauko);
  const [tulos, setTulos] = useState<string | null>(null);
  useEffect(() => {
    const t = lueTulos(k.ryhma, k.vuosi, k.viikko);
    if (t) setTulos(`Tuloksesi ${t.oikein}/${t.kaikki}`);
  }, [k.ryhma, k.vuosi, k.viikko]);
  const lw = Math.max(...k.otsikko.split(/\s+/).map((w) => w.length), 6);
  return (
    <div className="tnl3-muoto tnl3-muoto--aani" style={{ ["--lw" as string]: lw }}>
      <span className="tnl3-muoto-media tnl3-muoto-media--sono">
        <SonoPyyhinta sono={k.sono} p={soitettu ? p : 1} soi={soi} />
        <span className="tnl3-pilleri tnl3-pilleri--aani">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#0F0D07" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#0F0D07" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          Äänivisa
        </span>
      </span>
      <NaytePainike soi={soi} toggle={toggle} />
      <span className="tnl3-muoto-ala">
        <span className="tnl3-muoto-teksti">
          <a className="tnl3-muoto-otsikko tnl3-venyva" href={k.href}>{k.otsikko}</a>
          <span className="tnl3-muoto-kuvaus">{k.kuvaus}</span>
          <span className="tnl3-aani-meta">
            Viikon {k.viikko} äänet{tulos ? ` · ${tulos}` : ""}
          </span>
        </span>
        <span className="tnl3-pelaa" aria-hidden="true">Pelaa</span>
      </span>
    </div>
  );
}
