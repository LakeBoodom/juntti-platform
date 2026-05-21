"use client";

import { useState, useTransition } from "react";
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
  createSynttaritCelebrity,
  updateSynttaritCelebrity,
  type SynttaritCelebrityInput,
} from "./actions";

type FormValue = SynttaritCelebrityInput & { id?: string };

function isoToParts(iso: string) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso))
    return { day: "", month: "", year: "" };
  const [y, m, d] = iso.split("-");
  return { day: String(parseInt(d)), month: String(parseInt(m)), year: y };
}

function partsToIso(day: string, month: string, year: string): string {
  if (!day || !month || !year) return "";
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function SynttaritCelebrityForm({
  initial,
  onDone,
}: {
  initial?: FormValue;
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const bp = isoToParts(initial?.birth_date ?? "");
  const [birthDay, setBirthDay] = useState(bp.day);
  const [birthMonth, setBirthMonth] = useState(bp.month);
  const [birthYear, setBirthYear] = useState(bp.year);
  const [role, setRole] = useState(initial?.role ?? "");
  const [bio, setBio] = useState(initial?.bio_short ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [wikiUrl, setWikiUrl] = useState(initial?.wikipedia_url ?? "");
  const [platform, setPlatform] = useState<"synttarit" | "both">(
    (initial?.platform as "synttarit" | "both") ?? "synttarit"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const birth_date = partsToIso(birthDay, birthMonth, birthYear);

    const input: SynttaritCelebrityInput = {
      name,
      birth_date,
      death_date: null,
      role,
      bio_short: bio || null,
      image_url: imageUrl || null,
      wikipedia_url: wikiUrl || null,
      platform,
    };

    startTransition(async () => {
      const res = initial?.id
        ? await updateSynttaritCelebrity(initial.id, input)
        : await createSynttaritCelebrity(input);

      if (!res.ok) {
        setError(res.error ?? "Tuntematon virhe");
      } else {
        onDone();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nimi */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Nimi *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="esim. Jari Litmanen"
          required
        />
      </div>

      {/* Syntymäpäivä */}
      <div className="space-y-1.5">
        <Label>Syntymäpäivä *</Label>
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
            placeholder="Kk"
            required
          />
          <Input
            type="number"
            min={1900}
            max={2020}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="Vuosi"
            required
          />
        </div>
      </div>

      {/* Rooli */}
      <div className="space-y-1.5">
        <Label htmlFor="role">Rooli / tunnetaan *</Label>
        <Input
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="esim. jalkapalloilija, laulaja, näyttelijä"
          required
        />
      </div>

      {/* Lyhyt bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">Lyhyt bio</Label>
        <Input
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="1–2 lauseen kuvaus (vapaaehtoinen)"
        />
      </div>

      {/* Wikipedia URL */}
      <div className="space-y-1.5">
        <Label htmlFor="wiki">Wikipedia-URL</Label>
        <Input
          id="wiki"
          type="url"
          value={wikiUrl}
          onChange={(e) => setWikiUrl(e.target.value)}
          placeholder="https://fi.wikipedia.org/wiki/…"
        />
      </div>

      {/* Kuva-URL */}
      <div className="space-y-1.5">
        <Label htmlFor="image">Kuva-URL (Wikipedia/Commons)</Label>
        <Input
          id="image"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://upload.wikimedia.org/…"
        />
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Esikatselu"
            className="mt-1 h-16 w-16 rounded-full object-cover border"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>

      {/* Alusta */}
      <div className="space-y-1.5">
        <Label>Alusta</Label>
        <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="synttarit">Vain Synttärit.com</SelectItem>
            <SelectItem value="both">Synttärit + Tietoniekka</SelectItem>
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
