"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Loader2, Sparkles } from "lucide-react";
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
  createKuvavisa,
  updateKuvavisa,
  uploadKuvavisaImage,
  type KuvavisaInput,
  type KuvavisaType,
} from "./actions";
import { aiGenerateKuvavisa } from "./ai-actions";

export type KuvavisaFormValue = KuvavisaInput & { id?: string };

const TYPE_LABELS: Record<KuvavisaType, string> = {
  liput: "Liput",
  paikkakunnat: "Paikkakunnat",
  logot: "Logot",
  vaakunat: "Vaakunat",
};

export function KuvavisaForm({
  initial,
  onDone,
  siteId,
  siteSlug,
  defaultType,
}: {
  initial?: KuvavisaFormValue;
  onDone: () => void;
  siteId: string;
  siteSlug: string;
  defaultType: KuvavisaType;
}) {
  const [type, setType] = useState<KuvavisaType>(initial?.type ?? defaultType);
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [options, setOptions] = useState<[string, string, string, string]>(
    initial?.options ?? ["", "", "", ""]
  );
  const [correctIdx, setCorrectIdx] = useState<number>(() => {
    if (!initial) return 0;
    const idx = initial.options.findIndex((o) => o === initial.correct_option);
    return idx >= 0 ? idx : 0;
  });
  const [fact, setFact] = useState(initial?.fact ?? "");
  const [difficulty, setDifficulty] = useState<"helppo" | "keski" | "vaikea">(
    initial?.difficulty ?? "keski"
  );
  const [tag, setTag] = useState(initial?.tag ?? "");
  const [weight, setWeight] = useState<number>(initial?.weight ?? 1);
  const [active, setActive] = useState<boolean>(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [aiPending, startAi] = useTransition();
  const [aiSubject, setAiSubject] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function fillFromAi() {
    if (!aiSubject.trim()) {
      setError("Anna aihe (esim. \"Jamaikan lippu\") jotta AI voi ehdottaa kysymyksen");
      return;
    }
    setError(null);
    startAi(async () => {
      const res = await aiGenerateKuvavisa({
        type,
        subject: aiSubject.trim(),
        difficulty,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setQuestion(res.data.question);
      setOptions(res.data.options as [string, string, string, string]);
      const idx = res.data.options.indexOf(res.data.correct_option);
      setCorrectIdx(idx >= 0 ? idx : 0);
      setFact(res.data.fact);
    });
  }


  function updateOption(idx: number, value: string) {
    setOptions((opts) => {
      const next = [...opts] as [string, string, string, string];
      next[idx] = value;
      return next;
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("site_slug", siteSlug);
    fd.set("type", type);
    startUpload(async () => {
      const res = await uploadKuvavisaImage(fd);
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
    const payload: KuvavisaInput = {
      site_id: siteId,
      type,
      question: question.trim(),
      image_url: imageUrl,
      options,
      correct_option: options[correctIdx],
      fact: fact.trim() || null,
      difficulty,
      active,
      weight,
      tag: tag.trim() || null,
    };
    startTransition(async () => {
      const res = initial?.id
        ? await updateKuvavisa(initial.id, payload)
        : await createKuvavisa(payload);
      if (!res.ok) setError(res.error);
      else onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label>Tyyppi</Label>
        <Select value={type} onValueChange={(v) => setType(v as KuvavisaType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 rounded-md border border-dashed border-amber-500/50 bg-amber-50/40 p-3 dark:bg-amber-950/20">
        <Label htmlFor="ai_subject" className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI-luo loput
        </Label>
        <div className="flex gap-2">
          <Input
            id="ai_subject"
            value={aiSubject}
            onChange={(e) => setAiSubject(e.target.value)}
            placeholder="esim. 'Jamaikan lippu' / 'Tampereen tuomiokirkko'"
            disabled={aiPending}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={fillFromAi}
            disabled={aiPending || !aiSubject.trim()}
          >
            {aiPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {aiPending ? "Generoidaan…" : "Täytä AI:lla"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Kerro mitä kuvassa on. AI keksii kysymyksen + 3 väärää vastausta + fact-tekstin.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="question">Kysymys</Label>
        <Input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="esim. Minkä maan lippu?"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Kuva</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={onFileChange}
          className="hidden"
        />
        <div className="flex items-start gap-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Esikatselu"
              className="h-24 w-32 rounded-md border object-cover"
            />
          ) : (
            <div className="flex h-24 w-32 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
              Ei kuvaa
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" /> Ladataan…
              </>
            ) : (
              <>
                <Upload /> {imageUrl ? "Vaihda kuva" : "Lataa kuva"}
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Max 5 MB. JPEG/PNG/WebP/SVG. Tallentuu Supabase Storageen.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Vastausvaihtoehdot (valitse oikea)</Label>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={correctIdx === idx}
                onChange={() => setCorrectIdx(idx)}
                className="h-4 w-4"
                aria-label={`Vaihtoehto ${String.fromCharCode(65 + idx)} on oikea`}
              />
              <span className="w-6 text-sm font-medium text-muted-foreground">
                {String.fromCharCode(65 + idx)}
              </span>
              <Input
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Vaihtoehto ${String.fromCharCode(65 + idx)}`}
                required
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fact">Tiesitkö? -teksti (valinnainen)</Label>
        <textarea
          id="fact"
          value={fact}
          onChange={(e) => setFact(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Yksi-kaksi lausetta — näytetään vastauksen jälkeen."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Vaikeus</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as never)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="helppo">Helppo</SelectItem>
              <SelectItem value="keski">Keskitaso</SelectItem>
              <SelectItem value="vaikea">Vaikea</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weight">Painotus</Label>
          <Input
            id="weight"
            type="number"
            min={1}
            value={weight}
            onChange={(e) => setWeight(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tag">Tag (valinnainen)</Label>
        <Input
          id="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="esim. vappu, jaakiekko_mm"
          pattern="[a-z0-9_\-]*"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="active"
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="active" className="cursor-pointer">
          Aktiivinen (näytetään pelissä)
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
