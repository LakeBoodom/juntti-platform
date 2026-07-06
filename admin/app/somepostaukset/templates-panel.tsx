"use client";

import { useState, useRef, useTransition } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  createTemplate,
  deleteTemplate,
  toggleTemplateActive,
  uploadSocialTemplateImage,
  type TemplateContentScope,
  type TemplateAspectRatio,
} from "./actions";

export type TemplateRow = {
  id: string;
  site_id: string;
  name: string;
  theme_key: string | null;
  content_scope: TemplateContentScope;
  image_url: string;
  aspect_ratio: TemplateAspectRatio;
  active: boolean;
  sort_order: number;
  created_at: string;
};

const SCOPE_LABELS: Record<TemplateContentScope, string> = {
  quiz: "Visa",
  celebrity: "Synttäri",
  countdown: "Tapahtuma",
  general: "Yleinen",
  all: "Kaikki",
};

function NewTemplateForm({ siteId, onDone }: { siteId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [themeKey, setThemeKey] = useState("");
  const [contentScope, setContentScope] = useState<TemplateContentScope>("all");
  const [imageUrl, setImageUrl] = useState("");
  const [aspectRatio, setAspectRatio] = useState<TemplateAspectRatio>("portrait");
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("site_slug", siteId);
    uploadSocialTemplateImage(fd).then((res) => {
      setUploading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setImageUrl(res.publicUrl);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createTemplate({
        site_id: siteId,
        name,
        theme_key: themeKey,
        content_scope: contentScope,
        image_url: imageUrl,
        aspect_ratio: aspectRatio,
        active,
        sort_order: 0,
      });
      if (!res.ok) setError(res.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tpl_name">Nimi</Label>
        <Input id="tpl_name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tpl_theme">Teema-avain</Label>
        <Input
          id="tpl_theme"
          value={themeKey}
          onChange={(e) => setThemeKey(e.target.value)}
          placeholder="esim. joulu, kesa2026"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Käyttöalue</Label>
        <Select value={contentScope} onValueChange={(v) => setContentScope(v as TemplateContentScope)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SCOPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Kuvasuhde</Label>
        <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as TemplateAspectRatio)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="portrait">Pysty 4:5 (1080×1350) — suositus IG/FB:lle</SelectItem>
            <SelectItem value="square">Neliö (1080×1080)</SelectItem>
            <SelectItem value="landscape">Vaaka</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Kuva</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileChange}
          className="hidden"
        />
        <div className="flex items-start gap-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Esikatselu"
              className="h-24 w-24 rounded border object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded border border-dashed text-xs text-muted-foreground">
              Ei kuvaa
            </div>
          )}
          <div className="space-y-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Ladataan…" : imageUrl ? "Vaihda kuva" : "Lataa kuva"}
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG/PNG/WebP, max 8 Mt. Kuvan pitäisi olla tekstitön tausta —
              teksti ja pisteet piirretään sen päälle automaattisesti.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="tpl_active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="tpl_active" className="cursor-pointer">
          Aktiivinen
        </Label>
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
        <Button type="submit" disabled={pending || uploading || !imageUrl}>
          {pending ? "Tallennetaan…" : "Tallenna"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function TemplateItem({ template }: { template: TemplateRow }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doToggle() {
    startTransition(async () => {
      const res = await toggleTemplateActive(template.id, !template.active);
      if (!res.ok) setError(res.error);
    });
  }

  function doDelete() {
    startTransition(async () => {
      const res = await deleteTemplate(template.id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="flex items-center gap-3 rounded-md border p-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={template.image_url} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{template.name}</div>
        <div className="text-xs text-muted-foreground">
          {SCOPE_LABELS[template.content_scope]} · {template.aspect_ratio}
          {template.theme_key ? ` · ${template.theme_key}` : ""}
        </div>
        {error && <div className="text-xs text-destructive">{error}</div>}
      </div>
      <button
        type="button"
        onClick={doToggle}
        disabled={pending}
        className="text-xs underline-offset-2 hover:underline"
      >
        {template.active ? "✓ Aktiivinen" : "○ Pois käytöstä"}
      </button>
      <Button variant="ghost" size="icon" onClick={doDelete} disabled={pending} aria-label="Poista">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function TemplatesPanel({
  siteId,
  templates,
}: {
  siteId: string;
  templates: TemplateRow[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-medium">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Pohjakuvat ({templates.length})
        </span>
        <span className="text-xs text-muted-foreground">
          Some-kuvien taustapohjat kategorioittain
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t p-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus /> Lisää pohja
            </Button>
          </div>
          {templates.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Ei pohjakuvia vielä. Ilman pohjaa käytetään automaattista gradientti-taustaa.
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <TemplateItem key={t.id} template={t} />
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uusi pohjakuva</DialogTitle>
            <DialogDescription>
              Kun aktiivinen pohja löytyy sopivalle käyttöalueelle, sitä käytetään
              some-kuvan taustana gradientin sijaan.
            </DialogDescription>
          </DialogHeader>
          <NewTemplateForm siteId={siteId} onDone={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
