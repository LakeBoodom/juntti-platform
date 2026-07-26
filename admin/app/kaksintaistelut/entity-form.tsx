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
import { createEntity, updateEntity, DATE_ATTRS, type EntityInput, type AttrValue } from "./actions";

export type Def = {
  attr_key: string;
  kind: string;
  theme: string;
  subject_label: string;
  question_text: string;
  winner: "low" | "high";
  easy_gap: number | null;
  mid_gap: number | null;
  max_gap: number | null;
  min_gap: number | null;
  max_domain_distance: number;
  compare_mode?: "numeric" | "flag" | "distance";
  unit_label: string | null;
  enabled: boolean;
};

export type EntityValue = {
  id?: string;
  name: string;
  kind: string;
  role_label: string | null;
  show_role: boolean;
  image_url: string | null;
  image_credit: string | null;
  wiki_url: string | null;
  status: "draft" | "published" | "hidden";
  lat: number | null;
  lon: number | null;
  name_partitive: string | null;
  duel_attributes?: AttrValue[];
};

const epochToDate = (n: number) => new Date(n * 1000).toISOString().slice(0, 10);
const dateToEpoch = (s: string) => Date.parse(s + "T00:00:00Z") / 1000;
const today = () => new Date().toISOString().slice(0, 10);

export function EntityForm({
  initial,
  defs,
  onDone,
}: {
  initial?: EntityValue;
  defs: Def[];
  onDone: () => void;
}) {
  const kinds = Array.from(new Set(defs.map((d) => d.kind)));
  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState(initial?.kind ?? kinds[0] ?? "person");
  const [roleLabel, setRoleLabel] = useState(initial?.role_label ?? "");
  const [showRole, setShowRole] = useState(initial?.show_role ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [imageCredit, setImageCredit] = useState(initial?.image_credit ?? "");
  const [wikiUrl, setWikiUrl] = useState(initial?.wiki_url ?? "");
  const [lat, setLat] = useState(initial?.lat === null || initial?.lat === undefined ? "" : String(initial.lat));
  const [lon, setLon] = useState(initial?.lon === null || initial?.lon === undefined ? "" : String(initial.lon));
  const [partitive, setPartitive] = useState(initial?.name_partitive ?? "");
  const [status, setStatus] = useState<"draft" | "published" | "hidden">(
    initial?.status ?? "published",
  );

  const existing = new Map((initial?.duel_attributes ?? []).map((a) => [a.attr_key, a]));
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const a of initial?.duel_attributes ?? [])
      o[a.attr_key] = DATE_ATTRS.includes(a.attr_key)
        ? epochToDate(a.num_value ?? 0)
        : String(a.num_value ?? "");
    return o;
  });
  const [sources, setSources] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const a of initial?.duel_attributes ?? []) o[a.attr_key] = a.source ?? "";
    return o;
  });

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const kindDefs = defs.filter((d) => d.kind === kind);
  // Sijaintikentät näytetään vain jos tälle lajille on etäisyyskysymys.
  const needsCoords = kindDefs.some((d) => d.compare_mode === "distance");

  function buildAttributes(): AttrValue[] {
    return kindDefs.map((d) => {
      const raw = (vals[d.attr_key] ?? "").trim();
      let num: number | null = null;
      if (raw) num = DATE_ATTRS.includes(d.attr_key) ? dateToEpoch(raw) : Number(raw.replace(",", "."));
      const display =
        num === null
          ? null
          : DATE_ATTRS.includes(d.attr_key)
            ? "s. " + raw.slice(0, 4)
            : `${num.toLocaleString("fi-FI")}${d.unit_label ? " " + d.unit_label : ""}`;
      const prev = existing.get(d.attr_key);
      const changed = prev?.num_value !== num;
      return {
        attr_key: d.attr_key,
        num_value: num,
        display_value: display,
        source: sources[d.attr_key]?.trim() || null,
        verified_at: changed ? today() : (prev?.verified_at ?? today()),
      };
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: EntityInput = {
      name,
      kind,
      role_label: roleLabel || null,
      show_role: showRole,
      image_url: imageUrl || null,
      image_credit: imageCredit || null,
      wiki_url: wikiUrl || null,
      status,
      lat: lat.trim() === "" ? null : Number(lat.replace(",", ".")),
      lon: lon.trim() === "" ? null : Number(lon.replace(",", ".")),
      name_partitive: partitive.trim() || null,
      attributes: buildAttributes(),
    };
    startTransition(async () => {
      const res = initial?.id ? await updateEntity(initial.id, payload) : await createEntity(payload);
      if (!res.ok) setError(res.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={submit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dname">Nimi</Label>
          <Input id="dname" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Laji</Label>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kinds.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="drole">Alaotsikko kortilla</Label>
          <Input
            id="drole"
            value={roleLabel}
            onChange={(e) => setRoleLabel(e.target.value)}
            placeholder="esim. Jääkiekkoilija"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Näytä alaotsikko</Label>
          <Select value={showRole ? "1" : "0"} onValueChange={(v) => setShowRole(v === "1")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Kyllä</SelectItem>
              <SelectItem value="0">Ei — laji käy ilmi kysymyksestä</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attribuutit lajin mukaan */}
      <div className="space-y-3 rounded-md border bg-muted/30 p-3">
        <div className="text-sm font-medium">Attribuutit</div>
        {!kindDefs.length && (
          <p className="text-sm text-muted-foreground">
            Lajille &quot;{kind}&quot; ei ole vielä yhtään attribuuttia. Lisää se ensin
            Attribuutit-taulukosta.
          </p>
        )}
        {kindDefs.map((d) => (
          <div key={d.attr_key} className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`a-${d.attr_key}`}>
                {d.attr_key}
                {d.unit_label ? ` (${d.unit_label})` : ""}
              </Label>
              <Input
                id={`a-${d.attr_key}`}
                type={DATE_ATTRS.includes(d.attr_key) ? "date" : "number"}
                step="any"
                value={vals[d.attr_key] ?? ""}
                onChange={(e) => setVals({ ...vals, [d.attr_key]: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`s-${d.attr_key}`}>Lähde</Label>
              <Input
                id={`s-${d.attr_key}`}
                value={sources[d.attr_key] ?? ""}
                onChange={(e) => setSources({ ...sources, [d.attr_key]: e.target.value })}
                placeholder="esim. Tilastokeskus 2025"
              />
            </div>
          </div>
        ))}
      </div>

      {needsCoords && (
        <div className="space-y-3 rounded-md border bg-muted/30 p-3">
          <div className="text-sm font-medium">Sijainti</div>
          <p className="text-xs text-muted-foreground">
            Etäisyyskysymykset (&quot;kumpi on lähempänä Vaasaa&quot;) lasketaan sijainnista,
            joten ilman näitä {kind} ei näy niissä lainkaan. Koordinaatit saa Wikipedian
            artikkelin oikeasta yläkulmasta.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dlat">Leveysaste</Label>
              <Input
                id="dlat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="63.0951"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dlon">Pituusaste</Label>
              <Input
                id="dlon"
                type="number"
                step="any"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="21.6165"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dpart">Partitiivi</Label>
              <Input
                id="dpart"
                value={partitive}
                onChange={(e) => setPartitive(e.target.value)}
                placeholder="Vaasaa"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Partitiivi luetaan kysymyksessä muodossa &quot;on lähempänä{" "}
            <strong>{partitive || "Vaasaa"}</strong>?&quot; — tarkista että se taipuu oikein.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="dimg">Kuva (suora upload.wikimedia.org-linkki)</Label>
        <Input id="dimg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <p className="text-xs text-muted-foreground">
          Artikkelilinkki (…/wiki/Nimi#/media/…) ei toimi — avaa kuva Commonsissa ja
          kopioi tiedoston osoite.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dcredit">Kuvan lähde</Label>
          <Input id="dcredit" value={imageCredit} onChange={(e) => setImageCredit(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Tila</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="published">Julkaistu</SelectItem>
              <SelectItem value="draft">Luonnos</SelectItem>
              <SelectItem value="hidden">Piilotettu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dwiki">Wikipedia-osoite</Label>
        <Input id="dwiki" value={wikiUrl} onChange={(e) => setWikiUrl(e.target.value)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Tallennetaan…" : "Tallenna"}
        </Button>
      </div>
    </form>
  );
}
