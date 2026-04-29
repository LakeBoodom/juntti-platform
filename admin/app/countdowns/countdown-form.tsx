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
// Note: Select is still imported because Alusta still uses it.
import {
  createCountdown,
  updateCountdown,
  type CountdownInput,
} from "./actions";

// CountdownFormValue: row tulee DB:stä jossa site_id voi olla null vanhalle datalle.
// Form-arvot rentona tyyppinä; payload-rakentaja täyttää siteId-prop:n pakollisesta arvosta.
export type CountdownFormValue = Omit<CountdownInput, "site_id"> & {
  id?: string;
  site_id?: string | null;
};

export function CountdownForm({
  initial,
  onDone,
  siteId,
}: {
  initial?: CountdownFormValue;
  onDone: () => void;
  siteId: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [day, setDay] = useState<number>(initial?.day ?? 1);
  const [month, setMonth] = useState<number>(initial?.month ?? 1);
  const [objectType, setObjectType] = useState(
    initial?.object_type ?? "",
  );
  const [platform, setPlatform] = useState<string>(initial?.platform ?? "both");
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: CountdownInput = {
      name: name.trim(),
      slug: slug.trim(),
      day,
      month,
      object_type: objectType,
      platform: platform === "both" ? null : platform,
      tag: tag.trim() || null,
      site_id: siteId,
    };
    startTransition(async () => {
      const res = initial?.id
        ? await updateCountdown(initial.id, payload)
        : await createCountdown(payload);
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
          placeholder="esim. Vappu"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="esim. vappu"
          pattern="[a-z0-9\-]+"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="day">Päivä</Label>
          <Input
            id="day"
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value) || 1)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="month">Kuukausi</Label>
          <Input
            id="month"
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="object_type">Ikoni</Label>
        <Input
          id="object_type"
          value={objectType}
          onChange={(e) => setObjectType(e.target.value)}
          placeholder="esim. bottle, helmet, bonfire, microphone, cross"
          required
        />
        <p className="text-xs text-muted-foreground">
          Lyhyt englanninkielinen nimi ikonille, jota etusivun countdown
          näyttää. Nykyiset: bottle, helmet, bonfire, sunglasses, ornament.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tag">Tag <span className="text-muted-foreground">(valinnainen)</span></Label>
        <Input
          id="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="esim. vappu, jaakiekko_mm, euroviisut"
          pattern="[a-z0-9_\-]*"
        />
        <p className="text-xs text-muted-foreground">
          Tagi linkittää eventin teemavisaan: schedule_rules-säännössä strategy=&quot;tag&quot; matchaa samanniminen tag.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Alusta (legacy)</Label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Molemmat (juntti + tietoniekka)</SelectItem>
            <SelectItem value="juntti">Vain juntti.com</SelectItem>
            <SelectItem value="tietoniekka">Vain Tietoniekka.fi</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Vanha kenttä — site valitaan navigaation site-vaihtimesta. Säilytetty legacy-tueksi.
        </p>
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
