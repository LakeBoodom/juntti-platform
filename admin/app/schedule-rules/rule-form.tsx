"use client";

import { useEffect, useState, useTransition } from "react";
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
  createRule,
  updateRule,
  type RuleInput,
  type Strategy,
  type ContentType,
} from "./actions";

export type ContentOption = { id: string; label: string };
export type ContentOptionsMap = Record<ContentType, ContentOption[]>;

export type RuleFormValue = RuleInput & { id?: string };

const STRATEGY_LABELS: Record<Strategy, string> = {
  date: "Tietty päivämäärä",
  tag: "Tag-pohjainen",
  recurring_daily: "Toistuu joka päivä",
  random: "Random-rotaatio",
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  quiz: "Visa",
  celebrity: "Julkkis",
  countdown: "Countdown",
  kuvavisa: "Kuvavisa",
};

export function RuleForm({
  initial,
  onDone,
  siteId,
  contentOptions,
}: {
  initial?: RuleFormValue;
  onDone: () => void;
  siteId: string;
  contentOptions: ContentOptionsMap;
}) {
  const [contentType, setContentType] = useState<ContentType>(
    initial?.content_type ?? "quiz"
  );
  const [contentId, setContentId] = useState<string>(initial?.content_id ?? "");
  const [strategy, setStrategy] = useState<Strategy>(initial?.strategy ?? "date");
  const [scheduledDate, setScheduledDate] = useState<string>(
    initial?.scheduled_date ?? new Date().toISOString().slice(0, 10)
  );
  const [tag, setTag] = useState<string>(initial?.tag ?? "");
  const [weight, setWeight] = useState<number>(initial?.weight ?? 1);
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Kun content_type vaihtuu, valitaan oletus content_id (ensimmäinen lista)
  useEffect(() => {
    if (!initial) {
      const opts = contentOptions[contentType];
      setContentId(opts[0]?.id ?? "");
    }
  }, [contentType, contentOptions, initial]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: RuleInput = {
      site_id: siteId,
      content_type: contentType,
      content_id: contentId,
      strategy,
      scheduled_date: strategy === "date" ? scheduledDate : null,
      tag: strategy === "tag" ? tag.trim() || null : null,
      weight,
      active,
    };
    startTransition(async () => {
      const res = initial?.id
        ? await updateRule(initial.id, payload)
        : await createRule(payload);
      if (!res.ok) setError(res.error);
      else onDone();
    });
  }

  const opts = contentOptions[contentType] ?? [];

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Sisältötyyppi</Label>
        <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Sisältö</Label>
        <Select value={contentId} onValueChange={setContentId}>
          <SelectTrigger>
            <SelectValue placeholder={opts.length ? "Valitse..." : "Ei sisältöä"} />
          </SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {opts.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Tällä sitellä ei ole vielä {CONTENT_TYPE_LABELS[contentType].toLowerCase()}-sisältöä.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Strategia</Label>
        <Select value={strategy} onValueChange={(v) => setStrategy(v as Strategy)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STRATEGY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {strategy === "date" && (
        <div className="space-y-1.5">
          <Label htmlFor="scheduled_date">Päivämäärä</Label>
          <Input
            id="scheduled_date"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            required
          />
        </div>
      )}

      {strategy === "tag" && (
        <div className="space-y-1.5">
          <Label htmlFor="tag">Tag</Label>
          <Input
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="esim. vappu, jaakiekko_mm, 20260501"
            pattern="[a-z0-9_\-]+"
            required
          />
          <p className="text-xs text-muted-foreground">
            Sisältö näkyy kun saman tagin omaava event aktivoituu (countdown.tag).
          </p>
        </div>
      )}

      {strategy === "random" && (
        <div className="space-y-1.5">
          <Label htmlFor="weight">Painotus</Label>
          <Input
            id="weight"
            type="number"
            min={1}
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value) || 1)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Korkeampi paino = todennäköisempi valinta random-rotaatiossa.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id="active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="active" className="cursor-pointer">
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
        <Button type="submit" disabled={pending || !contentId}>
          {pending ? "Tallennetaan…" : "Tallenna"}
        </Button>
      </DialogFooter>
    </form>
  );
}
