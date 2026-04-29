"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateQuizMeta } from "./actions";

type Site = { id: string; slug: string; name: string };

type Difficulty = "helppo" | "keski" | "vaikea";
type Tone = "rento" | "humoristinen" | "asiallinen" | "nostalginen";
type Platform = "juntti" | "tietoniekka" | "both";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  helppo: "Helppo",
  keski: "Keskitaso",
  vaikea: "Vaikea",
};

const TONE_LABELS: Record<Tone, string> = {
  rento: "Rento",
  humoristinen: "Humoristinen",
  asiallinen: "Asiallinen",
  nostalginen: "Nostalginen",
};

export function MetaEditor({
  id,
  initial,
  sites,
  isDraft,
}: {
  id: string;
  initial: {
    title: string;
    description: string | null;
    category: string;
    difficulty: Difficulty;
    tone: Tone;
    platform: Platform;
    site_id: string | null;
  };
  sites: Site[];
  isDraft: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [category, setCategory] = useState(initial.category);
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [tone, setTone] = useState<Tone>(initial.tone);
  const [platform, setPlatform] = useState<Platform>(initial.platform);
  const [siteId, setSiteId] = useState<string>(initial.site_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateQuizMeta(id, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        difficulty,
        tone,
        platform,
        site_id: siteId || null,
      });
      if (!res.ok) setError(res.error);
      else setEditing(false);
    });
  }

  function cancel() {
    setEditing(false);
    setTitle(initial.title);
    setDescription(initial.description ?? "");
    setCategory(initial.category);
    setDifficulty(initial.difficulty);
    setTone(initial.tone);
    setPlatform(initial.platform);
    setSiteId(initial.site_id ?? "");
    setError(null);
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          <Pencil /> Muokkaa
        </Button>
      </div>
    );
  }

  // Edit-tilassa näytä kaikki muokattavat kentät. Site/kategoria/vaikeus/sävy/alusta
  // muokattavissa vain kun visa on draft-tilassa — julkaistuun ei kosketa.
  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-4">
      <div className="space-y-1.5">
        <Label>Otsikko</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Kuvaus</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {!isDraft && (
        <p className="rounded-md border border-amber-500/40 bg-amber-50/40 p-2 text-xs text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
          Visa on julkaistu — alla olevat kentät (site, kategoria, vaikeus, sävy, alusta)
          eivät ole muokattavissa. Palauta visa luonnokseksi (Julkaistu → Draft) jos haluat muuttaa niitä.
        </p>
      )}

      <fieldset disabled={!isDraft} className="space-y-3 disabled:opacity-50">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Site (uusi)</Label>
            <Select value={siteId} onValueChange={setSiteId}>
              <SelectTrigger>
                <SelectValue placeholder="Valitse..." />
              </SelectTrigger>
              <SelectContent>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Ohjaa mille sivustolle visa näytetään.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Alusta (legacy)</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Molemmat</SelectItem>
                <SelectItem value="juntti">Juntti</SelectItem>
                <SelectItem value="tietoniekka">Tietoniekka.fi</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Vanha kenttä — Site (ylempi) on uusi totuuden lähde.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Kategoria</Label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="esim. urheilu, maantieto, luonto, historia, tv-sarjat, elokuvat, musiikki, ruoka-juoma"
          />
          <p className="text-xs text-muted-foreground">
            Tietoniekassa käytä yhtä kategorian slug-arvoista — yhdistää visan etusivun
            kategoriakorttiin ja /kategoria/[slug]-sivulle.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Vaikeus</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Sävy</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TONE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={cancel}>
          <X /> Peruuta
        </Button>
        <Button onClick={save} disabled={pending}>
          {pending ? "Tallennetaan…" : "Tallenna"}
        </Button>
      </div>
    </div>
  );
}
