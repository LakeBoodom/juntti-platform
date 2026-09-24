"use client";

// Yksi Instagram-julkaisu adminissa (Claude Design kierros 4): esikatselu, pohja,
// kortin tekstit (aihe, koukku, palkinto, CTA), visan kysymykset, kuva, kuvateksti,
// fanitasot ja hyväksyntä. Esikatselukuva piirretään /api/ig/kuva-reitillä; kun
// tekstiä muokataan, kuva päivittyy hetken viiveellä ennen tallennusta.

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, Check, Download, ExternalLink, RotateCcw, Send, Sparkles, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Julkaisu } from "@/lib/ig/suunnitelma";
import type { Kentat } from "@/lib/ig/pohjat";
import {
  CTA_EHDOTUKSET,
  KASIN,
  KOMMENTTIPOHJAT,
  OLETUSTEKSTIT,
  POHJAN_KENTAT,
  POHJA_NIMET,
  kysymyksiaPohjalle,
  type Pohja,
} from "@/lib/ig/pohjatiedot";
import {
  asetaTila,
  ehdotaTekstit,
  hyvaksyJulkaisu,
  julkaiseNyt,
  lataaIgKuva,
  luoFanitasotNyt,
  palautaAutomaattinen,
  poistaOma,
  tallennaFanitasot,
  tallennaJulkaisu,
  tarkistaKuvaOsoite,
  vaihdaOmanVisa,
  type KuvanTiedot,
} from "./actions";
import { Kytkin, VisaValitsin } from "./omat";

export type KorttiData = {
  rivi: Julkaisu;
  otsikko: string;
  ala: string;
  pohjat: Pohja[];
  esteet: Record<string, string[]>;
  huomiot: Record<string, string[]>;
  oletusKuvateksti: string;
  /** Päivän visan intron otsikko (tapahtuma kuvatekstiin) */
  oletusTapahtuma: string | null;
  /** Käytössä oleva kuva (visan/henkilön oma tai toimituksen korvaava) */
  kuva: { url: string | null; leveys: number; korkeus: number; fx: number; fy: number; korvattu: boolean };
  /** Visan kysymykset kysymyskorttien valitsimeen; sopii = pohjat, joihin kysymys kelpaa */
  kysymykset: Array<{ id: string; teksti: string; sopii: Pohja[] }>;
  /** Tulosruudun fanitasot (visajulkaisut) */
  fanitasot: { quizId: string; tasot: string[] | null } | null;
  /** Kierroksen 2 julkaistu kortti: esikatselu julkaistusta kuvasta */
  vanha: boolean;
};

export type Mittaus = { klikkaus: number; avaus: number; valmis: number };

const syote = "h-8 w-full rounded-md border border-input bg-background px-2 text-sm";

/** Selain pienentää ison kuvan ennen lähetystä (Vercelin pyyntöraja 4,5 MB). */
async function pienenna(file: File): Promise<Blob> {
  if (file.size <= 3.5 * 1024 * 1024) return file;
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((ok, ei) => c.toBlob((b) => (b ? ok(b) : ei(new Error("pienennys"))), "image/jpeg", 0.9));
}

function koonKuvaus(t: { leveys: number; korkeus: number; kokoPinta: boolean; kaistale: boolean }) {
  return `${t.leveys}×${t.korkeus} px — ${t.kokoPinta ? "riittää koko pinnalle (4a, 5a, 5f)" : t.kaistale ? "riittää kehykseen, ei koko pinnalle" : "liian pieni kuvapohjille"}`;
}

const TILA_TEKSTI: Record<string, { teksti: string; luokka: string }> = {
  luonnos: { teksti: "Luonnos", luokka: "border-yellow-600/30 bg-yellow-600/10 text-yellow-800" },
  hyvaksytty: { teksti: "Hyväksytty", luokka: "border-green-600/30 bg-green-600/10 text-green-800" },
  julkaistaan: { teksti: "Julkaistaan…", luokka: "border-blue-600/30 bg-blue-600/10 text-blue-800" },
  julkaistu: { teksti: "Julkaistu", luokka: "border-blue-600/30 bg-blue-600/10 text-blue-800" },
  epaonnistui: { teksti: "Epäonnistui", luokka: "border-red-600/30 bg-red-600/10 text-red-800" },
  ohitettu: { teksti: "Ohitettu", luokka: "border-muted-foreground/30 bg-muted text-muted-foreground" },
};

const KENTTA_NIMI = { aihe: "Aihe", koukku: "Koukku", palkinto: "Palkinto", syy: "Syyrivi" } as const;

export function JulkaisuKortti({ data, otsikko, yhdistetty, mittaus }: { data: KorttiData; otsikko: string; yhdistetty: boolean; mittaus?: Mittaus }) {
  const r = data.rivi;
  const [pohja, setPohja] = useState<Pohja>(data.pohjat.includes(r.pohja) ? r.pohja : data.pohjat[0]);
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
    pohja !== r.pohja || JSON.stringify(kentat) !== JSON.stringify(r.kentat ?? {}) || kuvateksti !== (r.kuvateksti ?? data.oletusKuvateksti);

  const esikatselu = useMemo(() => {
    if (data.vanha) return r.kuva_urls?.[0] ?? null;
    const p = new URLSearchParams({ id: r.id, pohja });
    p.set("kentat", JSON.stringify(esikKentat));
    return `/api/ig/kuva?${p.toString()}`;
  }, [data.vanha, r.kuva_urls, r.id, pohja, esikKentat]);

  const esteet = data.esteet[pohja] ?? [];
  const huomiot = data.huomiot[pohja] ?? [];
  const tekstiMuuttui = JSON.stringify(kentat) !== JSON.stringify(r.kentat ?? {}) || pohja !== r.pohja;
  const lukittu = r.tila === "julkaistu" || r.tila === "julkaistaan" || data.vanha;
  const oma = r.slotti === "oma";
  const oletus = OLETUSTEKSTIT[pohja];
  const kysymyksia = kysymyksiaPohjalle(pohja);

  // Kuvan vaihto: liitetty osoite tai oma tiedosto, sekä rajauksen kohdistus.
  const [kuvaUrl, setKuvaUrl] = useState("");
  const [kuvaInfo, setKuvaInfo] = useState<string | null>(null);
  const tiedosto = useRef<HTMLInputElement>(null);
  const nykyKuva = kentat.kuva?.url ? kentat.kuva : data.kuva.url ? { url: data.kuva.url, fx: data.kuva.fx, fy: data.kuva.fy } : null;

  function aseta<K extends keyof Kentat>(k: K, v: Kentat[K]) {
    setKentat((e) => ({ ...e, [k]: v }));
  }

  function kaytaKuvaa(t: KuvanTiedot) {
    if (!t.ok) { setKuvaInfo(t.virhe); return; }
    aseta("kuva", { url: t.url, fx: 50, fy: 40 });
    setKuvaInfo(`Uusi kuva: ${koonKuvaus(t)}. Muista tallentaa.`);
    setKuvaUrl("");
  }

  function asetaKysymys(i: number, id: string) {
    const nyk = [...(kentat.kysymykset ?? [])];
    while (nyk.length < kysymyksia) nyk.push("");
    nyk[i] = id;
    aseta("kysymykset", nyk.filter(Boolean));
  }

  function ehdota() {
    setViesti(null);
    start(async () => {
      const t = await ehdotaTekstit(r.id, pohja);
      if (!t.ok) { setViesti({ ok: false, teksti: t.virhe }); return; }
      const kaytossa = POHJAN_KENTAT[pohja];
      setKentat((e) => ({
        ...e,
        ...(kaytossa.includes("aihe") && t.luonnos.aihe ? { aihe: t.luonnos.aihe } : {}),
        ...(kaytossa.includes("koukku") && t.luonnos.koukku ? { koukku: t.luonnos.koukku } : {}),
        ...(kaytossa.includes("palkinto") ? { palkinto: t.luonnos.palkinto || undefined } : {}),
        luonnosPohjalle: pohja,
      }));
      setViesti({ ok: true, teksti: "Tekoälyn ehdotus — tarkista ja tallenna." });
    });
  }

  function tallenna(jalkeen?: () => Promise<{ ok: boolean; virhe?: string }>) {
    setViesti(null);
    start(async () => {
      const t = await tallennaJulkaisu(r.id, { pohja, kentat, kuvateksti: kuvateksti === data.oletusKuvateksti ? null : kuvateksti });
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
  const tunnistuslinkki = `${esikatselu ?? ""}${esikatselu?.includes("?") ? "&lataa=1" : ""}`;

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row">
      {/* Esikatselu */}
      <div className="flex shrink-0 flex-col gap-2">
        {esikatselu ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={esikatselu} alt={otsikko} loading="lazy" className="aspect-[4/5] w-[216px] rounded border bg-muted object-cover" />
        ) : (
          <div className="flex aspect-[4/5] w-[216px] items-center justify-center rounded border bg-muted text-xs text-muted-foreground">Ei esikatselua</div>
        )}
        {esikatselu && (
          <a href={tunnistuslinkki} className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
            <Download className="h-3 w-3" /> Lataa
          </a>
        )}
      </div>

      {/* Ohjaimet */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{otsikko}</div>
            <div className="truncate font-medium" title={data.otsikko}>{data.otsikko}</div>
            <div className="truncate text-xs text-muted-foreground" title={data.ala}>{data.ala}</div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className={`rounded-full border px-2 py-0.5 text-xs ${tila.luokka}`}>{tila.teksti}</span>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {r.tila === "ohitettu" ? "Ei julkaista" : "Julkaistaan"}
              <Kytkin
                nimi="Julkaistaan"
                paalla={r.tila !== "ohitettu"}
                disabled={pending || lukittu}
                onChange={(v) => start(async () => { await asetaTila(r.id, v ? "luonnos" : "ohitettu"); })}
              />
            </label>
          </div>
        </div>

        {data.vanha ? (
          <div className="text-xs text-muted-foreground">Kierroksen 2 pohja ({POHJA_NIMET[r.pohja] ?? r.pohja}) — julkaistu, ei enää muokattavissa.</div>
        ) : (
          <>
            {oma && (
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">Visa</span>
                <VisaValitsin
                  valittu={null}
                  placeholder="Vaihda visa — hae nimellä…"
                  onValitse={(v) =>
                    start(async () => {
                      const t = await vaihdaOmanVisa(r.id, v.id);
                      setViesti(t.ok ? { ok: true, teksti: "Visa vaihdettu." } : { ok: false, teksti: t.virhe });
                    })
                  }
                />
              </div>
            )}

            <label className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">Pohja</span>
              <select value={pohja} disabled={lukittu} onChange={(e) => setPohja(e.target.value as Pohja)} className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm">
                {data.pohjat.map((p) => (
                  <option key={p} value={p}>
                    {p} · {POHJA_NIMET[p]}
                    {KASIN.includes(p) ? " (käsin)" : ""}
                    {(data.esteet[p] ?? []).length ? " — ei käytettävissä" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="text-xs text-muted-foreground">
              {r.pohja_valittu_kasin ? "Muokattu käsin." : "Pohja ja tekstit valittu automaattisesti kierron mukaan."}
              {kentat.luonnosPohjalle && kentat.luonnosPohjalle !== pohja ? " Tekstit on luonnosteltu toiselle pohjalle — pyydä uusi ehdotus." : ""}
            </div>

            {/* Kortin tekstit pohjan mukaan */}
            {POHJAN_KENTAT[pohja].map((k) => (
              <label key={k} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">{KENTTA_NIMI[k]}</span>
                <input
                  value={kentat[k] ?? ""}
                  onChange={(e) => aseta(k, e.target.value)}
                  disabled={lukittu}
                  maxLength={k === "aihe" ? 24 : k === "syy" ? 32 : 90}
                  placeholder={
                    k === "aihe"
                      ? "esim. JOKERIT (valinnainen)"
                      : k === "syy"
                        ? "Valinnainen, esim. Euroviisut 2027 — korvaa automaattisen rivin"
                        : k === "koukku"
                          ? oletus.koukku ?? "Pakollinen — kysymys tai haaste katsojalle"
                          : oletus.palkinto ?? "Valinnainen — pois, jos koukku jo lupaa palkinnon"
                  }
                  className={syote}
                />
              </label>
            ))}
            <label className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">CTA</span>
              <input
                value={kentat.cta ?? ""}
                onChange={(e) => aseta("cta", e.target.value)}
                disabled={lukittu}
                list={`cta-${r.id}`}
                maxLength={32}
                placeholder={oletus.cta}
                className={syote}
              />
              <datalist id={`cta-${r.id}`}>
                {CTA_EHDOTUKSET[pohja].map((c) => <option key={c} value={c} />)}
              </datalist>
            </label>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={kentat.reitti ?? !KOMMENTTIPOHJAT.includes(pohja)}
                  disabled={lukittu}
                  onChange={(e) => aseta("reitti", e.target.checked)}
                />
                Reittiohje "tietoniekka.fi · linkki biossa"
              </label>
              <span>"|" = tavutuskohta, esim. Jokeri|fani</span>
              <Button type="button" size="sm" variant="outline" disabled={pending || lukittu} onClick={ehdota} title="Luonnostele tekstit tekoälyllä tälle pohjalle">
                <Sparkles className="h-3.5 w-3.5" /> Ehdota tekstit
              </Button>
            </div>

            {/* Visan kysymykset kysymyskortteihin */}
            {kysymyksia > 0 && (
              <div className="space-y-1">
                {Array.from({ length: kysymyksia }, (_, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground">Kysymys{kysymyksia > 1 ? ` ${i + 1}` : ""}</span>
                    <select
                      value={kentat.kysymykset?.[i] ?? ""}
                      disabled={lukittu}
                      onChange={(e) => asetaKysymys(i, e.target.value)}
                      className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="">Automaattinen valinta</option>
                      {data.kysymykset.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.sopii.includes(pohja) ? "" : "(ei sovi) "}
                          {q.teksti.length > 90 ? `${q.teksti.slice(0, 88)}…` : q.teksti}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                <div className="text-[11px] text-muted-foreground">Kysymys ja vaihtoehdot näkyvät kortissa sellaisinaan visasta. Vastausta ei näytetä.</div>
              </div>
            )}

            {pohja === "4i" && (
              <input value={kentat.kuvaaja ?? ""} onChange={(e) => aseta("kuvaaja", e.target.value)} placeholder="Kuvaaja ja lisenssi, esim. Matti Meikäläinen / CC BY-SA 4.0 (Wikimedia Commons)" className={syote} />
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
          </>
        )}

        {r.tila === "epaonnistui" && r.virhe && (
          <div className="flex gap-1 rounded border border-red-600/30 bg-red-600/5 p-2 text-xs text-red-800">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> Julkaisu epäonnistui: {r.virhe}
          </div>
        )}

        {!data.vanha && (
          <details className="text-xs" open={!data.kuva.url && ["4a", "4g", "4d", "4e", "4i"].includes(pohja)}>
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Kuva {data.kuva.url ? `· ${data.kuva.leveys}×${data.kuva.korkeus}${data.kuva.korvattu ? " (vaihdettu)" : ""}` : "· ei kuvaa"}
            </summary>
            <div className="mt-1 space-y-2">
              <div className="flex gap-1">
                <input
                  value={kuvaUrl}
                  onChange={(e) => setKuvaUrl(e.target.value)}
                  placeholder="Liitä kuvan osoite tai Wikimedia Commonsin tiedostosivu"
                  disabled={lukittu}
                  className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                />
                <Button type="button" size="sm" variant="outline" disabled={pending || lukittu || !kuvaUrl.trim()} onClick={() => start(async () => kaytaKuvaa(await tarkistaKuvaOsoite(kuvaUrl)))}>
                  Käytä
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={pending || lukittu} onClick={() => tiedosto.current?.click()} title="Lataa oma kuva">
                  <Upload className="h-3.5 w-3.5" />
                </Button>
                <input
                  ref={tiedosto}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    setKuvaInfo("Ladataan…");
                    start(async () => {
                      try {
                        const fd = new FormData();
                        fd.append("file", new File([await pienenna(f)], f.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
                        kaytaKuvaa(await lataaIgKuva(fd));
                      } catch {
                        setKuvaInfo("Kuvan lataus epäonnistui.");
                      }
                    });
                  }}
                />
              </div>
              {nykyKuva && (
                <div className="grid grid-cols-[4rem_1fr] items-center gap-x-2 gap-y-1">
                  <span className="text-muted-foreground">Vaaka</span>
                  <input type="range" min={0} max={100} value={nykyKuva.fx} disabled={lukittu} onChange={(e) => aseta("kuva", { ...nykyKuva, fx: Number(e.target.value) })} />
                  <span className="text-muted-foreground">Pysty</span>
                  <input type="range" min={0} max={100} value={nykyKuva.fy} disabled={lukittu} onChange={(e) => aseta("kuva", { ...nykyKuva, fy: Number(e.target.value) })} />
                </div>
              )}
              {kentat.kuva?.url && (
                <button type="button" disabled={lukittu} onClick={() => { aseta("kuva", undefined); setKuvaInfo(null); }} className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                  Palauta alkuperäinen kuva ja rajaus
                </button>
              )}
              {kuvaInfo && <div className="text-muted-foreground">{kuvaInfo}</div>}
              <div className="text-[11px] text-muted-foreground">
                Kuva tarvitaan pohjiin 4a, 4g, 4d ja 4i (4e toimii ilman). Koko pinnalle väh. 720×900 px. Vain kuvia, joihin on
                käyttöoikeus — Commonsin kuvissa kuvaaja ja lisenssi kuvatekstiin.
              </div>
            </div>
          </details>
        )}

        {!data.vanha && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Kuvateksti ja tapahtuma</summary>
            <div className="mt-1 space-y-1">
              <input
                value={kentat.tapahtuma ?? ""}
                onChange={(e) => aseta("tapahtuma", e.target.value)}
                disabled={lukittu}
                maxLength={120}
                placeholder={data.oletusTapahtuma ?? "Tapahtuma (event_context) — vain kuvatekstiin, esim. Jokerit kohtaa TPS:n tänään"}
                className={syote}
              />
              <textarea value={kuvateksti} onChange={(e) => setKuvateksti(e.target.value)} rows={7} disabled={lukittu} className="w-full rounded-md border border-input bg-background p-2 text-xs" />
              <div className="text-[11px] text-muted-foreground">{kuvateksti.length} / 2200 · kuvateksti muodostuu teksteistä tallennettaessa, jos et muokkaa sitä</div>
            </div>
          </details>
        )}

        {data.fanitasot && <Fanitasot quizId={data.fanitasot.quizId} alku={data.fanitasot.tasot} />}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {!data.vanha && (
            <Button size="sm" variant="outline" disabled={!muokattu || pending || lukittu} onClick={() => tallenna()}>
              Tallenna
            </Button>
          )}
          {!lukittu && (r.tila !== "hyvaksytty" ? (
            <Button size="sm" disabled={pending || (!muokattu && esteet.length > 0)} onClick={() => tallenna(() => hyvaksyJulkaisu(r.id))} title={esteet.length ? "Korjaa esteet ensin" : "Hyväksy julkaistavaksi"}>
              <Check className="h-3.5 w-3.5" /> Hyväksy
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => { await asetaTila(r.id, "luonnos"); })}>
              Peru hyväksyntä
            </Button>
          ))}
          {oma && !lukittu && (
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => { if (confirm("Poistetaanko tämä oma julkaisu?")) start(async () => { await poistaOma(r.id); }); }} title="Poista oma julkaisu">
              <Trash2 className="h-3.5 w-3.5" /> Poista
            </Button>
          )}
          {!oma && !lukittu && r.pohja_valittu_kasin && (
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => { if (confirm("Hylätäänkö muutokset ja annetaan kierron valita pohja ja tekstit uudelleen?")) start(async () => { await palautaAutomaattinen(r.id); }); }} title="Anna kierron valita pohja ja tekstit uudelleen">
              <RotateCcw className="h-3.5 w-3.5" /> Automaattinen
            </Button>
          )}
          {yhdistetty && (r.tila === "hyvaksytty" || r.tila === "epaonnistui") && !muokattu && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => {
                if (!confirm("Julkaistaanko tämä Instagramiin nyt?")) return;
                setViesti({ ok: true, teksti: "Julkaistaan…" });
                start(async () => {
                  const t = await julkaiseNyt(r.id);
                  setViesti(t.ok ? { ok: true, teksti: "Julkaistu Instagramiin." } : { ok: false, teksti: t.virhe });
                });
              }}
              title="Julkaise heti Instagramiin"
            >
              <Send className="h-3.5 w-3.5" /> {r.tila === "epaonnistui" ? "Yritä uudelleen" : "Julkaise nyt"}
            </Button>
          )}
          {r.tila === "julkaistu" && r.ig_tilastot && (
            <span className="text-xs text-muted-foreground" title={r.tilastot_at ? `Instagramin luvut, päivitetty ${new Date(r.tilastot_at).toLocaleString("fi-FI")}` : undefined}>
              Instagram: tavoitti {r.ig_tilastot.reach ?? "–"}
              {r.ig_tilastot.views !== undefined ? ` · näytöt ${r.ig_tilastot.views}` : ""} · tykkäykset {r.ig_tilastot.likes ?? 0} · kommentit{" "}
              {r.ig_tilastot.comments ?? 0} · tallennukset {r.ig_tilastot.saved ?? 0} · jaot {r.ig_tilastot.shares ?? 0}
              {r.ig_tilastot.profile_visits !== undefined ? ` · profiilikäynnit ${r.ig_tilastot.profile_visits}` : ""}
              {r.ig_tilastot.follows !== undefined ? ` · uudet seuraajat ${r.ig_tilastot.follows}` : ""}
            </span>
          )}
          {r.tila === "julkaistu" && (
            <span className="text-xs text-muted-foreground" title="Bio-sivun (tietoniekka.fi/ig) mittaus">
              Bio: {mittaus?.klikkaus ?? 0} klikkausta · {mittaus?.avaus ?? 0} aloitusta · {mittaus?.valmis ?? 0} loppuun
            </span>
          )}
          {r.tila === "julkaistu" && r.ig_permalink && (
            <a href={r.ig_permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline">
              <ExternalLink className="h-3 w-3" /> Avaa Instagramissa
            </a>
          )}
          {viesti && <span className={`text-xs ${viesti.ok ? "text-green-700" : "text-red-700"}`}>{viesti.teksti}</span>}
        </div>
      </div>
    </div>
  );
}

/** Visan fanitasot tulosruutuun (heikoimmasta parhaaseen, rajat 0/40/60/80/100 %). */
function Fanitasot({ quizId, alku }: { quizId: string; alku: string[] | null }) {
  const [tasot, setTasot] = useState<string[]>(alku ?? ["", "", "", "", ""]);
  const [viesti, setViesti] = useState<{ ok: boolean; teksti: string } | null>(null);
  const [pending, start] = useTransition();
  const rajat = ["0 %", "40 %", "60 %", "80 %", "100 %"];
  return (
    <details className="text-xs">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
        Fanitasot tulosruudussa {alku ? `· ${alku[0]} → ${alku[4]}` : "· puuttuu"}
      </summary>
      <div className="mt-1 space-y-1">
        {tasot.map((x, i) => (
          <label key={i} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-muted-foreground">{rajat[i]}</span>
            <input value={x} maxLength={28} onChange={(e) => setTasot((t) => t.map((y, j) => (j === i ? e.target.value : y)))} className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs" />
          </label>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => { const t = await tallennaFanitasot(quizId, tasot); setViesti(t.ok ? { ok: true, teksti: "Tallennettu." } : { ok: false, teksti: t.virhe }); })}>
            Tallenna tasot
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(async () => { const t = await luoFanitasotNyt(quizId); if (t.ok) { setTasot(t.tasot); setViesti({ ok: true, teksti: "Uudet tasot luotu ja tallennettu." }); } else setViesti({ ok: false, teksti: t.virhe }); })}>
            <Sparkles className="h-3.5 w-3.5" /> Luo uudet
          </Button>
          {viesti && <span className={viesti.ok ? "text-green-700" : "text-red-700"}>{viesti.teksti}</span>}
        </div>
        <div className="text-[11px] text-muted-foreground">Näkyy sivuston tulosruudun otsikkona (4a, 4g ja 4n lupaavat tason). Sana enintään 14 merkkiä.</div>
      </div>
    </details>
  );
}
