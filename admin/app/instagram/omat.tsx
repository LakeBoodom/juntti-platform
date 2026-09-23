"use client";

// Instagram-sivun ohjaimet: päivittäisten sarjojen päälle/pois-kytkimet, uusi oma
// julkaisu tai kampanja, sekä visahaku (käytetään myös omien julkaisujen korteissa).

import { useEffect, useState, useTransition } from "react";
import { ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tallennaAsetukset, haeVisoja, luoKampanjaToiminto, luoOma, paivitaLuvut, type VisaHaku } from "./actions";

const kentta = "h-8 rounded-md border border-input bg-background px-2 text-sm";

function huomennaHelsinki(): string {
  const t = new Date(Date.now() + 24 * 3600 * 1000);
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Helsinki" }).format(t);
}

/** Kytkin (role=switch). */
export function Kytkin(p: { paalla: boolean; onChange: (v: boolean) => void; disabled?: boolean; nimi: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={p.paalla}
      aria-label={p.nimi}
      disabled={p.disabled}
      onClick={() => p.onChange(!p.paalla)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${p.paalla ? "bg-green-600" : "bg-muted-foreground/30"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${p.paalla ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}

export function SlottiKytkin(p: { kentta: "visa_paalla" | "synttarit_paalla"; paalla: boolean; nimi: string }) {
  const [pending, start] = useTransition();
  const [virhe, setVirhe] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3 text-sm">
      <Kytkin
        paalla={p.paalla}
        disabled={pending}
        nimi={p.nimi}
        onChange={(v) =>
          start(async () => {
            const t = await tallennaAsetukset({ [p.kentta]: v });
            setVirhe(t.ok ? null : t.virhe);
          })
        }
      />
      <span>{p.nimi}</span>
      <span className="text-xs text-muted-foreground">{p.paalla ? "päällä" : "pois päältä"}</span>
      {virhe && <span className="text-xs text-red-700">{virhe}</span>}
    </div>
  );
}

export function PaivitaLuvut() {
  const [pending, start] = useTransition();
  const [viesti, setViesti] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const t = await paivitaLuvut();
            setViesti(t.ok ? `Päivitetty ${t.maara} julkaisun luvut.` : t.virhe);
          })
        }
      >
        {pending ? "Haetaan…" : "Päivitä luvut nyt"}
      </Button>
      {viesti && <span className="text-xs text-muted-foreground">{viesti}</span>}
    </span>
  );
}

/** Visahaku: kirjoita nimen osa, valitse listasta. */
export function VisaValitsin(p: { valittu: VisaHaku | null; onValitse: (v: VisaHaku) => void; placeholder?: string }) {
  const [haku, setHaku] = useState("");
  const [tulokset, setTulokset] = useState<VisaHaku[]>([]);
  const [auki, setAuki] = useState(false);

  useEffect(() => {
    if (haku.trim().length < 2) { setTulokset([]); return; }
    let peruttu = false;
    const t = setTimeout(async () => {
      const r = await haeVisoja(haku);
      if (!peruttu) setTulokset(r);
    }, 250);
    return () => { peruttu = true; clearTimeout(t); };
  }, [haku]);

  return (
    <div className="relative min-w-0 flex-1">
      <input
        type="text"
        value={auki ? haku : (p.valittu?.nimi ?? haku)}
        onFocus={() => { setAuki(true); setHaku(""); }}
        onBlur={() => setTimeout(() => setAuki(false), 150)}
        onChange={(e) => setHaku(e.target.value)}
        placeholder={p.placeholder ?? "Hae visaa nimellä…"}
        className={`${kentta} w-full`}
      />
      {auki && tulokset.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-background py-1 text-sm shadow-lg">
          {tulokset.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { p.onValitse(v); setAuki(false); setHaku(""); }}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-muted"
              >
                <span className="min-w-0 flex-1 truncate">{v.nimi}</span>
                {v.kuva && <ImageIcon className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="kuvallinen" />}
                <span className="shrink-0 text-xs text-muted-foreground">{v.kokoelma}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function UusiJulkaisu({ kokoelmat }: { kokoelmat: Array<{ nimi: string; lkm: number }> }) {
  const [tapa, setTapa] = useState<"yksi" | "kampanja">("kampanja");
  const [paiva, setPaiva] = useState(huomennaHelsinki);
  const [visa, setVisa] = useState<VisaHaku | null>(null);
  const [otsake, setOtsake] = useState("");
  const [paivia, setPaivia] = useState(7);
  const [kokoelma, setKokoelma] = useState(kokoelmat.find((k) => k.nimi === "Luonto")?.nimi ?? kokoelmat[0]?.nimi ?? "");
  const [viesti, setViesti] = useState<{ ok: boolean; teksti: string } | null>(null);
  const [pending, start] = useTransition();

  function luo() {
    setViesti(null);
    start(async () => {
      if (tapa === "yksi") {
        const t = await luoOma({ paiva, quizId: visa?.id ?? "", otsake });
        setViesti(t.ok ? { ok: true, teksti: "Julkaisu lisätty päivän alle." } : { ok: false, teksti: t.virhe });
        if (t.ok) setVisa(null);
      } else {
        const t = await luoKampanjaToiminto({ nimi: otsake, alku: paiva, paivia, kokoelma });
        setViesti(t.ok ? { ok: true, teksti: `${t.teksti} Ne näkyvät päivien alla.` } : { ok: false, teksti: t.virhe });
      }
    });
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold">Oma julkaisu tai kampanja</h2>
        <div className="flex overflow-hidden rounded-md border text-xs">
          {(["kampanja", "yksi"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTapa(t)}
              className={`px-3 py-1 ${tapa === t ? "bg-foreground text-background" : "hover:bg-muted"}`}
            >
              {t === "kampanja" ? "Kampanja (useita päiviä)" : "Yksittäinen julkaisu"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{tapa === "kampanja" ? "Alkaa" : "Päivä"}</span>
          <input type="date" value={paiva} onChange={(e) => setPaiva(e.target.value)} className={kentta} />
        </label>
        {tapa === "kampanja" && (
          <label className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Päiviä</span>
            <input type="number" min={1} max={14} value={paivia} onChange={(e) => setPaivia(Number(e.target.value))} className={`${kentta} w-16`} />
          </label>
        )}
        <label className="flex min-w-[220px] flex-1 items-center gap-1">
          <span className="text-xs text-muted-foreground">{tapa === "kampanja" ? "Nimi" : "Aihe"}</span>
          <input
            value={otsake}
            onChange={(e) => setOtsake(e.target.value)}
            maxLength={28}
            placeholder={tapa === "kampanja" ? "Kampanjan nimi, esim. Luontoviikko" : "Aihe-etiketti, esim. JOKERIT (valinnainen)"}
            className={`${kentta} min-w-0 flex-1`}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {tapa === "kampanja" ? (
          <label className="flex min-w-0 flex-1 items-center gap-1">
            <span className="text-xs text-muted-foreground">Kokoelma</span>
            <select value={kokoelma} onChange={(e) => setKokoelma(e.target.value)} className={`${kentta} min-w-0 flex-1`}>
              {kokoelmat.map((k) => (
                <option key={k.nimi} value={k.nimi}>
                  {k.nimi} ({k.lkm} visaa)
                </option>
              ))}
            </select>
          </label>
        ) : (
          <VisaValitsin valittu={visa} onValitse={setVisa} />
        )}
        <Button size="sm" disabled={pending} onClick={luo}>
          <Plus className="h-3.5 w-3.5" /> {tapa === "kampanja" ? "Luo kampanja" : "Lisää julkaisu"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {tapa === "kampanja"
          ? "Kampanja luo joka päivälle yhden julkaisun kokoelman visoista (kuvalliset ensin, ei jo Instagramissa julkaistuja eikä lähipäivien Päivän visoja). Pohja kiertää motiivista toiseen ja tekoäly luonnostelee tekstit. Kampanjan nimi näkyy adminissa; kortin aihe-etiketti tehdään visan aiheesta. Voit vaihtaa kunkin päivän visan, pohjan ja tekstit kortista."
          : "Otsake on kortin aihe-etiketti (esim. JOKERIT) — jätä tyhjäksi, niin tekoäly ehdottaa."}
      </p>
      {viesti && <div className={`text-xs ${viesti.ok ? "text-green-700" : "text-red-700"}`}>{viesti.teksti}</div>}
    </div>
  );
}
