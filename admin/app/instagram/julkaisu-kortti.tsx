"use client";

// Yksi Instagram-julkaisu adminissa: esikatselu, pohjan vaihto, toimitetut tekstit,
// kuvateksti ja hyväksyntä. Esikatselukuva piirretään /api/ig/kuva-reitillä; kun
// tekstiä muokataan, kuva päivittyy hetken viiveellä ennen tallennusta.

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AlertTriangle, Check, Download, ExternalLink, RotateCcw, Send, Sparkles, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Julkaisu } from "@/lib/ig/suunnitelma";
import type { Kentat, Pohja, VdVari } from "@/lib/ig/pohjat";
import {
  asetaTila,
  ehdotaHaaste,
  hyvaksyJulkaisu,
  julkaiseNyt,
  lataaIgKuva,
  palautaAutomaattinen,
  poistaOma,
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
  /** Päivän visan intron otsikko (Tapahtuma-kentän oletus) */
  oletusTapahtuma: string | null;
  /** Käytössä oleva kuva (visan/henkilön oma tai toimituksen korvaava) */
  kuva: { url: string | null; leveys: number; korkeus: number; fx: number; fy: number; korvattu: boolean };
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
  return `${t.leveys}×${t.korkeus} px — ${t.kokoPinta ? "riittää koko pinnalle (V-C, S-A)" : t.kaistale ? "riittää kaistaleeksi, ei koko pinnalle" : "liian pieni kuvapohjille"}`;
}

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
  julkaistaan: { teksti: "Julkaistaan…", luokka: "border-blue-600/30 bg-blue-600/10 text-blue-800" },
  julkaistu: { teksti: "Julkaistu", luokka: "border-blue-600/30 bg-blue-600/10 text-blue-800" },
  epaonnistui: { teksti: "Epäonnistui", luokka: "border-red-600/30 bg-red-600/10 text-red-800" },
  ohitettu: { teksti: "Ohitettu", luokka: "border-muted-foreground/30 bg-muted text-muted-foreground" },
};

export function JulkaisuKortti({ data, otsikko, yhdistetty, mittaus }: { data: KorttiData; otsikko: string; yhdistetty: boolean; mittaus?: Mittaus }) {
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
    const p = new URLSearchParams({ id: r.id, pohja, vari });
    p.set("kentat", JSON.stringify(esikKentat));
    return Array.from({ length: ruutuja }, (_, i) => {
      const q = new URLSearchParams(p);
      q.set("ruutu", String(i + 1));
      return `/api/ig/kuva?${q.toString()}`;
    });
  }, [r.id, pohja, vari, esikKentat, ruutuja]);

  const esteet = data.esteet[pohja] ?? [];
  const huomiot = data.huomiot[pohja] ?? [];
  const tekstiMuuttui = JSON.stringify(kentat) !== JSON.stringify(r.kentat ?? {});
  const lukittu = r.tila === "julkaistu" || r.tila === "julkaistaan";
  const visajulkaisu = r.slotti !== "synttarit";
  const oma = r.slotti === "oma";

  // Kuvan vaihto: liitetty osoite tai oma tiedosto, sekä rajauksen kohdistus.
  const [kuvaUrl, setKuvaUrl] = useState("");
  const [kuvaInfo, setKuvaInfo] = useState<string | null>(null);
  const tiedosto = useRef<HTMLInputElement>(null);
  const nykyKuva = kentat.kuva?.url ? kentat.kuva : data.kuva.url ? { url: data.kuva.url, fx: data.kuva.fx, fy: data.kuva.fy } : null;

  function kaytaKuvaa(t: KuvanTiedot) {
    if (!t.ok) { setKuvaInfo(t.virhe); return; }
    aseta("kuva", { url: t.url, fx: 50, fy: 40 });
    setKuvaInfo(`Uusi kuva: ${koonKuvaus(t)}. Muista tallentaa.`);
    setKuvaUrl("");
  }

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

        {oma && (
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted-foreground">Visa</span>
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
        {oma && (
          <label className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted-foreground">Otsake</span>
            <input value={kentat.otsake ?? ""} onChange={(e) => aseta("otsake", e.target.value)} maxLength={28} placeholder="VISA" className={syote} />
          </label>
        )}

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

        {visajulkaisu && pohja !== "V-E" && (
          <label className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted-foreground">Tapahtuma</span>
            <input
              value={kentat.tapahtuma ?? ""}
              onChange={(e) => aseta("tapahtuma", e.target.value)}
              maxLength={80}
              placeholder={data.oletusTapahtuma ?? (pohja === "V-A" ? "V-A vaatii tapahtuman, esim. Revontulet näkyvät tänään" : "Valinnainen alarivi")}
              className={syote}
            />
          </label>
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

        {r.tila === "epaonnistui" && r.virhe && (
          <div className="flex gap-1 rounded border border-red-600/30 bg-red-600/5 p-2 text-xs text-red-800">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> Julkaisu epäonnistui: {r.virhe}
          </div>
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

        <details className="text-xs" open={!data.kuva.url || (data.kuva.leveys > 0 && data.kuva.leveys < 720)}>
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Kuva{" "}
            {data.kuva.url
              ? `· ${data.kuva.leveys}×${data.kuva.korkeus}${data.kuva.korvattu ? " (vaihdettu)" : ""}`
              : "· ei kuvaa"}
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
              Koko pinnan kuva (V-C, S-A) vaatii vähintään 720×900 px, kaistale (V-A, V-B) 720 px leveyttä. Vain kuvia,
              joihin on käyttöoikeus — Commonsin kuvissa kuvaaja ja lisenssi kuvatekstiin.
            </div>
          </div>
        </details>

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
          {oma && !lukittu && (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => { if (confirm("Poistetaanko tämä oma julkaisu?")) start(async () => { await poistaOma(r.id); }); }}
              title="Poista oma julkaisu"
            >
              <Trash2 className="h-3.5 w-3.5" /> Poista
            </Button>
          )}
          {!oma && r.tila === "luonnos" && r.pohja_valittu_kasin && (
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(async () => { await palautaAutomaattinen(r.id); })} title="Anna kierron valita pohja uudelleen">
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
