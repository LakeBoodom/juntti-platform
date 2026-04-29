"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
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
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  createCelebrity,
  updateCelebrity,
  type CelebrityInput,
} from "./actions";
import { fetchFromWikipedia } from "./wikipedia-actions";

export type CelebrityFormValue = CelebrityInput & { id?: string };

function isoToParts(iso: string): { day: string; month: string; year: string } {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso))
    return { day: "", month: "", year: "" };
  const [y, m, d] = iso.split("-");
  return { day: String(parseInt(d)), month: String(parseInt(m)), year: y };
}

function partsToIso(day: string, month: string, year: string): string {
  if (!day || !month || !year) return "";
  const y = year.padStart(4, "0");
  const m = month.padStart(2, "0");
  const d = day.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function CelebrityForm({
  initial,
  onDone,
}: {
  initial?: CelebrityFormValue;
  onDone: () => void;
}) {
  const [wikiUrl, setWikiUrl] = useState(initial?.wikipedia_url ?? "");
  const [wikiError, setWikiError] = useState<string | null>(null);
  const [wikiPending, startWikiTransition] = useTransition();

  const [name, setName] = useState(initial?.name ?? "");
  const birthParts = isoToParts(initial?.birth_date ?? "");
  const [birthDay, setBirthDay] = useState(birthParts.day);
  const [birthMonth, setBirthMonth] = useState(birthParts.month);
  const [birthYear, setBirthYear] = useState(birthParts.year);
  const deathParts = isoToParts(initial?.death_date ?? "");
  const [deathDay, setDeathDay] = useState(deathParts.day);
  const [deathMonth, setDeathMonth] = useState(deathParts.month);
  const [deathYear, setDeathYear] = useState(deathParts.year);
  const [role, setRole] = useState(initial?.role ?? "");
  const [bio, setBio] = useState(initial?.bio_short ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [platform, setPlatform] = useState<"juntti" | "tietoniekka" | "both">(
    initial?.platform ?? "both",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function fetchWikipedia() {
    setWikiError(null);
    startWikiTransition(async () => {
      const res = await fetchFromWikipedia(wikiUrl);
      if (!res.ok) {
        setWikiError(res.error);
        return;
      }
      if (res.name) setName(res.name);
      if (res.bio_short) setBio(res.bio_short);
      if (res.image_url) setImageUrl(res.image_url);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const hasDeath = deathDay || deathMonth || deathYear;
    const payload: CelebrityInput = {
      name,
      birth_date: partsToIso(birthDay, birthMonth, birthYear),
      death_date: hasDeath ? partsToIso(deathDay, deathMonth, deathYear) : null,
      role,
      bio_short: bio || null,
      image_url: imageUrl || null,
      platform,
      wikipedia_url: wikiUrl || null,
    };
    startTransition(async () => {
      const res = initial?.id
        ? await updateCelebrity(initial.id, payload)
        : await createCelebrity(payload);
      if (!res.ok) setError(res.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Wikipedia import */}
      <div className="space-y-1.5 rounded-md border bg-muted/30 p-3">
        <Label htmlFor="wiki">Hae Wikipediasta (vapaaehtoinen)</Label>
        <div className="flex gap-2">
          <Input
            id="wiki"
            type="url"
            value={wikiUrl}
            onChange={(e) => setWikiUrl(e.target.value)}
            placeholder="https://fi.wikipedia.org/wiki/…"
            disabled={wikiPending}
          />
          <Button
            type="button"
            variant="outline"
            onClick={fetchWikipedia}
            disabled={wikiPending || !wikiUrl}
          >
            <Download />
            {wikiPending ? "Haetaan…" : "Hae"}
          </Button>
        </div>
        {wikiError && (
          <p className="text-xs text-destructive">{wikiError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Täyttää nimen, lyhyen bion ja kuva-URL:n automaattisesti. URL
          tallentuu myös talteen — AI-visan generointi käyttää koko artikkelin
          lähteenä, mikä parantaa faktatarkkuutta.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nimi</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="esim. Matti Nykänen"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Syntymäpäivä</Label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            min={1}
            max={31}
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
            placeholder="Päivä"
            required
          />
          <Input
            type="number"
            min={1}
            max={12}
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
            placeholder="Kuukausi"
            required
          />
          <Input
            type="number"
            min={1900}
            max={2030}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="Vuosi"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Kuolinpäivä (jätä tyhjäksi jos elossa)</Label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            min={1}
            max={31}
            value={deathDay}
            onChange={(e) => setDeathDay(e.target.value)}
            placeholder="Päivä"
          />
          <Input
            type="number"
            min={1}
            max={12}
            value={deathMonth}
            onChange={(e) => setDeathMonth(e.target.value)}
            placeholder="Kuukausi"
          />
          <Input
            type="number"
            min={1900}
            max={2030}
            value={deathYear}
            onChange={(e) => setDeathYear(e.target.value)}
            placeholder="Vuosi"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">Rooli / tunnetaan</Label>
        <Input
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="esim. mäkihyppääjä, laulaja, poliitikko"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Lyhyt bio</Label>
        <Input
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="1–2 lauseen kuvaus (vapaaehtoinen)"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="image">Kuva-URL</Label>
        <Input
          id="image"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Alusta</Label>
        <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Molemmat</SelectItem>
            <SelectItem value="juntti">Vain juntti.com</SelectItem>
            <SelectItem value="tietoniekka">Vain Tietoniekka.fi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Peruuta
          </Button>
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Tallennetaan…" : "Tallenna"}
        </Button>
      </DialogFooter>
    </form>
  );
}
