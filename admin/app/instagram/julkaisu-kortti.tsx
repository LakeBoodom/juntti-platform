"use client";

// Yksi Instagram-julkaisu adminissa: esikatselu, pohjan vaihto, toimitetut tekstit,
// kuvateksti ja hyväksyntä. Esikatselukuva piirretään /api/ig/kuva-reitillä; kun
// tekstiä muokataan, kuva päivittyy hetken viiveellä ennen tallennusta.

import { useEffect, useMemo, useState, useTransition } from "react";
import { AlertTriangle, Check, Download, RotateCcw, Sparkles, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Julkaisu } from "@/lib/ig/suunnitelma";
import type { Kentat, Pohja, VdVari } from "@/lib/ig/pohjat";
import { asetaTila, ehdotaHaaste, hyvaksyJulkaisu, palautaAutomaattinen, tallennaJulkaisu } from "./actions";

export type KorttiData = {
  rivi: Julkaisu;
  otsikko: string;
  ala: string;
  pohjat: Pohja[];
  esteet: Record<string, string[]>;
  huomiot: Record<string, string[]>;
  oletusKuvateksti: string;
};

const NIMET: Record<Pohja, string> = {
  "V-A": "Tapahtuma edellä",
  "V-B": "Haaste edellä",
  "V-C": "Kuva edellä",
  "V-D": "Typografia edellä",
  "V-E": "Karuselli",
  "S-A": "Henkilökuva edellä",
  "S-B": "Nimi edellä",
  "S-C": "Ikä edellä",
  "S-D": "Visayhteys edellä",
};

const TILA_TEKSTI: Record<string, { teksti: string; luokka: string }> = {
  luonnos: { teksti: "Luonnos", luokka: "border-yellow-600/30 bg-yellow-600/10 text-yellow-800" },
  hyvaksytty: { teksti: "Hyväksytty", luokka: "border-green-600/30 bg-green-600/10 text-green-800" },
  julkaistu: { teksti: "Julkaistu", luokka: "border-blue-600/30 bg-blue-600/10 text-blue-800" },
  epaonnistui: { teksti: "Epäonnistui", luokka: "border-red-600/30 bg-red-600/10 text-red-800" },
  ohitettu: { teksti: "Ohitettu", luokka: "border-muted-foreground/30 bg-muted text-muted-foreground" },
};

export function JulkaisuKortti({ data, otsikko }: { data: KorttiData; otsikko: string }) {
  const r = data.rivi;
  const [pohja, setPohja] = useState<Pohja>(r.pohja);
  const [vari, setVari] = useState<VdVari>(r.pohja_vari ?? "lime");
  const [kentat, setKentat] = useState<Kentat>(r.kentat ?? {});
  const [kuvateksti, setKuvateksti] = useState(r.kuvateksti ?? data.oletusKuvateksti);
  const [viesti, setViesti] = useState<{ ok: boolean; teksti: string } | null>(null);
  const [pending, start] = useTransition();

  // Esikatselun kentät päivittyvät viiveellä, ettei jokainen näppäily piirrä kuvaa.
  const [esikKentat, setEsikKentat] = useState(kentat);
  useEffect(() => {
    const t = setTimeout(() => setEsikKentat(kentat), 700);
    return () => clearTimeout(t);
  }, [kentat]);

  const muokattu =
    pohja !== r.pohja ||
    (pohja === "V-D" && vari !== (r.pohja_vari ?? "lime")) ||
    JSON.stringify(kentat) !== JSON.stringify(r.kentat ?? {}) ||
    kuvateksti !== (r.kuvateksti ?? data.oletusKuvateksti);

  const ruutuja = pohja === "V-E" ? 3 : 1;
  const kuvat = useMemo(() => {
    const p = new URLSearchParams({ paiva: r.paiva, slotti: r.slotti, pohja, vari });
    p.set("kentat", JSON.stringify(esikKentat));
    return Array.from({ length: ruutuja }, (_, i) => {
      const q = new URLSearchParams(p);
      q.set("ruutu", String(i + 1));
      return `/api/ig/kuva?${q.toString()}`;
    });
  }, [r.paiva, r.slotti, pohja, vari, esikKentat, ruutuja]);

  const esteet = data.esteet[pohja] ?? [];
  const huomiot = data.huomiot[pohja] ?? [];
  const tekstiMuuttui = JSON.stringify(kentat) !== JSON.stringify(r.kentat ?? {});
  const lukittu = r.tila === "julkaistu";

  function aseta<K extends keyof Kentat>(k: K, v: Kentat[K]) {
    setKentat((e) => ({ ...e, [k]: v }));
  }

  function tallenna(jalkeen?: () => Promise<{ ok: boolean; virhe?: string }>) {
    setViesti(null);
    start(async () => {
      const t = await tallennaJulkaisu(r.id, {
        pohja,
        pohja_vari: pohja === "V-D" ? vari : null,
        kentat,
        kuvateksti: kuvateksti === data.oletusKuvateksti ? null : kuvateksti,
      });
      if (!t.ok) { setViesti({ ok: false, teksti: t.virhe }); return; }
      if (jalkeen) {
        const j = await jalkeen();
        setViesti(j.ok ? { ok: true, teksti: "Hyväksytty." } : { ok: false, teksti: j.virhe ?? "Virhe" });
      } else {
        setViesti({ ok: true, teksti: "Tallennettu." });
      }
    });
  }

  const tila = TILA_TEKSTI[r.tila] ?? TILA_TEKSTI.luonnos;

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row">
      {/* Esikatselu */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex gap-1">
          {kuvat.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`${otsikko} ${i + 1}/${ruutuja}`}
              loading="lazy"
              className={`${ruutuja > 1 ? "w-[112px]" : "w-[216px]"} aspect-[4/5] rounded border bg-muted object-cover`}
            />
          ))}
        </div>
        <div className="flex gap-1">
          {kuvat.map((src, i) => (
            <a
              key={i}
              href={`${src}&lataa=1`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              <Download className="h-3 w-3" /> Lataa{ruutuja > 1 ? ` ${i + 1}` : ""}
            </a>
          ))}
        </div>
      </div>

      {/* Ohjaimet */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{otsikko}</div>
            <div className="truncate font-medium" title={data.otsikko}>{data.otsikko}</div>
            <div className="truncate text-xs text-muted-foreground" title={data.ala}>{data.ala}</div>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${tila.luokka}`}>{tila.teksti}</span>
        </div>

        <label className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-xs text-muted-foreground">Pohja</span>
          <select
            value={pohja}
            disabled={lukittu}
            onChange={(e) => setPohja(e.target.value as Pohja)}
            className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm"
          >
            {data.pohjat.map((p) => (
              <option key={p} value={p}>
                {p} · {NIMET[p]}
                {(data.esteet[p] ?? []).length ? " — ei käytettävissä" : ""}
              </option>
            ))}
          </select>
          {pohja === "V-D" && (
            <select
              value={vari}
              disabled={lukittu}
              onChange={(e) => setVari(e.target.value as VdVari)}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="lime">lime</option>
              <option value="valkoinen">luonnonvalkoinen</option>
              <option value="mintti">mintti</option>
            </select>
          )}
        </label>
        {r.pohja_valittu_kasin ? (
          <div className="text-xs text-muted-foreground">Pohja valittu käsin.</div>
        ) : (
          <div className="text-xs text-muted-foreground">Pohja valittu automaattisesti kierron mukaan.</div>
        )}

        {/* Toimitetut tekstit pohjan mukaan */}
        {pohja === "V-B" && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <input
                value={kentat.haaste ?? ""}
                onChange={(e) => aseta("haaste", e.target.value)}
                placeholder="Haaste, esim. Montako suomalaista F1-kuljettajaa muistat ulkoa?"
                maxLength={90}
                className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending || lukittu}
                onClick={() =>
                  start(async () => {
                    const t = await ehdotaHaaste(r.id);
                    if (t.ok) aseta("haaste", t.haaste);
                    else setViesti({ ok: false, teksti: t.virhe });
                  })
                }
                title="Ehdota haaste tekoälyllä"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="text-[11px] text-muted-foreground">{(kentat.haaste ?? "").length} / 70 merkkiä · ei faktaväitteitä eikä vastausvihjeitä</div>
          </div>
        )}
        {pohja === "V-E" && (
          <div className="space-y-1">
            <input value={kentat.koukku ?? ""} onChange={(e) => aseta("koukku", e.target.value)} placeholder="Koukku, esim. Kolme suomalaista ennätystä NHL:ssä" className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm" />
            <input value={kentat.koukkuAla ?? ""} onChange={(e) => aseta("koukkuAla", e.target.value)} placeholder="Alarivi, esim. Tunnistatko haltijat? Pyyhkäise." className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm" />
            {[0, 1, 2].map((i) => {
              const s = kentat.sisalto?.[i] ?? { otsikko: "", teksti: "" };
              const aseta2 = (kentta: "otsikko" | "teksti", arvo: string) => {
                const uusi = [...(kentat.sisalto ?? [])];
                while (uusi.length <= i) uusi.push({ otsikko: "", teksti: "" });
                uusi[i] = { ...uusi[i], [kentta]: arvo };
                aseta("sisalto", uusi);
              };
              return (
                <div key={i} className="flex gap-1">
                  <input value={s.otsikko} onChange={(e) => aseta2("otsikko", e.target.value)} placeholder={`Kenttä ${i + 1}: otsikko`} className="h-8 w-2/5 rounded-md border border-input bg-background px-2 text-xs" />
                  <input value={s.teksti} onChange={(e) => aseta2("teksti", e.target.value)} placeholder="teksti" className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs" />
                </div>
              );
            })}
          </div>
        )}
        {pohja === "S-D" && (
          <input value={kentat.kysymys ?? ""} onChange={(e) => aseta("kysymys", e.target.value)} placeholder="Kysymysrivi (oletus: Kuinka hyvin tunnet hänet?)" className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm" />
        )}
        {pohja === "S-A" && (
          <input value={kentat.kuvaaja ?? ""} onChange={(e) => aseta("kuvaaja", e.target.value)} placeholder="Kuvaaja ja lisenssi, esim. Matti Meikäläinen / CC BY-SA 4.0 (Wikimedia Commons)" className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm" />
        )}

        {/* Esteet ja huomiot (palvelimen tarkistus tallennetuilla teksteillä) */}
        {esteet.length > 0 && (
          <ul className="space-y-0.5">
            {esteet.map((e, i) => (
              <li key={i} className="flex gap-1 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {e}
              </li>
            ))}
            {tekstiMuuttui && <li className="text-[11px] text-muted-foreground">Tarkistus päivittyy tallennettaessa.</li>}
          </ul>
        )}
        {huomiot.length > 0 && (
          <ul className="space-y-0.5">
            {huomiot.map((h, i) => (
              <li key={i} className="text-xs text-muted-foreground">{h}</li>
            ))}
          </ul>
        )}

        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Kuvateksti</summary>
          <textarea
            value={kuvateksti}
            onChange={(e) => setKuvateksti(e.target.value)}
            rows={6}
            disabled={lukittu}
            className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs"
          />
          <div className="text-[11px] text-muted-foreground">{kuvateksti.length} / 2200</div>
        </details>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <Button size="sm" variant="outline" disabled={!muokattu || pending || lukittu} onClick={() => tallenna()}>
            Tallenna
          </Button>
          {r.tila !== "hyvaksytty" ? (
            <Button
              size="sm"
              disabled={pending || lukittu || (!muokattu && esteet.length > 0)}
              onClick={() => tallenna(() => hyvaksyJulkaisu(r.id))}
              title={esteet.length ? "Korjaa esteet ensin" : "Hyväksy julkaistavaksi"}
            >
              <Check className="h-3.5 w-3.5" /> Hyväksy
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled={pending || lukittu} onClick={() => start(async () => { await asetaTila(r.id, "luonnos"); })}>
              Peru hyväksyntä
            </Button>
          )}
          {r.tila !== "ohitettu" ? (
            <Button size="sm" variant="ghost" disabled={pending || lukittu} onClick={() => start(async () => { await asetaTila(r.id, "ohitettu"); })} title="Ei julkaista tänä päivänä">
              <SkipForward className="h-3.5 w-3.5" /> Ohita
            </Button>
          ) : (
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(async () => { await asetaTila(r.id, "luonnos"); })}>
              Palauta
            </Button>
          )}
          {r.tila === "luonnos" && r.pohja_valittu_kasin && (
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(async () => { await palautaAutomaattinen(r.id); })} title="Anna kierron valita pohja uudelleen">
              <RotateCcw className="h-3.5 w-3.5" /> Automaattinen
            </Button>
          )}
          {viesti && <span className={`text-xs ${viesti.ok ? "text-green-700" : "text-red-700"}`}>{viesti.teksti}</span>}
        </div>
      </div>
    </div>
  );
}
