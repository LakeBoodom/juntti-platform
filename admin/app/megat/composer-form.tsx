"use client";

// Koosta Mega -lomake (Heikki 4.8.2026): nimi + koko + TEEMAVALINNAT.
// Teemalista on datavetoinen: kaikki kannan kategoriat + aktiiviset kuvakortistot
// haetaan listThemeOptions()-actionilla lukumäärineen — mikään teema ei jää
// kovakoodauksen takia pois (muoti-design, ruoka-juoma, historia jne. mukana).

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { composeMega, listThemeOptions } from "./actions";

/** Suomenkieliset nimet kategoria-avaimille; tuntematon avain näytetään sellaisenaan. */
const CATEGORY_LABEL: Record<string, string> = {
  "henkilö": "Tunnetut henkilöt",
  musiikki: "Musiikki",
  "tv-sarjat": "TV-sarjat",
  elokuvat: "Elokuvat",
  urheilu: "Urheilu",
  maantieto: "Maantieto",
  luonto: "Luonto",
  kulttuuri: "Kulttuuri",
  historia: "Historia",
  politiikka: "Politiikka",
  "ruoka-juoma": "Ruoka & juoma",
  "muoti-design": "Muoti & design",
};
const DECK_LABEL: Record<string, string> = {
  liput: "Liput", vaakunat: "Vaakunat", linnut: "Linnut", elaimet: "Eläimet",
  kasvit: "Kasvit", henkilot: "Henkilöt", rakennukset: "Rakennukset",
  kaupungit: "Kaupungit", maalaukset: "Maalaukset",
};

type Options = {
  categories: Array<{ value: string; n: number }>;
  decks: Array<{ type: string; n: number }>;
};

export function ComposerForm() {
  const [title, setTitle] = useState("");
  const [size, setSize] = useState(50);
  const [options, setOptions] = useState<Options | null>(null);
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [decks, setDecks] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let alive = true;
    listThemeOptions().then((opts) => {
      if (!alive) return;
      setOptions(opts);
      // Kaikki kategoriat esivalittuna, kortistot valinnaisina.
      setCategories(new Set(opts.categories.map((c) => c.value)));
    }).catch(() => { if (alive) setError("Teemojen haku epäonnistui — lataa sivu uudelleen."); });
    return () => { alive = false; };
  }, []);

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, v: string) {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    setter(next);
  }

  const nothingSelected = categories.size + decks.size === 0;

  return (
    <div className="rounded-md border p-4">
      <div className="mb-3 text-sm font-semibold">Koosta uusi Mega</div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Nimi
          <input
            className="h-9 w-64 rounded-md border bg-background px-3 text-sm text-foreground"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="esim. Viihteen Mega"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Koko
          <select className="h-9 rounded-md border bg-background px-2 text-sm text-foreground" value={size} onChange={(e) => setSize(Number(e.target.value))}>
            {[20, 50, 100].map((s) => <option key={s} value={s}>{s} kysymystä</option>)}
          </select>
        </label>
        <Button
          disabled={pending || !title.trim() || nothingSelected || !options}
          onClick={() => {
            setError(null);
            start(async () => {
              const res = await composeMega({ title, size, categories: [...categories], decks: [...decks] });
              if (res && !res.ok) setError(res.error);
            });
          }}
        >
          {pending ? "Koostetaan…" : "Koosta ehdotus"}
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">Teemat mukaan</div>
        {!options && <p className="text-sm text-muted-foreground">Ladataan teemoja…</p>}
        {options && (
          <>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {options.categories.map((c) => (
                <label key={c.value} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={categories.has(c.value)} onChange={() => toggle(categories, setCategories, c.value)} />
                  {CATEGORY_LABEL[c.value] ?? c.value}
                  <span className="text-xs text-muted-foreground">({c.n})</span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {options.decks.map((d) => (
                <label key={d.type} className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={decks.has(d.type)} onChange={() => toggle(decks, setDecks, d.type)} />
                  🖼 {DECK_LABEL[d.type] ?? d.type}
                  <span className="text-xs text-muted-foreground">({d.n})</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        Automaatti poimii valituista teemoista: max 2 per lähdevisa/kortisto, teemat vuorotellen.
        Suluissa teeman visojen/korttien määrä kannassa. Mega syntyy draftina — mitään ei julkaista
        ilman sinua. Voit muokata rivejä editorissa vapaasti.
      </p>
    </div>
  );
}
