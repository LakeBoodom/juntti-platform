"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { paivaSlug, synttaritBetaUrl } from "@/lib/synttarit";
import {
  createSynttaritCelebrity,
  updateSynttaritCelebrity,
  type SynttaritCelebrityInput,
} from "./actions";

type FormValue = SynttaritCelebrityInput & { id?: string };

function isoToParts(iso: string | null | undefined) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso))
    return { day: "", month: "", year: "" };
  const [y, m, d] = iso.split("-");
  return { day: String(parseInt(d)), month: String(parseInt(m)), year: y };
}

function partsToIso(day: string, month: string, year: string): string {
  if (!day || !month || !year) return "";
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function DateParts({
  day,
  month,
  year,
  onDay,
  onMonth,
  onYear,
  required,
}: {
  day: string;
  month: string;
  year: string;
  onDay: (v: string) => void;
  onMonth: (v: string) => void;
  onYear: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Input type="number" min={1} max={31} value={day} onChange={(e) => onDay(e.target.value)} placeholder="Päivä" required={required} />
      <Input type="number" min={1} max={12} value={month} onChange={(e) => onMonth(e.target.value)} placeholder="Kk" required={required} />
      <Input type="number" min={1000} max={2100} value={year} onChange={(e) => onYear(e.target.value)} placeholder="Vuosi" required={required} />
    </div>
  );
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
  const bp = isoToParts(initial?.birth_date);
  const [birthDay, setBirthDay] = useState(bp.day);
  const [birthMonth, setBirthMonth] = useState(bp.month);
  const [birthYear, setBirthYear] = useState(bp.year);
  const dp = isoToParts(initial?.death_date);
  const [deathDay, setDeathDay] = useState(dp.day);
  const [deathMonth, setDeathMonth] = useState(dp.month);
  const [deathYear, setDeathYear] = useState(dp.year);
  const [role, setRole] = useState(initial?.role ?? "");
  const [bio, setBio] = useState(initial?.bio_short ?? "");
  const [bioIntro, setBioIntro] = useState(initial?.bio_intro ?? "");
  const [facts, setFacts] = useState<{ label: string; value: string }[]>(
    initial?.facts?.length ? initial.facts : []
  );
  const [tiesitko, setTiesitko] = useState(initial?.tiesitko ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [imageCredit, setImageCredit] = useState(initial?.image_credit ?? "");
  const [imageLicense, setImageLicense] = useState(initial?.image_license ?? "");
  const [wikiUrl, setWikiUrl] = useState(initial?.wikipedia_url ?? "");
  const [platform, setPlatform] = useState<"synttarit" | "both">(
    (initial?.platform as "synttarit" | "both") ?? "synttarit"
  );

  function setFact(i: number, key: "label" | "value", v: string) {
    setFacts((fs) => fs.map((f, j) => (j === i ? { ...f, [key]: v } : f)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const birth_date = partsToIso(birthDay, birthMonth, birthYear);
    const death_date = partsToIso(deathDay, deathMonth, deathYear) || null;
    if ((deathDay || deathMonth || deathYear) && !death_date) {
      setError("Kuolinpäivästä puuttuu päivä, kuukausi tai vuosi (tai jätä kaikki tyhjiksi)");
      return;
    }

    const input: SynttaritCelebrityInput = {
      name,
      birth_date,
      death_date,
      role,
      bio_short: bio || null,
      image_url: imageUrl || null,
      wikipedia_url: wikiUrl || null,
      platform,
      bio_intro: bioIntro || null,
      facts,
      tiesitko: tiesitko || null,
      image_credit: imageCredit || null,
      image_license: imageLicense || null,
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

  const previewDate = partsToIso(birthDay, birthMonth, birthYear || "2000");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {initial?.id && previewDate && (
        <a
          href={`${synttaritBetaUrl()}/${paivaSlug(previewDate)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
        >
          Esikatsele päivän sivu betassa <ExternalLink className="h-3 w-3" />
        </a>
      )}

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

      {/* Syntymä- ja kuolinpäivä */}
      <div className="space-y-1.5">
        <Label>Syntymäpäivä *</Label>
        <DateParts
          day={birthDay} month={birthMonth} year={birthYear}
          onDay={setBirthDay} onMonth={setBirthMonth} onYear={setBirthYear}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Kuolinpäivä</Label>
        <DateParts
          day={deathDay} month={deathMonth} year={deathYear}
          onDay={setDeathDay} onMonth={setDeathMonth} onYear={setDeathYear}
        />
        <p className="text-xs text-muted-foreground">
          Jätä tyhjäksi, jos henkilö on elossa. Päivän sivulla lukee silloin &quot;Täyttää tänään X vuotta&quot;.
        </p>
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

      {/* Kuvaus */}
      <div className="space-y-1.5">
        <Label htmlFor="bio_intro">Kuvaus (päivän sivun leipäteksti)</Label>
        <Textarea
          id="bio_intro"
          value={bioIntro}
          onChange={(e) => setBioIntro(e.target.value)}
          rows={4}
          placeholder="2–3 lauseen kuvaus henkilöstä"
        />
        <p className="text-xs text-muted-foreground">
          Sama teksti näkyy myös Tietoniekan henkilösivulla.
        </p>
      </div>

      {/* Tietolaatikko */}
      <div className="space-y-1.5">
        <Label>Tietolaatikko</Label>
        <div className="space-y-2">
          {facts.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input
                className="w-2/5"
                value={f.label}
                onChange={(e) => setFact(i, "label", e.target.value)}
                placeholder="Otsikko, esim. Huippuhetki"
              />
              <Input
                value={f.value}
                onChange={(e) => setFact(i, "value", e.target.value)}
                placeholder="Arvo"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFacts((fs) => fs.filter((_, j) => j !== i))}
                aria-label="Poista rivi"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFacts((fs) => [...fs, { label: "", value: "" }])}
          >
            <Plus className="mr-1 h-3 w-3" /> Lisää rivi
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Sama tietolaatikko näkyy myös Tietoniekan henkilösivulla.
        </p>
      </div>

      {/* Tiesitkö */}
      <div className="space-y-1.5">
        <Label htmlFor="tiesitko">Tiesitkö?</Label>
        <Textarea
          id="tiesitko"
          value={tiesitko}
          onChange={(e) => setTiesitko(e.target.value)}
          rows={2}
          placeholder="Yllättävä fakta (vapaaehtoinen). Jos tyhjä, nostona käytetään tietolaatikon ensimmäistä riviä."
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

      {/* Kuva */}
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
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="image_credit">Kuvan tekijä / lähde</Label>
          <Input
            id="image_credit"
            value={imageCredit}
            onChange={(e) => setImageCredit(e.target.value)}
            placeholder="esim. Matti Meikäläinen / Wikimedia Commons"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="image_license">Kuvan lisenssi</Label>
          <Input
            id="image_license"
            value={imageLicense}
            onChange={(e) => setImageLicense(e.target.value)}
            placeholder="esim. CC BY-SA 4.0"
          />
        </div>
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
