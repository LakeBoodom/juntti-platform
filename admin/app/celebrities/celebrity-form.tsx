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
  createCelebrity,
  updateCelebrity,
  type CelebrityInput,
} from "./actions";

export type CelebrityFormValue = CelebrityInput & { id?: string };

export function CelebrityForm({
  initial,
  onDone,
}: {
  initial?: CelebrityFormValue;
  onDone: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [birthDate, setBirthDate] = useState(initial?.birth_date ?? "");
  const [deathDate, setDeathDate] = useState(initial?.death_date ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [bio, setBio] = useState(initial?.bio_short ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [platform, setPlatform] = useState<"juntti" | "tietovisa" | "both">(
    initial?.platform ?? "both",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: CelebrityInput = {
      name,
      birth_date: birthDate,
      death_date: deathDate || null,
      role,
      bio_short: bio || null,
      image_url: imageUrl || null,
      platform,
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="birth">Syntymäpäivä</Label>
          <Input
            id="birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="death">Kuolinpäivä (tyhjä = elossa)</Label>
          <Input
            id="death"
            type="date"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
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
            <SelectItem value="tietovisa">Vain tietovisa.fi</SelectItem>
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
