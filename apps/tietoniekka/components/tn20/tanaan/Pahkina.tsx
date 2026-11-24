"use client";
// TÄNÄÄN — Päivän pähkinä (CD Pahkina.dc.html, Heikin päätökset 24.11.2026). Tumma laatikko lehden lopussa.
// Muoto vuorottelee ja käyttää olemassa olevia pelejä:
//   jarjesta  Järjestän oma rivi (ReorderableChainList: napauta kahta vaihtaaksesi tai raahaa) → Lukitse valintasi
//   kumpi     Kumpi?-pelin kortit (Kortti, KumpiKierros.tsx)
//   peli      olemassa oleva päiväpeli (Mikä maa?): pelataan pelin omalla sivulla, tulos luetaan sen tallenteesta
// "Ohita pähkinä" antaa tuloksen "pähkinä auki"; tulosnäkymästä voi palata ratkaisemaan.
import { useEffect, useState } from "react";
import { ReorderableChainList } from "@/components/tn20/ReorderableChainList";
import { RankingCard, type RankingCardPerson } from "@/components/tn20/RankingCard";
import { VAIHTO_OHJE } from "@/lib/jarjesta/rivi";
import { Kortti } from "@/components/tn20/kumpi/KumpiKierros";
import type { KumpiKysymys } from "@/lib/kumpi/tyypit";
import { lueTallenne, MM_SIVU } from "@/lib/vihjepeli/mikamaa";
import { pahkinanNimi, type Pahkina as PahkinaData, type PahkinanTila } from "@/lib/tanaan/tyypit";
import { TANAAN_PALUU } from "@/lib/tanaan/tallennus";
import "@/components/tn20/kumpi/kumpi.css";


export default function Pahkina({ data, pvm, onValmis }: { data: PahkinaData; pvm: string; onValmis: (t: PahkinanTila) => void }) {
  return (
    <section className="tv-pk" aria-labelledby="tv-pk-h">
      <div className="tv-pk-k">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l10 10-10 10L2 12z" /></svg>
        <h2 id="tv-pk-h" tabIndex={-1}>Päivän pähkinä</h2>
        <span>{pahkinanNimi(data)}</span>
      </div>
      {data.muoto === "jarjesta" ? (
        <Jarjesta data={data} onValmis={onValmis} />
      ) : data.muoto === "kumpi" ? (
        <KumpiPari data={data} onValmis={onValmis} />
      ) : (
        <PeliPahkina pvm={pvm} onValmis={onValmis} />
      )}
    </section>
  );
}

function Ohita({ onValmis }: { onValmis: (t: PahkinanTila) => void }) {
  return <button type="button" className="tv-pk-ohita" onClick={() => onValmis("skip")}>Ohita pähkinä</button>;
}

function Jatka({ ok, onValmis }: { ok: boolean; onValmis: (t: PahkinanTila) => void }) {
  return (
    <button type="button" className="tv-cta" onClick={() => onValmis(ok ? "ok" : "fail")}>
      Katso tulos <Nuoli />
    </button>
  );
}

/* ── Järjestä neljä: sama rivi kuin Järjestä-pelissä ─────────────────────────────────────────── */

type JKohde = RankingCardPerson & { arvo: string; sija: number };

function Jarjesta({ data, onValmis }: { data: Extract<PahkinaData, { muoto: "jarjesta" }>; onValmis: (t: PahkinanTila) => void }) {
  const [rivi, setRivi] = useState<JKohde[]>(() =>
    data.kohteet.map((k, i) => ({ id: String(i), name: k.teksti, role: "", image_url: null, hideThumb: true, arvo: k.arvo, sija: k.sija })),
  );
  const [lukittu, setLukittu] = useState(false);
  const ok = lukittu && rivi.every((k, i) => k.sija === i + 1);
  const oikeat = [...rivi].sort((a, b) => a.sija - b.sija);
  return (
    <>
      <p className="tv-pk-s">{data.saanto}</p>
      {!lukittu && <p className="tv-pk-ohje">{VAIHTO_OHJE}</p>}
      <div className="tv-pk-rivi">
        <span className="jr-merkki"><span aria-hidden="true">↑ </span>{data.ylin}</span>
        {lukittu ? (
          <ol className="tv-pk-tulosrivi" style={{ "--tk-n": 4 } as React.CSSProperties}>
            {rivi.map((k, i) => (
              <li key={k.id}>
                <RankingCard
                  person={k}
                  position={i + 1}
                  state={k.sija === i + 1 ? "correct" : "wrong"}
                  value={k.arvo}
                  note={k.sija === i + 1 ? null : `Kuuluu paikalle ${k.sija}.`}
                  readOnly
                />
              </li>
            ))}
          </ol>
        ) : (
          <div style={{ "--tk-n": 4 } as React.CSSProperties}>
            <ReorderableChainList items={rivi} onReorder={setRivi} />
          </div>
        )}
        <span className="jr-merkki jr-merkki--ala"><span aria-hidden="true">↓ </span>{data.alin}</span>
      </div>
      <div aria-live="polite">
        {lukittu && (
          <p className="tv-pk-res">
            {ok ? "✓ Oikea järjestys" : "✗ Järjestys meni ristiin"}
            {!ok && <small>Oikein: {oikeat.map((k) => k.name).join(" → ")}</small>}
          </p>
        )}
      </div>
      <div className="tv-pk-act">
        {lukittu ? (
          <Jatka ok={ok} onValmis={onValmis} />
        ) : (
          <>
            <button type="button" className="tv-cta" onClick={() => setLukittu(true)}>Lukitse valintasi</button>
            <Ohita onValmis={onValmis} />
          </>
        )}
      </div>
    </>
  );
}

/* ── Kumpi?-pari: Kumpi?-pelin kortit ────────────────────────────────────────────────────────── */

function KumpiPari({ data, onValmis }: { data: Extract<PahkinaData, { muoto: "kumpi" }>; onValmis: (t: PahkinanTila) => void }) {
  const [valinta, setValinta] = useState<0 | 1 | null>(null);
  const auki = valinta !== null;
  const ok = auki && valinta === data.oikea;
  const v = (x: { teksti: string; arvo: string }, i: number) => ({ id: String(i), nimi: x.teksti, lyhyt: x.teksti, kuva: null, arvo: x.arvo });
  const q = { vaihtoehdot: [v(data.a, 0), v(data.b, 1)], oikea: data.oikea, arvoTyyppi: "luku" } as unknown as KumpiKysymys;
  return (
    <>
      <p className="tv-pk-s" id="tv-pk-kysymys">{data.kysymys}</p>
      <div className={`kp-peli ilman tv-pk-kumpi${auki ? " auki" : ""}`}>
        <div className="kp-kortit" role="group" aria-labelledby="tv-pk-kysymys">
          {([0, 1] as const).map((ix) => (
            <Kortti key={ix} q={q} ix={ix} valinta={valinta} auki={auki} onValitse={(i) => { if (!auki) setValinta(i); }} kuvat={false} />
          ))}
        </div>
      </div>
      <div aria-live="polite">
        {auki && (
          <p className="tv-pk-res">
            {ok ? "✓ Oikein" : "✗ Ei tällä kertaa"}
          </p>
        )}
      </div>
      <div className="tv-pk-act">{auki ? <Jatka ok={ok} onValmis={onValmis} /> : <Ohita onValmis={onValmis} />}</div>
    </>
  );
}

/* ── Päiväpeli pähkinänä: Mikä maa? ─────────────────────────────────────────────────────────── */

function PeliPahkina({ pvm, onValmis }: { pvm: string; onValmis: (t: PahkinanTila) => void }) {
  const [tulos, setTulos] = useState<{ ratkesi: boolean; yrityksia: number } | null>(null);
  useEffect(() => {
    const lue = () => {
      const t = lueTallenne(pvm);
      setTulos(t ? { ratkesi: t.ratkesi, yrityksia: t.arvaukset.length } : null);
    };
    lue();
    // Palattaessa pelistä (bfcache tai välilehden vaihto) tulos luetaan uudelleen.
    window.addEventListener("pageshow", lue);
    document.addEventListener("visibilitychange", lue);
    return () => { window.removeEventListener("pageshow", lue); document.removeEventListener("visibilitychange", lue); };
  }, [pvm]);
  return (
    <>
      <p className="tv-pk-s">Tunnista päivän maa vihjeistä.</p>
      <div aria-live="polite">
        {tulos && (
          <p className="tv-pk-res">
            {tulos.ratkesi ? `✓ Oikein ${tulos.yrityksia}. yrityksellä` : "✗ Maa jäi arvoitukseksi"}
          </p>
        )}
      </div>
      <div className="tv-pk-act">
        {tulos ? (
          <Jatka ok={tulos.ratkesi} onValmis={onValmis} />
        ) : (
          <>
            <a
              className="tv-cta"
              href={MM_SIVU}
              onClick={() => { try { sessionStorage.setItem(TANAAN_PALUU, location.pathname + location.search); } catch { /* ei storagea */ } }}
            >
              Pelaa Mikä maa? <Nuoli />
            </a>
            <Ohita onValmis={onValmis} />
          </>
        )}
      </div>
    </>
  );
}

export function Nuoli() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
